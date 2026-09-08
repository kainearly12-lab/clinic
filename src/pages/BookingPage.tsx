import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Phone,
  User,
  FileText,
  Upload,
  Copy,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  MessageCircle,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Stethoscope,
  Clock3,
  CalendarCheck,
  Check,
  Lock,
  ChevronLeft,
  X,
  RefreshCw,
  Smartphone,
  Calendar,
} from 'lucide-react';
import { branches as defaultBranches } from '@/data/clinicData';
import { useBranches } from '@/hooks/useBranches';
import { getBranchWhatsAppNumber } from '@/services/bookingValidationService';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import {
  fetchClinicPaymentSettings,
  uploadPaymentScreenshot,
  ClinicPaymentSettings,
  DEFAULT_VODAFONE_ACCOUNTS,
  DEFAULT_INSTAPAY_ACCOUNTS,
} from '@/services/paymentSettingsService';
import {
  createAppointment,
  getTodayConfirmedQueueCount,
} from '@/services/appointmentService';
import {
  getScheduledBranchForDate,
  resolveBranchUuid,
  getIsoDateString,
  subscribeScheduleChanges,
  ARABIC_DAYS,
} from '@/services/scheduleService';
import { getSupabaseClient } from '@/lib/supabase';
import { NormalizedBranch } from '@/types/schedule';

export interface BookingPageProps {
  initialService?: string;
  initialBranch?: string;
  onNavigateHome?: (targetAnchor?: string) => void;
}

const COMMON_SERVICES = [
  'كشف واستشارة جلدية عامة',
  'علاج حب الشباب وآثاره',
  'إزالة الشعر بالليزر',
  'نضارة البشرة والهيدرافيشل',
  'حقن الفيلر والبوتوكس',
  'علاج تساقط الشعر والميزوثيرابي',
  'إزالة التصبغات والتقشير الكيميائي',
  'إجراء تجميلي جراحي بسيط',
];

