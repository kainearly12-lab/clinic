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
  wallet_method_name?: string; // e.g. 'فودافون كاش' | 'إتصالات كاش' | 'أورنج كاش' | 'المحافظ الإلكترونية'
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
  wallet_method_name: 'فودافون كاش',
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
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { ...cachedSettings };
    }

    // 1. Consultation Price & Currency (from DB, without hardcoded fallback once data is present)
    const dbPrice =
      typeof data.consultation_price === 'number'
        ? data.consultation_price
        : data.consultation_price !== null &&
          data.consultation_price !== undefined &&
          !isNaN(Number(data.consultation_price))
        ? Number(data.consultation_price)
        : typeof data.price === 'number'
        ? data.price
        : typeof data.amount === 'number'
        ? data.amount
        : DEFAULT_PAYMENT_SETTINGS.consultation_price;

    const dbCurrency = data.currency || DEFAULT_PAYMENT_SETTINGS.currency;

    // 2. Primary Numbers / Addresses from DB columns
    const rawVodafoneSingle =
      data.vodafone_cash_number ||
      data.vodafone_cash ||
      data.wallet_number ||
      '';

    const rawInstaSingle =
      data.instapay_account ||
      data.instapay_address ||
      data.instapay_ipa ||
      data.instapay ||
      '';

    // 3. Extract Vodafone accounts from DB
    let vodafoneAccounts: PaymentAccountItem[] = [];
    if (data.vodafone_cash_numbers && typeof data.vodafone_cash_numbers === 'object') {
      if (
        Array.isArray(data.vodafone_cash_numbers.vodafone) &&
        data.vodafone_cash_numbers.vodafone.length > 0
      ) {
        vodafoneAccounts = parseAccountsList(data.vodafone_cash_numbers.vodafone);
      } else if (
        Array.isArray(data.vodafone_cash_numbers) &&
        data.vodafone_cash_numbers.length > 0
      ) {
        vodafoneAccounts = parseAccountsList(data.vodafone_cash_numbers);
      }
    } else if (data.vodafone_cash_accounts) {
      vodafoneAccounts = parseAccountsList(data.vodafone_cash_accounts);
    }

    if (vodafoneAccounts.length === 0 && rawVodafoneSingle) {
      vodafoneAccounts = [
        {
          id: 'voda-primary',
          name: 'المحفظة الرئيسية (فودافون كاش)',
          value: rawVodafoneSingle,
          isActive: true,
        },
      ];
    }

    // 4. Extract InstaPay accounts from DB
    let instapayAccounts: PaymentAccountItem[] = [];
    if (
      data.vodafone_cash_numbers &&
      typeof data.vodafone_cash_numbers === 'object' &&
      Array.isArray(data.vodafone_cash_numbers.instapay) &&
      data.vodafone_cash_numbers.instapay.length > 0
    ) {
      instapayAccounts = parseAccountsList(data.vodafone_cash_numbers.instapay);
    } else if (data.instapay_accounts) {
      instapayAccounts = parseAccountsList(data.instapay_accounts);
    }

    if (instapayAccounts.length === 0 && rawInstaSingle) {
      instapayAccounts = [
        {
          id: 'insta-primary',
          name: 'عنوان إنستاباي الرئيسي (IPA)',
          value: rawInstaSingle,
          isActive: true,
        },
      ];
    }

    // If database record is completely blank, fallback to defaults
    if (vodafoneAccounts.length === 0) {
      vodafoneAccounts = DEFAULT_VODAFONE_ACCOUNTS;
    }
    if (instapayAccounts.length === 0) {
      instapayAccounts = DEFAULT_INSTAPAY_ACCOUNTS;
    }

    const primaryVodafone =
      vodafoneAccounts.find((a) => a.isActive)?.value ||
      rawVodafoneSingle ||
      DEFAULT_PAYMENT_SETTINGS.vodafone_cash_number;

    const primaryInstapay =
      instapayAccounts.find((a) => a.isActive)?.value ||
      rawInstaSingle ||
      DEFAULT_PAYMENT_SETTINGS.instapay_address;

    const dbWalletMethodName =
      data.wallet_method_name ||
      data.wallet_name ||
      (data.vodafone_cash_numbers &&
      typeof data.vodafone_cash_numbers === 'object' &&
      !Array.isArray(data.vodafone_cash_numbers)
        ? data.vodafone_cash_numbers.wallet_method_name || data.vodafone_cash_numbers.wallet_name
        : null) ||
      DEFAULT_PAYMENT_SETTINGS.wallet_method_name ||
      'فودافون كاش';

    const resolved: ClinicPaymentSettings = {
      id: data.id || 1,
      consultation_price: dbPrice,
      currency: dbCurrency,
      wallet_method_name: dbWalletMethodName,
      vodafone_cash_number: primaryVodafone,
      instapay_address: primaryInstapay,
      instapay_number: primaryVodafone,
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
    cachedSettings.vodafone_cash_number ||
    '01154021247';

  const firstActiveInstapay =
    nextInstapayAccounts.find((a) => a.isActive)?.value ||
    updates.instapay_address ||
    cachedSettings.instapay_address ||
    'androderma@instapay';

  const nextConsultationPrice =
    typeof updates.consultation_price === 'number'
      ? updates.consultation_price
      : Number(cachedSettings.consultation_price) || 1200;

  const nextCurrency = (updates.currency || cachedSettings.currency || 'ج.م').trim();
  const nextWalletMethodName = (
    updates.wallet_method_name ||
    cachedSettings.wallet_method_name ||
    'فودافون كاش'
  ).trim();

  const nextSettings: ClinicPaymentSettings = {
    ...cachedSettings,
    ...updates,
    wallet_method_name: nextWalletMethodName,
    consultation_price: nextConsultationPrice,
    currency: nextCurrency,
    vodafone_cash_number: firstActiveVodafone,
    instapay_address: firstActiveInstapay,
    instapay_number: firstActiveVodafone,
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
    `تم تحديث إعدادات الدفع (طريقة المحافظ: ${nextWalletMethodName}) وقيمة الكشف (${nextSettings.consultation_price} ${nextSettings.currency}) وإدارة حسابات ${nextWalletMethodName} (${nextSettings.vodafone_cash_accounts.length}) وإنستاباي (${nextSettings.instapay_accounts.length})`,
    'payment_settings',
    'clinic_payment_settings'
  );

  if (!supabase) {
    return { success: true, data: nextSettings };
  }

  try {
    const targetId = cachedSettings.id && !isNaN(Number(cachedSettings.id)) ? Number(cachedSettings.id) : 1;

    // Send payload matching the exact clinic_payment_settings table columns
    const payload: Record<string, unknown> = {
      id: targetId,
      consultation_price: nextConsultationPrice,
      currency: nextCurrency,
      wallet_method_name: nextWalletMethodName,
      vodafone_cash_number: firstActiveVodafone.slice(0, 50),
      instapay_account: firstActiveInstapay.slice(0, 50),
      vodafone_cash_numbers: {
        vodafone: nextVodafoneAccounts,
        instapay: nextInstapayAccounts,
        wallet_method_name: nextWalletMethodName,
      },
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from('clinic_payment_settings')
      .upsert([payload])
      .select()
      .maybeSingle();

    if (error && (error.message?.includes('wallet_method_name') || error.code === '42703')) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.wallet_method_name;
      const retry = await supabase
        .from('clinic_payment_settings')
        .upsert([fallbackPayload])
        .select()
        .maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.warn('Supabase direct upsert clinic_payment_settings error:', error);
      return { success: false, error: error.message };
    }

    if (data) {
      nextSettings.id = data.id || targetId;
      nextSettings.updated_at = data.updated_at || nextSettings.updated_at;
      cachedSettings = nextSettings;
    }

    return {
      success: true,
      data: nextSettings,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Failed to update clinic payment settings in Supabase:', err);
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
