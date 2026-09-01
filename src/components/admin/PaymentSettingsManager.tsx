import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Smartphone,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  Copy,
  Save,
  RotateCcw,
  Eye,
  Info,
} from 'lucide-react';
import {
  fetchClinicPaymentSettings,
  updateClinicPaymentSettings,
  ClinicPaymentSettings,
  PaymentAccountItem,
  DEFAULT_VODAFONE_ACCOUNTS,
  DEFAULT_INSTAPAY_ACCOUNTS,
} from '@/services/paymentSettingsService';

interface PaymentSettingsManagerProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

const PRICE_PRESETS = [800, 1000, 1200, 1500, 1800, 2000, 2500];

export const PaymentSettingsManager = React.memo(function PaymentSettingsManager({
  onNotify,
}: PaymentSettingsManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [consultationPrice, setConsultationPrice] = useState<number>(1200);
  const [currency, setCurrency] = useState<string>('ج.م');
  const [isPaymentEnabled, setIsPaymentEnabled] = useState<boolean>(true);
  const [paymentInstructions, setPaymentInstructions] = useState<string>(
    'يرجى تحويل رسوم الكشف الطبي عبر فودافون كاش أو تطبيق إنستاباي وإرفاق سكرين شوت يوضح نجاح التحويل لتأكيد الموعد فوراً.'
  );

  // Multi-Account Lists
  const [vodafoneAccounts, setVodafoneAccounts] = useState<PaymentAccountItem[]>(DEFAULT_VODAFONE_ACCOUNTS);
  const [instapayAccounts, setInstapayAccounts] = useState<PaymentAccountItem[]>(DEFAULT_INSTAPAY_ACCOUNTS);

  // New Account Inputs
  const [newVodaName, setNewVodaName] = useState('');
  const [newVodaNumber, setNewVodaNumber] = useState('');
  const [newVodaNotes, setNewVodaNotes] = useState('');

  const [newInstaName, setNewInstaName] = useState('');
  const [newInstaAddress, setNewInstaAddress] = useState('');
  const [newInstaNotes, setNewInstaNotes] = useState('');

  // Editing State
  const [editingAccount, setEditingAccount] = useState<{
    type: 'vodafone' | 'instapay';
    account: PaymentAccountItem;
  } | null>(null);

  // Load Settings on Mount
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: ClinicPaymentSettings = await fetchClinicPaymentSettings();
      setConsultationPrice(data.consultation_price || 1200);
      setCurrency(data.currency || 'ج.م');
      setIsPaymentEnabled(data.is_payment_enabled !== false);
      setPaymentInstructions(data.payment_instructions_ar || '');
      setVodafoneAccounts(
        data.vodafone_cash_accounts && data.vodafone_cash_accounts.length > 0
          ? data.vodafone_cash_accounts
          : DEFAULT_VODAFONE_ACCOUNTS
      );
      setInstapayAccounts(
        data.instapay_accounts && data.instapay_accounts.length > 0
          ? data.instapay_accounts
          : DEFAULT_INSTAPAY_ACCOUNTS
      );
    } catch (err) {
      console.error('Error loading payment settings:', err);
      onNotify('error', 'تعذر تحميل إعدادات بوابات الدفع');
    } finally {
      setIsLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Add Vodafone Account
  const handleAddVodafoneAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNum = newVodaNumber.trim();
    const trimmedName = newVodaName.trim() || `محفظة فودافون كاش (${trimmedNum.slice(-4)})`;

    if (!trimmedNum || trimmedNum.length < 10) {
      onNotify('error', 'يرجى إدخال رقم فودافون كاش صحيح (11 رقم)');
      return;
    }

    const newAcc: PaymentAccountItem = {
      id: `voda-${Date.now()}`,
      name: trimmedName,
      value: trimmedNum,
      isActive: true,
      notes: newVodaNotes.trim() || undefined,
    };

    setVodafoneAccounts((prev) => [...prev, newAcc]);
    setNewVodaName('');
    setNewVodaNumber('');
    setNewVodaNotes('');
    onNotify('success', `تمت إضافة المحفظة: ${trimmedName}`);
  };

  // Add InstaPay Account
  const handleAddInstapayAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAddress = newInstaAddress.trim();
    const trimmedName = newInstaName.trim() || `حساب إنستاباي (${trimmedAddress})`;

    if (!trimmedAddress || trimmedAddress.length < 3) {
      onNotify('error', 'يرجى إدخال عنوان إنستاباي صحيح (IPA Handle أو رقم)');
      return;
    }

    const newAcc: PaymentAccountItem = {
      id: `insta-${Date.now()}`,
      name: trimmedName,
      value: trimmedAddress,
      isActive: true,
      notes: newInstaNotes.trim() || undefined,
    };

    setInstapayAccounts((prev) => [...prev, newAcc]);
    setNewInstaName('');
    setNewInstaAddress('');
    setNewInstaNotes('');
    onNotify('success', `تمت إضافة عنوان إنستاباي: ${trimmedName}`);
  };

  // Delete Account
  const handleDeleteAccount = (type: 'vodafone' | 'instapay', id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الحساب "${name}"؟`)) {
      if (type === 'vodafone') {
        if (vodafoneAccounts.length <= 1) {
          onNotify('error', 'يجب الإبقاء على حساب فودافون كاش واحد على الأقل');
          return;
        }
        setVodafoneAccounts((prev) => prev.filter((a) => a.id !== id));
      } else {
        if (instapayAccounts.length <= 1) {
          onNotify('error', 'يجب الإبقاء على عنوان إنستاباي واحد على الأقل');
          return;
        }
        setInstapayAccounts((prev) => prev.filter((a) => a.id !== id));
      }
      onNotify('info', `تم حذف ${name}`);
    }
  };

  // Toggle Account Active Status
  const handleToggleActive = (type: 'vodafone' | 'instapay', id: string) => {
    if (type === 'vodafone') {
      setVodafoneAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
      );
    } else {
      setInstapayAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
      );
    }
  };

  // Save Edited Account Modal
  const handleSaveEditModal = () => {
    if (!editingAccount) return;
    const { type, account } = editingAccount;

    if (!account.value.trim()) {
      onNotify('error', 'قيمة الحساب أو الرقم مطلوبة');
      return;
    }

    if (type === 'vodafone') {
      setVodafoneAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...account } : a))
      );
    } else {
      setInstapayAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...account } : a))
      );
    }

    setEditingAccount(null);
    onNotify('success', 'تم تعديل بيانات الحساب بنجاح');
  };

  // Save All Settings to Database
  const handleSaveAll = async () => {
    if (consultationPrice <= 0) {
      onNotify('error', 'يرجى إدخال قيمة كشف صالحة');
      return;
    }

    const activeVoda = vodafoneAccounts.filter((a) => a.isActive);
    if (activeVoda.length === 0) {
      onNotify('error', 'يجب تفعيل محفظة فودافون كاش واحدة على الأقل');
      return;
    }

    const activeInsta = instapayAccounts.filter((a) => a.isActive);
    if (activeInsta.length === 0) {
      onNotify('error', 'يجب تفعيل عنوان إنستاباي واحد على الأقل');
      return;
    }

    setIsSaving(true);
    try {
      const primaryVoda = activeVoda[0].value;
      const primaryInsta = activeInsta[0].value;

      const res = await updateClinicPaymentSettings({
        consultation_price: Number(consultationPrice),
        currency: currency.trim() || 'ج.م',
        vodafone_cash_number: primaryVoda,
        instapay_address: primaryInsta,
        instapay_number: primaryVoda,
        vodafone_cash_accounts: vodafoneAccounts,
        instapay_accounts: instapayAccounts,
        payment_instructions_ar: paymentInstructions.trim(),
        is_payment_enabled: isPaymentEnabled,
      });

      if (res.success) {
        onNotify(
          'success',
          `تم حفظ ومزامنة إعدادات الدفع وقيمة الكشف (${consultationPrice} ${currency}) وتحديث بوابات التحويل مباشرة في قاعدة البيانات بنجاح`
        );
      } else {
        onNotify('error', res.error || 'تعذر تحديث الإعدادات');
      }
    } catch {
      onNotify('error', 'حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="w-10 h-10 border-3 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-bold">جاري تحميل إعدادات بوابات الدفع والتسعير...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Top Banner with Action Buttons */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ⚡ LIVE PAYMENT GATEWAYS
            </span>
            <span className="text-xs text-slate-400">إدارة حسابات التحويل والتسعير المباشر</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-[#00B8A9]" />
            <span>بوابات الدفع الإلكتروني وقيمة الكشف</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            التحكم الديناميكي في سعر الكشف الطبي، وإضافة أو تعديل محافظ فودافون كاش المتعددة وعناوين إنستاباي الرسمية المعروضة للمرضى أثناء الحجز.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSettings}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تحميل</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#00B8A9] hover:bg-[#00d6c4] text-slate-950 font-black text-xs shadow-lg hover:shadow-[0_0_20px_rgba(0,184,169,0.35)] transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري الحفظ والمزامنة...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات في النظام</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: Consultation Pricing & Global Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#00B8A9]" />
              <span>تسعير الكشف الطبي الأساسي (Base Consultation Fee)</span>
            </h3>
            <span className="text-xs text-slate-400">يظهر تلقائياً في شاشة الحجز</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                سعر الكشف الطبي (قيمة الحجز) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={consultationPrice}
                  onChange={(e) => setConsultationPrice(Number(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white font-mono text-lg font-black focus:outline-none focus:border-[#00B8A9]"
                  placeholder="1200"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400 font-mono">
                  {currency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">العملة</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-[#00B8A9]"
                placeholder="ج.م"
              />
            </div>
          </div>

          {/* Quick Price Presets */}
          <div>
            <span className="text-xs text-slate-400 block mb-2 font-medium">
              خيارات تسعير سريعة جاهزة:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRICE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setConsultationPrice(preset)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                    consultationPrice === preset
                      ? 'border-[#00B8A9] bg-[#00B8A9]/20 text-[#00B8A9] shadow-sm'
                      : 'border-white/10 bg-slate-800/60 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {preset.toLocaleString()} {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Prepayment Enable Toggle */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-white block">
                تفعيل متطلب الدفع الإلكتروني المسبق
              </span>
              <span className="text-[11px] text-slate-400 block">
                عند التفعيل، يُطلب من المريض إرفاق إيصال التحويل (Screenshot) لإتمام طلب الحجز
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPaymentEnabled}
                onChange={(e) => setIsPaymentEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B8A9]"></div>
            </label>
          </div>
        </div>

        {/* Live Patient Price Preview Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-teal-950/40 via-slate-900/60 to-slate-900/80 border border-teal-500/30 backdrop-blur-xl shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة واجهة المريض</span>
              </span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono font-bold">
                Live Preview
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center space-y-2">
              <span className="text-xs text-slate-400 block">قيمة الكشف والاستشارة</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {consultationPrice.toLocaleString()}{' '}
                <span className="text-sm text-slate-300 font-sans">{currency}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                يتم عرض هذا السعر لجميع المرضى في الخطوة الأخيرة من الحجز
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span>محافظ فودافون كاش النشطة:</span>
              <span className="font-bold text-red-400 font-mono">
                {vodafoneAccounts.filter((a) => a.isActive).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>عناوين إنستاباي النشطة:</span>
              <span className="font-bold text-purple-400 font-mono">
                {instapayAccounts.filter((a) => a.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Vodafone Cash Multi-Account Manager */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-red-500/20 backdrop-blur-xl shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                إدارة محافظ فودافون كاش (Vodafone Cash Accounts)
              </h3>
              <p className="text-xs text-slate-400">
                يمكنك تسجيل أكثر من محفظة وتحديد المحفظة النشطة لتوزيع التحويلات وتسهيل السداد
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/30 self-start sm:self-auto">
            {vodafoneAccounts.length} محفظة مسجلة
          </span>
        </div>

        {/* List of Existing Vodafone Cash Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {vodafoneAccounts.map((acc, idx) => (
            <div
              key={acc.id}
              className={`p-4 rounded-2xl border transition-all ${
                acc.isActive
                  ? 'bg-slate-950/80 border-red-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white truncate">{acc.name}</span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/30">
                        الافتراضي
                      </span>
                    )}
                  </div>
                  {acc.notes && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{acc.notes}</p>}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Active / Inactive Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive('vodafone', acc.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      acc.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {acc.isActive ? 'مفعل' : 'معطل'}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => setEditingAccount({ type: 'vodafone', account: { ...acc } })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="تعديل الحساب"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount('vodafone', acc.id, acc.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="حذف المحفظة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="font-mono text-sm font-black text-red-400 tracking-wider" dir="ltr">
                  {acc.value}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(acc.value, acc.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/10 hover:border-red-500/40 transition"
                >
                  {copiedId === acc.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form: Add New Vodafone Cash Number */}
        <form
          onSubmit={handleAddVodafoneAccount}
          className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-red-400" />
            <h4 className="text-xs font-black text-white">إضافة محفظة فودافون كاش جديدة</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                اسم أو مسمى المحفظة
              </label>
              <input
                type="text"
                value={newVodaName}
                onChange={(e) => setNewVodaName(e.target.value)}
                placeholder="مثال: محفظة فرع مصر الجديدة"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                رقم المحفظة (11 رقم) <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="tel"
                value={newVodaNumber}
                onChange={(e) => setNewVodaNumber(e.target.value)}
                placeholder="01154021247"
                dir="ltr"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                ملاحظة توضيحية (اختياري)
              </label>
              <input
                type="text"
                value={newVodaNotes}
                onChange={(e) => setNewVodaNotes(e.target.value)}
                placeholder="مثال: متاحة للحجوزات الصباحية"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة المحفظة إلى القائمة</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: InstaPay Multi-Account Manager */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-purple-500/20 backdrop-blur-xl shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                إدارة عناوين إنستاباي (InstaPay Addresses / IPA)
              </h3>
              <p className="text-xs text-slate-400">
                إمكانية تسجيل أكثر من عنوان دفع إنستاباي أو رقم هاتف مربوط بحساب البنك
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 self-start sm:self-auto">
            {instapayAccounts.length} عنوان مسجل
          </span>
        </div>

        {/* List of Existing InstaPay Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {instapayAccounts.map((acc, idx) => (
            <div
              key={acc.id}
              className={`p-4 rounded-2xl border transition-all ${
                acc.isActive
                  ? 'bg-slate-950/80 border-purple-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white truncate">{acc.name}</span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30">
                        الافتراضي
                      </span>
                    )}
                  </div>
                  {acc.notes && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{acc.notes}</p>}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Active / Inactive Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive('instapay', acc.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      acc.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {acc.isActive ? 'مفعل' : 'معطل'}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => setEditingAccount({ type: 'instapay', account: { ...acc } })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="تعديل الحساب"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount('instapay', acc.id, acc.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="حذف العنوان"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="font-mono text-sm font-black text-purple-300 tracking-wider truncate" dir="ltr">
                  {acc.value}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(acc.value, acc.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/10 hover:border-purple-500/40 transition shrink-0"
                >
                  {copiedId === acc.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>نسخ العنوان</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form: Add New InstaPay Handle */}
        <form
          onSubmit={handleAddInstapayAccount}
          className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-black text-white">إضافة عنوان إنستاباي جديد</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                اسم أو مسمى الحساب
              </label>
              <input
                type="text"
                value={newInstaName}
                onChange={(e) => setNewInstaName(e.target.value)}
                placeholder="مثال: حساب بنك CIB الرسمي"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                عنوان الدفع IPA أو رقم الهاتف <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={newInstaAddress}
                onChange={(e) => setNewInstaAddress(e.target.value)}
                placeholder="androderma@instapay"
                dir="ltr"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                ملاحظة توضيحية (اختياري)
              </label>
              <input
                type="text"
                value={newInstaNotes}
                onChange={(e) => setNewInstaNotes(e.target.value)}
                placeholder="مثال: للتحويلات من الحسابات البنكية"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة العنوان إلى القائمة</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: Payment Instructions for Patients */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00B8A9]" />
            <span>نص تعليمات وإرشادات الدفع المعروضة للمريض</span>
          </h3>
          <button
            type="button"
            onClick={() =>
              setPaymentInstructions(
                'يرجى تحويل رسوم الكشف الطبي عبر فودافون كاش أو تطبيق إنستاباي وإرفاق سكرين شوت يوضح نجاح التحويل لتأكيد الموعد فوراً.'
              )
            }
            className="text-[11px] text-teal-300 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>استعادة النص الافتراضي</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={paymentInstructions}
          onChange={(e) => setPaymentInstructions(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00B8A9] resize-none leading-relaxed"
          placeholder="اكتب التعليمات التي ستظهر للمريض أسفل تفاصيل الحسابات..."
        />
      </div>

      {/* Bottom Save Action Bar */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/80 border border-white/10">
        <span className="text-xs text-slate-400 font-medium">
          يتم تطبيق الأسعار والحسابات الجديدة على جميع شاشات الحجز فور الحفظ
        </span>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-8 py-3 rounded-xl bg-[#00B8A9] hover:bg-[#00d6c4] text-slate-950 font-black text-sm shadow-xl hover:shadow-[0_0_25px_rgba(0,184,169,0.4)] transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>جاري الحفظ والمزامنة...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ ومزامنة بوابات الدفع والتسعير</span>
            </>
          )}
        </button>
      </div>

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-white">
              تعديل بيانات {editingAccount.type === 'vodafone' ? 'محفظة فودافون كاش' : 'عنوان إنستاباي'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الحساب أو المسمى</label>
                <input
                  type="text"
                  value={editingAccount.account.name}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      account: { ...editingAccount.account, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {editingAccount.type === 'vodafone' ? 'رقم الهاتف' : 'عنوان إنستاباي (IPA)'}
                </label>
                <input
                  type="text"
                  value={editingAccount.account.value}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      account: { ...editingAccount.account, value: e.target.value },
                    })
                  }
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#00B8A9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={editingAccount.account.notes || ''}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      account: { ...editingAccount.account, notes: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleSaveEditModal}
                className="px-5 py-2 rounded-xl bg-[#00B8A9] hover:bg-[#00d6c4] text-slate-950 font-bold text-xs shadow-md"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
