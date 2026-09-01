import {
  fetchScheduleExceptionForDate,
  fetchDailyBranchOverrideForDate,
  fetchWeeklyScheduleWithBranches,
  getOperatingDaysForBranch,
  getIsoDateString,
  normalizeBranch,
} from './scheduleService';
import { NormalizedBranch, ScheduleExceptionRecord } from '@/types/schedule';
import { branches as defaultBranches, clinic } from '@/data/clinicData';

/**
 * Branch-specific verified WhatsApp numbers (with Egyptian country code 20)
 */
export const BRANCH_WHATSAPP_NUMBERS: Record<string, string> = {
  'nasr-city': '201154021247',
  'fifth-settlement': '201223371075',
  'maadi': '201154021249',
  'new-giza': '201154021248',
};

/**
 * Returns the verified WhatsApp phone number for a branch ID
 */
export function getBranchWhatsAppNumber(branchId?: string | null): string {
  if (!branchId) return clinic.whatsapp || '201154021247';
  return BRANCH_WHATSAPP_NUMBERS[branchId] || clinic.whatsapp || '201154021247';
}

/**
 * Extracts and normalizes an ISO date string (YYYY-MM-DD) from user input or keywords
 */
export function parseBookingDate(input?: string | Date | null): {
  date: Date;
  dateString: string;
  hasExplicitDate: boolean;
} {
  const now = new Date();

  if (!input) {
    return {
      date: now,
      dateString: getIsoDateString(now),
      hasExplicitDate: false,
    };
  }

  if (input instanceof Date) {
    return {
      date: input,
      dateString: getIsoDateString(input),
      hasExplicitDate: true,
    };
  }

  const trimmed = input.trim();

  // Arabic date keyword shortcuts
  if (trimmed.includes('اليوم') || trimmed.toLowerCase().includes('today')) {
    return {
      date: now,
      dateString: getIsoDateString(now),
      hasExplicitDate: true,
    };
  }

  if (
    trimmed.includes('غداً') ||
    trimmed.includes('غدا') ||
    trimmed.includes('بكرة') ||
    trimmed.toLowerCase().includes('tomorrow')
  ) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      date: tomorrow,
      dateString: getIsoDateString(tomorrow),
      hasExplicitDate: true,
    };
  }

  // Check for ISO format YYYY-MM-DD in the text
  const isoMatch = trimmed.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const parsedDate = new Date(y, m, d);
    if (!isNaN(parsedDate.getTime())) {
      return {
        date: parsedDate,
        dateString: getIsoDateString(parsedDate),
        hasExplicitDate: true,
      };
    }
  }

  // Check for DD/MM/YYYY or DD-MM-YYYY format
  const dmyMatch = trimmed.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    const parsedDate = new Date(y, m, d);
    if (!isNaN(parsedDate.getTime())) {
      return {
        date: parsedDate,
        dateString: getIsoDateString(parsedDate),
        hasExplicitDate: true,
      };
    }
  }

  // Default to today if no date could be parsed
  return {
    date: now,
    dateString: getIsoDateString(now),
    hasExplicitDate: false,
  };
}

export interface BookingValidationResult {
  /** Whether the clinic is accepting bookings for this date (false if holiday/closed) */
  isValid: boolean;
  /** True if marked as an active holiday */
  isHoliday: boolean;
  /** True if clinic is closed for other exception reason */
  isClosed: boolean;
  /** Strict Arabic error message if blocked */
  errorMessageAr: string | null;
  /** Resolved branch ID (routed to override_branch_id / replacement_branch_id if swapped) */
  targetBranchId: string;
  /** Normalized Branch data for routing */
  targetBranch: NormalizedBranch;
  /** Scheduled branch for that day (whether swapped or standard rotation) */
  scheduledBranch: NormalizedBranch | null;
  /** True if requested branch does not match the branch scheduled for that day */
  isBranchMismatch: boolean;
  /** Operating days in Arabic for the requested branch */
  operatingDaysAr: string[];
  /** Direct WhatsApp number to route message to */
  targetWhatsAppNumber: string;
  /** Whether the schedule was swapped for this date */
  isBranchSwapped: boolean;
  /** Original requested branch before swap */
  originalBranchId?: string;
  /** Exception details if any */
  exception: ScheduleExceptionRecord | null;
  /** Formatted date string */
  dateString: string;
}

