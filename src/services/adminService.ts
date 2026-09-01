import { getSupabaseClient } from '@/lib/supabase';
import {
  BranchRecord,
  ScheduleExceptionRecord,
} from '@/types/schedule';
import { SiteSettingsRecord, ActivityLogRecord } from '@/types/admin';
import { branches as defaultBranches } from '@/data/clinicData';
import { getDeviceType } from '@/utils/deviceDetector';
import {
  notifyScheduleChanged,
  updateWeeklyScheduleDay,
  saveFullWeeklySchedule,
} from '@/services/scheduleService';
import {
  ADMIN_WHITELIST,
  AUTHORIZED_ADMIN_CREDENTIALS,
  isAdminEmailWhitelisted,
  verifyAdminCredentials,
  createAdminSession,
  injectSuperAdminSession,
  getValidAdminSession,
  clearAdminSession,
  isPreviewEnvironment,
} from '@/utils/adminAuth';

export {
  updateWeeklyScheduleDay,
  saveFullWeeklySchedule,
  ADMIN_WHITELIST,
  AUTHORIZED_ADMIN_CREDENTIALS,
  isAdminEmailWhitelisted,
  verifyAdminCredentials,
  createAdminSession,
  injectSuperAdminSession,
  getValidAdminSession,
  clearAdminSession,
  isPreviewEnvironment,
};

// Fallback in-memory cache to ensure zero latency
let localExceptions: ScheduleExceptionRecord[] = [];

const localBranches: BranchRecord[] = defaultBranches.map((b) => ({
  id: b.id,
  name_ar: b.nameAr,
  nameAr: b.nameAr,
  city_ar: b.cityAr,
  cityAr: b.cityAr,
  address_ar: b.addressAr,
  addressAr: b.addressAr,
  phone: b.phones[0]?.number || '01154021247',
  maps_url: b.mapsUrl,
  mapsUrl: b.mapsUrl,
  map_src: b.mapSrc,
  mapSrc: b.mapSrc,
  is_active: true,
}));

let localSettings: SiteSettingsRecord = {
  id: 'main-settings',
  clinic_name_ar: 'عيادات Androderma',
  tagline_ar: 'عناية متقدمة بالجلدية والليزر والتجميل الطبي',
  primary_color: '#00B8A9',
  accent_color: '#0F766E',
  whatsapp_number: '201154021247',
  email_contact: 'info@androderma.com',
  emergency_notice_ar: null,
  is_maintenance_mode: false,
  updated_at: new Date().toISOString(),
};

let localLogs: ActivityLogRecord[] = [];

/**
 * Audit Logger: writes directly to Supabase activity_logs table with automatic device detection
 */
export async function logAdminActivity(
  actionType: string,
  description: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseClient();
  const detectedDevice = getDeviceType();
  const performedBy = 'مدير النظام';

  const logEntry: ActivityLogRecord = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action_type: actionType,
    description,
    entity_type: entityType,
    entity_id: entityId,
    admin_email: performedBy,
    performed_by: performedBy,
    device_info: detectedDevice,
    metadata: metadata || null,
    created_at: new Date().toISOString(),
  };

  localLogs = [logEntry, ...localLogs].slice(0, 50);

  if (!supabase) return;

  try {
    const { error } = await supabase.from('activity_logs').insert([
      {
        action_type: actionType,
        description,
        performed_by: performedBy,
        device_info: detectedDevice,
        metadata: metadata || null,
      },
    ]);

    if (error) {
      // Fallback if schema doesn't have device_info column yet
      await supabase.from('activity_logs').insert([
        {
          action_type: actionType,
          description,
          performed_by: performedBy,
        },
      ]);
    }
  } catch (err) {
    console.warn('Failed to insert activity log to Supabase:', err);
  }
}

/**
 * 30-Day Activity Log Retention Policy & Cleanup
 * Cleans activity logs older than 30 days from live Supabase and local memory.
 * - Attempts to call RPC function `clean_old_activity_logs()`
 * - Falls back to standard Supabase delete query with `.lt('created_at', cutoffDate)`
 * - Cleans in-memory cache to ensure strict 30-day retention
 */
