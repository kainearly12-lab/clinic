/**
 * Time and Schedule Localization Utilities (Egyptian Arabic 12-Hour Format)
 * Standardizes time representations across the public Weekly Matrix, banners,
 * admin managers, and booking appointment slots.
 */

export interface TimeFormatOptions {
  /**
   * If true, uses descriptive words: 'مساءً', 'صباحاً', 'ظهراً'
   * If false (default), uses compact Egyptian format: 'م', 'ص'
   */
  fullPeriod?: boolean;
}

/**
 * Converts a 24-hour time string (e.g. '13:00', '13:00:00', '09:30')
 * or a time range (e.g. '13:00 — 21:00', '13:00 - 21:00')
 * into Egyptian Arabic 12-hour format (e.g. '1:00 م — 9:00 م' or '1:00 مساءً — 9:00 مساءً').
 */
export function formatTime12h(
  timeStr: string | null | undefined,
  options: TimeFormatOptions = {}
): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // 1. Check if input is a range separated by '—', '-', '–', or 'إلى' / 'to'
  const rangeSeparator = getRangeSeparator(trimmed);
  if (rangeSeparator) {
    const parts = trimmed.split(rangeSeparator);
    if (parts.length >= 2) {
      const startFormatted = formatSingleTime12h(parts[0], options);
      const endFormatted = formatSingleTime12h(parts[1], options);
      return `${startFormatted} — ${endFormatted}`;
    }
  }

  return formatSingleTime12h(trimmed, options);
}

/**
 * Detects if the string contains a time range separator
 */
function getRangeSeparator(str: string): string | null {
  if (str.includes('—')) return '—';
  if (str.includes('–')) return '–';
  if (str.includes(' - ')) return ' - ';
  if (str.includes('-') && /\d-\d/.test(str)) return '-';
  if (str.includes(' إلى ')) return ' إلى ';
  if (str.includes(' to ')) return ' to ';
  return null;
}

/**
 * Formats a single time string like '13:00' or '09:00:00' or already formatted '1:00 ظهراً'
 */
export function formatSingleTime12h(
  singleTime: string,
  options: TimeFormatOptions = {}
): string {
  const t = singleTime.trim();
  if (!t) return '';

  // If it already contains Arabic period indicators ('م', 'ص', 'مساءً', 'صباحاً', 'ظهراً', 'عصراً')
  if (/[\u0600-\u06FF]/.test(t)) {
    // If standardizing to compact 'م' / 'ص' or vice-versa, clean up cleanly
    if (options.fullPeriod) {
      if (t.includes(' م') && !t.includes('مساء')) {
        return t.replace(/\s*م$/, ' مساءً');
      }
      if (t.includes(' ص') && !t.includes('صباح')) {
        return t.replace(/\s*ص$/, ' صباحاً');
      }
    }
    return t;
  }

  // Parse HH:mm or HH:mm:ss
  const match = t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) {
    return t; // Return as-is if unparseable
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];

  if (isNaN(hours)) return t;

  let periodCompact = 'ص';
  let periodFull = 'صباحاً';

  if (hours === 0) {
    hours = 12;
    periodCompact = 'ص';
    periodFull = 'صباحاً';
  } else if (hours === 12) {
    hours = 12;
    periodCompact = 'م';
    periodFull = 'ظهراً';
  } else if (hours > 12 && hours < 24) {
    hours = hours - 12;
    periodCompact = 'م';
    if (hours === 1 || hours === 2) {
      periodFull = 'ظهراً';
    } else if (hours >= 3 && hours <= 5) {
      periodFull = 'عصراً';
    } else {
      periodFull = 'مساءً';
    }
  } else {
    periodCompact = 'ص';
    periodFull = 'صباحاً';
  }

  const period = options.fullPeriod ? periodFull : periodCompact;
  return `${hours}:${minutes} ${period}`;
}

/**
 * Combines start and end time into localized 12-hour Arabic range
 * Example: formatTimeRange12h('13:00', '21:00') => '1:00 م — 9:00 م'
 */
export function formatTimeRange12h(
  openTime: string | null | undefined,
  closeTime: string | null | undefined,
  options: TimeFormatOptions = {}
): string {
  if (!openTime && !closeTime) return '';
  if (!openTime) return formatTime12h(closeTime, options);
  if (!closeTime) return formatTime12h(openTime, options);

  const start = formatSingleTime12h(openTime, options);
  const end = formatSingleTime12h(closeTime, options);
  return `${start} — ${end}`;
}

/**
 * Formats a Date or ISO date string into friendly Egyptian Arabic day and date
 * Example: formatArabicDate(new Date()) => 'الثلاثاء، 1 سبتمبر 2026'
 */
export function formatArabicDate(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  try {
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return d.toLocaleDateString('ar-EG');
  }
}
