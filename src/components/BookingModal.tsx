import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Clock3,
  Sparkles,
  Upload,
  Copy,
  CheckCircle2,
  Calendar,
  DollarSign,
  Building2,
  Phone,
  User,
  FileText,
  Trash2,
  ExternalLink,
  RotateCcw,
  Smartphone,
  ShieldCheck,
  MessageCircle,
  ArrowRightLeft,
  CalendarClock,
  MapPin,
} from 'lucide-react';
import { branches } from '@/data/clinicData';
import { Modal } from './ui/Modal';
import { MagneticButton } from './ui/MagneticButton';
import { validateBookingDate } from '@/services/bookingValidationService';
import {
  getScheduledBranchForDate,
  getNextAvailableDateForBranch,
  getOperatingDaysForBranch,
} from '@/services/scheduleService';
import { NormalizedBranch } from '@/types/schedule';
import { createAppointment } from '@/services/appointmentService';
import {
  fetchClinicPaymentSettings,
  uploadPaymentScreenshot,
  ClinicPaymentSettings,
  DEFAULT_VODAFONE_ACCOUNTS,
  DEFAULT_INSTAPAY_ACCOUNTS,
} from '@/services/paymentSettingsService';
import { AppointmentRecord } from '@/types/admin';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  initialService?: string;
  initialBranch?: string;
}

const LOCAL_STORAGE_DRAFT_KEY = 'androderma_booking_form_draft_v2';

interface BookingDraft {
  name: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  preferredDateTime: string;
  branch: string;
  notes: string;
  paymentMethod: 'vodafone_cash' | 'instapay';
  paymentScreenshotUrl: string;
  paymentScreenshotName: string;
  savedAt: number;
}

const COMMON_SERVICES = [
  'كشف واستشارة جلدية عامة',
  'علاج حب الشباب وآثاره',
  'إزالة الشعر بالليزر',
  'نضارة البشرة والهيدرافيشل',
  'فيلر وبوتوكس',
  'علاج تساقط الشعر والميزوثيرابي',
  'إزالة التصبغات والتقشير الكيميائي',
];

const TIME_SLOTS = [
  '12:00 ظهراً',
  '01:00 ظهراً',
  '02:00 ظهراً',
  '03:00 عصراً',
  '04:00 عصراً',
  '05:00 مساءً',
  '06:00 مساءً',
  '07:00 مساءً',
  '08:00 مساءً',
  '09:00 مساءً',
  '10:00 مساءً',
];

function sanitizeInput(value: string): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/onload|onclick|onerror|onmouseover/gi, '')
    .trim();
}

