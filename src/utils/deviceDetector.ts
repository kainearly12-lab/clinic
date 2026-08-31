/**
 * Automatic Device Detection Utility
 * Parses navigator.userAgent to identify the client device category in Arabic
 * (e.g., لابتوب ويندوز, ماك, أيفون, أندرويد, آيباد, لينكس)
 */

export type DeviceCategory = 'windows' | 'mac' | 'iphone' | 'ipad' | 'android' | 'linux' | 'other';

export interface DeviceDetectionResult {
  deviceLabelAr: string;
  category: DeviceCategory;
  browserName?: string;
  fullIdentifier: string;
}

/**
 * Detect device type and return a concise Arabic label
 */
export function getDeviceType(customUA?: string): string {
  const result = detectDevice(customUA);
  return result.deviceLabelAr;
}

/**
 * Detailed device and browser detection
 */
export function detectDevice(customUA?: string): DeviceDetectionResult {
  if (typeof window === 'undefined' && !customUA) {
    return {
      deviceLabelAr: 'مدير النظام (خادم)',
      category: 'other',
      fullIdentifier: 'Server Environment',
    };
  }

  const ua = customUA || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const lowerUA = ua.toLowerCase();

  // Determine Browser
  let browserName = 'متصفح ويب';
  if (lowerUA.includes('edg/')) {
    browserName = 'Edge';
  } else if (lowerUA.includes('chrome') && !lowerUA.includes('chromium')) {
    browserName = 'Chrome';
  } else if (lowerUA.includes('safari') && !lowerUA.includes('chrome')) {
    browserName = 'Safari';
  } else if (lowerUA.includes('firefox')) {
    browserName = 'Firefox';
  } else if (lowerUA.includes('opera') || lowerUA.includes('opr/')) {
    browserName = 'Opera';
  }

  // Detect Device Category & Arabic Label
  // 1. iPhone
  if (/iphone|ipod/.test(lowerUA)) {
    return {
      deviceLabelAr: 'أيفون',
      category: 'iphone',
      browserName,
      fullIdentifier: `أيفون (${browserName})`,
    };
  }

  // 2. iPad
  if (/ipad/.test(lowerUA) || (lowerUA.includes('macintosh') && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) {
    return {
      deviceLabelAr: 'آيباد',
      category: 'ipad',
      browserName,
      fullIdentifier: `آيباد (${browserName})`,
    };
  }

  // 3. Android Phone / Tablet
  if (/android/.test(lowerUA)) {
    const isTablet = /tablet/.test(lowerUA) || !/mobile/.test(lowerUA);
    const label = isTablet ? 'تابلت أندرويد' : 'أندرويد';
    return {
      deviceLabelAr: label,
      category: 'android',
      browserName,
      fullIdentifier: `${label} (${browserName})`,
    };
  }

  // 4. Windows PC / Laptop
  if (/windows|win32|win64|wow64/.test(lowerUA)) {
    return {
      deviceLabelAr: 'لابتوب ويندوز',
      category: 'windows',
      browserName,
      fullIdentifier: `لابتوب ويندوز (${browserName})`,
    };
  }

  // 5. Mac / macOS
  if (/macintosh|mac os x/.test(lowerUA)) {
    return {
      deviceLabelAr: 'ماك',
      category: 'mac',
      browserName,
      fullIdentifier: `ماك (${browserName})`,
    };
  }

  // 6. Linux
  if (/linux|x11/.test(lowerUA)) {
    return {
      deviceLabelAr: 'نظام لينكس',
      category: 'linux',
      browserName,
      fullIdentifier: `لينكس (${browserName})`,
    };
  }

  // Fallback
  return {
    deviceLabelAr: 'متصفح ويب',
    category: 'other',
    browserName,
    fullIdentifier: `متصفح ويب (${browserName})`,
  };
}
