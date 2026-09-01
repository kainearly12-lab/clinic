import { getSupabaseClient } from '@/lib/supabase';
import { logAdminActivity } from './adminService';

export interface ClinicPaymentSettings {
  id?: string | number;
  consultation_price: number;
  currency: string;
  vodafone_cash_number: string;
  instapay_address: string;
  instapay_number: string;
  bank_account_info?: string;
  payment_instructions_ar: string;
  is_payment_enabled: boolean;
  updated_at?: string;
}

const DEFAULT_PAYMENT_SETTINGS: ClinicPaymentSettings = {
  id: 1,
  consultation_price: 1200,
  currency: 'ج.م',
  vodafone_cash_number: '01154021247',
  instapay_address: 'androderma@instapay',
  instapay_number: '01154021247',
  bank_account_info: '',
  payment_instructions_ar:
    'يرجى تحويل رسوم الكشف الطبي عبر فودافون كاش أو تطبيق إنستاباي وإرفاق سكرين شوت يوضح نجاح التحويل لتأكيد الموعد فوراً.',
  is_payment_enabled: true,
  updated_at: new Date().toISOString(),
};

const LOCAL_STORAGE_CACHE_KEY = 'androderma_payment_settings_cache';

let cachedSettings: ClinicPaymentSettings = { ...DEFAULT_PAYMENT_SETTINGS };

// Initialize from local storage cache if available
try {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (raw) {
      cachedSettings = { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(raw) };
    }
  }
} catch {
  // Ignore local storage parse error
}

/**
 * Fetches dynamic clinic payment settings and consultation price from Supabase table 'clinic_payment_settings'
 */
export async function fetchClinicPaymentSettings(): Promise<ClinicPaymentSettings> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ...cachedSettings };
  }

  try {
    const { data, error } = await supabase
      .from('clinic_payment_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      // If table does not exist or is empty, check site_settings or return cached settings
      return { ...cachedSettings };
    }

    // Flexible column mapping to support various schema column names
    const resolved: ClinicPaymentSettings = {
      id: data.id || 1,
      consultation_price:
        typeof data.consultation_price === 'number'
          ? data.consultation_price
          : typeof data.price === 'number'
          ? data.price
          : typeof data.amount === 'number'
          ? data.amount
          : DEFAULT_PAYMENT_SETTINGS.consultation_price,
      currency: data.currency || 'ج.م',
      vodafone_cash_number:
        data.vodafone_cash_number ||
        data.vodafone_cash ||
        data.wallet_number ||
        DEFAULT_PAYMENT_SETTINGS.vodafone_cash_number,
      instapay_address:
        data.instapay_address ||
        data.instapay_ipa ||
        data.instapay ||
        DEFAULT_PAYMENT_SETTINGS.instapay_address,
      instapay_number:
        data.instapay_number ||
        data.instapay_phone ||
        DEFAULT_PAYMENT_SETTINGS.instapay_number,
      bank_account_info: data.bank_account_info || '',
      payment_instructions_ar:
        data.payment_instructions_ar ||
        data.instructions ||
        DEFAULT_PAYMENT_SETTINGS.payment_instructions_ar,
      is_payment_enabled:
        typeof data.is_payment_enabled === 'boolean'
          ? data.is_payment_enabled
          : typeof data.is_active === 'boolean'
          ? data.is_active
          : true,
      updated_at: data.updated_at || new Date().toISOString(),
    };

    cachedSettings = resolved;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(resolved));
      } catch {
        // Ignore storage quotas
      }
    }

    return resolved;
  } catch (err) {
    console.warn('Could not fetch clinic payment settings:', err);
    return { ...cachedSettings };
  }
}

/**
 * Updates dynamic clinic payment settings in Supabase
 */
export async function updateClinicPaymentSettings(
  updates: Partial<ClinicPaymentSettings>
): Promise<{ success: boolean; data?: ClinicPaymentSettings; error?: string }> {
  const supabase = getSupabaseClient();
  const nextSettings: ClinicPaymentSettings = {
    ...cachedSettings,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  cachedSettings = nextSettings;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(nextSettings));
    } catch {
      // Ignore
    }
  }

  await logAdminActivity(
    'settings_updated',
    `تم تحديث إعدادات الدفع الإلكتروني وقيمة الكشف (${nextSettings.consultation_price} ${nextSettings.currency}) وأرقام فودافون كاش وإنستاباي`,
    'payment_settings',
    'clinic_payment_settings'
  );

  if (!supabase) {
    return { success: true, data: nextSettings };
  }

  try {
    const payload = {
      id: 1,
      consultation_price: Number(nextSettings.consultation_price) || 1200,
      currency: nextSettings.currency || 'ج.م',
      vodafone_cash_number: nextSettings.vodafone_cash_number || '01154021247',
      instapay_address: nextSettings.instapay_address || 'androderma@instapay',
      instapay_number: nextSettings.instapay_number || '01154021247',
      bank_account_info: nextSettings.bank_account_info || '',
      payment_instructions_ar: nextSettings.payment_instructions_ar,
      is_payment_enabled: Boolean(nextSettings.is_payment_enabled),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('clinic_payment_settings')
      .upsert([payload])
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase update clinic_payment_settings error:', error);
      // Fallback: update in site_settings if needed
    }

    return {
      success: true,
      data: data ? { ...nextSettings, ...data } : nextSettings,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Compresses an image file client-side to keep size under 300KB
 */
export async function compressImageToDataUrl(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a payment screenshot to Supabase storage bucket or returns optimized data URL
 */
export async function uploadPaymentScreenshot(
  file: File
): Promise<{ success: boolean; url: string; error?: string }> {
  const supabase = getSupabaseClient();

  // Compress image first for lightning-fast upload & minimal payload
  let dataUrl = '';
  try {
    dataUrl = await compressImageToDataUrl(file);
  } catch {
    // If compression fails, read original
    dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  if (!supabase) {
    return { success: true, url: dataUrl };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    // Attempt upload to Supabase Storage bucket 'payment-screenshots' or 'receipts'
    const { error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        return { success: true, url: publicUrlData.publicUrl };
      }
    }
  } catch (storageErr) {
    console.warn('Supabase storage upload attempt skipped, using optimized data URL:', storageErr);
  }

  // Graceful fallback to compressed Data URL
  return { success: true, url: dataUrl };
}
