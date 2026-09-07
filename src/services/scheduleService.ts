import { getSupabaseClient } from '@/lib/supabase';
import { logAdminActivity } from '@/services/activityLogService';
import { branches as defaultBranches } from '@/data/clinicData';
import {
  BranchRecord,
  ScheduleExceptionRecord,
  DailyBranchOverrideRecord,
  NormalizedBranch,
  TodayScheduleResult,
  WeeklyScheduleItem,
} from '@/types/schedule';
import {
  formatTime12h,
  formatTimeRange12h,
  formatSingleTime12h,
  formatArabicDate,
} from '@/utils/timeFormat';

export { formatTime12h, formatTimeRange12h, formatSingleTime12h, formatArabicDate };

// In-memory fallback cache for fast daily overrides
let localDailyOverrides: DailyBranchOverrideRecord[] = [];

// In-memory cache for Supabase weekly_schedule row UUIDs mapped by day_of_week (0-6)
const cachedWeeklyRowIds: Record<number, string> = {};

export const CANONICAL_BRANCH_MAP = {
  'nasr-city': {
    uuid: 'ced08c5c-3f0d-49c1-b8c0-5856961909e4',
    nameAr: 'فرع مدينة نصر',
    slug: 'nasr-city',
  },
  'fifth-settlement': {
    uuid: '55306d12-9d6d-401a-9785-b118ee60b45f',
    nameAr: 'فرع التجمع الخامس',
    slug: 'fifth-settlement',
  },
  'tagamoa': {
    uuid: '55306d12-9d6d-401a-9785-b118ee60b45f',
    nameAr: 'فرع التجمع الخامس',
    slug: 'fifth-settlement',
  },
  'maadi': {
    uuid: '38d81efd-c175-47e2-97b5-9666fab10bd2',
    nameAr: 'فرع المعادي',
    slug: 'maadi',
  },
  'new-giza': {
    uuid: 'a8aadd71-7ab9-4001-bf10-b0e93012b9b0',
    nameAr: 'فرع نيو جيزة',
    slug: 'new-giza',
  },
  'zayed': {
    uuid: 'a8aadd71-7ab9-4001-bf10-b0e93012b9b0',
    nameAr: 'فرع نيو جيزة',
    slug: 'new-giza',
  },
};

/**
 * Resolves any branch ID, slug, or Arabic name to its canonical Supabase UUID
 */
export function resolveBranchUuid(branchIdOrName?: string | null): string {
  if (!branchIdOrName) return 'ced08c5c-3f0d-49c1-b8c0-5856961909e4';
  const val = branchIdOrName.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
    return val;
  }
  if (CANONICAL_BRANCH_MAP[val as keyof typeof CANONICAL_BRANCH_MAP]) {
    return CANONICAL_BRANCH_MAP[val as keyof typeof CANONICAL_BRANCH_MAP].uuid;
  }
  if (val.includes('مدينة نصر') || val.includes('نصر')) return 'ced08c5c-3f0d-49c1-b8c0-5856961909e4';
  if (val.includes('التجمع') || val.includes('fifth') || val.includes('tagamoa')) return '55306d12-9d6d-401a-9785-b118ee60b45f';
  if (val.includes('المعادي') || val.includes('maadi')) return '38d81efd-c175-47e2-97b5-9666fab10bd2';
  if (val.includes('جيزة') || val.includes('زايد') || val.includes('giza') || val.includes('zayed')) return 'a8aadd71-7ab9-4001-bf10-b0e93012b9b0';
  return 'ced08c5c-3f0d-49c1-b8c0-5856961909e4';
}

/**
 * Resolves any branch UUID, slug, or text to its official Arabic name
 */
export function resolveBranchName(branchIdOrName?: string | null): string {
  if (!branchIdOrName) return 'فرع مدينة نصر';
  const val = branchIdOrName.trim();
  if (val.startsWith('فرع ')) return val;
  if (val === 'ced08c5c-3f0d-49c1-b8c0-5856961909e4' || val.includes('nasr') || val.includes('نصر')) return 'فرع مدينة نصر';
  if (val === '55306d12-9d6d-401a-9785-b118ee60b45f' || val.includes('tagamoa') || val.includes('fifth') || val.includes('التجمع')) return 'فرع التجمع الخامس';
  if (val === '38d81efd-c175-47e2-97b5-9666fab10bd2' || val.includes('maadi') || val.includes('المعادي')) return 'فرع المعادي';
  if (val === 'a8aadd71-7ab9-4001-bf10-b0e93012b9b0' || val.includes('giza') || val.includes('zayed') || val.includes('جيزة')) return 'فرع نيو جيزة';
  return val;
}