export async function cleanOldActivityLogs(): Promise<{
  success: boolean;
  deletedCount: number;
  cutoffDate: string;
  error?: string;
}> {
  const supabase = getSupabaseClient();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const cutoffTime = Date.now() - thirtyDaysMs;
  const cutoffDateIso = new Date(cutoffTime).toISOString();

  // 1. In-memory cleanup
  const beforeCount = localLogs.length;
  localLogs = localLogs.filter((log) => {
    const logTime = new Date(log.created_at).getTime();
    return !isNaN(logTime) ? logTime >= cutoffTime : true;
  });
  const localDeleted = beforeCount - localLogs.length;

  if (!supabase) {
    return {
      success: true,
      deletedCount: localDeleted,
      cutoffDate: cutoffDateIso,
    };
  }

  try {
    // 2. Try Supabase RPC clean_old_activity_logs() first
    const { data: rpcDeleted, error: rpcError } = await supabase.rpc('clean_old_activity_logs');

    if (!rpcError && typeof rpcDeleted === 'number') {
      return {
        success: true,
        deletedCount: rpcDeleted,
        cutoffDate: cutoffDateIso,
      };
    }

    // 3. Fallback to direct DELETE query via PostgREST
    const { count, error: deleteError } = await supabase
      .from('activity_logs')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDateIso);

    if (deleteError) {
      console.warn('Fallback delete query notice for activity_logs:', deleteError.message);
      return {
        success: true,
        deletedCount: localDeleted,
        cutoffDate: cutoffDateIso,
      };
    }

    return {
      success: true,
      deletedCount: typeof count === 'number' ? count : localDeleted,
      cutoffDate: cutoffDateIso,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('cleanOldActivityLogs error (non-fatal):', msg);
    return {
      success: true,
      deletedCount: localDeleted,
      cutoffDate: cutoffDateIso,
      error: msg,
    };
  }
}

/**
 * Fetch all activity logs from live Supabase (with automatic 30-day retention filtering)
 */
export async function fetchActivityLogs(): Promise<ActivityLogRecord[]> {
  const supabase = getSupabaseClient();

  // Trigger non-blocking background retention cleanup
  cleanOldActivityLogs().catch(() => {
    // Silent catch
  });

  if (!supabase) {
    return [...localLogs];
  }

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return [...localLogs];
    }
    return data.map((item) => ({
      id: item.id,
      action_type: item.action_type,
      description: item.description,
      admin_email: item.performed_by || 'مدير النظام',
      performed_by: item.performed_by || 'مدير النظام',
      device_info: item.device_info || getDeviceType(),
      created_at: item.created_at,
    })) as ActivityLogRecord[];
  } catch {
    return [...localLogs];
  }
}

/**
 * Fetch all schedule exceptions directly from live Supabase
 */
export async function fetchAllScheduleExceptions(): Promise<ScheduleExceptionRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [...localExceptions];
  }

  try {
    const { data, error } = await supabase
      .from('schedule_exceptions')
      .select('*')
      .order('exception_date', { ascending: true });

    if (error || !data) {
      return [...localExceptions];
    }

    const formatted = data.map((row) => ({
      id: row.id,
      exception_date: row.exception_date,
      exception_type: (row.is_holiday ? 'holiday' : 'branch_swap') as ScheduleExceptionRecord['exception_type'],
      branch_id: row.replacement_branch_id || null,
      replacement_branch_id: row.replacement_branch_id || null,
      override_branch_id: row.replacement_branch_id || null,
      is_holiday: Boolean(row.is_holiday),
      is_closed: Boolean(row.is_holiday),
      title_ar: row.reason || (row.is_holiday ? 'عطلة رسمية' : 'تبديل فرع'),
      reason_ar: row.reason || null,
      reason: row.reason || null,
      created_at: row.created_at,
    }));

    localExceptions = formatted;
    return formatted;
  } catch {
    return [...localExceptions];
  }
}

/**
 * Save or Update a Schedule Exception in live Supabase table `schedule_exceptions`
 */
