import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import {
  Calendar,
  Building2,
  Sliders,
  Activity,
  ArrowRight,
  RefreshCw,
  Users,
  TrendingUp,
  LogOut,
  ShieldCheck,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Sparkles,
  Stethoscope,
  Settings2,
  MapPin,
  ChevronLeft,
} from 'lucide-react';
import { BookingsManager } from './BookingsManager';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { PaymentSettingsManager } from './PaymentSettingsManager';
import { ScheduleManager } from './ScheduleManager';
import { BranchEditor } from './BranchEditor';
import { SiteSettingsEditor } from './SiteSettingsEditor';
import { ActivityLogs } from './ActivityLogs';
import { ToastContainer } from './ToastContainer';
import {
  fetchAllScheduleExceptions,
  saveScheduleException,
  deleteScheduleException,
  fetchAllBranches,
  updateBranchDetails,
  fetchSiteSettings,
  updateSiteSettings,
  fetchActivityLogs,
} from '@/services/adminService';
import { fetchAppointments } from '@/services/appointmentService';
import {
  getTodayDynamicSchedule,
  subscribeScheduleChanges,
  getIsoDateString,
} from '@/services/scheduleService';
import { formatArabicDate, formatTime12h } from '@/utils/timeFormat';
import { BranchRecord, ScheduleExceptionRecord, TodayScheduleResult } from '@/types/schedule';
import { SiteSettingsRecord, ActivityLogRecord, ToastMessage, AppointmentRecord } from '@/types/admin';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { useSiteSettings } from '@/context/SiteSettingsContext';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onSignOut?: () => void;
  adminEmail?: string;
}

export type OperationalTab = 'bookings' | 'schedule' | 'analytics';
export type SystemSubTab = 'payments' | 'branches' | 'settings' | 'logs';
export type AdminTab = OperationalTab | SystemSubTab | 'system';

// Helper: Parse time string into minutes from midnight for sorting and next patient detection
function parseTimeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim();
  const isPM = clean.includes('م') || clean.includes('مساء') || clean.toUpperCase().includes('PM');
  const isAM = clean.includes('ص') || clean.includes('صباح') || clean.toUpperCase().includes('AM');

  const match = clean.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + mins;
  }
  return 0;
}

