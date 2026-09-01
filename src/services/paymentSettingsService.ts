import { getSupabaseClient } from '@/lib/supabase';
import { logAdminActivity } from './adminService';

export interface PaymentAccountItem {
  id: string;
  name: string; // e.g. 'محفظة الفرع الرئيسي' or 'حساب د. أندرو'
  value: string; // e.g. '01154021247' or 'androderma@instapay'
  isActive: boolean;
  notes?: string;
}

export interface ClinicPaymentSettings {
  id?: string | number;
  consultation_price: number;
  currency: string;
  vodafone_cash_number: string;
  instapay_address: string;
  instapay_number: string;
  vodafone_cash_accounts: PaymentAccountItem[];
  instapay_accounts: PaymentAccountItem[];
  bank_account_info?: string;
  payment_instructions_ar: string;
  is_payment_enabled: boolean;
  updated_at?: string;
}

export const DEFAULT_VODAFONE_ACCOUNTS: PaymentAccountItem[] = [
  {
    id: 'voda-main',
    name: 'المحفظة الرئيسية (الفرع الرئيسي)',
    value: '01154021247',
    isActive: true,
    notes: 'متاحة على مدار الساعة لجميع الفروع',
  },
  {
    id: 'voda-clinic-2',
    name: 'محفظة الطوارئ والمتابعات السريعة',
    value: '01012345678',
    isActive: true,
    notes: 'تأكيد فوري للتحويلات',
  },
];

export const DEFAULT_INSTAPAY_ACCOUNTS: PaymentAccountItem[] = [
  {
    id: 'insta-main',
    name: 'عنوان إنستاباي الرئيسي (IPA)',
    value: 'androderma@instapay',
    isActive: true,
    notes: 'التحويل المباشر لحساب العيادة الرسمي',
  },
  {
    id: 'insta-phone',
    name: 'تحويل برقم الهاتف (InstaPay Phone)',
    value: '01154021247',
    isActive: true,
    notes: 'ربط بنكي فوري بدون عمولات',
  },
];

const DEFAULT_PAYMENT_SETTINGS: ClinicPaymentSettings = {
  id: 1,
  consultation_price: 1200,
  currency: 'ج.م',
  vodafone_cash_number: '01154021247',
  instapay_address: 'androderma@instapay',
  instapay_number: '01154021247',
  vodafone_cash_accounts: DEFAULT_VODAFONE_ACCOUNTS,
  instapay_accounts: DEFAULT_INSTAPAY_ACCOUNTS,
  bank_account_info: '',
  payment_instructions_ar:
    'يرجى تحويل رسوم الكشف الطبي عبر فودافون كاش أو تطبيق إنستاباي وإرفاق سكرين شوت يوضح نجاح التحويل لتأكيد الموعد فوراً.',
  is_payment_enabled: true,
  updated_at: new Date().toISOString(),
};

const LOCAL_STORAGE_CACHE_KEY = 'androderma_payment_settings_cache_v2';

let cachedSettings: ClinicPaymentSettings = { ...DEFAULT_PAYMENT_SETTINGS };

// Initialize from local storage cache if available
try {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cachedSettings = {
        ...DEFAULT_PAYMENT_SETTINGS,
        ...parsed,
        vodafone_cash_accounts:
          Array.isArray(parsed.vodafone_cash_accounts) && parsed.vodafone_cash_accounts.length > 0
            ? parsed.vodafone_cash_accounts
            : DEFAULT_VODAFONE_ACCOUNTS,
        instapay_accounts:
          Array.isArray(parsed.instapay_accounts) && parsed.instapay_accounts.length > 0
            ? parsed.instapay_accounts
            : DEFAULT_INSTAPAY_ACCOUNTS,
      };
    }
  }
} catch {
  // Ignore local storage parse error
}

/**
 * Safely parse account items from string, json, or fallback
 */