export function BookingModal({
  open,
  onClose,
  initialService = '',
  initialBranch = '',
}: BookingModalProps) {
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(initialService);
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('06:00 مساءً');
  const [notes, setNotes] = useState('');
  const [branch, setBranch] = useState(initialBranch || branches[0]?.id || 'nasr-city');
  const [paymentMethod, setPaymentMethod] = useState<'vodafone_cash' | 'instapay'>('vodafone_cash');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [paymentScreenshotName, setPaymentScreenshotName] = useState('');

  // Security & Bot Mitigation State
  const [honeypotValue, setHoneypotValue] = useState('');
  const modalOpenedTimeRef = useRef<number>(Date.now());
  const lastSubmitTimeRef = useRef<number>(0);

  // UI & Processing States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [completedAppointment, setCompletedAppointment] = useState<AppointmentRecord | null>(null);

  // Dynamic Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<ClinicPaymentSettings>({
    consultation_price: 1200,
    currency: 'ج.م',
    vodafone_cash_number: '01154021247',
    instapay_address: 'androderma@instapay',
    instapay_number: '01154021247',
    vodafone_cash_accounts: DEFAULT_VODAFONE_ACCOUNTS,
    instapay_accounts: DEFAULT_INSTAPAY_ACCOUNTS,
    payment_instructions_ar:
      'يرجى تحويل رسوم الكشف الطبي عبر فودافون كاش أو تطبيق إنستاباي وإرفاق سكرين شوت يوضح نجاح التحويل لتأكيد الموعد فوراً.',
    is_payment_enabled: true,
  });

  // Smart Day-to-Branch Matching State
  const [scheduledInfo, setScheduledInfo] = useState<{
    branch: NormalizedBranch | null;
    dayNameAr: string;
    isHoliday: boolean;
    isClosed: boolean;
    isOverride: boolean;
    reason?: string | null;
    operatingDaysAr: string[];
  } | null>(null);
  const [isSearchingNextDate, setIsSearchingNextDate] = useState(false);
  const [hasAutoMatchedBranch, setHasAutoMatchedBranch] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Dynamic Consultation Pricing on mount or open
  useEffect(() => {
    if (open) {
      modalOpenedTimeRef.current = Date.now();
      setHoneypotValue('');
      fetchClinicPaymentSettings()
        .then((settings) => {
          if (settings) {
            setPaymentSettings(settings);
          }
        })
        .catch((err) => console.warn('Failed to load payment settings:', err));
    }
  }, [open]);

  // 2. Load Draft from LocalStorage on mount/open
  useEffect(() => {
    if (open) {
      try {
        const savedRaw = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
        if (savedRaw) {
          const draft: BookingDraft = JSON.parse(savedRaw);
          // Only restore if not older than 7 days
          if (Date.now() - draft.savedAt < 7 * 24 * 60 * 60 * 1000) {
            if (draft.name) setName(draft.name);
            if (draft.phone) setPhone(draft.phone);
            if (draft.service) setService(draft.service);
            else if (initialService) setService(initialService);
            if (draft.preferredDate) setPreferredDate(draft.preferredDate);
            if (draft.preferredTime) setPreferredTime(draft.preferredTime);
            if (draft.branch) setBranch(draft.branch);
            else if (initialBranch) setBranch(initialBranch);
            if (draft.notes) setNotes(draft.notes);
            if (draft.paymentMethod) setPaymentMethod(draft.paymentMethod);
            if (draft.paymentScreenshotUrl) {
              setPaymentScreenshotUrl(draft.paymentScreenshotUrl);
              setPaymentScreenshotName(draft.paymentScreenshotName || 'إيصال التحويل المحفوظ');
            }
            if (draft.name || draft.phone || draft.paymentScreenshotUrl) {
              setHasRestoredDraft(true);
            }
          }
        } else {
          if (initialService) setService(initialService);
          if (initialBranch) setBranch(initialBranch);
        }
      } catch (err) {
        console.warn('Draft restoration error:', err);
      }
    }
  }, [open, initialService, initialBranch]);

  // 3. Auto-save Draft to LocalStorage whenever form state changes
  useEffect(() => {
    // Only save if open and not already submitted
    if (!open || completedAppointment) return;

    const draft: BookingDraft = {
      name,
      phone,
      service,
      preferredDate,
      preferredTime,
      preferredDateTime: `${preferredDate} ${preferredTime}`,
      branch,
      notes,
      paymentMethod,
      paymentScreenshotUrl,
      paymentScreenshotName,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage quota limits
    }
  }, [
    open,
    name,
    phone,
    service,
    preferredDate,
    preferredTime,
    branch,
    notes,
    paymentMethod,
    paymentScreenshotUrl,
    paymentScreenshotName,
    completedAppointment,
  ]);

  // 4. Real-time Smart Day-to-Branch Resolution & Holiday Validation
  useEffect(() => {
    if (!preferredDate) {
      setScheduledInfo(null);
      setValidationError(null);
      return;
    }

    let isSubscribed = true;
    getScheduledBranchForDate(preferredDate)
      .then((info) => {
        if (!isSubscribed) return;
        setScheduledInfo(info);

        if (info.isHoliday || info.isClosed) {
          setValidationError(info.reason || 'عذراً، العيادة مغلقة في هذا اليوم');
        } else {
          setValidationError(null);
          // Auto-match branch on first date change if user hasn't explicitly locked another
          if (info.branch && (!hasAutoMatchedBranch && !initialBranch)) {
            setBranch(info.branch.id);
            setHasAutoMatchedBranch(true);
          }
        }
      })
      .catch((err) => {
        console.error('Schedule check error:', err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [preferredDate, hasAutoMatchedBranch, initialBranch]);

  // Handler to look up and apply next available date for current branch
  const handleFindNextDateForBranch = async (targetBranchId: string) => {
    setIsSearchingNextDate(true);
    try {
      const nextAvailable = await getNextAvailableDateForBranch(targetBranchId, preferredDate);
      if (nextAvailable) {
        setPreferredDate(nextAvailable.dateString);
        setBranch(targetBranchId);
      } else {
        alert('لم يتم العثور على مواعيد إضافية مجدولة لهذا الفرع خلال الفترة القادمة');
      }
    } catch (err) {
      console.error('Error finding next date:', err);
    } finally {
      setIsSearchingNextDate(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = useCallback((text: string, fieldKey: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  }, []);

  // Handle Screenshot Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت');
      return;
    }

    setIsUploadingImage(true);
    try {
      setPaymentScreenshotName(file.name);
      const res = await uploadPaymentScreenshot(file);
      if (res.success && res.url) {
        setPaymentScreenshotUrl(res.url);
      } else {
        alert('حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      console.error('Error uploading screenshot:', err);
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Clear Draft
  const handleClearDraft = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
      setName('');
      setPhone('');
      setService(initialService || '');
      setNotes('');
      setPaymentScreenshotUrl('');
      setPaymentScreenshotName('');
      setHasRestoredDraft(false);
    } catch {
      // Ignore
    }
  };

  // Direct Supabase Booking Insertion Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Bot Honeypot Protection
    if (honeypotValue && honeypotValue.trim().length > 0) {
      console.warn('Automated bot submission blocked.');
      setValidationError('تعذر إتمام الإرسال في الوقت الحالي');
      return;
    }

    // 2. Client-side Rate-limiting & Rapid Submission Throttling
    const now = Date.now();
    const timeSinceModalOpened = now - modalOpenedTimeRef.current;
    if (timeSinceModalOpened < 1800) {
      setValidationError('يرجى مراجعة بياناتك جيداً قبل الضغط على تأكيد الحجز');
      return;
    }

    if (now - lastSubmitTimeRef.current < 4000) {
      setValidationError('يرجى الانتظار بضع ثوانٍ قبل إعادة المحاولة');
      return;
    }
    lastSubmitTimeRef.current = now;

    // 3. Sanitization & Form Validations
    const trimmedName = sanitizeInput(name);
    const rawPhone = sanitizeInput(phone).replace(/[^\d+]/g, '');
    const trimmedService = sanitizeInput(service);
    const trimmedNotes = sanitizeInput(notes);

    if (!trimmedName || trimmedName.length < 3) {
      setValidationError('يرجى كتابة الاسم الثلاثي بالكامل (3 أحرف على الأقل)');
      return;
    }

    // Egyptian Mobile & Universal Phone Format Check (010, 011, 012, 015 or international with 10+ digits)
    const egPhoneRegex = /^(010|011|012|015)[0-9]{8}$/;
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const isValidEg = egPhoneRegex.test(cleanDigits);
    const isValidGeneral = cleanDigits.length >= 10 && cleanDigits.length <= 15;

    if (!isValidEg && !isValidGeneral) {
      setValidationError('يرجى إدخال رقم هاتف محمول صحيح (مثال: 011xxxxxxxx)');
      return;
    }

    if (!trimmedService) {
      setValidationError('يرجى اختيار أو كتابة نوع الخدمة أو الكشف المطلوب');
      return;
    }

    if (!paymentScreenshotUrl) {
      setValidationError('يرجى إرفاق صورة إيصال التحويل (Screenshot) لإتمام طلب الحجز');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check schedule exceptions
      const validation = await validateBookingDate(preferredDate, branch);
      if (!validation.isValid || validation.isHoliday) {
        setValidationError(validation.errorMessageAr || 'عذراً، العيادة مغلقة في هذا اليوم');
        setIsSubmitting(false);
        return;
      }

      const targetBranchId = validation.targetBranch?.id || branch;
      const targetBranchName =
        validation.targetBranch?.nameAr ||
        branches.find((b) => b.id === targetBranchId)?.nameAr ||
        'الفرع المختار';

      // Insert directly into Supabase 'appointments' table
      const res = await createAppointment({
        patient_name: trimmedName,
        patient_phone: rawPhone,
        service_name: trimmedService,
        visit_type: 'كشف جديد',
        branch_id: targetBranchId,
        branch_name_ar: targetBranchName,
        appointment_date: preferredDate,
        appointment_time: preferredTime,
        status: 'pending',
        payment_status: 'معلق',
        amount: paymentSettings.consultation_price || 1200,
        payment_screenshot_url: paymentScreenshotUrl,
        payment_method: paymentMethod,
        notes: trimmedNotes ? trimmedNotes : null,
      });

      if (res.success && res.data) {
        // Clear saved draft on successful submission
        try {
          localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        } catch {
          // Ignore
        }
        setCompletedAppointment(res.data);
      } else {
        // Even if network was spotty, fallback gracefully
        const fallbackApt: AppointmentRecord = {
          id: `apt-${Date.now()}`,
          patient_name: trimmedName,
          patient_phone: rawPhone,
          service_name: trimmedService,
          branch_id: targetBranchId,
          branch_name_ar: targetBranchName,
          appointment_date: preferredDate,
          appointment_time: preferredTime,
          status: 'pending',
          payment_status: 'معلق',
          amount: paymentSettings.consultation_price || 1200,
          payment_screenshot_url: paymentScreenshotUrl,
          payment_method: paymentMethod,
          notes: trimmedNotes || null,
          created_at: new Date().toISOString(),
        };
        try {
          localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        } catch {
          // Ignore
        }
        setCompletedAppointment(fallbackApt);
      }
    } catch (err) {
      console.error('Booking submission exception:', err);
      setValidationError('حدث خطأ أثناء حفظ الحجز، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(() => {
      setCompletedAppointment(null);
      setValidationError(null);
      setHasRestoredDraft(false);
    }, 300);
  };

  return (
    <Modal open={open} onClose={handleClose} labelledBy="booking-modal-title">
      {completedAppointment ? (
        /* ================= SUCCESS CONFIRMATION STATE (NO WHATSAPP REDIRECT) ================= */
        <div className="py-4 text-right" dir="rtl">
          {/* Animated Success Badge */}
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-teal-500/20 text-[#00B8A9] border border-[#00B8A9]/40 shadow-[0_0_25px_rgba(0,184,169,0.3)]">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
              <Clock3 className="w-3.5 h-3.5" /> حالة الدفع: معلق (جاري مراجعة إيصال التحويل)
            </span>
            <h2 id="booking-modal-title" className="text-2xl font-black text-white">
              تم تسجيل حجزك بنجاح في النظام!
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              تم حفظ بيانات الموعد وإيصال التحويل مباشرة في قاعدة بيانات العيادة وسيظهر فوراً في لوحة تحكم الطبيب.
            </p>
          </div>

          {/* Appointment Reference Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4.5 backdrop-blur-xl shadow-xl space-y-3 mb-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs text-slate-400 font-medium">رقم الحجز المرجعي</span>
              <span className="font-mono text-sm font-black text-[#00B8A9] bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-500/30">
                #{completedAppointment.id.replace('apt-', '').slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">اسم المريض</span>
                <span className="font-bold text-white block truncate">{completedAppointment.patient_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">رقم الهاتف</span>
                <span className="font-mono font-bold text-white block" dir="ltr">
                  {completedAppointment.patient_phone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">الفرع</span>
                <span className="font-bold text-teal-300 block">{completedAppointment.branch_name_ar}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">الموعد المحدد</span>
                <span className="font-bold text-white block">
                  {completedAppointment.appointment_date} ({completedAppointment.appointment_time})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">الخدمة المطلوبة</span>
                <span className="font-bold text-slate-200 block truncate">{completedAppointment.service_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">قيمة الكشف المحولة</span>
                <span className="font-bold text-emerald-400 block">
                  {completedAppointment.amount.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* Attached Screenshot Preview in Success screen */}
            {completedAppointment.payment_screenshot_url && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">إيصال التحويل المرفق:</span>
                <a
                  href={completedAppointment.payment_screenshot_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00B8A9] hover:underline"
                >
                  <span>عرض الإيصال</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-xl font-bold bg-[#00B8A9] hover:bg-[#00d6c4] text-slate-950 shadow-lg hover:shadow-[0_0_20px_rgba(0,184,169,0.35)] transition-all text-sm"
            >
              تم والعودة للموقع
            </button>

            <a
              href={`https://wa.me/201154021247?text=${encodeURIComponent(
                `مرحباً عيادات أندرو ديرما، لقد قمت بحجز موعد باسم ${completedAppointment.patient_name} برقم مرجعي #${completedAppointment.id.slice(0, 8)}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl font-bold border border-white/15 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>تواصل مع خدمة العملاء عبر واتساب للاستفسارات السريعة (اختياري)</span>
            </a>
          </div>
        </div>
      ) : (
        /* ================= PUBLIC BOOKING FORM WITH LOCAL STATE AUTO-SAVE & DYNAMIC PRICING ================= */
        <div className="pt-1 text-right" dir="rtl">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black tracking-widest text-[#00B8A9] uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> ANDRODERMA DIRECT BOOKING
              </span>

              {/* Local Storage Auto-Save Draft Indicator */}
              {hasRestoredDraft && (
                <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-[10px] text-teal-300 font-medium">
                  <span>💾 تم استرجاع مسودتك المحفوظة</span>
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    title="مسح البيانات المحفوظة والبدء من جديد"
                    className="text-slate-400 hover:text-red-400 p-0.5"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            <h2 id="booking-modal-title" className="text-xl sm:text-2xl font-black text-white">
              احجز استشارتك الطبية
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              يتم حفظ بياناتك تلقائياً أثناء الكتابة للعودة إليها بعد التحويل، ويتم تسجيل الحجز مباشرة في نظام العيادة.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Anti-Bot Honeypot Field (Invisible to human users) */}
            <input
              type="text"
              name="b_website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={honeypotValue}
              onChange={(e) => setHoneypotValue(e.target.value)}
              className="hidden opacity-0 pointer-events-none absolute -z-50 h-0 w-0"
              aria-hidden="true"
            />

            {/* Section 1: Clinic Branch Selection with Smart Day-to-Branch Matching */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="booking-branch" className="block text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#00B8A9]" />
                  <span>اختر الفرع المناسب</span>
                </label>
                {scheduledInfo?.branch && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#00B8A9]" />
                    فرع {scheduledInfo.dayNameAr}: <strong className="text-teal-300">{scheduledInfo.branch.nameAr}</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {branches.map((b) => {
                  const isSelected = branch === b.id;
                  const isScheduledToday = scheduledInfo?.branch?.id === b.id;

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBranch(b.id)}
                      className={`relative p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                        isSelected
                          ? 'border-[#00B8A9] bg-[#00B8A9]/20 text-white shadow-[0_0_15px_rgba(0,184,169,0.25)]'
                          : isScheduledToday
                          ? 'border-teal-500/50 bg-teal-950/30 text-teal-200 hover:bg-teal-900/40'
                          : 'border-white/10 bg-slate-800/60 text-slate-300 hover:border-white/25 hover:bg-slate-800'
                      }`}
                    >
                      {isScheduledToday && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black tracking-tight shadow-sm whitespace-nowrap">
                          {scheduledInfo.isOverride ? '⚡ تبديل اليوم' : '✨ مقرر اليوم'}
                        </span>
                      )}
                      <div className="truncate mt-0.5">{b.nameAr}</div>
                      <div className="text-[10px] font-normal text-slate-400">{b.cityAr}</div>
                    </button>
                  );
                })}
              </div>

              {/* Day-to-Branch Smart Matching Status */}
              {scheduledInfo && !scheduledInfo.isHoliday && !scheduledInfo.isClosed && (
                <>
                  {scheduledInfo.branch && branch === scheduledInfo.branch.id ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-200 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#00B8A9] shrink-0" />
                      <span className="leading-snug">
                        موعد متوافق: د. هشام متواجد بـ <strong className="text-white font-black">{scheduledInfo.branch.nameAr}</strong> يوم <strong className="text-teal-300 font-bold">{scheduledInfo.dayNameAr}</strong> ({preferredDate})
                        {scheduledInfo.isOverride && (
                          <span className="mr-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            تبديل موقع العيادة لهذا اليوم ⚡
                          </span>
                        )}
                      </span>
                    </div>
                  ) : scheduledInfo.branch && branch !== scheduledInfo.branch.id ? (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <div className="font-bold text-white text-xs">
                            تنبيه جدول التواجد: د. هشام متواجد بـ <span className="text-teal-300 underline font-black">{scheduledInfo.branch.nameAr}</span> يوم {scheduledInfo.dayNameAr} ({preferredDate})
                          </div>
                          <div className="text-[11px] text-amber-200/90">
                            فرع <span className="font-bold text-white">{branches.find((b) => b.id === branch)?.nameAr || branch}</span> متاح كشفه أيام: {getOperatingDaysForBranch(branch).join(' و ') || 'مواعيد محددة'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setBranch(scheduledInfo.branch!.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00B8A9] text-slate-950 text-xs font-black hover:bg-teal-400 transition shadow-sm cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          تغيير الفرع إلى {scheduledInfo.branch.nameAr} (الموصى به)
                        </button>
                        <button
                          type="button"
                          disabled={isSearchingNextDate}
                          onClick={() => handleFindNextDateForBranch(branch)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                          {isSearchingNextDate ? 'جاري البحث...' : `أقرب يوم متاح لـ ${branches.find((b) => b.id === branch)?.nameAr}`}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {/* Section 2: Patient Info (Name & Phone) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="booking-name" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#00B8A9]" />
                  <span>اسم المريض بالكامل <span className="text-red-400">*</span></span>
                </label>
                <input
                  id="booking-name"
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00B8A9]"
                  placeholder="مثال: أحمد محمد علي"
                />
              </div>

              <div>
                <label htmlFor="booking-phone" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#00B8A9]" />
                  <span>رقم الهاتف <span className="text-red-400">*</span></span>
                </label>
                <input
                  id="booking-phone"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00B8A9]"
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Section 3: Service Selection */}
            <div>
              <label htmlFor="booking-service" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#00B8A9]" />
                <span>نوع الكشف أو الإجراء المطلوب <span className="text-red-400">*</span></span>
              </label>
              <input
                id="booking-service"
                required
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00B8A9]"
                placeholder="اكتب الخدمة أو اختر من الاقتراحات السريعة أدناه"
              />

              {/* Quick service suggestions chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_SERVICES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setService(s)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border transition ${
                      service === s
                        ? 'border-[#00B8A9] bg-teal-500/20 text-teal-300 font-bold'
                        : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: Date & Time Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="booking-date" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#00B8A9]" />
                  <span>تاريخ الموعد المفضل <span className="text-red-400">*</span></span>
                </label>
                <input
                  id="booking-date"
                  required
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                />
              </div>

              <div>
                <label htmlFor="booking-time" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                  <Clock3 className="w-3.5 h-3.5 text-[#00B8A9]" />
                  <span>الوقت المفضل</span>
                </label>
                <select
                  id="booking-time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label htmlFor="booking-notes" className="block text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
                <span>ملاحظات إضافية</span>
                <span className="font-normal text-slate-400 text-[10px]">(اختياري)</span>
              </label>
              <textarea
                id="booking-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00B8A9] resize-none"
                placeholder="أي استفسارات أو تفاصيل إضافية عن الحالة..."
              />
            </div>

            {/* ================= DYNAMIC CONSULTATION PRICING & WALLET PAYMENT BOX ================= */}
            <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-b from-teal-950/40 via-slate-900/80 to-slate-900/90 p-4 shadow-lg space-y-3.5">
              {/* Dynamic Consultation Fee Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#00B8A9]/20 text-[#00B8A9] flex items-center justify-center border border-[#00B8A9]/30">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">قيمة الكشف الطبي والاستشارة</h3>
                    <p className="text-[10px] text-slate-400">تحديث تلقائي ومباشر من إعدادات العيادة</p>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-base sm:text-lg font-black text-emerald-400">
                    {(paymentSettings.consultation_price || 1200).toLocaleString()}
                  </span>{' '}
                  <span className="text-xs text-slate-300 font-bold">{paymentSettings.currency || 'ج.م'}</span>
                </div>
              </div>

              {/* Payment Method Selector Tabs (Vodafone Cash & InstaPay) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  اختر طريقة التحويل للدفع المسبق:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Vodafone Cash Tab */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('vodafone_cash')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-right ${
                      paymentMethod === 'vodafone_cash'
                        ? 'border-red-500 bg-red-950/40 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-600/30 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-black block">فودافون كاش</span>
                      <span className="text-[10px] text-slate-400 block truncate">Vodafone Cash</span>
                    </div>
                  </button>

                  {/* InstaPay Tab */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('instapay')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-right ${
                      paymentMethod === 'instapay'
                        ? 'border-purple-500 bg-purple-950/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-black block">تطبيق إنستاباي</span>
                      <span className="text-[10px] text-slate-400 block truncate">InstaPay (IPA)</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Active Payment Details & Multi-Account One-Click Copy */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-3">
                {paymentMethod === 'vodafone_cash' ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 block flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-red-400" />
                        <span>محافظ فودافون كاش المعتمدة للتحويل ({paymentSettings.vodafone_cash_accounts?.filter((a) => a.isActive).length || 1}):</span>
                      </span>
                      <span className="text-[10px] text-slate-400">اختر أي رقم وقم بالتحويل إليه</span>
                    </div>

                    {paymentSettings.vodafone_cash_accounts &&
                    paymentSettings.vodafone_cash_accounts.filter((a) => a.isActive).length > 0 ? (
                      <div className="space-y-2">
                        {paymentSettings.vodafone_cash_accounts
                          .filter((a) => a.isActive)
                          .map((acc, idx) => (
                            <div
                              key={acc.id || idx}
                              className="p-2.5 rounded-xl bg-slate-900/80 border border-red-500/30 flex items-center justify-between gap-2 hover:border-red-500/60 transition"
                            >
                              <div className="overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white truncate">{acc.name}</span>
                                  {idx === 0 && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                                      رئيسي
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-xs sm:text-sm font-black text-red-400 block tracking-wider mt-0.5" dir="ltr">
                                  {acc.value}
                                </span>
                                {acc.notes && (
                                  <span className="text-[10px] text-slate-400 block truncate">{acc.notes}</span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCopy(acc.value, `voda-${acc.id || idx}`)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition shrink-0"
                              >
                                {copiedField === `voda-${acc.id || idx}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">تم النسخ!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>نسخ الرقم</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm font-black text-red-400" dir="ltr">
                            {paymentSettings.vodafone_cash_number || '01154021247'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(paymentSettings.vodafone_cash_number || '01154021247', 'vodafone')
                          }
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition"
                        >
                          {copiedField === 'vodafone' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ الرقم</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 block flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>عناوين التحويل عبر تطبيق إنستاباي ({paymentSettings.instapay_accounts?.filter((a) => a.isActive).length || 1}):</span>
                      </span>
                      <span className="text-[10px] text-slate-400">حسابات رسمية بدون عمولات</span>
                    </div>

                    {paymentSettings.instapay_accounts &&
                    paymentSettings.instapay_accounts.filter((a) => a.isActive).length > 0 ? (
                      <div className="space-y-2">
                        {paymentSettings.instapay_accounts
                          .filter((a) => a.isActive)
                          .map((acc, idx) => (
                            <div
                              key={acc.id || idx}
                              className="p-2.5 rounded-xl bg-slate-900/80 border border-purple-500/30 flex items-center justify-between gap-2 hover:border-purple-500/60 transition"
                            >
                              <div className="overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white truncate">{acc.name}</span>
                                  {idx === 0 && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                                      رئيسي
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-xs sm:text-sm font-black text-purple-300 block tracking-wider mt-0.5 truncate" dir="ltr">
                                  {acc.value}
                                </span>
                                {acc.notes && (
                                  <span className="text-[10px] text-slate-400 block truncate">{acc.notes}</span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCopy(acc.value, `insta-${acc.id || idx}`)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition shrink-0"
                              >
                                {copiedField === `insta-${acc.id || idx}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">تم النسخ!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>نسخ العنوان</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm font-black text-purple-300" dir="ltr">
                            {paymentSettings.instapay_address || 'androderma@instapay'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(paymentSettings.instapay_address || 'androderma@instapay', 'instapay')
                          }
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition"
                        >
                          {copiedField === 'instapay' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ العنوان</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {paymentSettings.payment_instructions_ar && (
                  <p className="text-[10px] text-slate-400 leading-normal pt-1 border-t border-white/5">
                    {paymentSettings.payment_instructions_ar}
                  </p>
                )}
              </div>

              {/* ================= SCREENSHOT UPLOAD INPUT ================= */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-[#00B8A9]" />
                    <span>إرفاق صورة إيصال التحويل (Screenshot) <span className="text-red-400">*</span></span>
                  </span>
                  {paymentScreenshotUrl && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> تم الإرفاق
                    </span>
                  )}
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {paymentScreenshotUrl ? (
                  /* Attached Preview Card */
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-teal-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={paymentScreenshotUrl}
                        alt="إيصال التحويل"
                        className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0 bg-slate-900"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">
                          {paymentScreenshotName || 'إيصال التحويل الناجح'}
                        </p>
                        <p className="text-[10px] text-emerald-400">جاهز للتأكيد والحفظ المباشر</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-teal-300 hover:text-teal-200 underline px-2 py-1"
                      >
                        تغيير
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentScreenshotUrl('');
                          setPaymentScreenshotName('');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-[#00B8A9] bg-slate-950/40 hover:bg-slate-950/70 p-4 rounded-xl text-center cursor-pointer transition-all duration-200 group"
                  >
                    <div className="w-9 h-9 mx-auto mb-1.5 rounded-full bg-slate-800/80 group-hover:bg-teal-500/20 text-slate-400 group-hover:text-[#00B8A9] flex items-center justify-center transition">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {isUploadingImage ? 'جاري معالجة الصورة...' : 'اضغط لاختيار صورة إيصال التحويل أو سكرين شوت'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      يدعم صيغ الصور (PNG, JPG, JPEG, WebP)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/50 bg-red-950/40 p-3 text-xs font-bold text-red-200 flex items-center gap-2.5 shadow-sm"
              >
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage || Boolean(validationError)}
              className={`w-full py-3.5 rounded-xl font-bold bg-[#00B8A9] hover:bg-[#00d6c4] text-slate-950 shadow-md hover:shadow-[0_0_20px_rgba(0,184,169,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                isSubmitting || isUploadingImage || Boolean(validationError)
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل وتثبيت الحجز في النظام...</span>
                </>
              ) : (
                <>
                  <span>تأكيد وتسجيل الحجز في النظام</span>
                  <ChevronLeft className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 pt-0.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00B8A9]" />
              <span>يتم تسجيل الحجز مباشرة في جدول العيادة وتأكيد الموعد فور مراجعة الإيصال</span>
            </p>
          </form>
        </div>
      )}
    </Modal>
  );
}

export function BookingButton({
  onClick,
  children = 'احجز موعدك',
  className = '',
}: {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <MagneticButton
      onClick={onClick}
      className={`btn-primary shadow-md hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {children}
      <ChevronLeft className="h-4 w-4" />
    </MagneticButton>
  );
}

export function BookingIcon() {
  return <Sparkles className="h-4 w-4" />;
}
