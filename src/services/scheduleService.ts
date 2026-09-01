import { getSupabaseClient } from '@/lib/supabase';
import { branches as defaultBranches } from '@/data/clinicData';
import {
  BranchRecord,
  ScheduleExceptionRecord,
  DailyBranchOverrideRecord,
  NormalizedBranch,
  TodayScheduleResult,
  WeeklyScheduleItem,
} from '@/types/schedule';

// In-memory fallback cache for fast daily overrides
let localDailyOverrides: DailyBranchOverrideRecord[] = [];

/**
 * Static fallback schedule matching clinic defaults in Cairo
 */
const DEFAULT_WEEKLY_ROTATION: {
  dayIndex: number;
  dayNameAr: string;
  dayNameEn: string;
  branchId: string;
  openTime: string;
  closeTime: string;
  hoursAr: string;
  isSpecialDay?: boolean;
}[] = [
  {
    dayIndex: 6, // Saturday
    dayNameAr: 'السبت',
    dayNameEn: 'Saturday',
    branchId: 'fifth-settlement',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 0, // Sunday
    dayNameAr: 'الأحد',
    dayNameEn: 'Sunday',
    branchId: 'nasr-city',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 1, // Monday
    dayNameAr: 'الإثنين',
    dayNameEn: 'Monday',
    branchId: 'maadi',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 2, // Tuesday
    dayNameAr: 'الثلاثاء',
    dayNameEn: 'Tuesday',
    branchId: 'new-giza',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 3, // Wednesday
    dayNameAr: 'الأربعاء',
    dayNameEn: 'Wednesday',
    branchId: 'fifth-settlement',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 4, // Thursday
    dayNameAr: 'الخميس',
    dayNameEn: 'Thursday',
    branchId: 'nasr-city',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 5, // Friday
    dayNameAr: 'الجمعة',
    dayNameEn: 'Friday',
    branchId: 'maadi',
    openTime: '14:00',
    closeTime: '20:00',
    hoursAr: '2:00 ظهراً — 8:00 مساءً',
    isSpecialDay: true,
  },
];

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Normalizes branch data from Supabase or static dataset
 */
export function normalizeBranch(raw: BranchRecord | null | undefined): NormalizedBranch | null {
  if (!raw) return null;
  const fallback = defaultBranches.find((def) => def.id === raw.id || def.nameAr === raw.name_ar || def.nameAr === raw.nameAr);
  const phone =
    raw.phone ||
    fallback?.phones[0]?.number ||
    '01154021247';

  return {
    id: raw.id,
    nameAr: raw.name_ar || raw.nameAr || raw.name || fallback?.nameAr || 'فرع العيادة',
    cityAr: raw.city_ar || raw.cityAr || fallback?.cityAr || 'القاهرة',
    addressAr: raw.address_ar || raw.addressAr || raw.address || fallback?.addressAr || '',
    phone,
    mapsUrl: raw.maps_url || raw.mapsUrl || fallback?.mapsUrl || '',
  };
}

/**
 * Returns formatted ISO date YYYY-MM-DD for a given date
 */
export function getIsoDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Converts a time string (HH:mm:ss or HH:mm) into minutes from midnight
 */
function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

/**
 * Checks if the clinic is open based on open and close times and current time
 */