/**
 * 1. Validates a booking date against schedule exceptions, daily overrides, and weekly rotation.
 * - If date is an active holiday (is_holiday = true / is_closed = true), strictly flags invalid with error message.
 * - If date has an override_branch_id (branch swap) or daily branch override, automatically routes to the replacement branch.
 */
export async function validateBookingDate(
  inputDate?: string | Date | null,
  defaultBranchId?: string
): Promise<BookingValidationResult> {
  const { date, dateString } = parseBookingDate(inputDate);
  const dayOfWeek = date.getDay();

  // Fetch exception for date, daily branch override, and weekly schedule
  const [exceptionRes, overrideRecord, weeklyRes] = await Promise.all([
    fetchScheduleExceptionForDate(dateString),
    fetchDailyBranchOverrideForDate(dateString),
    fetchWeeklyScheduleWithBranches(),
  ]);

  const allBranches = weeklyRes.branches.length > 0
    ? weeklyRes.branches
    : defaultBranches.map((b) => normalizeBranch(b)!);

  const regularItem = weeklyRes.data.find((item) => item.dayIndex === dayOfWeek);

  // Fallback branch if none selected
  const requestedBranchId = defaultBranchId || regularItem?.branch.id || allBranches[0]?.id || 'nasr-city';
  let targetBranchId = requestedBranchId;
  let isHoliday = false;
  let isClosed = false;
  let isBranchSwapped = false;
  let errorMessageAr: string | null = null;

  const exception = exceptionRes.data;

  // Determine what branch is naturally scheduled for that day
  let scheduledBranch: NormalizedBranch | null =
    regularItem?.branch ||
    allBranches.find((b) => b.id === 'fifth-settlement') ||
    allBranches[0] ||
    null;

  if (exception) {
    const isHolidayFlag =
      exception.exception_type === 'holiday' ||
      Boolean(exception.is_holiday) ||
      Boolean(exception.is_closed);

    const overrideBranchId =
      overrideRecord?.branch_id ||
      exception.override_branch_id ||
      exception.replacement_branch_id;

    if (isHolidayFlag) {
      isHoliday = true;
      isClosed = true;
      scheduledBranch = null;
      // Mandated custom Arabic error alert
      errorMessageAr = 'عذراً، العيادة مغلقة في هذا اليوم';
      if (exception.title_ar && !exception.title_ar.includes('عطلة')) {
        errorMessageAr += ` (${exception.title_ar})`;
      }
    } else if (overrideBranchId) {
      isBranchSwapped = true;
      targetBranchId = overrideBranchId;
      const repl = allBranches.find((b) => b.id === overrideBranchId);
      if (repl) scheduledBranch = repl;
    }
  } else if (overrideRecord && overrideRecord.branch_id) {
    isBranchSwapped = true;
    targetBranchId = overrideRecord.branch_id;
    const repl = allBranches.find((b) => b.id === overrideRecord.branch_id);
    if (repl) scheduledBranch = repl;
  }

  // Resolve target normalized branch
  let targetBranch =
    allBranches.find((b) => b.id === targetBranchId) ||
    allBranches[0] ||
    normalizeBranch(defaultBranches[0])!;

  // If branch was swapped and joined branch data is available
  if (isBranchSwapped && exception) {
    const joined = normalizeBranch(exception.replacement_branch || exception.override_branch);
    if (joined) {
      targetBranch = joined;
      scheduledBranch = joined;
    }
  }

  const isBranchMismatch = Boolean(
    scheduledBranch && requestedBranchId && scheduledBranch.id !== requestedBranchId
  );

  const operatingDaysAr = getOperatingDaysForBranch(requestedBranchId);
  const targetWhatsAppNumber = getBranchWhatsAppNumber(targetBranch.id);

  return {
    isValid: !isHoliday && !isClosed,
    isHoliday,
    isClosed,
    errorMessageAr,
    targetBranchId: targetBranch.id,
    targetBranch,
    scheduledBranch,
    isBranchMismatch,
    operatingDaysAr,
    targetWhatsAppNumber,
    isBranchSwapped,
    originalBranchId: requestedBranchId,
    exception,
    dateString,
  };
}

