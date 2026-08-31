import { getSupabaseClient } from '@/lib/supabaseClient';
import { AppointmentRecord, PaymentStatus, AppointmentStatus } from '@/types/admin';
import { logAdminActivity } from './adminService';
import { branches as defaultBranches } from '@/data/clinicData';

// Clean real-time in-memory store for appointments (starts empty with zero fake records)
let localAppointments: AppointmentRecord[] = [];

function getBranchArabicName(branchId: string): string {
  const match = defaultBranches.find((b) => b.id === branchId);
  return match ? match.nameAr : branchId;
}

/**
 * Fetch all appointments from Supabase (or local store)
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
      console.warn('Supabase fetch appointments error (using local store):', error);
      return [...localAppointments];
    }

    if (!data) {
      return [];
    }

    return data.map((item) => ({
      ...item,
      branch_name_ar: item.branch_name_ar || getBranchArabicName(item.branch_id),
    })) as AppointmentRecord[];
  } catch (err) {
    console.warn('Supabase fetch appointments exception:', err);
    return [...localAppointments];
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  payload: Omit<AppointmentRecord, 'id' | 'created_at'> & { id?: string }
): Promise<{ success: boolean; data?: AppointmentRecord; error?: string }> {
  const supabase = getSupabaseClient();
  const newAppointment: AppointmentRecord = {
    id: payload.id || `apt-${Date.now()}`,
    patient_name: payload.patient_name,
    patient_phone: payload.patient_phone,
    service_name: payload.service_name,
    branch_id: payload.branch_id,
    branch_name_ar: payload.branch_name_ar || getBranchArabicName(payload.branch_id),
    appointment_date: payload.appointment_date,
    appointment_time: payload.appointment_time || '05:00 مساءً',
    status: payload.status || 'confirmed',
    payment_status: payload.payment_status || 'unpaid',
    amount: Number(payload.amount) || 0,
    notes: payload.notes || null,
    created_at: new Date().toISOString(),
  };

  localAppointments = [newAppointment, ...localAppointments];

  await logAdminActivity(
    'booking_created',
    `تم تسجيل حجز جديد للمريض ${newAppointment.patient_name} (${newAppointment.service_name}) في ${newAppointment.branch_name_ar}`,
    'appointment',
    newAppointment.id
  );

  if (!supabase) {
    return { success: true, data: newAppointment };
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([newAppointment])
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert appointment error:', error);
      return { success: true, data: newAppointment };
    }

    return { success: true, data: data as AppointmentRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(
  appointmentId: string,
  updates: Partial<AppointmentRecord>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const idx = localAppointments.findIndex((a) => a.id === appointmentId);

  if (idx >= 0) {
    const current = localAppointments[idx];
    const updatedBranchName = updates.branch_id
      ? getBranchArabicName(updates.branch_id)
      : current.branch_name_ar;

    localAppointments[idx] = {
      ...current,
      ...updates,
      branch_name_ar: updatedBranchName,
      updated_at: new Date().toISOString(),
    };
  }

  await logAdminActivity(
    'booking_updated',
    `تم تعديل بيانات الحجز #${appointmentId} (${updates.status || updates.payment_status || 'تحديث عام'})`,
    'appointment',
    appointmentId
  );

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
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
 * Toggle Payment Status with Optional Amount
 */
export async function togglePaymentStatus(
  appointmentId: string,
  newPaymentStatus: PaymentStatus,
  amount?: number
): Promise<{ success: boolean; error?: string }> {
  const updates: Partial<AppointmentRecord> = {
    payment_status: newPaymentStatus,
  };
  if (typeof amount === 'number') {
    updates.amount = amount;
  }

  await logAdminActivity(
    'payment_updated',
    `تم تغيير حالة الدفع للحجز #${appointmentId} إلى (${newPaymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}) بمبلغ ${amount ?? 'الحالي'} ج.م`,
    'appointment',
    appointmentId
  );

  return updateAppointment(appointmentId, updates);
}

/**
 * Update Confirmation Status
 */
