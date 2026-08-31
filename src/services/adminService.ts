import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  BranchRecord,
  ScheduleExceptionRecord,
} from '@/types/schedule';
import { SiteSettingsRecord, ActivityLogRecord } from '@/types/admin';
import { branches as defaultBranches } from '@/data/clinicData';

// Real-time in-memory state (starts clean with zero fake records)
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
 * Audit Logger: writes to activity_logs table
 */
export async function logAdminActivity(
  actionType: string,
  description: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseClient();
  const logEntry: ActivityLogRecord = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action_type: actionType,
    description,
    entity_type: entityType,
    entity_id: entityId,
    admin_email: 'admin@androderma.com',
    metadata: metadata || null,
    created_at: new Date().toISOString(),
  };

  // Local state update
  localLogs = [logEntry, ...localLogs].slice(0, 50);

  if (!supabase) return;

  try {
    await supabase.from('activity_logs').insert([
      {
        action_type: actionType,
        description,
        entity_type: entityType,
        entity_id: entityId,
        admin_email: 'admin@androderma.com',
        metadata: metadata || null,
      },
    ]);
  } catch (err) {
    console.warn('Failed to insert activity log to Supabase:', err);
  }
}

/**
 * Fetch all activity logs
 */
export async function fetchActivityLogs(): Promise<ActivityLogRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [...localLogs];
  }

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      return [...localLogs];
    }
    return data as ActivityLogRecord[];
  } catch {
    return [...localLogs];
  }
}

/**
 * Fetch all schedule exceptions
 */
export async function fetchAllScheduleExceptions(): Promise<ScheduleExceptionRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [...localExceptions];
  }

  try {
    const { data, error } = await supabase
      .from('schedule_exceptions')
      .select('*, replacement_branch:branches!schedule_exceptions_replacement_branch_id_fkey(*), original_branch:branches!schedule_exceptions_branch_id_fkey(*)')
      .order('exception_date', { ascending: true });

    if (error || !data) {
      // Fallback simple query
      const simple = await supabase.from('schedule_exceptions').select('*').order('exception_date', { ascending: true });
      if (!simple.error && simple.data) {
        return simple.data as ScheduleExceptionRecord[];
      }
      return [...localExceptions];
    }

    return data as ScheduleExceptionRecord[];
  } catch {
    return [...localExceptions];
  }
}

/**
 * Save or Update a Schedule Exception (Holiday or Branch Swap)
 */
export async function saveScheduleException(
  payload: Partial<ScheduleExceptionRecord> & { exception_date: string }
): Promise<{ success: boolean; data?: ScheduleExceptionRecord; error?: string }> {
  const supabase = getSupabaseClient();
  const dateStr = payload.exception_date;

  const exceptionData: ScheduleExceptionRecord = {
    id: payload.id || `exc-${Date.now()}`,
    exception_date: dateStr,
    exception_type: payload.exception_type || (payload.is_holiday ? 'holiday' : 'branch_swap'),
    branch_id: payload.branch_id || null,
    replacement_branch_id: payload.replacement_branch_id || payload.override_branch_id || null,
    override_branch_id: payload.override_branch_id || payload.replacement_branch_id || null,
    is_holiday: Boolean(payload.is_holiday),
    is_closed: Boolean(payload.is_closed ?? payload.is_holiday),
    title_ar: payload.title_ar || (payload.is_holiday ? 'عطلة رسمية' : 'تبديل فرع'),
    reason_ar: payload.reason_ar || null,
    open_time: payload.open_time || null,
    close_time: payload.close_time || null,
    hours_ar: payload.hours_ar || null,
    created_at: payload.created_at || new Date().toISOString(),
  };

  // Update local state
  const existingIdx = localExceptions.findIndex((e) => e.exception_date === dateStr);
  if (existingIdx >= 0) {
    localExceptions[existingIdx] = { ...localExceptions[existingIdx], ...exceptionData };
  } else {
    localExceptions.push(exceptionData);
  }

  // Log activity
  if (exceptionData.is_holiday) {
    await logAdminActivity(
      'holiday_created',
      `تم تعيين يوم ${dateStr} كعطلة رسمية مغلقة (${exceptionData.title_ar})`,
      'schedule_exception',
      exceptionData.id
    );
  } else {
    await logAdminActivity(
      'branch_swapped',
      `تم تعيين تبديل فرع لتاريخ ${dateStr} (${exceptionData.title_ar})`,
      'schedule_exception',
      exceptionData.id
    );
  }

  if (!supabase) {
    return { success: true, data: exceptionData };
  }

  try {
    const { data, error } = await supabase
      .from('schedule_exceptions')
      .upsert([exceptionData], { onConflict: 'exception_date' })
      .select()
      .single();

    if (error) {
      console.error('Supabase save exception error:', error);
      return { success: true, data: exceptionData };
    }
    return { success: true, data: data as ScheduleExceptionRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Delete a schedule exception for a date
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
    const query = dateOrId.includes('-')
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
 * Fetch all branches
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
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      return [...localBranches];
    }

    return data.map((b) => ({
      ...b,
      nameAr: b.name_ar || b.nameAr,
      cityAr: b.city_ar || b.cityAr,
      addressAr: b.address_ar || b.addressAr,
      mapsUrl: b.maps_url || b.mapsUrl,
    })) as BranchRecord[];
  } catch {
    return [...localBranches];
  }
}

/**
 * Update Branch information (name, address, maps_url, phone)
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
      name_ar: updates.name_ar || updates.nameAr || localBranches[idx].name_ar,
      nameAr: updates.nameAr || updates.name_ar || localBranches[idx].nameAr,
      city_ar: updates.city_ar || updates.cityAr || localBranches[idx].city_ar,
      cityAr: updates.cityAr || updates.city_ar || localBranches[idx].cityAr,
      address_ar: updates.address_ar || updates.addressAr || localBranches[idx].address_ar,
      addressAr: updates.addressAr || updates.address_ar || localBranches[idx].addressAr,
      maps_url: updates.maps_url || updates.mapsUrl || localBranches[idx].maps_url,
      mapsUrl: updates.mapsUrl || updates.maps_url || localBranches[idx].mapsUrl,
    };
  }

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
    const payload = {
      name_ar: updates.name_ar || updates.nameAr,
      city_ar: updates.city_ar || updates.cityAr,
      address_ar: updates.address_ar || updates.addressAr,
      phone: updates.phone,
      maps_url: updates.maps_url || updates.mapsUrl,
      map_src: updates.map_src || updates.mapSrc,
      is_active: updates.is_active,
    };

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
 * Fetch Site Settings
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
      .single();

    if (error || !data) {
      return { ...localSettings };
    }
    return data as SiteSettingsRecord;
  } catch {
    return { ...localSettings };
  }
}

/**
 * Update Site Settings
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
    const { error } = await supabase
      .from('site_settings')
      .upsert([{ id: localSettings.id || 'main-settings', ...settings }]);

    if (error) {
      console.warn('Supabase update site_settings error:', error);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