export interface WhatsAppBookingParams {
  name: string;
  phone: string;
  service?: string;
  preferredDateTime?: string;
  date?: string | Date | null;
  branchId?: string;
  notes?: string;
}

export interface WhatsAppGenerationResult {
  /** True if URL generated successfully */
  success: boolean;
  /** Generated WhatsApp wa.me URL, or null if blocked by holiday */
  url: string | null;
  /** Custom Arabic error message if blocked */
  errorMessageAr: string | null;
  /** Active target branch after exception resolution */
  targetBranch: NormalizedBranch;
  /** Direct WhatsApp number used */
  targetWhatsAppNumber: string;
  /** Whether date is marked as holiday */
  isHoliday: boolean;
  /** Whether branch was swapped */
  isBranchSwapped: boolean;
}

/**
 * 2 & 3. Validates date against schedule exceptions and generates the formatted WhatsApp URL.
 * - Strictly disables WhatsApp link generation if date is an active holiday (`is_holiday = true`).
 * - Automatically routes message and phone number to replacement branch if `override_branch_id` is active.
 */
export async function generateWhatsAppBookingUrl(
  params: WhatsAppBookingParams
): Promise<WhatsAppGenerationResult> {
  const {
    name,
    phone,
    service = 'استشارة عامة',
    preferredDateTime = '',
    date,
    branchId,
    notes = '',
  } = params;

  // 1. Validate schedule exception for the target date
  const validation = await validateBookingDate(date || preferredDateTime, branchId);

  // 2. If marked as holiday, STRICTLY prevent WhatsApp link generation
  if (validation.isHoliday || !validation.isValid) {
    return {
      success: false,
      url: null,
      errorMessageAr: validation.errorMessageAr || 'عذراً، العيادة مغلقة في هذا اليوم',
      targetBranch: validation.targetBranch,
      targetWhatsAppNumber: validation.targetWhatsAppNumber,
      isHoliday: true,
      isBranchSwapped: validation.isBranchSwapped,
    };
  }

  // 3. Construct WhatsApp message routed to target branch (or swapped override branch)
  const targetBranch = validation.targetBranch;
  const targetPhone = validation.targetWhatsAppNumber;

  const branchLine = validation.isBranchSwapped
    ? `📍 الفرع المتاح والمناوب: ${targetBranch.nameAr} (${targetBranch.cityAr})`
    : `📍 الفرع المطلوب: ${targetBranch.nameAr} (${targetBranch.cityAr})`;

  const messageLines = [
    'مرحبًا عيادات Androderma، أرغب في حجز موعد استشارة:',
    branchLine,
    `👤 الاسم: ${name.trim()}`,
    `📞 الهاتف: ${phone.trim()}`,
    `✨ نوع الخدمة: ${service.trim() || 'استشارة عامة'}`,
    `🗓️ الموعد المفضل: ${preferredDateTime.trim() || validation.dateString || 'أقرب موعد متاح'}`,
  ];

  if (validation.isBranchSwapped && validation.exception?.title_ar) {
    messageLines.push(`ℹ️ ملاحظة الفرع: ${validation.exception.title_ar}`);
  }

  if (notes.trim()) {
    messageLines.push(`📝 ملاحظات إضافية: ${notes.trim()}`);
  }

  const fullMessage = messageLines.join('\n');
  const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(fullMessage)}`;

  return {
    success: true,
    url: waUrl,
    errorMessageAr: null,
    targetBranch,
    targetWhatsAppNumber: targetPhone,
    isHoliday: false,
    isBranchSwapped: validation.isBranchSwapped,
  };
}
