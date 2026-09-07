import { getSupabaseClient } from '@/lib/supabase';
import { AppointmentRecord, PaymentStatus, AppointmentStatus } from '@/types/admin';
import { logAdminActivity } from './adminService';
import { branches as defaultBranches } from '@/data/clinicData';

// Real-time cache
let localAppointments: AppointmentRecord[] = [];

function getBranchArabicName(branchIdOrName: string): string {
  const match = defaultBranches.find(
    (b) => b.id === branchIdOrName || b.nameAr.includes(branchIdOrName) || branchIdOrName.includes(b.nameAr)
  );
  return match ? match.nameAr : branchIdOrName;
}

/**
 * Normalizes Arabic or English time string to SQL 'HH:MM:SS' time format
 */
function normalizeTimeToSql(timeStr?: string): string {
  if (!timeStr) return '17:00:00';
  const clean = timeStr.trim();

  // If already standard HH:mm:ss
  if (/^\d{2}:\d{2}:\d{2}$/.test(clean)) return clean;
  if (/^\d{1,2}:\d{2}$/.test(clean)) {
    const parts = clean.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}:00`;
  }

  // Parse strings like '05:00 م' or '5:00 مساءً' or '5:00 PM'
  const isPM = clean.includes('م') || clean.includes('مساء') || clean.toUpperCase().includes('PM');
  const isAM = clean.includes('ص') || clean.includes('صباح') || clean.toUpperCase().includes('AM');

  const match = clean.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}:00`;
  }

  return '17:00:00';
}

/**
 * Formats SQL time '17:00:00' to user-friendly Arabic time '05:00 مساءً'
 */