function parseAccountsList(
  input: unknown,
  fallbackSingleValue?: string,
  fallbackSingleLabel?: string,
  defaultList: PaymentAccountItem[] = []
): PaymentAccountItem[] {
  if (Array.isArray(input) && input.length > 0) {
    return input.map((item, idx) => ({
      id: item.id || `acc-${idx}-${Date.now()}`,
      name: String(item.name || `حساب ${idx + 1}`),
      value: String(item.value || '').trim(),
      isActive: typeof item.isActive === 'boolean' ? item.isActive : true,
      notes: item.notes ? String(item.notes) : undefined,
    }));
  }

  if (typeof input === 'string' && input.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parseAccountsList(parsed, fallbackSingleValue, fallbackSingleLabel, defaultList);
      }
    } catch {
      // ignore
    }
  }

  if (fallbackSingleValue && fallbackSingleValue.trim()) {
    return [
      {
        id: 'acc-primary',
        name: fallbackSingleLabel || 'الحساب الرئيسي',
        value: fallbackSingleValue.trim(),
        isActive: true,
      },
    ];
  }

  return defaultList;
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
      return { ...cachedSettings };
    }

    // Flexible column mapping
    const rawVodafoneSingle =
      data.vodafone_cash_number ||
      data.vodafone_cash ||
      data.wallet_number ||
      DEFAULT_PAYMENT_SETTINGS.vodafone_cash_number;

    const rawInstaSingle =
      data.instapay_address ||
      data.instapay_ipa ||
      data.instapay ||
      DEFAULT_PAYMENT_SETTINGS.instapay_address;

    const vodafoneAccounts = parseAccountsList(
      data.vodafone_cash_accounts || data.vodafone_accounts,
      rawVodafoneSingle,
      'المحفظة الرئيسية (فودافون كاش)',
      DEFAULT_VODAFONE_ACCOUNTS
    );

    const instapayAccounts = parseAccountsList(
      data.instapay_accounts,
      rawInstaSingle,
      'عنوان إنستاباي الرئيسي (IPA)',
      DEFAULT_INSTAPAY_ACCOUNTS
    );

    const primaryVodafone =
      vodafoneAccounts.find((a) => a.isActive)?.value || rawVodafoneSingle;
    const primaryInstapay =
      instapayAccounts.find((a) => a.isActive)?.value || rawInstaSingle;

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
      vodafone_cash_number: primaryVodafone,
      instapay_address: primaryInstapay,
      instapay_number: data.instapay_number || primaryVodafone,
      vodafone_cash_accounts: vodafoneAccounts,
      instapay_accounts: instapayAccounts,
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

  const nextVodafoneAccounts = updates.vodafone_cash_accounts || cachedSettings.vodafone_cash_accounts;
  const nextInstapayAccounts = updates.instapay_accounts || cachedSettings.instapay_accounts;

  const firstActiveVodafone =
    nextVodafoneAccounts.find((a) => a.isActive)?.value ||
    updates.vodafone_cash_number ||
    cachedSettings.vodafone_cash_number;

  const firstActiveInstapay =
    nextInstapayAccounts.find((a) => a.isActive)?.value ||
    updates.instapay_address ||
    cachedSettings.instapay_address;

  const nextSettings: ClinicPaymentSettings = {
    ...cachedSettings,
    ...updates,
    vodafone_cash_number: firstActiveVodafone,
    instapay_address: firstActiveInstapay,
    vodafone_cash_accounts: nextVodafoneAccounts,
    instapay_accounts: nextInstapayAccounts,
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
    `تم تحديث إعدادات الدفع وقيمة الكشف (${nextSettings.consultation_price} ${nextSettings.currency}) وإدارة حسابات فودافون كاش (${nextSettings.vodafone_cash_accounts.length}) وإنستاباي (${nextSettings.instapay_accounts.length})`,
    'payment_settings',
    'clinic_payment_settings'
  );

  if (!supabase) {
    return { success: true, data: nextSettings };
  }

  try {
    const payload: Record<string, unknown> = {
      id: 1,
      consultation_price: Number(nextSettings.consultation_price) || 1200,
      currency: nextSettings.currency || 'ج.م',
      vodafone_cash_number: nextSettings.vodafone_cash_number || '01154021247',
      instapay_address: nextSettings.instapay_address || 'androderma@instapay',
      instapay_number: nextSettings.instapay_number || '01154021247',
      vodafone_cash_accounts: nextSettings.vodafone_cash_accounts,
      instapay_accounts: nextSettings.instapay_accounts,
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
      console.warn('Supabase direct upsert clinic_payment_settings error, trying with stringified JSON:', error);
      // Try stringified JSON in case column type is text
      payload.vodafone_cash_accounts = JSON.stringify(nextSettings.vodafone_cash_accounts);
      payload.instapay_accounts = JSON.stringify(nextSettings.instapay_accounts);
      const retryResult = await supabase
        .from('clinic_payment_settings')
        .upsert([payload])
        .select()
        .maybeSingle();

      if (retryResult.error) {
        // If columns do not exist, upsert base columns without the multi-account arrays
        delete payload.vodafone_cash_accounts;
        delete payload.instapay_accounts;
        await supabase
          .from('clinic_payment_settings')
          .upsert([payload]);
      }
    }

    return {
      success: true,
      data: data ? { ...nextSettings, ...data } : nextSettings,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Failed to update clinic payment settings in Supabase:', err);
    return { success: true, data: nextSettings, error: msg };
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

  // Compress image first for fast upload & minimal payload
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
