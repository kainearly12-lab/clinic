import { useEffect, useRef, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { BookingsManager } from './BookingsManager';
import { AnalyticsDashboard } from './AnalyticsDashboard';
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
import { BranchRecord, ScheduleExceptionRecord } from '@/types/schedule';
import { SiteSettingsRecord, ActivityLogRecord, ToastMessage } from '@/types/admin';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { useSiteSettings } from '@/context/SiteSettingsContext';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onSignOut?: () => void;
  adminEmail?: string;
}

type AdminTab = 'bookings' | 'schedule' | 'branches' | 'analytics' | 'settings' | 'logs';

export function AdminDashboard({ onBackToSite, onSignOut, adminEmail = 'مدير النظام' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [exceptions, setExceptions] = useState<ScheduleExceptionRecord[]>([]);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [settings, setSettings] = useState<SiteSettingsRecord>({});
  const [logs, setLogs] = useState<ActivityLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { logoUrl: contextLogo, updateSettings: updateContextSettings } = useSiteSettings();

  const dashboardContainerRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Toast Dispatcher Helper
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Load
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [excData, branchData, settingsData, logsData] = await Promise.all([
        fetchAllScheduleExceptions(),
        fetchAllBranches(),
        fetchSiteSettings(),
        fetchActivityLogs(),
      ]);

      setExceptions(excData);
      setBranches(branchData);
      setSettings(settingsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
      addToast('error', 'حدث خطأ أثناء تحميل بيانات لوحة التحكم');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // GSAP Entry Animation
  useEffect(() => {
    if (!dashboardContainerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.gsap-header-anim', {
        y: -30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.from('.gsap-stats-anim', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.15,
      });

      gsap.from('.gsap-tabs-anim', {
        scale: 0.96,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.25,
      });
    }, dashboardContainerRef);

    return () => ctx.revert();
  }, []);

  // GSAP Animation when Tab changes
  useEffect(() => {
    if (!tabContentRef.current) return;

    gsap.fromTo(
      tabContentRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [activeTab]);

  // Handler: Save Schedule Exception
  const handleSaveException = async (
    payload: Partial<ScheduleExceptionRecord> & { exception_date: string }
  ) => {
    try {
      const res = await saveScheduleException(payload);
      if (res.success) {
        addToast(
          'success',
          payload.is_holiday
            ? `تم تعيين يوم ${payload.exception_date} كعطلة رسمية وإيقاف الحجوزات بنجاح`
            : `تم حفظ تبديل الفرع لتاريخ ${payload.exception_date} بنجاح`
        );
        await loadDashboardData();
      } else {
        addToast('error', res.error || 'تعذر حفظ الاستثناء');
      }
    } catch {
      addToast('error', 'حدث خطأ أثناء حفظ الاستثناء');
    }
  };

  // Handler: Delete Schedule Exception
  const handleDeleteException = async (idOrDate: string) => {
    try {
      const res = await deleteScheduleException(idOrDate);
      if (res.success) {
        addToast('success', 'تم إلغاء الاستثناء واستعادة المواعيد المعتادة');
        await loadDashboardData();
      } else {
        addToast('error', res.error || 'تعذر حذف الاستثناء');
      }
    } catch {
      addToast('error', 'حدث خطأ أثناء حذف الاستثناء');
    }
  };

  // Handler: Update Branch
  const handleUpdateBranch = async (branchId: string, updates: Partial<BranchRecord>) => {
    try {
      const res = await updateBranchDetails(branchId, updates);
      if (res.success) {
        addToast('success', 'تم تحديث بيانات وموقع الفرع في قاعدة البيانات بنجاح');
        await loadDashboardData();
      } else {
        addToast('error', res.error || 'تعذر تحديث بيانات الفرع');
      }
    } catch {
      addToast('error', 'حدث خطأ أثناء تحديث الفرع');
    }
  };

  // Handler: Update Site Settings
  const handleUpdateSettings = async (newSettings: Partial<SiteSettingsRecord>) => {
    try {
      const res = await updateSiteSettings(newSettings);
      if (res.success) {
        await updateContextSettings(newSettings);
        addToast('success', 'تم تطبيق وحفظ إعدادات الموقع وهوية الشعار والفافيكون بنجاح');
        await loadDashboardData();
      } else {
        addToast('error', res.error || 'تعذر حفظ إعدادات الموقع');
      }
    } catch {
      addToast('error', 'حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  // Summary Metrics
  const activeHolidaysCount = exceptions.filter((e) => e.is_holiday || e.exception_type === 'holiday').length;
  const activeSwapsCount = exceptions.filter((e) => !e.is_holiday && (e.override_branch_id || e.replacement_branch_id)).length;

  return (
    <div
      ref={dashboardContainerRef}
      dir="rtl"
      className="min-h-screen bg-[#06080C] text-slate-100 font-sans selection:bg-[#00B8A9] selection:text-slate-950 pb-20 relative overflow-hidden"
    >
      {/* Refined Ambient Glassmorphism Glows */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[600px] h-[600px] bg-[#00B8A9]/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[500px] h-[500px] bg-teal-900/15 rounded-full blur-[160px]" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/70 border-b border-white/10 px-4 sm:px-8 py-3.5 gsap-header-anim">
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
                  لوحة تحكم الإدارة
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00B8A9]/15 text-[#00B8A9] border border-[#00B8A9]/30">
                  Androderma Core
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                إدارة الحجوزات، المدفوعات، التحليلات، الجداول، الفروع والشعار
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
                {isSupabaseConfigured ? 'Supabase Live Connected' : 'Local Storage Engine'}
              </span>
            </div>

            {/* Back to Site Button */}
            <button
              onClick={onBackToSite}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00B8A9]/40 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 sm:gap-2 group"
            >
              <span>الواجهة الرئيسية</span>
              <ArrowRight className="w-4 h-4 text-[#00B8A9] transition-transform group-hover:-translate-x-0.5" />
            </button>

            {/* Sign Out Button */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="تسجيل الخروج من لوحة الإدارة"
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-all flex items-center gap-1 text-xs"
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
        {/* KPI Stats Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl gsap-stats-anim">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">إجمالي الفروع النشطة</span>
              <Building2 className="w-4 h-4 text-[#00B8A9]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{branches.length || 4}</div>
            <span className="text-[11px] text-teal-400 font-medium">فروع معتمدة بالقاهرة والجيزة</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl gsap-stats-anim">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">العطلات الرسمية المسجلة</span>
              <Calendar className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{activeHolidaysCount}</div>
            <span className="text-[11px] text-red-300 font-medium">تعطيل فوري للحجز والواتساب</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl gsap-stats-anim">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">تبديلات الفروع المناوبة</span>
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{activeSwapsCount}</div>
            <span className="text-[11px] text-amber-300 font-medium">توجيه تلقائي للفرع البديل</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl gsap-stats-anim">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">سجلات التدقيق والأمان</span>
              <Activity className="w-4 h-4 text-[#00B8A9]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{logs.length}</div>
            <span className="text-[11px] text-teal-400 font-medium">سجل عمليات حي محفوظ</span>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="p-1.5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-wrap gap-1.5 gsap-tabs-anim">
          {[
            { id: 'bookings' as AdminTab, label: 'إدارة الحجوزات والمدفوعات', icon: Users },
            { id: 'analytics' as AdminTab, label: 'لوحة التحليلات ومعدلات الطلب', icon: TrendingUp },
            { id: 'schedule' as AdminTab, label: 'إدارة المواعيد والعطلات', icon: Calendar },
            { id: 'branches' as AdminTab, label: 'محرر بيانات الفروع والمواقع', icon: Building2 },
            { id: 'settings' as AdminTab, label: 'إعدادات الموقع والشعار والـ Favicon', icon: Sliders },
            { id: 'logs' as AdminTab, label: 'سجل نشاطات الإدارة', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-[#00B8A9] text-slate-950 shadow-[0_0_20px_rgba(0,184,169,0.35)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content with GSAP Animation Wrapper */}
        <div ref={tabContentRef}>
          {activeTab === 'bookings' && (
            <BookingsManager onNotify={addToast} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard onNotify={addToast} />
          )}

          {activeTab === 'schedule' && (
            <ScheduleManager
              exceptions={exceptions}
              branches={branches}
              onSaveException={handleSaveException}
              onDeleteException={handleDeleteException}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'branches' && (
            <BranchEditor
              branches={branches}
              onUpdateBranch={handleUpdateBranch}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'settings' && (
            <SiteSettingsEditor
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'logs' && (
            <ActivityLogs
              logs={logs}
              onRefresh={loadDashboardData}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