function formatSqlTimeToArabic(sqlTime?: string): string {
  if (!sqlTime) return '05:00 مساءً';
  const parts = sqlTime.split(':');
  if (parts.length < 2) return sqlTime;
  const hours = parseInt(parts[0], 10);
  const mins = parts[1];
  const isPM = hours >= 12;
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${String(displayHours).padStart(2, '0')}:${mins} ${isPM ? 'مساءً' : 'صباحاً'}`;
}

/**
 * Fetch all appointments from Supabase
 */
export async function fetchAppointments(): Promise<AppointmentRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [...localAppointments].sort(
      (a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    );
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch appointments warning (using cached data):', error);
      return [...localAppointments];
    }

    if (!data) {
      return [];
    }

    const formatted: AppointmentRecord[] = data.map((item) => {
      // Parse service, visit_type, medical_notes, payment_screenshot_url and payment_method from notes or columns
      let parsedService = 'كشف جلدية وليزر';
      let parsedVisitType = item.visit_type || 'كشف جديد';
      let parsedMedicalNotes = item.medical_notes || null;
      let parsedScreenshotUrl = item.payment_screenshot_url || item.screenshot_url || null;
      let parsedPaymentMethod = item.payment_method || null;
      const rawNotes = item.notes || '';

      if (rawNotes.includes('[خدمة:')) {
        parsedService = rawNotes.split('[خدمة:')[1]?.split(']')[0]?.trim() || parsedService;
      }
      if (rawNotes.includes('[نوع:')) {
        parsedVisitType = rawNotes.split('[نوع:')[1]?.split(']')[0]?.trim() || parsedVisitType;
      }
      if (rawNotes.includes('[تشخيص:')) {
        parsedMedicalNotes = rawNotes.split('[تشخيص:')[1]?.split(']')[0]?.trim() || parsedMedicalNotes;
      }
      if (rawNotes.includes('[إيصال:')) {
        parsedScreenshotUrl = rawNotes.split('[إيصال:')[1]?.split(']')[0]?.trim() || parsedScreenshotUrl;
      }
      if (rawNotes.includes('[وسيلة:')) {
        parsedPaymentMethod = rawNotes.split('[وسيلة:')[1]?.split(']')[0]?.trim() || parsedPaymentMethod;
      }

      // Clean raw notes from tags for display
      const displayNotes = rawNotes
        .replace(/\[خدمة:[^\]]*\]/g, '')
        .replace(/\[نوع:[^\]]*\]/g, '')
        .replace(/\[تشخيص:[^\]]*\]/g, '')
        .replace(/\[إيصال:[^\]]*\]/g, '')
        .replace(/\[وسيلة:[^\]]*\]/g, '')
        .trim();

      // Normalize payment status safely
      let rawPaymentStatus: PaymentStatus = 'معلق';
      const ps = String(item.payment_status || '').toLowerCase().trim();
      const st = String(item.status || '').toLowerCase().trim();
      if (
        ps === 'paid' ||
        ps === 'مدفوع' ||
        ps === 'تم الدفع' ||
        ps === 'مكتمل' ||
        st === 'confirmed' ||
        st === 'completed'
      ) {
        rawPaymentStatus = 'paid';
      } else if (ps === 'unpaid' || ps === 'غير مدفوع') {
        rawPaymentStatus = 'unpaid';
      } else {
        rawPaymentStatus = 'معلق';
      }

      // Parse amount safely (e.g., Number(item.amount) || 0) - fallback to 1200 EGP if 0 or null
      let parsedAmount = 1200;
      const rawAmt = item.amount !== undefined && item.amount !== null ? item.amount : item.amount_paid;
      if (typeof rawAmt === 'number' && !isNaN(rawAmt) && rawAmt > 0) {
        parsedAmount = rawAmt;
      } else if (typeof rawAmt === 'string') {
        const num = parseFloat(rawAmt.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) {
          parsedAmount = num;
        }
      } else if (typeof item.amount_paid === 'number' && !isNaN(item.amount_paid) && item.amount_paid > 0) {
        parsedAmount = item.amount_paid;
      }

      return {
        id: item.id,
        patient_name: item.patient_name || 'مريض مجهول',
        patient_phone: item.patient_phone || '',
        service_name: parsedService,
        visit_type: parsedVisitType,
        branch_id: item.branch_id || 'nasr-city',
        branch_name_ar: getBranchArabicName(item.branch_id || 'nasr-city'),
        appointment_date: item.appointment_date || new Date().toISOString().split('T')[0],
        appointment_time: formatSqlTimeToArabic(item.appointment_time),
        status: (item.status as AppointmentStatus) || 'pending',
        payment_status: (rawPaymentStatus as PaymentStatus) || 'معلق',
        amount: parsedAmount,
        payment_screenshot_url: parsedScreenshotUrl,
        payment_method: parsedPaymentMethod,
        notes: displayNotes || null,
        medical_notes: parsedMedicalNotes,
        created_at: item.created_at || new Date().toISOString(),
      };
    });

    localAppointments = formatted;
    return formatted;
  } catch (err) {
    console.warn('Supabase fetch appointments exception:', err);
    return [...localAppointments];
  }
}

/**
 * Create a new appointment in live Supabase
 */
export async function createAppointment(
  payload: Omit<AppointmentRecord, 'id' | 'created_at'> & { id?: string }
): Promise<{ success: boolean; data?: AppointmentRecord; error?: string }> {
  const supabase = getSupabaseClient();
  const branchName = payload.branch_name_ar || getBranchArabicName(payload.branch_id);

  const newAppointment: AppointmentRecord = {
    id: payload.id || `apt-${Date.now()}`,
    patient_name: payload.patient_name,
    patient_phone: payload.patient_phone,
    service_name: payload.service_name || 'كشف واستشارة طبية',
    visit_type: payload.visit_type || 'كشف جديد',
    branch_id: payload.branch_id,
    branch_name_ar: branchName,
    appointment_date: payload.appointment_date,
    appointment_time: payload.appointment_time || '05:00 مساءً',
    status: payload.status || 'pending',
    payment_status: payload.payment_status || 'معلق',
    amount: Number(payload.amount) || 0,
    payment_screenshot_url: payload.payment_screenshot_url || null,
    payment_method: payload.payment_method || 'vodafone_cash',
    notes: payload.notes || null,
    medical_notes: payload.medical_notes || null,
    created_at: new Date().toISOString(),
  };

  localAppointments = [newAppointment, ...localAppointments];

  await logAdminActivity(
    'booking_created',
    `تم تسجيل حجز جديد (${newAppointment.visit_type || 'كشف'}) للمريض ${newAppointment.patient_name} (${newAppointment.service_name}) في ${branchName} - حالة الدفع: ${newAppointment.payment_status}`,
    'appointment',
    newAppointment.id
  );

  if (!supabase) {
    return { success: true, data: newAppointment };
  }

  try {
    // Resolve branch UUID from branches table if needed
    let targetBranchUUID = payload.branch_id;
    if (!targetBranchUUID || targetBranchUUID.length < 20) {
      const { data: branchRows } = await supabase.from('branches').select('id, name');
      if (branchRows && branchRows.length > 0) {
        const found = branchRows.find(
          (b) => b.name.includes(branchName) || branchName.includes(b.name)
        );
        if (found) targetBranchUUID = found.id;
        else targetBranchUUID = branchRows[0].id;
      }
    }

    // Embed structured tags into notes string to guarantee persistence across schema versions
    const tags: string[] = [];
    if (payload.service_name) tags.push(`[خدمة: ${payload.service_name}]`);
    if (payload.visit_type) tags.push(`[نوع: ${payload.visit_type}]`);
    if (payload.medical_notes) tags.push(`[تشخيص: ${payload.medical_notes}]`);
    if (payload.payment_screenshot_url) tags.push(`[إيصال: ${payload.payment_screenshot_url}]`);
    if (payload.payment_method) tags.push(`[وسيلة: ${payload.payment_method}]`);
    const plainNotes = payload.notes ? payload.notes.trim() : '';
    const notePayload = [...tags, plainNotes].filter(Boolean).join(' ').trim() || null;

    const dbInsert: Record<string, unknown> = {
      patient_name: payload.patient_name,
      patient_phone: payload.patient_phone,
      branch_id: targetBranchUUID,
      appointment_date: payload.appointment_date,
      appointment_time: normalizeTimeToSql(payload.appointment_time),
      status: payload.status || 'pending',
      payment_status: payload.payment_status || 'معلق',
      amount_paid: Number(payload.amount) || 0,
      notes: notePayload,
    };

    if (payload.payment_screenshot_url) {
      dbInsert.payment_screenshot_url = payload.payment_screenshot_url;
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([dbInsert])
      .select()
      .single();

    if (error) {
      // If payment_screenshot_url column is not present, retry without the column since it's already in notes tag
      delete dbInsert.payment_screenshot_url;
      const retryResult = await supabase
        .from('appointments')
        .insert([dbInsert])
        .select()
        .single();

      if (retryResult.data) {
        return {
          success: true,
          data: {
            ...newAppointment,
            id: retryResult.data.id,
          },
        };
      }
      console.warn('Supabase insert appointment error:', error);
      return { success: true, data: newAppointment };
    }

    return {
      success: true,
      data: {
        ...newAppointment,
        id: data.id,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Update an existing appointment in live Supabase
 */
export async function updateAppointment(
  appointmentId: string,
  updates: Partial<AppointmentRecord>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const idx = localAppointments.findIndex((a) => a.id === appointmentId);

  let currentApt: AppointmentRecord | undefined;
  if (idx >= 0) {
    currentApt = localAppointments[idx];
    const updatedBranchName = updates.branch_id
      ? getBranchArabicName(updates.branch_id)
      : currentApt.branch_name_ar;

    // Automatically promote payment_status to 'paid' when confirmation status is changed to 'confirmed'
    const finalPaymentStatus =
      updates.payment_status !== undefined
        ? updates.payment_status
        : updates.status === 'confirmed'
        ? 'paid'
        : currentApt.payment_status;

    localAppointments[idx] = {
      ...currentApt,
      ...updates,
      payment_status: finalPaymentStatus,
      branch_name_ar: updatedBranchName,
      updated_at: new Date().toISOString(),
    };
  }

  const actionDescription =
    updates.status === 'confirmed'
      ? `تم تأكيد حجز المريض (${currentApt?.patient_name || updates.patient_name || appointmentId}) وترقية حالة الدفع إلى مدفوع`
      : updates.status === 'cancelled'
      ? `تم إلغاء حجز المريض (${currentApt?.patient_name || updates.patient_name || appointmentId})`
      : updates.payment_status === 'paid'
      ? `تم تسجيل سداد حجز المريض (${currentApt?.patient_name || updates.patient_name || appointmentId}) بمبلغ ${updates.amount ?? currentApt?.amount_paid ?? 500} ج.م`
      : `تم تعديل بيانات الحجز #${appointmentId} (${updates.status || updates.payment_status || updates.visit_type || 'تحديث بيانات'})`;

  await logAdminActivity(
    'booking_updated',
    actionDescription,
    'appointment',
    appointmentId,
    {
      patient_name: currentApt?.patient_name || updates.patient_name,
      status: updates.status,
      payment_status: updates.payment_status,
      amount: updates.amount,
    }
  );

  if (!supabase) {
    return { success: true };
  }

  try {
    const dbUpdate: Record<string, unknown> = {};
    if (updates.status) dbUpdate.status = updates.status;
    if (updates.payment_status) {
      dbUpdate.payment_status = updates.payment_status;
    } else if (updates.status === 'confirmed') {
      dbUpdate.payment_status = 'paid';
    }
    if (typeof updates.amount === 'number') dbUpdate.amount_paid = updates.amount;
    if (updates.patient_name) dbUpdate.patient_name = updates.patient_name;
    if (updates.patient_phone) dbUpdate.patient_phone = updates.patient_phone;
    if (updates.appointment_date) dbUpdate.appointment_date = updates.appointment_date;
    if (updates.appointment_time) dbUpdate.appointment_time = normalizeTimeToSql(updates.appointment_time);

    // Rebuild structured notes with service, visit_type, medical_notes, screenshot and payment method
    const activeService = updates.service_name ?? currentApt?.service_name;
    const activeVisitType = updates.visit_type ?? currentApt?.visit_type;
    const activeMedicalNotes = updates.medical_notes !== undefined ? updates.medical_notes : currentApt?.medical_notes;
    const activeScreenshot = updates.payment_screenshot_url !== undefined ? updates.payment_screenshot_url : currentApt?.payment_screenshot_url;
    const activePaymentMethod = updates.payment_method !== undefined ? updates.payment_method : currentApt?.payment_method;
    const activePlainNotes = updates.notes !== undefined ? updates.notes : currentApt?.notes;

    const tags: string[] = [];
    if (activeService) tags.push(`[خدمة: ${activeService}]`);
    if (activeVisitType) tags.push(`[نوع: ${activeVisitType}]`);
    if (activeMedicalNotes) tags.push(`[تشخيص: ${activeMedicalNotes}]`);
    if (activeScreenshot) tags.push(`[إيصال: ${activeScreenshot}]`);
    if (activePaymentMethod) tags.push(`[وسيلة: ${activePaymentMethod}]`);
    const notePayload = [...tags, activePlainNotes || ''].filter(Boolean).join(' ').trim() || null;
    
    dbUpdate.notes = notePayload;

    const { error } = await supabase
      .from('appointments')
      .update(dbUpdate)
      .eq('id', appointmentId);

    if (error) {
      console.warn('Supabase update appointment error:', error);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Quick update for Doctor's Medical Notes and Clinical Diagnosis
 */
export async function updateMedicalNotes(
  appointmentId: string,
  medicalNotes: string,
  visitType?: string
): Promise<{ success: boolean; error?: string }> {
  return updateAppointment(appointmentId, {
    medical_notes: medicalNotes,
    ...(visitType ? { visit_type: visitType } : {}),
  });
}

/**
 * Format phone number to international WhatsApp standard (e.g. 201xxxxxxxxx)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return `20${digits.substring(1)}`;
  }
  if (digits.startsWith('20')) {
    return digits;
  }
  return `20${digits}`;
}

/**
 * Pre-defined WhatsApp Message Templates in Arabic
 */
export type WhatsAppTemplateKey =
  | 'confirmation'
  | 'reminder'
  | 'delay'
  | 'followup'
  | 'reschedule'
  | 'custom';

export function generateAppointmentWhatsAppMessage(
  apt: AppointmentRecord,
  templateKey: WhatsAppTemplateKey,
  extraDetails?: { delayMinutes?: number; customMessage?: string; newDate?: string }
): string {
  const patientName = apt.patient_name || 'العميل العزيز';
  const branchName = apt.branch_name_ar || 'عيادات Androderma';
  const date = apt.appointment_date;
  const time = apt.appointment_time;
  const service = apt.service_name;
  const visitType = apt.visit_type || 'كشف واستشارة';

  switch (templateKey) {
    case 'confirmation': {
      const matchBranch = defaultBranches.find(
        (b) => b.id === apt.branch_id || b.nameAr === apt.branch_name_ar || apt.branch_name_ar?.includes(b.nameAr)
      );
      const clinicAddress = matchBranch?.addressAr ? `\n🏢 *العنوان بالتفصيل:* ${matchBranch.addressAr}` : '';
      const doctorName = apt.doctor_name || 'د. هشام الزمزمي';

      return `مرحباً أستاذ/ة *${patientName}* 🌸
نتواصل معك من *عيادات أندروديرما (Androderma)* لتأكيد حجز موعدك الطبي.

📋 *بيانات الحجز المؤكد:*
👨‍⚕️ *الطبيب المعالج:* ${doctorName}
🩺 *الخدمة:* ${service} (${visitType})
📍 *الفرع:* ${branchName}${clinicAddress}
🗓️ *تاريخ الموعد:* ${date}
⏰ *وقت الموعد:* ${time}

✨ تم تثبيت موعدكم رسمياً في الجدول الطبي للعيادة. نرجو التكرم بالحضور قبل الموعد بـ 10 دقائق. نتطلع لاستقبالكم ونتمنى لكم دوام الصحة والعافية! 🤍`;
    }

    case 'reminder':
      return `تذكير بموعدكم القادم 🌿
أهلاً أستاذ/ة *${patientName}*، نذكركم بموعدكم غداً في *عيادات Androderma*:
📍 *الفرع:* ${branchName}
🗓️ *التاريخ:* ${date}
⏰ *الوقت:* ${time}
🩺 *الخدمة:* ${service}

نتطلع لاستقبالكم ونتمنى لكم دوام الصحة والجمال! 💫`;

    case 'delay': {
      const delay = extraDetails?.delayMinutes || 30;
      return `تنويه هام بشأن موعدكم اليوم ⚠️
أهلاً أستاذ/ة *${patientName}*، نحيطكم علماً بحدوث تأخير طارئ في عيادة د. أندروديرما بفرع *${branchName}* لمدة تقارب (${delay} دقيقة) نظراً لحالة طبية عاجلة.
موعدكم اليوم: ${date} - في تمام ${time}.
نعتذر بشدة عن أي إزعاج ونعمل جاهدين لتقديم أفضل رعاية طبية لكم. 🙏`;
    }

    case 'followup':
      return `متابعة ما بعد الكشف الطبي 🩺✨
أهلاً أستاذ/ة *${patientName}*، نتمنى أن تكونوا بأفضل صحة وحال بعد زيارتكم الأخيرة لعيادات *Androderma* (${branchName}).
هل لديكم أي استفسار طبي بخصوص الخطة العلاجية أو موعد المتابعة القادم؟ فريقنا الطبي في خدمتكم دائماً. 🤍`;

    case 'reschedule':
      return `بخصوص تعديل موعدكم في عيادات Androderma 🗓️
أهلاً أستاذ/ة *${patientName}*، بخصوص حجزكم لـ (${service}) في فرع *${branchName}*. نود التنسيق معكم لاختيار أنسب موعد بديل يناسب جدولكم.
يرجى إرسال اليوم والوقت المفضل لديكم وسنقوم بتثبيته فوراً. 🌹`;

    case 'custom':
      return extraDetails?.customMessage || `مرحباً أستاذ/ة ${patientName}، نتواصل معك من عيادات Androderma.`;
  }
}

/**
 * Toggle Payment Status with Optional Amount
 */
export async function togglePaymentStatus(
  appointmentId: string,
  currentStatus: PaymentStatus,
  amount?: number
): Promise<{ success: boolean; newStatus?: PaymentStatus; error?: string }> {
  const newStatus: PaymentStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
  const newAmount = newStatus === 'paid' ? amount || 500 : 0;

  const result = await updateAppointment(appointmentId, {
    payment_status: newStatus,
    amount: newAmount,
  });

  if (result.success) {
    return { success: true, newStatus };
  }
  return { success: false, error: result.error };
}

/**
 * Update appointment status (e.g., 'confirmed', 'completed', 'cancelled')
 * When changing status to 'confirmed' (مؤكد), automatically update payment_status to 'paid' (مدفوع)
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  if (newStatus === 'confirmed') {
    return updateAppointment(appointmentId, {
      status: 'confirmed',
      payment_status: 'paid',
    });
  }
  return updateAppointment(appointmentId, { status: newStatus });
}

/**
 * Update confirmation / status (alias for backwards compatibility)
 */
export async function updateConfirmationStatus(
  appointmentId: string,
  newStatus: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  return updateAppointmentStatus(appointmentId, newStatus);
}

/**
 * Delete an appointment from live Supabase
 */
export async function deleteAppointment(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const deleted = localAppointments.find((a) => a.id === appointmentId);
  localAppointments = localAppointments.filter((a) => a.id !== appointmentId);

  if (deleted) {
    await logAdminActivity(
      'booking_deleted',
      `تم حذف حجز المريض ${deleted.patient_name} (موعد: ${deleted.appointment_date})`,
      'appointment',
      appointmentId
    );
  }

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
    if (error) {
      console.warn('Supabase delete appointment warning:', error);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Clear/reset all appointments from live Supabase and local cache
 */
export async function clearAllAppointments(): Promise<{ success: boolean; count?: number; error?: string }> {
  const supabase = getSupabaseClient();
  const count = localAppointments.length;
  localAppointments = [];

  await logAdminActivity(
    'booking_deleted',
    `تم تصفية ومسح سجلات الحجوزات بالكامل (${count} حجز) من قبل الطبيب لإعادة الضبط`,
    'appointment'
  );

  if (!supabase) {
    return { success: true, count };
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.warn('Supabase clear all appointments warning:', error);
    }
    return { success: true, count };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export interface BranchDemandItem {
  branchId: string;
  branchName: string;
  count: number;
  revenue: number;
  percentage: number;
  isHighestDemand: boolean;
}

export interface DailyTrendItem {
  date: string;
  bookings: number;
  revenue: number;
}

export interface ServiceBreakdownItem {
  name: string;
  count: number;
}

export interface AnalyticsSummary {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  paidCount: number;
  unpaidCount: number;
  collectionRatePercentage: number;
  highestDemandBranch: BranchDemandItem | null;
  branchDemandList: BranchDemandItem[];
  dailyTrend: DailyTrendItem[];
  serviceBreakdown: ServiceBreakdownItem[];
}

/**
 * Compute aggregate analytics and branch demand breakdown
 */
export function computeAnalytics(appointments: AppointmentRecord[]): AnalyticsSummary {
  const totalBookings = appointments.length;
  let confirmedBookings = 0;
  let pendingBookings = 0;
  let totalRevenue = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  const branchMap: Record<string, { branchId: string; branchName: string; count: number; revenue: number }> = {};
  const dateMap: Record<string, { bookings: number; revenue: number }> = {};
  const serviceMap: Record<string, number> = {};

  // Initialize known branches
  defaultBranches.forEach((b) => {
    branchMap[b.id] = {
      branchId: b.id,
      branchName: b.nameAr,
      count: 0,
      revenue: 0,
    };
  });

  appointments.forEach((apt) => {
    const statusStr = String(apt.status || '').toLowerCase().trim();
    const paymentStatusStr = String(apt.payment_status || '').toLowerCase().trim();

    const isConfirmed =
      statusStr === 'confirmed' ||
      statusStr === 'completed' ||
      statusStr === 'مؤكد' ||
      statusStr === 'مكتمل';

    const isPaid =
      paymentStatusStr === 'paid' ||
      paymentStatusStr === 'مدفوع' ||
      paymentStatusStr === 'تم الدفع' ||
      paymentStatusStr === 'مكتمل' ||
      isConfirmed;

    if (isConfirmed) {
      confirmedBookings += 1;
    } else if (statusStr === 'pending' || statusStr === 'معلق' || !statusStr) {
      pendingBookings += 1;
    }

    // Safely parse monetary amount field (e.g. Number(item.amount) || 0)
    const rawAmt = apt.amount ?? apt.amount_paid ?? apt.price;
    const amt = typeof rawAmt === 'string'
      ? parseFloat(rawAmt.replace(/[^0-9.]/g, '')) || 0
      : Number(rawAmt) || Number(apt.amount) || 0;

    if (isPaid) {
      paidCount += 1;
      totalRevenue += amt;
    } else {
      unpaidCount += 1;
    }

    // Branch stats
    const branchKey = apt.branch_id || 'nasr-city';
    if (!branchMap[branchKey]) {
      branchMap[branchKey] = {
        branchId: branchKey,
        branchName: apt.branch_name_ar || getBranchArabicName(branchKey),
        count: 0,
        revenue: 0,
      };
    }
    branchMap[branchKey].count += 1;
    if (isPaid) {
      branchMap[branchKey].revenue += amt;
    }

    // Date stats
    const d = apt.appointment_date || new Date().toISOString().split('T')[0];
    if (!dateMap[d]) {
      dateMap[d] = { bookings: 0, revenue: 0 };
    }
    dateMap[d].bookings += 1;
    if (isPaid) {
      dateMap[d].revenue += amt;
    }

    // Service stats
    const svc = apt.service_name || 'كشف واستشارة طبية';
    serviceMap[svc] = (serviceMap[svc] || 0) + 1;
  });

  const collectionRatePercentage = totalBookings > 0 ? Math.round((paidCount / totalBookings) * 100) : 0;

  // Branch list
  let maxCount = -1;
  let highestBranch: BranchDemandItem | null = null;

  const branchDemandList: BranchDemandItem[] = Object.values(branchMap).map((b) => {
    const percentage = totalBookings > 0 ? Math.round((b.count / totalBookings) * 100) : 0;
    return {
      branchId: b.branchId,
      branchName: b.branchName,
      count: b.count,
      revenue: b.revenue,
      percentage,
      isHighestDemand: false,
    };
  });

  branchDemandList.forEach((b) => {
    if (b.count > maxCount) {
      maxCount = b.count;
      highestBranch = b;
    }
  });

  if (highestBranch && (highestBranch as BranchDemandItem).count > 0) {
    (highestBranch as BranchDemandItem).isHighestDemand = true;
  }

  // Daily trend sorted by date
  const dailyTrend: DailyTrendItem[] = Object.entries(dateMap)
    .map(([date, val]) => ({ date, bookings: val.bookings, revenue: val.revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // If dailyTrend is empty or small, provide default points
  if (dailyTrend.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    dailyTrend.push({ date: today, bookings: 0, revenue: 0 });
  }

  // Top services sorted descending
  const serviceBreakdown: ServiceBreakdownItem[] = Object.entries(serviceMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  if (serviceBreakdown.length === 0) {
    serviceBreakdown.push({ name: 'كشف واستشارة طبية', count: 0 });
  }

  return {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalRevenue,
    paidCount,
    unpaidCount,
    collectionRatePercentage,
    highestDemandBranch: highestBranch,
    branchDemandList,
    dailyTrend,
    serviceBreakdown,
  };
}

/**
 * Returns the count of confirmed appointments for a specific branch on today's date.
 * Strictly excludes pending, cancelled, or other statuses.
 */
export async function getTodayConfirmedQueueCount(
  branchId: string,
  dateStr?: string
): Promise<number> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  const supabase = getSupabaseClient();
  const targetBranchUUID = resolveBranchUuid(branchId);

  if (!supabase) {
    return localAppointments.filter(
      (a) =>
        a.appointment_date === targetDate &&
        (a.branch_id === branchId || a.branch_id === targetBranchUUID) &&
        a.status === 'confirmed'
    ).length;
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, branch_id, status, appointment_date')
      .eq('appointment_date', targetDate)
      .eq('status', 'confirmed');

    if (error || !data) {
      // Fallback to local filtering
      return localAppointments.filter(
        (a) =>
          a.appointment_date === targetDate &&
          (a.branch_id === branchId || a.branch_id === targetBranchUUID) &&
          a.status === 'confirmed'
      ).length;
    }

    return data.filter(
      (a) =>
        a.branch_id === branchId ||
        a.branch_id === targetBranchUUID ||
        (targetBranchUUID && a.branch_id?.toLowerCase() === targetBranchUUID.toLowerCase())
    ).length;
  } catch (err) {
    console.warn('Error fetching confirmed queue count:', err);
    return localAppointments.filter(
      (a) =>
        a.appointment_date === targetDate &&
        (a.branch_id === branchId || a.branch_id === targetBranchUUID) &&
        a.status === 'confirmed'
    ).length;
  }
}

