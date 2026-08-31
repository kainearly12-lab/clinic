/**
 * TypeScript definitions for Supabase schedule data layer,
 * including branches, weekly_schedule, and schedule_exceptions tables.
 */

export interface BranchRecord {
  id: string;
  name_ar?: string;
  nameAr?: string;
  city_ar?: string;
  cityAr?: string;
  address_ar?: string;
  addressAr?: string;
  phone?: string;
  phones?: { number: string; display: string }[];
  maps_url?: string;
  mapsUrl?: string;
  map_src?: string;
  mapSrc?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface WeeklyScheduleRecord {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  day_name_ar: string;
  day_name_en: string;
  branch_id: string;
  open_time: string; // e.g. '13:00:00' or '13:00'
  close_time: string; // e.g. '21:00:00' or '21:00'
  hours_ar: string; // e.g. '1:00 ظهراً — 9:00 مساءً'
  is_closed?: boolean;
  is_special?: boolean;
  created_at?: string;
  // Supabase relation join
  branches?: BranchRecord | null;
  branch?: BranchRecord | null;
}

export type ExceptionType =
  | 'holiday'
  | 'branch_swap'
  | 'custom_hours'
  | 'emergency_closure';

export interface ScheduleExceptionRecord {
  id?: string;
  exception_date: string; // ISO date 'YYYY-MM-DD'
  exception_type?: ExceptionType;
  branch_id?: string | null; // Scheduled default branch ID for that day
  replacement_branch_id?: string | null; // New active branch ID if swapped
  override_branch_id?: string | null; // Alternative column name for replacement_branch_id
  is_holiday?: boolean; // Boolean flag for holiday status
  is_closed?: boolean; // Boolean flag for closure status
  title_ar?: string; // e.g. 'عطلة رسمية — عيد الفطر' or 'تبديل فرع اليوم'
  reason_ar?: string | null;
  open_time?: string | null;
  close_time?: string | null;
  hours_ar?: string | null;
  created_at?: string;
  // Joined relations
  replacement_branch?: BranchRecord | null;
  override_branch?: BranchRecord | null;
  original_branch?: BranchRecord | null;
}

/**
 * Normalized representation of a Branch
 */
export interface NormalizedBranch {
  id: string;
  nameAr: string;
  cityAr: string;
  addressAr: string;
  phone: string;
  mapsUrl: string;
}

/**
 * Clean JSON output object containing the current active branch,
 * today's working hours, and whether the clinic is currently open
 * or on an exception status (for homepage banner & widgets).
 */
export interface TodayScheduleResult {
  /** ISO Date string 'YYYY-MM-DD' */
  date: string;
  /** JavaScript Day index 0-6 (0 = Sunday) */
  dayOfWeek: number;
  /** Arabic day name, e.g. 'الأحد' */
  dayNameAr: string;
  /** English day name, e.g. 'Sunday' */
  dayNameEn: string;

  /** Active branch for today (considers regular schedule or active branch swap) */
  activeBranch: NormalizedBranch | null;

  /** Today's working hours */
  todayWorkingHours: {
    /** Formatted Arabic string, e.g. '1:00 ظهراً — 9:00 مساءً' */
    formattedAr: string;
    /** Open time 'HH:mm' e.g. '13:00' */
    openTime: string | null;
    /** Close time 'HH:mm' e.g. '21:00' */
    closeTime: string | null;
    /** Whether today operates on special/reduced hours */
    isSpecialHours: boolean;
  };

  /** Real-time clinic open/closed status calculation */
  status: {
    /** Whether the clinic is currently open at this exact moment */
    isOpen: boolean;
    /** Human-readable status in Arabic, e.g. 'مفتوح الآن حتى 9:00 م' or 'مغلق اليوم' */
    statusTextAr: string;
    /** Clean concise badge text for the homepage banner */
    bannerBadgeText: string;
    /** Whether closing is imminent (within 60 minutes) */
    isClosingSoon: boolean;
    /** Whether today is marked as a holiday */
    isHoliday: boolean;
    /** Whether today's schedule was swapped to another branch */
    isBranchSwap: boolean;
  };

  /** Exception status details if an active holiday or branch swap exists for today */
  exception: {
    hasException: boolean;
    type: ExceptionType | null;
    titleAr: string | null;
    reasonAr: string | null;
    originalBranchId: string | null;
    originalBranchNameAr: string | null;
    replacementBranchId: string | null;
    replacementBranchNameAr: string | null;
    isClosed: boolean;
  };

  /** Source of data: Supabase remote DB or local fallback */
  source: 'supabase' | 'fallback';
  /** Timestamp when calculation was performed */
  timestamp: string;
}

/**
 * Complete weekly schedule item paired with branch data
 */
export interface WeeklyScheduleItem {
  dayIndex: number;
  dayNameAr: string;
  dayNameEn: string;
  branch: NormalizedBranch;
  hoursAr: string;
  openTime: string;
  closeTime: string;
  isSpecialDay: boolean;
  isClosed: boolean;
}