export async function saveScheduleException(
  payload: Partial<ScheduleExceptionRecord> & { exception_date: string }
): Promise<{ success: boolean; data?: ScheduleExceptionRecord; error?: string }> {
  const supabase = getSupabaseClient();
  const dateStr = payload.exception_date;

  const targetBranch = payload.branch_id || payload.replacement_branch_id || payload.override_branch_id || null;
  const reasonText = payload.reason_ar || payload.reason || payload.title_ar || (payload.is_holiday ? 'عطلة رسمية' : 'تبديل فرع');

  const exceptionData: ScheduleExceptionRecord = {
    id: payload.id || `exc-${Date.now()}`,
    exception_date: dateStr,
    exception_type: payload.exception_type || (payload.is_holiday ? 'holiday' : 'branch_swap'),
    branch_id: targetBranch,
    replacement_branch_id: targetBranch,
    override_branch_id: targetBranch,
    is_holiday: Boolean(payload.is_holiday),
    is_closed: Boolean(payload.is_closed ?? payload.is_holiday),
    title_ar: payload.title_ar || reasonText,
    reason_ar: reasonText,
    reason: reasonText,
    created_at: payload.created_at || new Date().toISOString(),
  };

  // Local state fast update
  const existingIdx = localExceptions.findIndex((e) => e.exception_date === dateStr);
  if (existingIdx >= 0) {
    localExceptions[existingIdx] = { ...localExceptions[existingIdx], ...exceptionData };
  } else {
    localExceptions.push(exceptionData);
  }

  notifyScheduleChanged();

  // Audit activity log
  await logAdminActivity(
    exceptionData.is_holiday ? 'holiday_created' : 'branch_swapped',
    `تم تسجيل استثناء لتاريخ ${dateStr} (${exceptionData.title_ar}) ${targetBranch ? `بفرع: ${targetBranch}` : 'لكافة الفروع'}`,
    'schedule_exception',
    exceptionData.id
  );

  if (!supabase) {
    return { success: true, data: exceptionData };
  }

  try {
    // Check if exception for this date already exists in DB
    const { data: existingRows } = await supabase
      .from('schedule_exceptions')
      .select('id')
      .eq('exception_date', dateStr);

    const dbPayload = {
      exception_date: dateStr,
      is_holiday: Boolean(payload.is_holiday),
      reason: reasonText,
      replacement_branch_id: targetBranch,
    };

    if (existingRows && existingRows.length > 0) {
      const { data, error } = await supabase
        .from('schedule_exceptions')
        .update(dbPayload)
        .eq('exception_date', dateStr)
        .select()
        .single();

      if (error) {
        console.error('Supabase update exception error:', error);
        return { success: true, data: exceptionData };
      }
      return { success: true, data: { ...exceptionData, id: data.id } };
    } else {
      const { data, error } = await supabase
        .from('schedule_exceptions')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert exception error:', error);
        return { success: true, data: exceptionData };
      }
      return { success: true, data: { ...exceptionData, id: data.id } };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Delete a schedule exception directly from live Supabase
 */
export async function deleteScheduleException(
  dateOrId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const deletedItem = localExceptions.find(
    (e) => e.id === dateOrId || e.exception_date === dateOrId
  );

  localExceptions = localExceptions.filter(
    (e) => e.id !== dateOrId && e.exception_date !== dateOrId
  );

  notifyScheduleChanged();

  if (deletedItem) {
    await logAdminActivity(
      'holiday_deleted',
      `تم إلغاء الاستثناء/العطلة لتاريخ ${deletedItem.exception_date}`,
      'schedule_exception',
      deletedItem.id
    );
  }

  if (!supabase) {
    return { success: true };
  }

  try {
    const query = dateOrId.includes('-') && dateOrId.length === 10
      ? supabase.from('schedule_exceptions').delete().eq('exception_date', dateOrId)
      : supabase.from('schedule_exceptions').delete().eq('id', dateOrId);

    const { error } = await query;
    if (error) {
      console.warn('Supabase delete exception error:', error);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Fetch all branches from live Supabase
 */
export async function fetchAllBranches(): Promise<BranchRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [...localBranches];
  }

  try {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return [...localBranches];
    }

    return data.map((b) => {
      const fallbackMatch = defaultBranches.find((def) => def.nameAr === b.name || def.id === b.id);
      return {
        id: b.id,
        name_ar: b.name || fallbackMatch?.nameAr || 'فرع العيادة',
        nameAr: b.name || fallbackMatch?.nameAr || 'فرع العيادة',
        city_ar: fallbackMatch?.cityAr || 'القاهرة',
        cityAr: fallbackMatch?.cityAr || 'القاهرة',
        address_ar: b.address || fallbackMatch?.addressAr || '',
        addressAr: b.address || fallbackMatch?.addressAr || '',
        phone: b.contact_number || fallbackMatch?.phones[0]?.number || '01154021247',
        maps_url: b.google_maps_url || fallbackMatch?.mapsUrl || '',
        mapsUrl: b.google_maps_url || fallbackMatch?.mapsUrl || '',
        map_src: fallbackMatch?.mapSrc,
        mapSrc: fallbackMatch?.mapSrc,
        is_active: b.is_active !== false,
      };
    }) as BranchRecord[];
  } catch {
    return [...localBranches];
  }
}

/**
 * Update Branch information in live Supabase
 */
export async function updateBranchDetails(
  branchId: string,
  updates: Partial<BranchRecord>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const idx = localBranches.findIndex((b) => b.id === branchId);
  if (idx >= 0) {
    localBranches[idx] = {
      ...localBranches[idx],
      ...updates,
    };
  }

  notifyScheduleChanged();

  await logAdminActivity(
    'branch_updated',
    `تم تحديث بيانات ${updates.name_ar || updates.nameAr || branchId} (العنوان ورابط الخرائط)`,
    'branch',
    branchId
  );

  if (!supabase) {
    return { success: true };
  }

  try {
    const payload: Record<string, unknown> = {};
    if (updates.name_ar || updates.nameAr) payload.name = updates.name_ar || updates.nameAr;
    if (updates.address_ar || updates.addressAr) payload.address = updates.address_ar || updates.addressAr;
    if (updates.maps_url || updates.mapsUrl) payload.google_maps_url = updates.maps_url || updates.mapsUrl;
    if (updates.phone) payload.contact_number = updates.phone;
    if (typeof updates.is_active === 'boolean') payload.is_active = updates.is_active;

    const { error } = await supabase.from('branches').update(payload).eq('id', branchId);
    if (error) {
      console.warn('Supabase branch update error:', error);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Fetch Site Settings from live Supabase
 */
export async function fetchSiteSettings(): Promise<SiteSettingsRecord> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ...localSettings };
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { ...localSettings };
    }

    return {
      id: String(data.id || '1'),
      clinic_name_ar: data.site_title || 'عيادات Androderma',
      primary_color: data.primary_color || '#00B8A9',
      accent_color: data.secondary_color || '#0F766E',
      is_maintenance_mode: Boolean(data.maintenance_mode),
      updated_at: new Date().toISOString(),
    };
  } catch {
    return { ...localSettings };
  }
}

/**
 * Update Site Settings in live Supabase
 */
export async function updateSiteSettings(
  settings: Partial<SiteSettingsRecord>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  localSettings = { ...localSettings, ...settings, updated_at: new Date().toISOString() };

  await logAdminActivity(
    'settings_updated',
    'تم حفظ وتطبيق إعدادات الموقع وهوية الألوان والبيانات العامة',
    'site_settings',
    'main-settings'
  );

  if (!supabase) {
    return { success: true };
  }

  try {
    const payload = {
      site_title: settings.clinic_name_ar || localSettings.clinic_name_ar,
      primary_color: settings.primary_color || localSettings.primary_color,
      secondary_color: settings.accent_color || localSettings.accent_color,
      maintenance_mode: Boolean(settings.is_maintenance_mode),
    };

    const { error } = await supabase.from('site_settings').upsert([{ id: 1, ...payload }]);

    if (error) {
      console.warn('Supabase update site_settings error:', error);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