export const AdminDashboard = React.memo(function AdminDashboard({
  onBackToSite,
  onSignOut,
  adminEmail = 'مدير النظام',
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [systemSubTab, setSystemSubTab] = useState<SystemSubTab>('payments');
  const [bookingsFilterPreset, setBookingsFilterPreset] = useState<'today' | 'review' | 'all' | null>(null);

  const [exceptions, setExceptions] = useState<ScheduleExceptionRecord[]>([]);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [settings, setSettings] = useState<SiteSettingsRecord>({});
  const [logs, setLogs] = useState<ActivityLogRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TodayScheduleResult | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { logoUrl: contextLogo, updateSettings: updateContextSettings } = useSiteSettings();

  const dashboardContainerRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Toast Dispatcher Helper - stable callback
  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial Data Load
  const loadDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [excData, branchData, settingsData, logsData, aptsData, schedData] = await Promise.all([
        fetchAllScheduleExceptions(),
        fetchAllBranches(),
        fetchSiteSettings(),
        fetchActivityLogs(),
        fetchAppointments(),
        getTodayDynamicSchedule(),
      ]);

      setExceptions(excData);
      setBranches(branchData);
      setSettings(settingsData);
      setLogs(logsData);
      setAppointments(aptsData);
      setTodaySchedule(schedData);

      if (isSilentRefresh) {
        addToast('success', 'تم تحديث كافة المؤشرات والبيانات الحية بنجاح');
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
      addToast('error', 'حدث خطأ أثناء تحميل بيانات لوحة التحكم');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Subscribe to real-time schedule changes
  useEffect(() => {
    const unsubscribe = subscribeScheduleChanges(() => {
      getTodayDynamicSchedule().then((res) => setTodaySchedule(res));
      fetchAllScheduleExceptions().then((exc) => setExceptions(exc));
    });
    return () => unsubscribe();
  }, []);

  // GSAP Entry Animation
  useEffect(() => {
    if (!dashboardContainerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.gsap-header-anim', {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      });

      gsap.from('.gsap-stats-anim', {
        y: 15,
        opacity: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.1,
      });

      gsap.from('.gsap-tabs-anim', {
        scale: 0.98,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.2,
      });
    }, dashboardContainerRef);

    return () => ctx.revert();
  }, []);

  // Smooth fade when tab changes without jarring re-layout
  useEffect(() => {
    if (!tabContentRef.current) return;

    gsap.fromTo(
      tabContentRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }, [activeTab, systemSubTab]);

  // Handler: Save Schedule Exception
  const handleSaveException = useCallback(
    async (payload: Partial<ScheduleExceptionRecord> & { exception_date: string }) => {
      try {
        const res = await saveScheduleException(payload);
        if (res.success) {
          addToast(
            'success',
            payload.is_holiday
              ? `تم تعيين يوم ${payload.exception_date} كعطلة رسمية وإيقاف الحجوزات بنجاح`
              : `تم حفظ تبديل الفرع لتاريخ ${payload.exception_date} بنجاح`
          );
          await loadDashboardData(true);
        } else {
          addToast('error', res.error || 'تعذر حفظ الاستثناء');
        }
      } catch {
        addToast('error', 'حدث خطأ أثناء حفظ الاستثناء');
      }
    },
    [addToast, loadDashboardData]
  );

  // Handler: Delete Schedule Exception
  const handleDeleteException = useCallback(
    async (idOrDate: string) => {
      try {
        const res = await deleteScheduleException(idOrDate);
        if (res.success) {
          addToast('success', 'تم إلغاء الاستثناء واستعادة المواعيد المعتادة');
          await loadDashboardData(true);
        } else {
          addToast('error', res.error || 'تعذر حذف الاستثناء');
        }
      } catch {
        addToast('error', 'حدث خطأ أثناء حذف الاستثناء');
      }
    },
    [addToast, loadDashboardData]
  );

  // Handler: Update Branch
  const handleUpdateBranch = useCallback(
    async (branchId: string, updates: Partial<BranchRecord>) => {
      try {
        const res = await updateBranchDetails(branchId, updates);
        if (res.success) {
          addToast('success', 'تم تحديث بيانات وموقع الفرع في قاعدة البيانات بنجاح');
          await loadDashboardData(true);
        } else {
          addToast('error', res.error || 'تعذر تحديث بيانات الفرع');
        }
      } catch {
        addToast('error', 'حدث خطأ أثناء تحديث الفرع');
      }
    },
    [addToast, loadDashboardData]
  );

  // Handler: Update Site Settings
  const handleUpdateSettings = useCallback(
    async (newSettings: Partial<SiteSettingsRecord>) => {
      try {
        const res = await updateSiteSettings(newSettings);
        if (res.success) {
          await updateContextSettings(newSettings);
          addToast('success', 'تم تطبيق وحفظ إعدادات الموقع وهوية الشعار والفافيكون بنجاح');
          await loadDashboardData(true);
        } else {
          addToast('error', res.error || 'تعذر حفظ إعدادات الموقع');
        }
      } catch {
        addToast('error', 'حدث خطأ أثناء حفظ الإعدادات');
      }
    },
    [addToast, updateContextSettings, loadDashboardData]
  );

  // Today Date in ISO and Arabic Formats
  const todayIso = useMemo(() => getIsoDateString(), []);
  const todayArabicFormatted = useMemo(() => formatArabicDate(new Date()), []);

  // Strict Today Filtered Appointments
  const todayAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.appointment_date === todayIso);
  }, [appointments, todayIso]);

  // Metric 1: Next upcoming patient for today
  const nextUpcomingPatient = useMemo(() => {
    const activeToday = todayAppointments.filter(
      (a) => a.status !== 'cancelled' && a.status !== 'completed'
    );
    if (activeToday.length === 0) return null;

    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const sorted = [...activeToday].sort((a, b) => {
      return parseTimeToMinutes(a.appointment_time) - parseTimeToMinutes(b.appointment_time);
    });

    const upcoming = sorted.find((a) => parseTimeToMinutes(a.appointment_time) >= nowMinutes);
    return upcoming || sorted[0];
  }, [todayAppointments]);

  // Metric 2: Today's Collected Paid Revenue
  const todayPaidRevenue = useMemo(() => {
    return todayAppointments
      .filter((a) => a.payment_status === 'paid')
      .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [todayAppointments]);

  const todayPaidCount = useMemo(() => {
    return todayAppointments.filter((a) => a.payment_status === 'paid').length;
  }, [todayAppointments]);

  // Metric 3: Pending Review Bookings & Payment Transfers Count
  const pendingReviewCount = useMemo(() => {
    return appointments.filter(
      (a) =>
        a.status === 'pending' ||
        a.payment_status === 'pending' ||
        a.payment_status === 'معلق' ||
        Boolean(a.payment_screenshot_url && a.payment_status !== 'paid')
    ).length;
  }, [appointments]);

  // Metric 4: Active Branch and Operating Hours for Today
  const todayActiveBranchName = useMemo(() => {
    if (todaySchedule?.isClosed || todaySchedule?.isHoliday) {
      return 'إجازة / غير متاح';
    }
    return todaySchedule?.activeBranch?.nameAr || 'فرع التجمع الخامس';
  }, [todaySchedule]);

  const todayHoursFormatted = useMemo(() => {
    if (todaySchedule?.isClosed || todaySchedule?.isHoliday) {
      return todaySchedule.reasonAr || 'العيادة مغلقة اليوم';
    }
    return todaySchedule?.todayWorkingHours?.formattedAr
      ? formatTime12h(todaySchedule.todayWorkingHours.formattedAr)
      : '1:00 م — 9:00 م';
  }, [todaySchedule]);

  // Is current tab inside System Configuration group?
  const isSystemActive =
    activeTab === 'system' ||
    activeTab === 'payments' ||
    activeTab === 'branches' ||
    activeTab === 'settings' ||
    activeTab === 'logs';

  // Resolved active view component
  const effectiveView = activeTab === 'system' ? systemSubTab : activeTab;

  // Handlers for Quick Navigation from Executive Daily Overview
  const handleViewTodayBookings = useCallback(() => {
    setBookingsFilterPreset('today');
    setActiveTab('bookings');
  }, []);

  const handleReviewPending = useCallback(() => {
    setBookingsFilterPreset('review');
    setActiveTab('bookings');
  }, []);

  const handleAdjustSchedule = useCallback(() => {
    setActiveTab('schedule');
  }, []);

  // System sub-tabs configuration
  const systemTabsConfig: { id: SystemSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'payments', label: 'بوابات الدفع والتسعير المالي', icon: CreditCard },
    { id: 'branches', label: 'تعديل بيانات الفروع والمواقع', icon: Building2 },
    { id: 'settings', label: 'إعدادات الموقع والشعار والـ Favicon', icon: Sliders },
    { id: 'logs', label: 'سجل النشاطات والأمان', icon: Activity },
  ];

  return (
    <div
      ref={dashboardContainerRef}
      dir="rtl"
      className="min-h-screen bg-[#06080C] text-slate-100 font-sans selection:bg-[#00B8A9] selection:text-slate-950 pb-20 relative overflow-hidden"
    >
      {/* Ambient Glassmorphism Glows */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[600px] h-[600px] bg-[#00B8A9]/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[500px] h-[500px] bg-teal-900/15 rounded-full blur-[160px]" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/80 border-b border-white/10 px-4 sm:px-8 py-3.5 gsap-header-anim shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={contextLogo || settings.logo_url || CLINIC_LOGO}
              alt="Androderma"
              className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,184,169,0.4)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = CLINIC_LOGO;
              }}
            />
            <div className="border-r border-white/10 pr-4">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-base sm:text-lg text-white">
                  لوحة تحكم الإدارة الطبية
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00B8A9]/15 text-[#00B8A9] border border-[#00B8A9]/30">
                  Doctor-First Layout
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                متابعة الحجوزات اليومية، الكشوفات، التحصيلات وإدارة الفروع
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin User Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-teal-500/30 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00B8A9]" />
              <span className="text-slate-200 font-bold text-xs">
                {adminEmail === 'admin@androderma.com' ? 'مدير النظام' : adminEmail}
              </span>
            </div>

            {/* Database Sync Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-[#00B8A9] animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300 font-mono text-[11px]">
                {isSupabaseConfigured ? 'Supabase Live Sync' : 'Local Storage'}
              </span>
            </div>

            {/* Back to Site Button */}
            <button
              onClick={onBackToSite}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00B8A9]/40 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 sm:gap-2 group cursor-pointer"
            >
              <span>الواجهة الرئيسية</span>
              <ArrowRight className="w-4 h-4 text-[#00B8A9] transition-transform group-hover:-translate-x-0.5" />
            </button>

            {/* Sign Out Button */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="تسجيل الخروج من لوحة الإدارة"
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-all flex items-center gap-1 text-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">خروج</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* ========================================================================= */}
        {/* 1. EXECUTIVE DAILY OVERVIEW (ملخص نشاط اليوم) — Doctor-First Primary Panel */}
        {/* ========================================================================= */}
        <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950 border border-teal-500/30 shadow-[0_12px_36px_-10px_rgba(0,184,169,0.2)] relative overflow-hidden backdrop-blur-xl gsap-stats-anim">
          {/* Subtle Decorative Ambient Background Elements */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-52 h-52 bg-[#00B8A9]/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-1/4 w-64 h-64 bg-teal-800/10 rounded-full blur-3xl" />

          {/* Banner Top Header Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00B8A9]/15 border border-[#00B8A9]/40 flex items-center justify-center text-[#00B8A9] shadow-[0_0_15px_rgba(0,184,169,0.3)]">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    ملخص نشاط اليوم — Executive Daily Overview
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    مؤشرات مباشرة
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  متابعة الكشوفات المقررة لليوم، التحصيلات المالية الفورية، وحالة الفرع المناوب
                </p>
              </div>
            </div>

            {/* Date Tag & Refresh Trigger */}
            <div className="flex items-center gap-2.5">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-2 text-xs font-bold text-slate-200">
                <Clock className="w-4 h-4 text-[#00B8A9]" />
                <span className="font-mono text-teal-300">{todayArabicFormatted}</span>
              </div>

              <button
                type="button"
                onClick={() => loadDashboardData(true)}
                disabled={isRefreshing || isLoading}
                title="تحديث مؤشرات اليوم فوراً"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00B8A9]/40 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#00B8A9] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث فوري</span>
              </button>
            </div>
          </div>

          {/* 4 Key Live Daily Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 relative z-10">
            {/* Metric 1: كشوفات اليوم + الموعد القادم */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#00B8A9]" />
                  <span>كشوفات اليوم</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-300">
                  {todayIso}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono tracking-tight">
                    {todayAppointments.length}
                  </span>
                  <span className="text-xs font-bold text-slate-400">حجز مجدول</span>
                </div>

                <div className="mt-2 text-[11px] text-slate-300">
                  {nextUpcomingPatient ? (
                    <div className="flex items-center gap-1.5 text-teal-300 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                      <span>
                        الموعد القادم:{' '}
                        <strong className="font-bold text-white">
                          {formatTime12h(nextUpcomingPatient.appointment_time)}
                        </strong>{' '}
                        ({nextUpcomingPatient.patient_name})
                      </span>
                    </div>
                  ) : todayAppointments.length > 0 ? (
                    <span className="text-slate-400">اكتملت جميع كشوفات اليوم</span>
                  ) : (
                    <span className="text-slate-500">لا توجد مواعيد مجدولة لليوم حتى الآن</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleViewTodayBookings}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#00B8A9]/15 border border-white/10 hover:border-[#00B8A9]/40 text-xs font-bold text-slate-200 hover:text-teal-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span>عرض جدول كشوفات اليوم</span>
                <ChevronLeft className="w-3.5 h-3.5 text-[#00B8A9]" />
              </button>
            </div>

            {/* Metric 2: تحصيلات اليوم (ج.م) */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>تحصيلات اليوم (ج.م)</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  كاش وتحويلات
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    {todayPaidRevenue.toLocaleString('ar-EG')}
                  </span>
                  <span className="text-xs font-bold text-slate-400">ج.م</span>
                </div>

                <p className="mt-2 text-[11px] text-slate-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {todayPaidCount > 0
                      ? `تم تحصيل ${todayPaidCount} كشف مؤكد بنجاح`
                      : 'في انتظار تحصيل كشوفات اليوم'}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleViewTodayBookings}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span>متابعة مدفوعات اليوم</span>
                <ChevronLeft className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>

            {/* Metric 3: طلبات تحتاج مراجعة (مع إجراء سريع) */}
            <div
              className={`p-5 rounded-2xl bg-slate-950/80 border transition-all flex flex-col justify-between space-y-3 group shadow-md ${
                pendingReviewCount > 0
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-white/10 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className={`w-4 h-4 ${pendingReviewCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>طلبات تحتاج مراجعة</span>
                </span>
                {pendingReviewCount > 0 ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse">
                    بحاجة لاعتماد
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    مكتمل ومحدث
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-black font-mono tracking-tight ${
                      pendingReviewCount > 0 ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {pendingReviewCount}
                  </span>
                  <span className="text-xs font-bold text-slate-400">طلب قيد المراجعة</span>
                </div>

                <p className="mt-2 text-[11px] text-slate-300">
                  {pendingReviewCount > 0
                    ? 'حجوزات غير مؤكدة أو إيصالات تحويل بانتظار الموافقة'
                    : 'لا توجد طلبات معلقة تتطلب تدقيقاً حالياً'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleReviewPending}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 ${
                  pendingReviewCount > 0
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>إجراء سريع وفحص الطلبات</span>
              </button>
            </div>

            {/* Metric 4: الفرع المتواجد به اليوم */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>الفرع المتواجد به اليوم</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    todaySchedule?.isClosed
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                      : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                  }`}
                >
                  {todaySchedule?.openStatus?.isOpen ? 'مفتوح الآن' : 'جدول التناوب'}
                </span>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-black text-white truncate" title={todayActiveBranchName}>
                  {todayActiveBranchName}
                </div>

                <div className="mt-2 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>مواعيد الكشف: {todayHoursFormatted}</span>
                  </div>
                  {todaySchedule?.openStatus?.statusTextAr && (
                    <div className="text-[10px] text-teal-300 font-semibold">
                      {todaySchedule.openStatus.statusTextAr}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdjustSchedule}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-xs font-bold text-slate-200 hover:text-cyan-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>تعديل جدول وتناوب اليوم</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. STREAMLINED TAB NAVIGATION (Doctor-First Operations vs System Config) */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          {/* Primary Operations Tab Bar */}
          <div className="p-1.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-wrap gap-1.5 gsap-tabs-anim shadow-lg">
            {/* Primary Tab 1: Bookings & Financials */}
            <button
              type="button"
              onClick={() => {
                setBookingsFilterPreset(null);
                setActiveTab('bookings');
              }}
              className={`flex-1 min-w-[170px] py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#00B8A9] text-slate-950 shadow-[0_0_25px_rgba(0,184,169,0.35)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-slate-950' : 'text-[#00B8A9]'}`} />
              <span>إدارة الحجوزات والمالية</span>
              {pendingReviewCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'bookings'
                      ? 'bg-slate-950 text-amber-300'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {pendingReviewCount}
                </span>
              )}
            </button>

            {/* Primary Tab 2: Weekly Schedule & Exceptions */}
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 min-w-[170px] py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-[#00B8A9] text-slate-950 shadow-[0_0_25px_rgba(0,184,169,0.35)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'schedule' ? 'text-slate-950' : 'text-teal-400'}`} />
              <span>جدول التناوب والإجازات</span>
            </button>

            {/* Primary Tab 3: Analytics & Demand */}
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 min-w-[170px] py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#00B8A9] text-slate-950 shadow-[0_0_25px_rgba(0,184,169,0.35)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-slate-950' : 'text-teal-400'}`} />
              <span>التحليلات ومعدلات الطلب</span>
            </button>

            {/* Secondary Grouped Tab 4: System & Technical Configuration */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('system');
              }}
              className={`flex-1 min-w-[170px] py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSystemActive
                  ? 'bg-slate-800 text-teal-300 border border-teal-500/40 shadow-[0_0_20px_rgba(0,184,169,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings2 className={`w-4 h-4 ${isSystemActive ? 'text-[#00B8A9]' : 'text-slate-400'}`} />
              <span>إعدادات المنظومة بالنظام</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
                4 إعدادات
              </span>
            </button>
          </div>

          {/* Secondary Sub-Bar for Technical / Developer Settings */}
          {isSystemActive && (
            <div className="p-2 rounded-2xl bg-slate-950/90 border border-teal-500/20 backdrop-blur-xl flex flex-wrap gap-2 items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-400 font-bold border-l border-white/10 pl-3">
                <Sliders className="w-3.5 h-3.5 text-[#00B8A9]" />
                <span className="hidden sm:inline">أقسام إعدادات النظام:</span>
              </div>

              <div className="flex flex-wrap gap-1.5 flex-1 justify-end">
                {systemTabsConfig.map((subTab) => {
                  const Icon = subTab.icon;
                  const isCurrentSub = effectiveView === subTab.id;

                  return (
                    <button
                      key={subTab.id}
                      type="button"
                      onClick={() => {
                        setSystemSubTab(subTab.id);
                        setActiveTab(subTab.id);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCurrentSub
                          ? 'bg-[#00B8A9] text-slate-950 font-black shadow-md'
                          : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:border-teal-500/30'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isCurrentSub ? 'text-slate-950' : 'text-teal-400'}`} />
                      <span>{subTab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. ACTIVE TAB CONTENT VIEW WITH GSAP ANIMATION WRAPPER                    */}
        {/* ========================================================================= */}
        <div ref={tabContentRef} className="space-y-6">
          {effectiveView === 'bookings' && (
            <BookingsManager onNotify={addToast} filterPreset={bookingsFilterPreset} />
          )}

          {effectiveView === 'analytics' && (
            <AnalyticsDashboard onNotify={addToast} />
          )}

          {effectiveView === 'schedule' && (
            <ScheduleManager
              exceptions={exceptions}
              branches={branches}
              onSaveException={handleSaveException}
              onDeleteException={handleDeleteException}
              isLoading={isLoading}
            />
          )}

          {effectiveView === 'payments' && (
            <PaymentSettingsManager onNotify={addToast} />
          )}

          {effectiveView === 'branches' && (
            <BranchEditor
              branches={branches}
              onUpdateBranch={handleUpdateBranch}
              isLoading={isLoading}
            />
          )}

          {effectiveView === 'settings' && (
            <SiteSettingsEditor
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              isLoading={isLoading}
            />
          )}

          {effectiveView === 'logs' && (
            <ActivityLogs
              logs={logs}
              onRefresh={() => loadDashboardData(true)}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
});