export function BookingPage({
  initialService = '',
  initialBranch = '',
  onNavigateHome,
}: BookingPageProps) {
  const { logoUrl, clinicName, phone: clinicPhone, contactPhone } = useSiteSettings();
  const { branches: dynamicBranches } = useBranches();
  const branchList = dynamicBranches.length > 0 ? dynamicBranches : defaultBranches;
  const effectiveClinicPhone = contactPhone || clinicPhone || '01154021247';

  // Multi-step State: 1 = Patient Info, 2 = Payment & Receipt, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Dynamic Date Mode: 'today' vs 'tomorrow'
  const [bookingMode, setBookingMode] = useState<'today' | 'tomorrow'>('today');
  const [activeScheduledBranch, setActiveScheduledBranch] = useState<NormalizedBranch | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(true);
  const [isClosedOnSelectedDate, setIsClosedOnSelectedDate] = useState<boolean>(false);
  const [closureReason, setClosureReason] = useState<string | null>(null);

  // Calculate Dates for Today and Tomorrow
  const todayDate = useMemo(() => new Date(), []);
  const tomorrowDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const selectedDate = bookingMode === 'today' ? todayDate : tomorrowDate;
  const selectedDateIso = useMemo(() => getIsoDateString(selectedDate), [selectedDate]);
  const selectedDayIndex = selectedDate.getDay();
  const selectedDayNameAr = ARABIC_DAYS[selectedDayIndex] || 'اليوم';

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  // Form Fields (Step 1)
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialBranch || branches[0]?.id || 'nasr-city'
  );
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>(
    initialService || COMMON_SERVICES[0]
  );
  const [customService, setCustomService] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Form Validation Errors
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    receipt?: string;
  }>({});

  // Payment Settings (Step 2)
  const [paymentSettings, setPaymentSettings] = useState<ClinicPaymentSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'vodafone_cash'>('instapay');
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Receipt File & Upload
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation Details (Step 3)
  const [confirmedQueuePosition, setConfirmedQueuePosition] = useState<number>(1);
  const [bookingRefId, setBookingRefId] = useState<string>('');
  const [submissionTimestamp, setSubmissionTimestamp] = useState<string>('');

  // Dynamic Branch Working Schedules & Auto-Locking
  useEffect(() => {
    let isMounted = true;
    setScheduleLoading(true);

    async function resolveBranchSchedule() {
      try {
        // 1. Query schedule service (evaluates Supabase weekly_schedule, daily_branch_overrides, and schedule_exceptions)
        const scheduled = await getScheduledBranchForDate(selectedDateIso);

        // 2. Fetch Supabase branches to check any working_days column or branch configuration
        const client = getSupabaseClient();
        if (client) {
          try {
            await client.from('branches').select('id, name, working_days, is_active');
          } catch {
            // Non-blocking fallback
          }
        }

        if (!isMounted) return;

        if (scheduled.isHoliday || scheduled.isClosed) {
          setIsClosedOnSelectedDate(true);
          setClosureReason(scheduled.reason || 'إجازة رسمية');
          setActiveScheduledBranch(null);
        } else {
          setIsClosedOnSelectedDate(false);
          setClosureReason(null);
          setActiveScheduledBranch(scheduled.branch);

          // Auto-Select: Automatically pre-select the active branch where the doctor is available for that specific day
          if (scheduled.branch) {
            const matchedStatic = branches.find(
              (b) =>
                resolveBranchUuid(b.id) === resolveBranchUuid(scheduled.branch!.id) ||
                b.nameAr === scheduled.branch!.nameAr
            );
            if (matchedStatic) {
              setSelectedBranchId(matchedStatic.id);
            } else {
              setSelectedBranchId(scheduled.branch.id);
            }
          }
        }
      } catch (err) {
        console.warn('Error resolving branch schedule:', err);
      } finally {
        if (isMounted) {
          setScheduleLoading(false);
        }
      }
    }

    resolveBranchSchedule();

    const unsubscribe = subscribeScheduleChanges(() => {
      resolveBranchSchedule();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [selectedDateIso]);

  // Helper to determine if a branch is active for the selected date
  const isBranchActiveForDate = (branchId: string, branchNameAr?: string) => {
    if (isClosedOnSelectedDate) return false;
    if (!activeScheduledBranch) return true; // If schedule not loaded yet, don't block

    const bUuid = resolveBranchUuid(branchId);
    const activeUuid = resolveBranchUuid(activeScheduledBranch.id);

    return bUuid === activeUuid || (Boolean(branchNameAr) && branchNameAr === activeScheduledBranch.nameAr);
  };

  // Load Payment Settings
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const data = await fetchClinicPaymentSettings();
        if (isMounted && data) {
          setPaymentSettings(data);
        }
      } catch (err) {
        console.warn('Could not load clinic payment settings:', err);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync initial service prop
  useEffect(() => {
    if (initialService) setSelectedService(initialService);
  }, [initialService]);

  // Selected Branch Object
  const currentBranch =
    branchList.find((b) => b.id === selectedBranchId) ||
    branchList[0] ||
    defaultBranches[0];

  const activeService = selectedService === 'أخرى' && customService.trim()
    ? customService.trim()
    : selectedService;

  const isPaymentFormValid = Boolean(senderAccount.trim().length > 0 && receiptFile);

  const consultationPrice = paymentSettings?.consultation_price || 1200;
  const currency = paymentSettings?.currency || 'ج.م';
  const walletMethodName = paymentSettings?.wallet_method_name || 'فودافون كاش';

  // Active Payment Accounts
  const vodafoneAccounts =
    paymentSettings?.vodafone_cash_accounts?.filter((a) => a.isActive) ||
    DEFAULT_VODAFONE_ACCOUNTS;
  const instapayAccounts =
    paymentSettings?.instapay_accounts?.filter((a) => a.isActive) ||
    DEFAULT_INSTAPAY_ACCOUNTS;

  // Copy handler
  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrors((prev) => ({
        ...prev,
        receipt: 'يرجى اختيار صورة إيصال صالحة (PNG, JPG, JPEG) أو ملف PDF',
      }));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        receipt: 'حجم الملف كبير جداً، الحد الأقصى 15 ميجابايت',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, receipt: undefined }));
    setReceiptFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setReceiptPreviewUrl(url);
    } else {
      setReceiptPreviewUrl(null);
    }
  };

  const handleRemoveReceipt = () => {
    if (receiptPreviewUrl) {
      URL.revokeObjectURL(receiptPreviewUrl);
    }
    setReceiptFile(null);
    setReceiptPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate Step 1
  const handleProceedToPayment = () => {
    const newErrors: { name?: string; phone?: string } = {};

    const cleanName = patientName.trim();
    if (!cleanName || cleanName.length < 3) {
      newErrors.name = 'يرجى إدخال اسم المريض الثلاثي بالكامل (3 أحرف على الأقل)';
    }

    const cleanPhone = patientPhone.replace(/[\s-]/g, '');
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!cleanPhone) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف للتواصل';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقماً (مثال: 01154021247)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Booking (Step 2)
  const handleSubmitBooking = async () => {
    // Mandatory Payment Validation
    if (!senderAccount.trim()) {
      setErrors({ receipt: 'يرجى إدخال رقم المحفظة أو عنوان InstaPay المحوّل منه' });
      return;
    }
    if (!receiptFile) {
      setErrors({ receipt: 'يرجى إرفاق صورة إيصال التحويل (Screenshot) لإتمام طلب الحجز' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let uploadedScreenshotUrl: string | null = null;

      // 1. Upload receipt if attached
      if (receiptFile) {
        setIsUploading(true);
        const uploadRes = await uploadPaymentScreenshot(receiptFile);
        if (uploadRes.success && uploadRes.url) {
          uploadedScreenshotUrl = uploadRes.url;
        }
        setIsUploading(false);
      }

      // 2. Prepare appointment payload with dynamic appointment_date (Today vs Tomorrow)
      const appointmentDateIso = selectedDateIso;
      const timeStr = new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const appointmentPayload = {
        patient_name: patientName.trim(),
        patient_phone: patientPhone.trim(),
        service_name: activeService,
        visit_type: 'كشف جديد',
        branch_id: selectedBranchId,
        branch_name_ar: currentBranch?.nameAr || 'الفرع المختار',
        appointment_date: appointmentDateIso,
        appointment_time: timeStr || '12:00 PM',
        status: 'pending' as const,
        payment_status: 'معلق' as const,
        amount: consultationPrice,
        payment_screenshot_url: uploadedScreenshotUrl,
        payment_method: paymentMethod,
        sender_account: senderAccount.trim() ? senderAccount.trim() : null,
        payment_notes: senderAccount.trim() ? `المحوّل منه: ${senderAccount.trim()}` : null,
        notes: notes.trim() ? notes.trim() : null,
      };

      // 3. Insert into appointments (with atomic DB-level queue number via RPC)
      const createRes = await createAppointment(appointmentPayload);
      if (!createRes.success) {
        throw new Error(createRes.error || 'فشل تسجيل الموعد');
      }

      // 4. Use atomic queue number assigned by database or fallback to count
      let assignedQueue = createRes.data?.queue_number;
      if (!assignedQueue) {
        try {
          const confirmedCount = await getTodayConfirmedQueueCount(selectedBranchId, appointmentDateIso);
          assignedQueue = confirmedCount + 1;
        } catch (countErr) {
          console.warn('Queue count lookup fallback:', countErr);
          assignedQueue = 1;
        }
      }
      setConfirmedQueuePosition(assignedQueue);

      // Generate friendly reference
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const refId = `ANDRO-${randomSuffix}`;
      setBookingRefId(refId);
      setSubmissionTimestamp(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));

      // Move to Step 3
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء تأكيد الحجز، يرجى المحاولة ثانية';
      setErrors({ receipt: msg });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // WhatsApp Link for Confirmation with dynamic branch phone
  const generateWhatsAppMessage = () => {
    const senderInfo = senderAccount.trim() ? ` [محوّل من: ${senderAccount.trim()}]` : '';
    const dateLabel = bookingMode === 'today' ? `اليوم (${formatShortDate(selectedDate)})` : `غداً (${formatShortDate(selectedDate)})`;
    const rawMsg = `مرحباً عيادات Androderma، قمت بحجز موعد جديد [رقم الحجز: ${bookingRefId || 'مؤكد'}] بتاريخ: ${dateLabel} باسم: ${patientName} لفرع: ${currentBranch?.nameAr} لخدمة: ${activeService}${senderInfo}. رقمي في قائمة الحجز: #${confirmedQueuePosition}. يرجى تأكيد استلام التحويل والموعد.`;
    const branchPhone =
      currentBranch && 'phone' in currentBranch
        ? (currentBranch as { phone?: string }).phone
        : currentBranch?.phones?.[0]?.number || clinicPhone;
    const dynamicWhatsApp = getBranchWhatsAppNumber(currentBranch?.id, branchPhone);
    return `https://wa.me/${dynamicWhatsApp}?text=${encodeURIComponent(rawMsg)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0e12] text-slate-900 dark:text-slate-100 font-sans pb-24 selection:bg-teal-500 selection:text-white">
      {/* Top Ambient Light Accents */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl" />
      <div className="pointer-events-none absolute top-40 left-1/4 h-72 w-72 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl" />

      {/* Top Header & Breadcrumb Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0f1217]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => onNavigateHome ? onNavigateHome() : (window.location.href = '/')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <img
                src={logoUrl || CLINIC_LOGO}
                alt="Clinic Logo"
                className="h-10 w-auto object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CLINIC_LOGO;
                }}
              />
              <div className="text-start">
                <span className="block font-display text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {clinicName || 'عيادات Androderma'}
                </span>
                <span className="block text-[11px] font-bold text-teal-700 dark:text-teal-400">
                  بوابة الحجز الطبي الفوري المعتمد
                </span>
              </div>
            </button>
          </div>

          {/* Quick Exit / Back to Home CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateHome ? onNavigateHome() : (window.location.href = '/')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للرئيسية</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Step Progress Tracker */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative flex items-center justify-between">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 -z-10" />
            <div
              className="absolute top-1/2 right-0 h-0.5 -translate-y-1/2 bg-teal-600 dark:bg-teal-500 transition-all duration-500 -z-10"
              style={{
                width:
                  currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
              }}
            />

            {/* Step 1 Node */}
            <div className="flex flex-col items-center gap-1.5 bg-slate-50 dark:bg-[#0c0e12] px-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep >= 1
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25 ring-4 ring-teal-50 dark:ring-teal-950/40'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > 1 ? <Check className="h-5 w-5" /> : '1'}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                بيانات المريض والفرع
              </span>
            </div>

            {/* Step 2 Node */}
            <div className="flex flex-col items-center gap-1.5 bg-slate-50 dark:bg-[#0c0e12] px-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep >= 2
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25 ring-4 ring-teal-50 dark:ring-teal-950/40'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > 2 ? <Check className="h-5 w-5" /> : '2'}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                الدفع وإرفاق الإيصال
              </span>
            </div>

            {/* Step 3 Node */}
            <div className="flex flex-col items-center gap-1.5 bg-slate-50 dark:bg-[#0c0e12] px-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep === 3
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-4 ring-emerald-50 dark:ring-emerald-950/40'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                تأكيد الموعد والقائمة
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* RIGHT COLUMN (60% on desktop: lg:col-span-7) */}
          <div className="lg:col-span-7 order-1 space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Patient Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-[#12151c] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/30 dark:shadow-none space-y-7"
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-bold mb-2">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>الخطوة الأولى من خطوتين</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      اختر الفرع وسجل بياناتك الطبية
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      نظام حجز ذكي ومباشر — اختر الكشف اليوم أو لليوم التالي لتثبيت موعدك في الفرع المتاح فوراً.
                    </p>
                  </div>

                  {/* 1. Branch Selection Interactive Cards */}
                  <div>
                    {/* Toggle Switch (Today vs Tomorrow) */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <CalendarCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          موعد الكشف الطبي:
                        </span>
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                          {selectedDayNameAr} ({formatShortDate(selectedDate)})
                        </span>
                      </div>

                      <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 grid grid-cols-2 gap-1.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setBookingMode('today')}
                          className={`py-3 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                            bookingMode === 'today'
                              ? 'bg-white dark:bg-[#161a22] text-teal-700 dark:text-teal-400 shadow-md shadow-slate-300/40 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-700'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <CalendarCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                            حجز الكشف اليوم
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            ({formatShortDate(todayDate)})
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBookingMode('tomorrow')}
                          className={`py-3 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                            bookingMode === 'tomorrow'
                              ? 'bg-white dark:bg-[#161a22] text-teal-700 dark:text-teal-400 shadow-md shadow-slate-300/40 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-700'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                            حجز لليوم التالي
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            ({formatShortDate(tomorrowDate)})
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Holiday or Closure Alert if applicable */}
                    {isClosedOnSelectedDate && (
                      <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>
                          العيادة في إجازة {bookingMode === 'today' ? 'اليوم' : 'غداً'} ({closureReason || 'عطلة رسمية'}). يرجى التبديل لليوم الآخر للمتابعة.
                        </span>
                      </div>
                    )}

                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        اختر فرع العيادة الأنسب لك:
                      </span>
                      <span className="text-xs text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1.5">
                        {scheduleLoading ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin text-teal-600 dark:text-teal-400" />
                            <span>جاري فحص المواعيد المتاحة...</span>
                          </>
                        ) : activeScheduledBranch ? (
                          `(المواعيد متاحة في ${activeScheduledBranch.nameAr})`
                        ) : (
                          '(متاح حسب الجدول الطبي)'
                        )}
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {branches.map((b) => {
                        const isSelected = selectedBranchId === b.id;
                        const isBranchActive = isBranchActiveForDate(b.id, b.nameAr);

                        return (
                          <button
                            key={b.id}
                            type="button"
                            disabled={!isBranchActive}
                            onClick={() => {
                              if (isBranchActive) {
                                setSelectedBranchId(b.id);
                              }
                            }}
                            className={`group relative text-start p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
                              !isBranchActive
                                ? 'opacity-55 grayscale-[30%] bg-slate-100/70 dark:bg-slate-900/30 border-dashed border-slate-300 dark:border-slate-800 cursor-not-allowed select-none'
                                : isSelected
                                ? 'border-teal-600 dark:border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 shadow-md shadow-teal-500/10 cursor-pointer'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/70 cursor-pointer'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <span className="font-bold text-base text-slate-900 dark:text-white block">
                                    {b.nameAr}
                                  </span>
                                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                                    {b.cityAr}
                                  </span>
                                </div>
                                <div
                                  className={`h-5 w-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                                    !isBranchActive
                                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                      : isSelected
                                      ? 'bg-teal-600 text-white'
                                      : 'border border-slate-300 dark:border-slate-700 text-transparent'
                                  }`}
                                >
                                  {!isBranchActive ? (
                                    <Lock className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {b.addressAr}
                              </p>
                            </div>

                            {/* Dynamic Branch Status Badges */}
                            <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-[11px]">
                              {!isBranchActive ? (
                                <>
                                  <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                                    <Lock className="h-3 w-3 text-slate-400 shrink-0" />
                                    {bookingMode === 'today' ? 'غير متاح اليوم' : 'غير متاح لليوم التالي'}
                                  </span>
                                  {activeScheduledBranch && (
                                    <span className="text-teal-700 dark:text-teal-400 font-semibold truncate max-w-[130px]" title={activeScheduledBranch.nameAr}>
                                      المواعيد في {activeScheduledBranch.nameAr}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
                                    الفرع النشط {bookingMode === 'today' ? 'اليوم' : 'غداً'}
                                  </span>
                                  <span className="text-teal-700 dark:text-teal-400 font-bold">
                                    حجز معتمد
                                  </span>
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Patient Name & Phone Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Patient Name */}
                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        اسم المريض بالكامل <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => {
                          setPatientName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="مثال: د. محمد أحمد إبراهيم"
                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.name
                            ? 'border-rose-400 focus:ring-rose-400/40 bg-rose-50/20'
                            : 'border-slate-200 dark:border-slate-800 focus:ring-teal-500/30 focus:border-teal-500'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Patient Phone */}
                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        رقم الهاتف للتواصل وتأكيد الحجز <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={patientPhone}
                        onChange={(e) => {
                          setPatientPhone(e.target.value);
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder="01154021247"
                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.phone
                            ? 'border-rose-400 focus:ring-rose-400/40 bg-rose-50/20'
                            : 'border-slate-200 dark:border-slate-800 focus:ring-teal-500/30 focus:border-teal-500'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. Service Selection */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      نوع الخدمة أو الكشف المطلوب:
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {COMMON_SERVICES.map((s) => {
                        const isSelected = selectedService === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setSelectedService(s);
                              setCustomService('');
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                              isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/20'
                                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setSelectedService('أخرى')}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                          selectedService === 'أخرى'
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/20'
                            : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        خدمة أخرى...
                      </button>
                    </div>

                    {selectedService === 'أخرى' && (
                      <input
                        type="text"
                        value={customService}
                        onChange={(e) => setCustomService(e.target.value)}
                        placeholder="حدد الخدمة أو الاستشارة المطلوبة هنا..."
                        className="w-full px-4 py-2.5 rounded-xl border border-teal-500/50 bg-teal-50/30 dark:bg-teal-950/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                    )}
                  </div>

                  {/* 4. Additional Notes (Optional) */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      ملاحظات إضافية أو أعراض خاصة (اختياري)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="اكتب أي معلومات ترغب في إطلاع الطبيب أو الاستقبال عليها مسبقاً..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    />
                  </div>

                  {/* Action: Proceed to Payment */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
                    >
                      <span>الانتقال لخطوة الدفع وتأكيد الحجز</span>
                      <ChevronLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
                    </button>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                      سيتم الانتقال للخطوة التالية لاختيار وسيلة السداد (إنستاباي أو {walletMethodName})
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Payment & Receipt Upload */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-[#12151c] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/30 dark:shadow-none space-y-7"
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 mb-3"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span>الرجوع لتعديل بيانات المريض والفرع</span>
                    </button>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      سداد رسوم الكشف وتأكيد الموعد
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      يرجى تحويل رسوم الكشف الطبي عبر تطبيق إنستاباي أو {walletMethodName} وإرفاق صورة الإيصال.
                    </p>
                  </div>

                  {/* Consultation Amount Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200/70 dark:border-teal-800/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-teal-800 dark:text-teal-300 block">
                        إجمالي رسوم الكشف والاستشارة الطبية:
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {consultationPrice}{' '}
                        <span className="text-base font-bold text-teal-700 dark:text-teal-400">
                          {currency}
                        </span>
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold shadow-xs">
                        <Lock className="h-3 w-3" />
                        سداد رسمي معتمد
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Switcher */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                      اختر وسيلة التحويل المعتمدة:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* InstaPay */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('instapay')}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 text-start flex flex-col justify-between ${
                          paymentMethod === 'instapay'
                            ? 'border-teal-600 dark:border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                            إنستاباي (InstaPay)
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                            فوري 0% عمولة
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          تحويل مباشر لحساب العيادة بالـ IPA أو رقم الهاتف
                        </span>
                      </button>

                      {/* Vodafone Cash */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('vodafone_cash')}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 text-start flex flex-col justify-between ${
                          paymentMethod === 'vodafone_cash'
                            ? 'border-teal-600 dark:border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                            {walletMethodName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                            محافظ إلكترونية
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          تحويل إلى رقم {walletMethodName} المعتمد للعيادة
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Account Display with 1-Click Copy */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
                        {paymentMethod === 'instapay' ? 'بيانات حساب إنستاباي' : `أرقام ${walletMethodName} المتاحة`}
                      </span>
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                        اضغط لنسخ الرقم فوراً
                      </span>
                    </div>

                    {paymentMethod === 'instapay' ? (
                      <div className="space-y-3">
                        {instapayAccounts.map((acc, idx) => (
                          <div
                            key={acc.id || idx}
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                {acc.name}
                              </span>
                              <span className="text-sm font-black text-slate-900 dark:text-white font-mono" dir="ltr">
                                {acc.value}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(acc.value, `insta-${idx}`)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                copiedKey === `insta-${idx}`
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {copiedKey === `insta-${idx}` ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>تم النسخ</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>نسخ</span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {vodafoneAccounts.map((acc, idx) => (
                          <div
                            key={acc.id || idx}
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                {acc.name}
                              </span>
                              <span className="text-sm font-black text-slate-900 dark:text-white font-mono" dir="ltr">
                                {acc.value}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(acc.value, `voda-${idx}`)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                copiedKey === `voda-${idx}`
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {copiedKey === `voda-${idx}` ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>تم النسخ</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>نسخ</span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <p className="font-semibold text-teal-800 dark:text-teal-300">
                        خطوات تأكيد الدفع:
                      </p>
                      <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                        <li>قم بنسخ الرقم أو الحساب أعلاه وافتح تطبيق المحفظة أو إنستاباي.</li>
                        <li>حول مبلغ ({consultationPrice} {currency}) واحتفظ بلقطة شاشة لرسالة نجاح العملية.</li>
                        <li>ارفق صورة الإيصال بالأسفل واضغط تأكيد الحجز.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Sender Account Input Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        رقم المحفظة أو عنوان InstaPay المحوّل منه
                      </span>
                      <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                        لتسهيل وتأكيد مطابقة الإيصال
                      </span>
                    </label>
                    <input
                      type="text"
                      value={senderAccount}
                      onChange={(e) => setSenderAccount(e.target.value)}
                      placeholder="أدخل الرقم أو الـ IPA الذي قمت بالتحويل منه (مثال: 01012345678 أو name@instapay)"
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-sans placeholder:text-xs transition"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      يساعد هذا الرقم موظف الاستقبال على سرعة مطابقة إشعار التحويل البنكي أو المحفظة مع موعدك وتأكيده فوراً.
                    </p>
                  </div>

                  {/* Receipt Upload Dropzone */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Upload className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        إرفاق صورة إيصال التحويل (لقطة الشاشة):
                      </span>
                      <span className="text-xs text-slate-500">PNG, JPG, PDF حتى 15 ميجابايت</span>
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {!receiptFile ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-7 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center ${
                          dragActive
                            ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 scale-[1.01]'
                            : 'border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-slate-50/40 dark:bg-slate-900/30'
                        }`}
                      >
                        <div className="h-12 w-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          اضغط لاختيار صورة الإيصال أو اسحب الملف هنا
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          يدعم صور الكاميرا وسكرين شوت التطبيق مباشرة
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-950/20 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          {receiptPreviewUrl ? (
                            <img
                              src={receiptPreviewUrl}
                              alt="Receipt Preview"
                              className="h-14 w-14 rounded-xl object-cover border border-teal-300/60 shrink-0"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-teal-600/10 text-teal-600 flex items-center justify-center shrink-0">
                              <FileText className="h-6 w-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 block">
                              تم إرفاق الإيصال بنجاح
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate block">
                              {receiptFile.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {(receiptFile.size / 1024).toFixed(1)} كيلوبايت
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveReceipt}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="حذف الملف واختيار غيره"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    {errors.receipt && (
                      <p className="text-xs text-rose-500 mt-2 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.receipt}
                      </p>
                    )}
                  </div>

                  {/* Submission Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting || isUploading}
                      onClick={() => setCurrentStep(1)}
                      className="py-3.5 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>تعديل البيانات</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting || isUploading || !isPaymentFormValid}
                      onClick={handleSubmitBooking}
                      className={`flex-1 py-4 px-6 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center gap-3 ${
                        isSubmitting || isUploading || !isPaymentFormValid
                          ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 cursor-pointer hover:-translate-y-0.5'
                      }`}
                    >
                      {isSubmitting || isUploading ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>جاري رفع الإيصال وتسجيل الموعد...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span>تأكيد وإرسال الحجز الطبي الآن</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: High-Impact Confirmation & Queue Position */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-[#12151c] rounded-3xl p-6 sm:p-9 border border-emerald-200 dark:border-emerald-800/60 shadow-2xl shadow-emerald-500/10 space-y-7 text-start"
                >
                  {/* Celebratory Icon Header */}
                  <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                      تم استلام طلب الحجز بنجاح
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      أهلاً بك، {patientName}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                      تم تسجيل بيانات حجزك المبدئي وإرفاق الإيصال بنجاح. فريق الاستقبال الطبي بفرع {currentBranch?.nameAr} يراجع التحويل لتأكيده فوراً.
                    </p>
                  </div>

                  {/* Confirmed Queue Position Card (The Core Requirement) */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-teal-900/20 text-center space-y-2">
                    <span className="text-xs font-bold tracking-widest text-emerald-100 uppercase">
                      موقعك في كشف العيادة المعتمد
                    </span>
                    <div className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-sm">
                      رقمك في قائمة الحجز المؤكد {bookingMode === 'today' ? 'اليوم' : 'لليوم التالي'}: #{confirmedQueuePosition}
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-100/90 font-medium pt-1">
                      (يتم تأكيد هذا الترتيب المتقدم وحجزه لك فور مراجعة قسم الحسابات للإيصال)
                    </p>
                  </div>

                  {/* Booking Receipt Summary Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-slate-800 text-xs text-slate-500">
                      <span>رقم الحجز المرجعي:</span>
                      <div className="flex items-center gap-2">
                        {submissionTimestamp && (
                          <span className="text-[11px] text-slate-400">({submissionTimestamp})</span>
                        )}
                        <span className="font-mono font-black text-slate-900 dark:text-white">
                          {bookingRefId}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">تاريخ الكشف:</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">
                        {bookingMode === 'today' ? 'اليوم' : 'غداً'} ({formatShortDate(selectedDate)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">الفرع المختار:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{currentBranch?.nameAr}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">نوع الخدمة:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeService}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">وسيلة الدفع:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' : `${walletMethodName} (المحفظة الإلكترونية)`}
                      </span>
                    </div>
                    {senderAccount && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">الحساب المحوّل منه:</span>
                        <span className="font-mono font-bold text-teal-700 dark:text-teal-400" dir="ltr">
                          {senderAccount}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">رسوم الكشف:</span>
                      <span className="font-black text-teal-700 dark:text-teal-400">
                        {consultationPrice} {currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">حالة الحجز المبدئية:</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        قيد المراجعة الفورية (Pending)
                      </span>
                    </div>
                  </div>

                  {/* Direct WhatsApp Confirmation Trigger */}
                  <div className="space-y-3">
                    <a
                      href={generateWhatsAppMessage()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-base shadow-lg shadow-[#25D366]/25 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      <MessageCircle className="h-5 w-5 fill-white text-white" />
                      <span>تأكيد الحجز فوراً عبر واتساب العيادة</span>
                      <ExternalLink className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onNavigateHome ? onNavigateHome() : (window.location.href = '/')}
                      className="w-full py-3.5 px-6 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      العودة للصفحة الرئيسية
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LEFT COLUMN (40% on desktop: lg:col-span-5 - Sticky Trust Sidebar) */}
          <div className="lg:col-span-5 order-2 space-y-6 lg:sticky lg:top-28">
            {/* 1. Real-Time Booking Summary Card */}
            <div className="bg-white dark:bg-[#12151c] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/20 dark:shadow-none space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <span className="text-xs font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  ملخص الحجز اللحظي
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  {bookingMode === 'today' ? 'قائمة كشف اليوم' : 'قائمة كشف الغد'}
                </span>
              </div>

              {/* Date Quick Recap */}
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    موعد وتاريخ الكشف
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {bookingMode === 'today' ? 'اليوم' : 'غداً'} — {formatShortDate(selectedDate)}
                  </span>
                </div>
              </div>

              {/* Branch Quick Recap */}
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    الفرع المحدد
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {currentBranch?.nameAr}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {currentBranch?.addressAr}
                  </span>
                </div>
              </div>

              {/* Service Quick Recap */}
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    الخدمة المختارة
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {activeService}
                  </span>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>رسوم الاستشارة الطبية</span>
                  <span className="font-bold">{consultationPrice} {currency}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>رسوم الحجز الإلكتروني</span>
                  <span className="font-bold text-emerald-600">مجاناً (0 {currency})</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    الإجمالي المطلوب سداده:
                  </span>
                  <span className="text-lg font-black text-teal-700 dark:text-teal-400">
                    {consultationPrice} {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Clinic Security & Trust Badges */}
            <div className="bg-white dark:bg-[#12151c] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/20 dark:shadow-none space-y-4">
              <span className="text-xs font-black tracking-wider uppercase text-slate-500 dark:text-slate-400 block">
                ضمانات الحجز والأمان الطبي
              </span>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      كشف طبي معتمد بنسبة 100%
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      بإشراف نخبة من أساتذة واستشاريي الجلدية والليزر والتجميل الطبي.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lock className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      سرية تامة للبيانات الطبية
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      تشفير كامل للمعلومات والملفات الطبية الخاصة بكل مريض.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      مرونة تغيير الموعد
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      إمكانية تعديل الفرع أو تأجيل الموعد مجاناً بالتنسيق مع الاستقبال.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Direct Branch Location & Support */}
            <div className="bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" />
                  موقع الفرع المختار على الخريطة
                </span>
                {currentBranch?.mapsUrl && (
                  <a
                    href={currentBranch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>فتح الخرائط</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentBranch?.addressAr}
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>للاستفسار السريع عبر الهاتف:</span>
                <a
                  href={`tel:${currentBranch?.phones[0]?.number || effectiveClinicPhone}`}
                  className="font-bold text-teal-700 dark:text-teal-400"
                  dir="ltr"
                >
                  {currentBranch?.phones[0]?.display || effectiveClinicPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