export function calculateOpenStatus(
  openTimeStr: string | null | undefined,
  closeTimeStr: string | null | undefined,
  isClosedFlag: boolean = false,
  now: Date = new Date()
): {
  isOpen: boolean;
  isClosingSoon: boolean;
  statusTextAr: string;
} {
  if (isClosedFlag || !openTimeStr || !closeTimeStr) {
    return {
      isOpen: false,
      isClosingSoon: false,
      statusTextAr: 'مغلق اليوم',
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(openTimeStr);
  const closeMinutes = parseTimeToMinutes(closeTimeStr);

  if (openMinutes === null || closeMinutes === null) {
    return {
      isOpen: false,
      isClosingSoon: false,
      statusTextAr: 'مواعيد العمل محددة مسبقاً',
    };
  }

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    const minutesUntilClose = closeMinutes - currentMinutes;
    const isClosingSoon = minutesUntilClose <= 60 && minutesUntilClose > 0;

    const closeHour = Math.floor(closeMinutes / 60);
    const displayCloseHour = closeHour > 12 ? `${closeHour - 12}:00 م` : `${closeHour}:00 ص`;

    return {
      isOpen: true,
      isClosingSoon,
      statusTextAr: isClosingSoon
        ? `يغلق قريباً خلال ${minutesUntilClose} دقيقة (الساعة ${displayCloseHour})`
        : `مفتوح الآن — حتى ${displayCloseHour}`,
    };
  } else if (currentMinutes < openMinutes) {
    const openHour = Math.floor(openMinutes / 60);
    const displayOpenHour = openHour > 12 ? `${openHour - 12}:00 ظهراً` : `${openHour}:00 ص`;
    return {
      isOpen: false,
      isClosingSoon: false,
      statusTextAr: `مغلق حالياً — يفتح اليوم الساعة ${displayOpenHour}`,
    };
  } else {
    return {
      isOpen: false,
      isClosingSoon: false,
      statusTextAr: 'مغلق حالياً — انتهت ساعات العمل لليوم',
    };
  }
}

/**
 * 1. Query branches and weekly_schedule tables from live Supabase
 */
export async function fetchWeeklyScheduleWithBranches(): Promise<{
  data: WeeklyScheduleItem[];
  branches: NormalizedBranch[];
  source: 'supabase' | 'fallback';
  error: Error | null;
}> {
  const client = getSupabaseClient();
  const fallbackBranches = defaultBranches.map((b) => normalizeBranch(b)!);

  if (!client) {
    const scheduleItems: WeeklyScheduleItem[] = DEFAULT_WEEKLY_ROTATION.map((item) => {
      const branch =
        fallbackBranches.find((b) => b.id === item.branchId) || fallbackBranches[0];
      return {
        dayIndex: item.dayIndex,
        dayNameAr: item.dayNameAr,
        dayNameEn: item.dayNameEn,
        branch,
        hoursAr: item.hoursAr,
        openTime: item.openTime,
        closeTime: item.closeTime,
        isSpecialDay: Boolean(item.isSpecialDay),
        isClosed: false,
      };
    });

    return {
      data: scheduleItems,
      branches: fallbackBranches,
      source: 'fallback',
      error: null,
    };
  }

  try {
    const [branchesRes, scheduleRes] = await Promise.all([
      client.from('branches').select('*').eq('is_active', true),
      client.from('weekly_schedule').select('*').order('day_of_week', { ascending: true }),
    ]);

    const rawBranches: BranchRecord[] =
      branchesRes.data && branchesRes.data.length > 0
        ? branchesRes.data.map((b) => {
            const fb = defaultBranches.find((def) => def.nameAr === b.name || def.id === b.id);
            return {
              id: b.id,
              nameAr: b.name || fb?.nameAr || 'فرع العيادة',
              cityAr: fb?.cityAr || 'القاهرة',
              addressAr: b.address || fb?.addressAr || '',
              phone: b.contact_number || fb?.phones[0]?.number || '01154021247',
              mapsUrl: b.google_maps_url || fb?.mapsUrl || '',
            };
          })
        : fallbackBranches;

    const normalizedBranches = rawBranches.map((b) => normalizeBranch(b)!);
    const rawSchedules = scheduleRes.data || [];

    if (rawSchedules.length === 0) {
      const scheduleItems: WeeklyScheduleItem[] = DEFAULT_WEEKLY_ROTATION.map((item) => {
        const branch =
          normalizedBranches.find((b) => b.id === item.branchId) ||
          normalizedBranches[0] ||
          fallbackBranches[0];
        return {
          dayIndex: item.dayIndex,
          dayNameAr: item.dayNameAr,
          dayNameEn: item.dayNameEn,
          branch,
          hoursAr: item.hoursAr,
          openTime: item.openTime,
          closeTime: item.closeTime,
          isSpecialDay: Boolean(item.isSpecialDay),
          isClosed: false,
        };
      });

      return {
        data: scheduleItems,
        branches: normalizedBranches,
        source: 'supabase',
        error: null,
      };
    }

    const scheduleItems: WeeklyScheduleItem[] = rawSchedules.map((row) => {
      const dayIdx = Number(row.day_of_week);
      const branch =
        normalizedBranches.find((b) => b.id === row.branch_id) ||
        normalizedBranches[0] ||
        fallbackBranches[0];

      const start = row.start_time ? row.start_time.slice(0, 5) : '13:00';
      const end = row.end_time ? row.end_time.slice(0, 5) : '21:00';

      return {
        dayIndex: dayIdx,
        dayNameAr: ARABIC_DAYS[dayIdx] || 'اليوم',
        dayNameEn: ENGLISH_DAYS[dayIdx] || 'Today',
        branch,
        hoursAr: `${start} — ${end}`,
        openTime: start,
        closeTime: end,
        isSpecialDay: dayIdx === 5,
        isClosed: row.is_working_day === false,
      };
    });

    return {
      data: scheduleItems,
      branches: normalizedBranches,
      source: 'supabase',
      error: null,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    const scheduleItems: WeeklyScheduleItem[] = DEFAULT_WEEKLY_ROTATION.map((item) => {
      const branch =
        fallbackBranches.find((b) => b.id === item.branchId) || fallbackBranches[0];
      return {
        dayIndex: item.dayIndex,
        dayNameAr: item.dayNameAr,
        dayNameEn: item.dayNameEn,
        branch,
        hoursAr: item.hoursAr,
        openTime: item.openTime,
        closeTime: item.closeTime,
        isSpecialDay: Boolean(item.isSpecialDay),
        isClosed: false,
      };
    });

    return {
      data: scheduleItems,
      branches: fallbackBranches,
      source: 'fallback',
      error,
    };
  }
}

/**
 * 2. Query schedule_exceptions table for a given date
 */
export async function fetchScheduleExceptionForDate(
  dateString?: string
): Promise<{
  data: ScheduleExceptionRecord | null;
  error: Error | null;
}> {
  const client = getSupabaseClient();
  const targetDate = dateString || getIsoDateString();

  if (!client) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await client
      .from('schedule_exceptions')
      .select('*')
      .eq('exception_date', targetDate)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return {
      data: {
        id: data.id,
        exception_date: data.exception_date,
        exception_type: data.is_holiday ? 'holiday' : 'branch_swap',
        branch_id: data.replacement_branch_id || null,
        replacement_branch_id: data.replacement_branch_id || null,
        override_branch_id: data.replacement_branch_id || null,
        is_holiday: Boolean(data.is_holiday),
        is_closed: Boolean(data.is_holiday),
        title_ar: data.reason || (data.is_holiday ? 'عطلة رسمية' : 'تبديل فرع'),
        reason_ar: data.reason || null,
        reason: data.reason || null,
      },
      error: null,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

/**
 * 2.1 Fetch All Daily Branch Overrides (from Supabase daily_branch_overrides or schedule_exceptions)
 */
export async function fetchDailyBranchOverrides(): Promise<DailyBranchOverrideRecord[]> {
  const client = getSupabaseClient();

  if (!client) {
    return [...localDailyOverrides];
  }

  try {
    // Attempt to query daily_branch_overrides table first
    const { data, error } = await client
      .from('daily_branch_overrides')
      .select('*')
      .order('override_date', { ascending: true });

    if (!error && data && data.length > 0) {
      const formatted: DailyBranchOverrideRecord[] = data.map((row) => ({
        id: row.id,
        override_date: row.override_date,
        branch_id: row.branch_id || row.replacement_branch_id,
        original_branch_id: row.original_branch_id || null,
        reason: row.reason || row.reason_ar || 'تبديل موقع العيادة اليومي',
        reason_ar: row.reason_ar || row.reason || 'تبديل موقع العيادة اليومي',
        notes: row.notes || null,
        is_active: row.is_active !== false,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
      localDailyOverrides = formatted;
      return formatted;
    }

    // Fallback query to schedule_exceptions where is_holiday is false
    const { data: excData, error: excError } = await client
      .from('schedule_exceptions')
      .select('*')
      .eq('is_holiday', false)
      .order('exception_date', { ascending: true });

    if (!excError && excData && excData.length > 0) {
      const formatted: DailyBranchOverrideRecord[] = excData
        .filter((row) => row.replacement_branch_id)
        .map((row) => ({
          id: row.id,
          override_date: row.exception_date,
          branch_id: row.replacement_branch_id,
          original_branch_id: null,
          reason: row.reason || 'تبديل فرع الكشف',
          reason_ar: row.reason || 'تبديل فرع الكشف',
          notes: null,
          is_active: true,
          created_at: row.created_at,
        }));
      localDailyOverrides = formatted;
      return formatted;
    }

    return [...localDailyOverrides];
  } catch (err) {
    console.warn('Error fetching daily branch overrides:', err);
    return [...localDailyOverrides];
  }
}

/**
 * 2.2 Fetch Daily Branch Override for a Specific Date
 */
export async function fetchDailyBranchOverrideForDate(
  dateString: string
): Promise<DailyBranchOverrideRecord | null> {
  const localMatch = localDailyOverrides.find(
    (o) => o.override_date === dateString && o.is_active !== false
  );
  if (localMatch) return localMatch;

  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('daily_branch_overrides')
      .select('*')
      .eq('override_date', dateString)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        override_date: data.override_date,
        branch_id: data.branch_id,
        original_branch_id: data.original_branch_id || null,
        reason: data.reason || data.reason_ar || 'تبديل فرع الكشف',
        reason_ar: data.reason_ar || data.reason || 'تبديل فرع الكشف',
        notes: data.notes || null,
        is_active: data.is_active !== false,
        created_at: data.created_at,
      };
    }
  } catch {
    // Ignore and fallback
  }

  return null;
}

/**
 * 2.3 Save / Update Daily Branch Override
 */
export async function saveDailyBranchOverride(payload: {
  override_date: string;
  branch_id: string;
  original_branch_id?: string | null;
  reason?: string;
  notes?: string;
}): Promise<{ success: boolean; data?: DailyBranchOverrideRecord; error?: string }> {
  const client = getSupabaseClient();
  const dateStr = payload.override_date;
  const reasonText = payload.reason || 'تبديل موقع العيادة اليومي';

  const overrideRecord: DailyBranchOverrideRecord = {
    id: `dbo-${Date.now()}`,
    override_date: dateStr,
    branch_id: payload.branch_id,
    original_branch_id: payload.original_branch_id || null,
    reason: reasonText,
    reason_ar: reasonText,
    notes: payload.notes || null,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  // Immediate local update
  const existIdx = localDailyOverrides.findIndex((o) => o.override_date === dateStr);
  if (existIdx >= 0) {
    localDailyOverrides[existIdx] = { ...localDailyOverrides[existIdx], ...overrideRecord };
  } else {
    localDailyOverrides.push(overrideRecord);
  }

  if (!client) {
    return { success: true, data: overrideRecord };
  }

  try {
    // 1. Save to daily_branch_overrides table
    const { data: dbData, error: dbError } = await client
      .from('daily_branch_overrides')
      .upsert(
        [
          {
            override_date: dateStr,
            branch_id: payload.branch_id,
            original_branch_id: payload.original_branch_id || null,
            reason: reasonText,
            reason_ar: reasonText,
            notes: payload.notes || null,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'override_date' }
      )
      .select()
      .single();

    // 2. Also keep schedule_exceptions in sync so both queries stay consistent
    await client.from('schedule_exceptions').upsert(
      [
        {
          exception_date: dateStr,
          is_holiday: false,
          reason: reasonText,
          replacement_branch_id: payload.branch_id,
        },
      ],
      { onConflict: 'exception_date' }
    );

    if (dbError) {
      console.warn('Upsert to daily_branch_overrides warning:', dbError.message);
    }

    return {
      success: true,
      data: dbData ? { ...overrideRecord, id: dbData.id } : overrideRecord,
    };
  } catch (err: unknown) {
    console.error('Error saving daily branch override:', err);
    return { success: true, data: overrideRecord };
  }
}

/**
 * 2.4 Delete Daily Branch Override
 */
export async function deleteDailyBranchOverride(
  dateOrId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  const dateStr = dateOrId.includes('-') && dateOrId.length === 10 ? dateOrId : null;

  localDailyOverrides = localDailyOverrides.filter(
    (o) => o.id !== dateOrId && o.override_date !== dateOrId
  );

  if (!client) {
    return { success: true };
  }

  try {
    if (dateStr) {
      await client.from('daily_branch_overrides').delete().eq('override_date', dateStr);
      await client
        .from('schedule_exceptions')
        .delete()
        .eq('exception_date', dateStr)
        .eq('is_holiday', false);
    } else {
      await client.from('daily_branch_overrides').delete().eq('id', dateOrId);
      await client.from('schedule_exceptions').delete().eq('id', dateOrId);
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Helper to get Arabic operating days for a given branch
 */
export function getOperatingDaysForBranch(branchId: string): string[] {
  const matching = DEFAULT_WEEKLY_ROTATION.filter((r) => r.branchId === branchId);
  return matching.map((r) => r.dayNameAr);
}

/**
 * Resolves the scheduled branch for any given date string YYYY-MM-DD
 */
export async function getScheduledBranchForDate(dateString: string): Promise<{
  branch: NormalizedBranch | null;
  dayIndex: number;
  dayNameAr: string;
  isHoliday: boolean;
  isClosed: boolean;
  isOverride: boolean;
  reason?: string | null;
  operatingDaysAr: string[];
}> {
  const parts = dateString.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const targetDate = new Date(y, m, d);
  const dayIndex = targetDate.getDay();
  const dayNameAr = ARABIC_DAYS[dayIndex] || 'اليوم';

  const [weeklyRes, exceptionRes, overrideRecord] = await Promise.all([
    fetchWeeklyScheduleWithBranches(),
    fetchScheduleExceptionForDate(dateString),
    fetchDailyBranchOverrideForDate(dateString),
  ]);

  const allBranches = weeklyRes.branches.length > 0
    ? weeklyRes.branches
    : defaultBranches.map((b) => normalizeBranch(b)!);

  const exception = exceptionRes.data;

  // 1. Check Holiday / Closure Exception
  if (exception && (exception.is_holiday || exception.is_closed || exception.exception_type === 'holiday')) {
    return {
      branch: null,
      dayIndex,
      dayNameAr,
      isHoliday: true,
      isClosed: true,
      isOverride: false,
      reason: exception.title_ar || exception.reason_ar || 'عطلة رسمية — العيادة مغلقة',
      operatingDaysAr: [],
    };
  }

  // 2. Check Daily Branch Override / Branch Swap Exception
  const overrideBranchId =
    overrideRecord?.branch_id ||
    exception?.override_branch_id ||
    exception?.replacement_branch_id;

  if (overrideBranchId) {
    const branch =
      allBranches.find((b) => b.id === overrideBranchId) ||
      allBranches[0] ||
      normalizeBranch(defaultBranches[0])!;

    return {
      branch,
      dayIndex,
      dayNameAr,
      isHoliday: false,
      isClosed: false,
      isOverride: true,
      reason: overrideRecord?.reason || exception?.reason_ar || 'تم تبديل موقع العيادة لهذا اليوم',
      operatingDaysAr: getOperatingDaysForBranch(branch.id),
    };
  }

  // 3. Fallback to weekly rotation
  const scheduledRotation = weeklyRes.data.find((item) => item.dayIndex === dayIndex);
  const regularBranch =
    scheduledRotation?.branch ||
    allBranches.find((b) => b.id === DEFAULT_WEEKLY_ROTATION.find((r) => r.dayIndex === dayIndex)?.branchId) ||
    allBranches[0] ||
    normalizeBranch(defaultBranches[0])!;

  return {
    branch: regularBranch,
    dayIndex,
    dayNameAr,
    isHoliday: false,
    isClosed: false,
    isOverride: false,
    operatingDaysAr: getOperatingDaysForBranch(regularBranch.id),
  };
}

/**
 * Finds the next upcoming date where the doctor is scheduled at a specific branch
 */
export async function getNextAvailableDateForBranch(
  branchId: string,
  fromDateString?: string
): Promise<{
  dateString: string;
  dayNameAr: string;
  formattedDateAr: string;
} | null> {
  const start = fromDateString ? new Date(fromDateString) : new Date();
  if (isNaN(start.getTime())) return null;

  // Search ahead up to 21 days
  for (let i = 1; i <= 21; i++) {
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + i);
    const dateStr = getIsoDateString(nextDate);
    const resolved = await getScheduledBranchForDate(dateStr);

    if (!resolved.isHoliday && !resolved.isClosed && resolved.branch?.id === branchId) {
      const formatter = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return {
        dateString: dateStr,
        dayNameAr: resolved.dayNameAr,
        formattedDateAr: formatter.format(nextDate),
      };
    }
  }

  return null;
}

/**
 * 3. Primary Dynamic Schedule Calculator
 */
export async function getTodayDynamicSchedule(
  options: {
    targetDate?: Date;
    dateString?: string;
  } = {}
): Promise<TodayScheduleResult> {
  const date = options.targetDate || new Date();
  const dateStr = options.dateString || getIsoDateString(date);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const dayNameAr = ARABIC_DAYS[dayOfWeek] || 'اليوم';
  const dayNameEn = ENGLISH_DAYS[dayOfWeek] || 'Today';

  const [weeklyRes, exceptionRes, overrideRecord] = await Promise.all([
    fetchWeeklyScheduleWithBranches(),
    fetchScheduleExceptionForDate(dateStr),
    fetchDailyBranchOverrideForDate(dateStr),
  ]);

  const allBranches = weeklyRes.branches;
  const regularTodayItem = weeklyRes.data.find((item) => item.dayIndex === dayOfWeek);

  let activeBranch: NormalizedBranch | null =
    regularTodayItem?.branch ||
    allBranches.find((b) => b.id === 'fifth-settlement') ||
    allBranches[0] ||
    null;

  let formattedHoursAr = regularTodayItem?.hoursAr || '1:00 ظهراً — 9:00 مساءً';
  let openTime = regularTodayItem?.openTime || '13:00';
  let closeTime = regularTodayItem?.closeTime || '21:00';
  const isSpecialHours = Boolean(regularTodayItem?.isSpecialDay);
  let isClosed = Boolean(regularTodayItem?.isClosed);

  const exception = exceptionRes.data;
  let isHoliday = false;
  let isBranchSwap = false;
  let bannerBadgeText = '';

  const exceptionDetails = {
    hasException: Boolean(exception || overrideRecord),
    type: (overrideRecord ? 'branch_swap' : exception?.exception_type) || null,
    titleAr: (overrideRecord?.reason || exception?.title_ar) || null,
    reasonAr: (overrideRecord?.reason || exception?.reason_ar) || null,
    originalBranchId: exception?.branch_id || (activeBranch ? activeBranch.id : null),
    originalBranchNameAr: activeBranch ? activeBranch.nameAr : null,
    replacementBranchId: overrideRecord?.branch_id || exception?.replacement_branch_id || null,
    replacementBranchNameAr: null as string | null,
    isClosed: Boolean(exception?.is_closed),
  };

  // Evaluate Daily Branch Override or Exception Override
  if (exception) {
    const isHolidayFlag =
      exception.exception_type === 'holiday' ||
      Boolean(exception.is_holiday) ||
      Boolean(exception.is_closed);

    const swapBranchId =
      overrideRecord?.branch_id ||
      exception.override_branch_id ||
      exception.replacement_branch_id;

    if (isHolidayFlag) {
      isHoliday = true;
      isClosed = true;
      formattedHoursAr = `مغلق اليوم (${exception.title_ar || 'عطلة رسمية'})`;
      openTime = null as unknown as string;
      closeTime = null as unknown as string;
      bannerBadgeText = `عطلة رسمية: ${exception.title_ar || 'العيادة مغلقة اليوم'}`;
    } else if (exception.exception_type === 'branch_swap' || swapBranchId) {
      isBranchSwap = true;
      if (swapBranchId) {
        const replacement =
          allBranches.find((b) => b.id === swapBranchId || b.nameAr.includes(swapBranchId));

        if (replacement) {
          activeBranch = replacement;
          exceptionDetails.replacementBranchId = swapBranchId;
          exceptionDetails.replacementBranchNameAr = replacement.nameAr;
        }
      }
      bannerBadgeText = `الفرع النشط اليوم: ${activeBranch ? activeBranch.nameAr : 'عيادات أندروديرما'}`;
    }
  } else if (overrideRecord && overrideRecord.branch_id) {
    isBranchSwap = true;
    const replacement =
      allBranches.find((b) => b.id === overrideRecord.branch_id || b.nameAr.includes(overrideRecord.branch_id));
    if (replacement) {
      activeBranch = replacement;
      exceptionDetails.replacementBranchId = overrideRecord.branch_id;
      exceptionDetails.replacementBranchNameAr = replacement.nameAr;
    }
    bannerBadgeText = `⚡ تبديل الفرع اليوم: ${activeBranch ? activeBranch.nameAr : 'عيادات أندروديرما'}`;
  }

  // Real-time Open/Closed Status
  const statusCalc = calculateOpenStatus(openTime, closeTime, isClosed, date);

  if (!bannerBadgeText) {
    if (activeBranch) {
      bannerBadgeText = `${statusCalc.isOpen ? 'متاح كشف اليوم' : 'المواعيد القادمة'} بـ ${activeBranch.nameAr}`;
    } else {
      bannerBadgeText = 'متاح الحجز بجميع الفروع';
    }
  }

  return {
    date: dateStr,
    dayOfWeek,
    dayNameAr,
    dayNameEn,
    activeBranch,
    todayWorkingHours: {
      formattedAr: formattedHoursAr,
      openTime: isClosed ? null : openTime,
      closeTime: isClosed ? null : closeTime,
      isSpecialHours,
    },
    status: {
      isOpen: statusCalc.isOpen,
      statusTextAr: statusCalc.statusTextAr,
      bannerBadgeText,
      isClosingSoon: statusCalc.isClosingSoon,
      isHoliday,
      isBranchSwap,
    },
    exception: exceptionDetails,
    source: weeklyRes.source,
    timestamp: new Date().toISOString(),
  };
}