/**
 * Static initial schedule matching Cairo clinic operations in 12-hour Egyptian Arabic format
 */
export const DEFAULT_WEEKLY_ROTATION: {
  dayIndex: number;
  dayNameAr: string;
  dayNameEn: string;
  branchId: string;
  openTime: string;
  closeTime: string;
  hoursAr: string;
  isSpecialDay?: boolean;
  isClosed?: boolean;
  reasonAr?: string | null;
  reason?: string | null;
}[] = [
  {
    dayIndex: 6, // Saturday
    dayNameAr: 'السبت',
    dayNameEn: 'Saturday',
    branchId: 'fifth-settlement',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 م — 9:00 م',
    isClosed: false,
  },
  {
    dayIndex: 0, // Sunday
    dayNameAr: 'الأحد',
    dayNameEn: 'Sunday',
    branchId: 'nasr-city',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 م — 9:00 م',
    isClosed: false,
  },
  {
    dayIndex: 1, // Monday
    dayNameAr: 'الإثنين',
    dayNameEn: 'Monday',
    branchId: 'maadi',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 م — 9:00 م',
    isClosed: false,
  },
  {
    dayIndex: 2, // Tuesday
    dayNameAr: 'الثلاثاء',
    dayNameEn: 'Tuesday',
    branchId: 'new-giza',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 م — 9:00 م',
    isClosed: false,
  },
  {
    dayIndex: 3, // Wednesday
    dayNameAr: 'الأربعاء',
    dayNameEn: 'Wednesday',
    branchId: 'fifth-settlement',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 م — 9:00 م',
    isClosed: false,
  },
  {
    dayIndex: 4, // Thursday
    dayNameAr: 'الخميس',
    dayNameEn: 'Thursday',
    branchId: 'nasr-city',
    openTime: '13:00',
    closeTime: '21:00',
    hoursAr: '1:00 م — 9:00 م',
    isClosed: false,
  },
  {
    dayIndex: 5, // Friday
    dayNameAr: 'الجمعة',
    dayNameEn: 'Friday',
    branchId: 'maadi',
    openTime: '14:00',
    closeTime: '20:00',
    hoursAr: '2:00 م — 8:00 م',
    isSpecialDay: true,
    isClosed: false,
  },
];

// Active mutable weekly schedule rotation in memory
const localWeeklyRotation = DEFAULT_WEEKLY_ROTATION.map((item) => ({ ...item }));

export const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Event emitter for immediate state reactivity across public and admin components
 */
export function notifyScheduleChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('androderma_schedule_updated'));
  }
}

export function subscribeScheduleChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('androderma_schedule_updated', callback);
  return () => {
    window.removeEventListener('androderma_schedule_updated', callback);
  };
}

/**
 * Normalizes branch data from Supabase or static dataset
 */
