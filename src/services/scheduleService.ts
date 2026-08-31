import { getSupabaseClient } from '@/lib/supabase';
import { branches as defaultBranches } from '@/data/clinicData';
import {
  BranchRecord,
  ScheduleExceptionRecord,
  NormalizedBranch,
  TodayScheduleResult,
  WeeklyScheduleItem,
} from '@/types/schedule';

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
      },
      error: null,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
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

  const [weeklyRes, exceptionRes] = await Promise.all([
    fetchWeeklyScheduleWithBranches(),
    fetchScheduleExceptionForDate(dateStr),
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
    hasException: Boolean(exception),
    type: exception?.exception_type || null,
    titleAr: exception?.title_ar || null,
    reasonAr: exception?.reason_ar || null,
    originalBranchId: exception?.branch_id || (activeBranch ? activeBranch.id : null),
    originalBranchNameAr: activeBranch ? activeBranch.nameAr : null,
    replacementBranchId: exception?.replacement_branch_id || null,
    replacementBranchNameAr: null as string | null,
    isClosed: Boolean(exception?.is_closed),
  };

  // Evaluate Exception Override (Holiday vs Branch Swap vs Branch Specific)
  if (exception) {
    const isHolidayFlag =
      exception.exception_type === 'holiday' ||
      Boolean(exception.is_holiday) ||
      Boolean(exception.is_closed);

    const swapBranchId = exception.override_branch_id || exception.replacement_branch_id;

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