export async function updateConfirmationStatus(
  appointmentId: string,
  newStatus: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  return updateAppointment(appointmentId, { status: newStatus });
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const item = localAppointments.find((a) => a.id === appointmentId);

  localAppointments = localAppointments.filter((a) => a.id !== appointmentId);

  if (item) {
    await logAdminActivity(
      'booking_deleted',
      `تم حذف حجز المريض ${item.patient_name} (${item.service_name}) من النظام`,
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
      console.warn('Supabase delete appointment error:', error);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Analytics summary computation engine
 */
export interface BranchDemandInsight {
  branchId: string;
  branchName: string;
  count: number;
  revenue: number;
  percentage: number;
  isHighestDemand: boolean;
}

export interface AnalyticsSummary {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  paidCount: number;
  unpaidCount: number;
  collectionRatePercentage: number;
  highestDemandBranch: BranchDemandInsight | null;
  branchDemandList: BranchDemandInsight[];
  dailyTrend: { date: string; bookings: number; revenue: number }[];
  serviceBreakdown: { name: string; count: number }[];
}

export function computeAnalytics(appointments: AppointmentRecord[]): AnalyticsSummary {
  const totalBookings = appointments.length;
  const confirmedBookings = appointments.filter((a) => a.status === 'confirmed' || a.status === 'completed').length;
  const pendingBookings = appointments.filter((a) => a.status === 'pending').length;
  const cancelledBookings = appointments.filter((a) => a.status === 'cancelled').length;

  const paidAppointments = appointments.filter((a) => a.payment_status === 'paid');
  const totalRevenue = paidAppointments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const paidCount = paidAppointments.length;
  const unpaidCount = appointments.filter((a) => a.payment_status === 'unpaid').length;
  const collectionRatePercentage = totalBookings > 0 ? Math.round((paidCount / totalBookings) * 100) : 0;

  // Branch Demand grouping
  const branchMap: Record<string, { count: number; revenue: number; name: string }> = {};

  defaultBranches.forEach((b) => {
    branchMap[b.id] = { count: 0, revenue: 0, name: b.nameAr };
  });

  appointments.forEach((a) => {
    const bId = a.branch_id || 'nasr-city';
    if (!branchMap[bId]) {
      branchMap[bId] = { count: 0, revenue: 0, name: a.branch_name_ar || bId };
    }
    branchMap[bId].count += 1;
    if (a.payment_status === 'paid') {
      branchMap[bId].revenue += Number(a.amount) || 0;
    }
  });

  let maxCount = -1;
  let highestBranchId = '';

  const branchDemandList: BranchDemandInsight[] = Object.keys(branchMap).map((bId) => {
    const data = branchMap[bId];
    if (data.count > maxCount) {
      maxCount = data.count;
      highestBranchId = bId;
    }
    const pct = totalBookings > 0 ? Math.round((data.count / totalBookings) * 100) : 0;
    return {
      branchId: bId,
      branchName: data.name,
      count: data.count,
      revenue: data.revenue,
      percentage: pct,
      isHighestDemand: false,
    };
  });

  // Mark highest demand
  branchDemandList.forEach((b) => {
    if (b.branchId === highestBranchId && b.count > 0) {
      b.isHighestDemand = true;
    }
  });

  // Sort by count descending
  branchDemandList.sort((a, b) => b.count - a.count);

  const highestDemandBranch = branchDemandList.find((b) => b.isHighestDemand) || branchDemandList[0] || null;

  // Daily Trend (recent dates)
  const dateMap: Record<string, { bookings: number; revenue: number }> = {};
  appointments.forEach((a) => {
    const d = a.appointment_date || '2026-09-01';
    if (!dateMap[d]) {
      dateMap[d] = { bookings: 0, revenue: 0 };
    }
    dateMap[d].bookings += 1;
    if (a.payment_status === 'paid') {
      dateMap[d].revenue += Number(a.amount) || 0;
    }
  });

  const dailyTrend = Object.keys(dateMap)
    .sort()
    .map((date) => ({
      date: date.substring(5), // MM-DD
      bookings: dateMap[date].bookings,
      revenue: dateMap[date].revenue,
    }));

  // Service breakdown
  const serviceMap: Record<string, number> = {};
  appointments.forEach((a) => {
    const key = a.service_name.split('(')[0].trim() || 'استشارة جلدية';
    serviceMap[key] = (serviceMap[key] || 0) + 1;
  });

  const serviceBreakdown = Object.keys(serviceMap)
    .map((name) => ({ name, count: serviceMap[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalRevenue,
    paidCount,
    unpaidCount,
    collectionRatePercentage,
    highestDemandBranch,
    branchDemandList,
    dailyTrend,
    serviceBreakdown,
  };
}