export function normalizeBranch(raw: BranchRecord | null | undefined): NormalizedBranch | null {
  if (!raw) return null;
  const fallback = defaultBranches.find(
    (def) => def.id === raw.id || def.nameAr === raw.name_ar || def.nameAr === raw.nameAr
  );
  const phone = raw.phone || fallback?.phones[0]?.number || '01154021247';

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

  const displayCloseHour = formatSingleTime12h(closeTimeStr);
  const displayOpenHour = formatSingleTime12h(openTimeStr);

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    const minutesUntilClose = closeMinutes - currentMinutes;
    const isClosingSoon = minutesUntilClose <= 60 && minutesUntilClose > 0;

    return {
      isOpen: true,
      isClosingSoon,
      statusTextAr: isClosingSoon
        ? `يغلق قريباً خلال ${minutesUntilClose} دقيقة (الساعة ${displayCloseHour})`
        : `مفتوح الآن — حتى ${displayCloseHour}`,
    };
  } else if (currentMinutes < openMinutes) {
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
    const scheduleItems: WeeklyScheduleItem[] = localWeeklyRotation.map((item) => {
      const branch =
        fallbackBranches.find((b) => b.id === item.branchId) || fallbackBranches[0];
      return {
        dayIndex: item.dayIndex,
        dayNameAr: item.dayNameAr,
        dayNameEn: item.dayNameEn,
        branch,
        hoursAr: item.hoursAr ? formatTime12h(item.hoursAr) : formatTimeRange12h(item.openTime, item.closeTime),
        openTime: item.openTime,
        closeTime: item.closeTime,
        isSpecialDay: Boolean(item.isSpecialDay),
        isClosed: Boolean(item.isClosed),
        reasonAr: item.reasonAr || (item.isClosed ? 'إجازة أسبوعية — غير متاح لكشوفات اليوم' : null),
        reason: item.reason || null,
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
      const scheduleItems: WeeklyScheduleItem[] = localWeeklyRotation.map((item) => {
        const branch =
          normalizedBranches.find((b) => b.id === item.branchId) ||
          normalizedBranches[0] ||
          fallbackBranches[0];
        return {
          dayIndex: item.dayIndex,
          dayNameAr: item.dayNameAr,
          dayNameEn: item.dayNameEn,
          branch,
          hoursAr: item.hoursAr ? formatTime12h(item.hoursAr) : formatTimeRange12h(item.openTime, item.closeTime),
          openTime: item.openTime,
          closeTime: item.closeTime,
          isSpecialDay: Boolean(item.isSpecialDay),
          isClosed: Boolean(item.isClosed),
          reasonAr: item.reasonAr || null,
          reason: item.reason || null,
        };
      });

      return {
        data: scheduleItems,
        branches: normalizedBranches,
        source: 'supabase',
        error: null,
      };
    }

    // Cache row IDs for on-conflict-safe upserts
    rawSchedules.forEach((row) => {
      cachedWeeklyRowIds[Number(row.day_of_week)] = row.id;
    });

    const scheduleItems: WeeklyScheduleItem[] = rawSchedules.map((row) => {
      const dayIdx = Number(row.day_of_week);
      const branch =
        normalizedBranches.find((b) => b.id === row.branch_id) ||
        normalizedBranches[0] ||
        fallbackBranches[0];

      const start = row.start_time
        ? row.start_time.slice(0, 5)
        : row.open_time
        ? row.open_time.slice(0, 5)
        : '13:00';
      const end = row.end_time
        ? row.end_time.slice(0, 5)
        : row.close_time
        ? row.close_time.slice(0, 5)
        : '21:00';

      const hoursAr = row.hours_ar
        ? formatTime12h(row.hours_ar)
        : formatTimeRange12h(start, end);

      const isClosed = row.is_working_day === false || row.is_closed === true;
      const reasonAr =
        row.reason_ar ||
        row.reason ||
        (isClosed ? 'إجازة أسبوعية — غير متاح لكشوفات اليوم' : null);

      return {
        id: row.id,
        dayIndex: dayIdx,
        dayNameAr: ARABIC_DAYS[dayIdx] || row.day_name_ar || 'اليوم',
        dayNameEn: ENGLISH_DAYS[dayIdx] || row.day_name_en || 'Today',
        branch,
        branchId: row.branch_id,
        branch_id: row.branch_id,
        hoursAr,
        openTime: start,
        closeTime: end,
        isSpecialDay: dayIdx === 5,
        isClosed,
        is_working_day: !isClosed,
        reasonAr,
        reason: row.reason || null,
      };
    });

    // Update local cache so in-memory calculations stay in sync
    scheduleItems.forEach((item) => {
      const idx = localWeeklyRotation.findIndex((r) => r.dayIndex === item.dayIndex);
      if (idx >= 0) {
        localWeeklyRotation[idx] = {
          dayIndex: item.dayIndex,
          dayNameAr: item.dayNameAr,
          dayNameEn: item.dayNameEn,
          branchId: item.branch.id,
          openTime: item.openTime,
          closeTime: item.closeTime,
          hoursAr: item.hoursAr,
          isSpecialDay: item.isSpecialDay,
          isClosed: item.isClosed,
          reasonAr: item.reasonAr,
          reason: item.reason,
        };
      }
    });

    return {
      data: scheduleItems,
      branches: normalizedBranches,
      source: 'supabase',
      error: null,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    const scheduleItems: WeeklyScheduleItem[] = localWeeklyRotation.map((item) => {
      const branch =
        fallbackBranches.find((b) => b.id === item.branchId) || fallbackBranches[0];
      return {
        dayIndex: item.dayIndex,
        dayNameAr: item.dayNameAr,
        dayNameEn: item.dayNameEn,
        branch,
        hoursAr: item.hoursAr ? formatTime12h(item.hoursAr) : formatTimeRange12h(item.openTime, item.closeTime),
        openTime: item.openTime,
        closeTime: item.closeTime,
        isSpecialDay: Boolean(item.isSpecialDay),
        isClosed: Boolean(item.isClosed),
        reasonAr: item.reasonAr || null,
        reason: item.reason || null,
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
 * 1.1 Update a Specific Day in the Recurring Weekly Schedule
 */
export async function updateWeeklyScheduleDay(
  dayIndex: number,
  updates: {
    branchId?: string;
    branch_id?: string;
    openTime?: string;
    open_time?: string;
    closeTime?: string;
    close_time?: string;
    hoursAr?: string;
    hours_ar?: string;
    isClosed?: boolean;
    is_closed?: boolean;
    is_working_day?: boolean;
    is_holiday?: boolean;
    isHoliday?: boolean;
    reason?: string | null;
    reasonAr?: string | null;
    reason_ar?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  const targetBranchId = updates.branchId || updates.branch_id;
  const targetOpenTime = updates.openTime || updates.open_time;
  const targetCloseTime = updates.closeTime || updates.close_time;
  const targetIsClosed = typeof updates.isClosed === 'boolean' ? updates.isClosed : typeof updates.is_closed === 'boolean' ? updates.is_closed : undefined;
  const targetReason = updates.reason !== undefined ? updates.reason : updates.reasonAr !== undefined ? updates.reasonAr : updates.reason_ar;

  // 1. Update in-memory rotation
  const matchIdx = localWeeklyRotation.findIndex((r) => r.dayIndex === dayIndex);
  if (matchIdx >= 0) {
    const current = localWeeklyRotation[matchIdx];
    const openTime = targetOpenTime || current.openTime;
    const closeTime = targetCloseTime || current.closeTime;
    const hoursAr = updates.hoursAr || updates.hours_ar
      ? formatTime12h(updates.hoursAr || updates.hours_ar || '')
      : formatTimeRange12h(openTime, closeTime);

    localWeeklyRotation[matchIdx] = {
      ...current,
      branchId: targetBranchId || current.branchId,
      openTime,
      closeTime,
      hoursAr,
      isClosed: targetIsClosed !== undefined ? targetIsClosed : current.isClosed,
      reasonAr: targetReason !== undefined ? targetReason : current.reasonAr,
      reason: targetReason !== undefined ? targetReason : current.reason,
    };
  }

  // 2. Broadcast immediate reactive update across components
  notifyScheduleChanged();

  const targetItem = localWeeklyRotation.find((r) => r.dayIndex === dayIndex);

  if (!client) {
    if (targetItem) {
      await logAdminActivity(
        'schedule_updated',
        `تم تعديل مواعيد وجدول يوم (${targetItem.dayNameAr}) بفرع ${resolveBranchName(targetItem.branchId)}`,
        'schedule',
        String(dayIndex)
      );
    }
    return { success: true };
  }

  try {
    if (!targetItem) return { success: true };

    // Resolve row ID for this day from cache or database
    let targetRowId = cachedWeeklyRowIds[dayIndex];
    if (!targetRowId) {
      const { data: existingRow } = await client
        .from('weekly_schedule')
        .select('id')
        .eq('day_of_week', dayIndex)
        .maybeSingle();
      if (existingRow) {
        targetRowId = existingRow.id;
        cachedWeeklyRowIds[dayIndex] = targetRowId;
      }
    }

    const branchUuid = resolveBranchUuid(targetBranchId || targetItem.branchId);
    const openTime = targetItem.openTime.length === 5 ? `${targetItem.openTime}:00` : targetItem.openTime;
    const closeTime = targetItem.closeTime.length === 5 ? `${targetItem.closeTime}:00` : targetItem.closeTime;

    const payload: {
      id?: string;
      day_of_week: number;
      branch_id: string;
      start_time: string;
      end_time: string;
      is_working_day: boolean;
      updated_at: string;
    } = {
      day_of_week: dayIndex,
      branch_id: branchUuid,
      start_time: openTime || '13:00:00',
      end_time: closeTime || '21:00:00',
      is_working_day: !targetItem.isClosed,
      updated_at: new Date().toISOString(),
    };

    if (targetRowId) {
      payload.id = targetRowId;
    }

    const { data: upsertData, error } = await client
      .from('weekly_schedule')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsert weekly_schedule warning:', error.message);
      return { success: false, error: error.message };
    }

    if (upsertData && upsertData[0]) {
      cachedWeeklyRowIds[dayIndex] = upsertData[0].id;
    }

    await logAdminActivity(
      'schedule_updated',
      `تم تعديل مواعيد وجدول يوم (${targetItem.dayNameAr}) بـ ${resolveBranchName(targetItem.branchId)}`,
      'schedule',
      String(dayIndex)
    );

    notifyScheduleChanged();
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * 1.2 Save Full Weekly Schedule (all 7 days) directly using Supabase batch upsert
 */
export interface ScheduleSaveInput {
  dayIndex?: number;
  day_of_week?: number;
  branchId?: string;
  branch_id?: string;
  openTime?: string;
  open_time?: string;
  closeTime?: string;
  close_time?: string;
  isClosed?: boolean;
  is_closed?: boolean;
  reason?: string | null;
  reasonAr?: string | null;
  reason_ar?: string | null;
}

export async function saveFullWeeklySchedule(
  items: ScheduleSaveInput[]
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  // 1. Update in-memory rotation immediately
  for (const item of items) {
    const day = item.dayIndex !== undefined ? item.dayIndex : item.day_of_week;
    if (day === undefined) continue;
    const matchIdx = localWeeklyRotation.findIndex((r) => r.dayIndex === day);
    if (matchIdx >= 0) {
      const openTime = item.openTime || item.open_time || localWeeklyRotation[matchIdx].openTime;
      const closeTime = item.closeTime || item.close_time || localWeeklyRotation[matchIdx].closeTime;
      localWeeklyRotation[matchIdx] = {
        ...localWeeklyRotation[matchIdx],
        branchId: item.branchId || item.branch_id || localWeeklyRotation[matchIdx].branchId,
        openTime,
        closeTime,
        hoursAr: formatTimeRange12h(openTime, closeTime),
        isClosed: item.isClosed !== undefined ? item.isClosed : item.is_closed !== undefined ? item.is_closed : localWeeklyRotation[matchIdx].isClosed,
        reasonAr: item.reasonAr || item.reason_ar || item.reason || localWeeklyRotation[matchIdx].reasonAr,
        reason: item.reason || item.reasonAr || localWeeklyRotation[matchIdx].reason,
      };
    }
  }

  notifyScheduleChanged();

  if (!client) {
    await logAdminActivity(
      'schedule_updated',
      `تم حفظ وتحديث جدول التناوب الأسبوعي بالكامل (${items.length} يوم)`,
      'weekly_schedule',
      'full_rotation'
    );
    return { success: true };
  }

  try {
    // Query current weekly_schedule rows from Supabase to retrieve primary keys for all 7 days
    const { data: dbRows } = await client.from('weekly_schedule').select('id, day_of_week');
    const dayToIdMap: Record<number, string> = { ...cachedWeeklyRowIds };
    if (dbRows) {
      dbRows.forEach((r) => {
        dayToIdMap[Number(r.day_of_week)] = r.id;
        cachedWeeklyRowIds[Number(r.day_of_week)] = r.id;
      });
    }

    const payloads = localWeeklyRotation.map((item) => {
      const openTime = item.openTime.length === 5 ? `${item.openTime}:00` : item.openTime;
      const closeTime = item.closeTime.length === 5 ? `${item.closeTime}:00` : item.closeTime;
      const rowId = dayToIdMap[item.dayIndex];

      const payload: {
        id?: string;
        day_of_week: number;
        branch_id: string;
        start_time: string;
        end_time: string;
        is_working_day: boolean;
        updated_at: string;
      } = {
        day_of_week: item.dayIndex,
        branch_id: resolveBranchUuid(item.branchId),
        start_time: openTime || '13:00:00',
        end_time: closeTime || '21:00:00',
        is_working_day: !item.isClosed,
        updated_at: new Date().toISOString(),
      };

      if (rowId) {
        payload.id = rowId;
      }

      return payload;
    });

    const { data: upsertData, error } = await client
      .from('weekly_schedule')
      .upsert(payloads)
      .select();

    if (error) {
      console.warn('Supabase batch upsert weekly_schedule error:', error.message);
      return { success: false, error: error.message };
    }

    if (upsertData) {
      upsertData.forEach((r) => {
        cachedWeeklyRowIds[Number(r.day_of_week)] = r.id;
      });
    }

    await logAdminActivity(
      'schedule_updated',
      `تم حفظ وتحديث جدول التناوب الأسبوعي بالكامل (${items.length} يوم) في قاعدة البيانات`,
      'weekly_schedule',
      'full_rotation'
    );

    notifyScheduleChanged();
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
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
    // Query live daily_branch_overrides table
    const { data, error } = await client
      .from('daily_branch_overrides')
      .select('*')
      .order('override_date', { ascending: true });

    if (!error && data && data.length > 0) {
      const formatted: DailyBranchOverrideRecord[] = data.map((row) => {
        const branchName = row.branch_name || 'فرع مدينة نصر';
        const branchUuid = resolveBranchUuid(branchName);
        const fallbackBranch = defaultBranches.find((def) => def.nameAr === branchName) || defaultBranches[0];

        return {
          id: String(row.id),
          override_date: row.override_date,
          branch_name: branchName,
          branch_id: branchUuid,
          reason: row.reason || 'تبديل موقع العيادة اليومي',
          reason_ar: row.reason || 'تبديل موقع العيادة اليومي',
          notes: null,
          is_active: true,
          created_at: row.created_at,
          branch: {
            id: branchUuid,
            nameAr: branchName,
            cityAr: fallbackBranch?.cityAr || 'القاهرة',
            addressAr: fallbackBranch?.addressAr || '',
            phone: fallbackBranch?.phones?.[0]?.number || '01154021247',
            mapsUrl: fallbackBranch?.mapsUrl || '',
          },
        };
      });
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
        .map((row) => {
          const branchName = resolveBranchName(row.replacement_branch_id);
          const fallbackBranch = defaultBranches.find((def) => def.nameAr === branchName) || defaultBranches[0];
          return {
            id: row.id,
            override_date: row.exception_date,
            branch_name: branchName,
            branch_id: row.replacement_branch_id,
            reason: row.reason || 'تبديل فرع الكشف',
            reason_ar: row.reason || 'تبديل فرع الكشف',
            notes: null,
            is_active: true,
            created_at: row.created_at,
            branch: {
              id: row.replacement_branch_id,
              nameAr: branchName,
              cityAr: fallbackBranch?.cityAr || 'القاهرة',
              addressAr: fallbackBranch?.addressAr || '',
              phone: fallbackBranch?.phones?.[0]?.number || '01154021247',
              mapsUrl: fallbackBranch?.mapsUrl || '',
            },
          };
        });
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
  const localMatch = localDailyOverrides.find((o) => o.override_date === dateString);
  if (localMatch) return localMatch;

  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('daily_branch_overrides')
      .select('*')
      .eq('override_date', dateString)
      .maybeSingle();

    if (!error && data) {
      const branchName = data.branch_name || 'فرع مدينة نصر';
      const branchUuid = resolveBranchUuid(branchName);
      return {
        id: String(data.id),
        override_date: data.override_date,
        branch_name: branchName,
        branch_id: branchUuid,
        reason: data.reason || 'تبديل فرع الكشف',
        reason_ar: data.reason || 'تبديل فرع الكشف',
        notes: null,
        is_active: true,
        created_at: data.created_at,
      };
    }
  } catch {
    // Fallback
  }

  return null;
}

/**
 * 2.3 Save / Update Daily Branch Override
 */
export async function saveDailyBranchOverride(payload: {
  override_date: string;
  branch_id: string;
  branch_name?: string;
  original_branch_id?: string | null;
  reason?: string;
  notes?: string;
}): Promise<{ success: boolean; data?: DailyBranchOverrideRecord; error?: string }> {
  const client = getSupabaseClient();
  const dateStr = payload.override_date;
  const branchName = payload.branch_name || resolveBranchName(payload.branch_id);
  const branchUuid = resolveBranchUuid(payload.branch_id);
  const reasonText = payload.reason || 'تبديل استثنائي لموقع العيادة اليومي';

  const overrideRecord: DailyBranchOverrideRecord = {
    id: `dbo-${Date.now()}`,
    override_date: dateStr,
    branch_name: branchName,
    branch_id: branchUuid,
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

  notifyScheduleChanged();

  if (!client) {
    return { success: true, data: overrideRecord };
  }

  try {
    // 1. Save to daily_branch_overrides table using onConflict on override_date
    const { data: dbData, error: dbError } = await client
      .from('daily_branch_overrides')
      .upsert(
        [
          {
            override_date: dateStr,
            branch_name: branchName,
            reason: reasonText,
          },
        ],
        { onConflict: 'override_date' }
      )
      .select()
      .single();

    if (dbError) {
      console.warn('Upsert to daily_branch_overrides error:', dbError.message);
      return { success: false, error: dbError.message };
    }

    if (dbData) {
      overrideRecord.id = String(dbData.id);
      overrideRecord.created_at = dbData.created_at || overrideRecord.created_at;
    }

    // 2. Also keep schedule_exceptions table in sync with valid branch UUID
    const { data: existingExc } = await client
      .from('schedule_exceptions')
      .select('id')
      .eq('exception_date', dateStr);

    const excPayload = {
      exception_date: dateStr,
      is_holiday: false,
      reason: reasonText,
      replacement_branch_id: branchUuid,
    };

    if (existingExc && existingExc.length > 0) {
      await client
        .from('schedule_exceptions')
        .update(excPayload)
        .eq('id', existingExc[0].id);
    } else {
      await client
        .from('schedule_exceptions')
        .insert([excPayload]);
    }

    await logAdminActivity(
      'branch_swapped',
      `تم تغيير فرع يوم ${overrideRecord.override_date} إلى ${overrideRecord.branch_name || overrideRecord.branch_name_ar || resolveBranchName(overrideRecord.branch_id)}`,
      'daily_override',
      overrideRecord.override_date
    );

    notifyScheduleChanged();
    return { success: true, data: overrideRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error saving daily branch override:', err);
    return { success: false, error: msg };
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

  await logAdminActivity(
    'branch_swapped',
    `تم إلغاء التغيير اليومي للفرع لتاريخ ${dateStr || dateOrId}`,
    'daily_override',
    dateStr || dateOrId
  );

  notifyScheduleChanged();

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
      await client.from('daily_branch_overrides').delete().eq('id', Number(dateOrId) || dateOrId);
      await client.from('schedule_exceptions').delete().eq('id', dateOrId);
    }
    notifyScheduleChanged();
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
  const matching = localWeeklyRotation.filter((r) => r.branchId === branchId && !r.isClosed);
  if (matching.length === 0) {
    const fallbackMatching = DEFAULT_WEEKLY_ROTATION.filter((r) => r.branchId === branchId);
    return fallbackMatching.map((r) => r.dayNameAr);
  }
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

  const allBranches =
    weeklyRes.branches.length > 0
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
    allBranches.find((b) => b.id === localWeeklyRotation.find((r) => r.dayIndex === dayIndex)?.branchId) ||
    allBranches[0] ||
    normalizeBranch(defaultBranches[0])!;

  const isWeeklyClosed = Boolean(scheduledRotation?.isClosed);
  const weeklyReason = scheduledRotation?.reasonAr || (isWeeklyClosed ? 'إجازة أسبوعية — العيادة مغلقة' : null);

  return {
    branch: regularBranch,
    dayIndex,
    dayNameAr,
    isHoliday: false,
    isClosed: isWeeklyClosed,
    isOverride: false,
    reason: weeklyReason,
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

  let formattedHoursAr = regularTodayItem?.hoursAr
    ? formatTime12h(regularTodayItem.hoursAr)
    : '1:00 م — 9:00 م';
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
    isClosed: isClosed || isHoliday,
    isHoliday,
    reasonAr: exceptionDetails.reasonAr,
    openStatus: {
      isOpen: statusCalc.isOpen,
      statusTextAr: statusCalc.statusTextAr,
    },
  };
}
