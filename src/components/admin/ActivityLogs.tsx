import React, { useState, useMemo } from 'react';
import {
  Activity,
  History,
  Clock,
  Search,
  RefreshCw,
  CalendarOff,
  Building2,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Cpu,
  Globe,
  Calendar,
  CreditCard,
  LogIn,
  Layers,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  Database,
  Info,
  Copy,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';
import { ActivityLogRecord } from '@/types/admin';
import { getDeviceType } from '@/utils/deviceDetector';
import { cleanOldActivityLogs } from '@/services/adminService';

interface ActivityLogsProps {
  logs: ActivityLogRecord[];
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export const ActivityLogs = React.memo(function ActivityLogs({ logs, onRefresh, isLoading }: ActivityLogsProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 30-Day Retention Cleanup Modal & State
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [cleanupResult, setCleanupResult] = useState<{
    success: boolean;
    deletedCount?: number;
    cutoffDate?: string;
    message?: string;
  } | null>(null);

  // Supabase SQL Guide Modal
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [isCopiedSql, setIsCopiedSql] = useState<boolean>(false);

  // Current client device info
  const currentDevice = useMemo(() => getDeviceType(), []);

  // 30-Day cutoff calculation for preview
  const thirtyDaysCutoffDate = useMemo(() => {
    const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Execute manual retention cleanup
  const handleExecuteCleanup = async () => {
    setIsCleaning(true);
    setCleanupResult(null);

    try {
      const res = await cleanOldActivityLogs();
      if (res.success) {
        setCleanupResult({
          success: true,
          deletedCount: res.deletedCount,
          cutoffDate: res.cutoffDate,
          message:
            res.deletedCount > 0
              ? `تم تنظيف وحذف ${res.deletedCount} سجلاً أقدم من 30 يوماً بنجاح.`
              : 'جميع السجلات الحالية حديثة وتقع ضمن نافذة الـ 30 يوماً المحمية. لا توجد سجلات قديمة للحذف.',
        });
        await onRefresh();
      } else {
        setCleanupResult({
          success: false,
          message: res.error || 'حدث خطأ أثناء تنظيف السجلات القديمة',
        });
      }
    } catch (err) {
      setCleanupResult({
        success: false,
        message: err instanceof Error ? err.message : 'تعذر إتمام عملية التنظيف',
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const copySqlToClipboard = async () => {
    const sqlCode = `-- 1. الدالة المسؤولة عن حذف السجلات الأقدم من 30 يوماً
CREATE OR REPLACE FUNCTION clean_old_activity_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < (NOW() - INTERVAL '30 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION clean_old_activity_logs() TO authenticated, service_role, anon;

-- 2. تفعيل الجدولة التلقائية الأسبوعية عبر pg_cron (كل أحد الساعة 3:00 ص بتوقيت UTC)
SELECT cron.schedule(
  'clean_old_activity_logs_weekly',
  '0 3 * * 0',
  'SELECT clean_old_activity_logs();'
);`;

    try {
      await navigator.clipboard.writeText(sqlCode);
      setIsCopiedSql(true);
      setTimeout(() => setIsCopiedSql(false), 3000);
    } catch {
      // Fallback
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const performer = log.performed_by || log.admin_email || 'مدير النظام';
      const device = log.device_info || 'لابتوب ويندوز';
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        log.description.toLowerCase().includes(term) ||
        performer.toLowerCase().includes(term) ||
        device.toLowerCase().includes(term) ||
        log.action_type.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'bookings') {
        return log.action_type.includes('booking') || log.action_type.includes('appointment');
      }
      if (selectedFilter === 'holidays') {
        return log.action_type.includes('holiday') || log.action_type.includes('exception');
      }
      if (selectedFilter === 'branches') {
        return log.action_type.includes('branch');
      }
      if (selectedFilter === 'settings') {
        return log.action_type.includes('settings') || log.action_type.includes('schedule');
      }
      if (selectedFilter === 'payments') {
        return log.action_type.includes('payment') || log.action_type.includes('price');
      }
      if (selectedFilter === 'auth') {
        return log.action_type.includes('login') || log.action_type.includes('auth');
      }

      return true;
    });
  }, [logs, searchTerm, selectedFilter]);

  const getActionBadge = (actionType: string) => {
    const type = actionType.toLowerCase();

    if (type.includes('holiday') || type.includes('exception')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/15 border border-rose-500/30 text-rose-300">
          <CalendarOff className="w-3 h-3 text-rose-400" />
          عطلة / استثناء
        </span>
      );
    }
    if (type.includes('branch')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 border border-amber-500/30 text-amber-300">
          <Building2 className="w-3 h-3 text-amber-400" />
          فروع ومواقع
        </span>
      );
    }
    if (type.includes('settings')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-teal-500/15 border border-teal-500/30 text-[#00B8A9]">
          <Sliders className="w-3 h-3 text-[#00B8A9]" />
          إعدادات وهوية
        </span>
      );
    }
    if (type.includes('booking') || type.includes('appointment')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-500/15 border border-sky-500/30 text-sky-300">
          <Calendar className="w-3 h-3 text-sky-400" />
          حجز ومواعيد
        </span>
      );
    }
    if (type.includes('payment') || type.includes('price')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
          <CreditCard className="w-3 h-3 text-emerald-400" />
          مدفوعات
        </span>
      );
    }
    if (type.includes('login') || type.includes('auth')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
          <LogIn className="w-3 h-3 text-indigo-400" />
          تسجيل دخول
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-800/80 border border-white/10 text-slate-300">
        <CheckCircle2 className="w-3 h-3 text-[#00B8A9]" />
        مزامنة عامة
      </span>
    );
  };

  const getDeviceVisual = (deviceInfo?: string) => {
    const raw = (deviceInfo || '').toLowerCase();

    if (raw.includes('iphone') || raw.includes('أيفون')) {
      return {
        label: deviceInfo || 'أيفون',
        icon: Smartphone,
        colorClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        iconClass: 'text-emerald-400',
      };
    }
    if (raw.includes('ipad') || raw.includes('آيباد')) {
      return {
        label: deviceInfo || 'آيباد',
        icon: Tablet,
        colorClass: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
        iconClass: 'text-indigo-400',
      };
    }
    if (raw.includes('android') || raw.includes('أندرويد')) {
      return {
        label: deviceInfo || 'هاتف أندرويد',
        icon: Smartphone,
        colorClass: 'bg-lime-500/15 border-lime-500/30 text-lime-300',
        iconClass: 'text-lime-400',
      };
    }
    if (raw.includes('mac') || raw.includes('ماك')) {
      return {
        label: deviceInfo || 'ماك',
        icon: Laptop,
        colorClass: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
        iconClass: 'text-purple-400',
      };
    }
    if (raw.includes('linux') || raw.includes('لينكس')) {
      return {
        label: deviceInfo || 'نظام لينكس',
        icon: Cpu,
        colorClass: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        iconClass: 'text-amber-400',
      };
    }
    if (raw.includes('windows') || raw.includes('ويندوز')) {
      return {
        label: deviceInfo || 'لابتوب ويندوز',
        icon: Laptop,
        colorClass: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
        iconClass: 'text-sky-400',
      };
    }

    return {
      label: deviceInfo || 'متصفح ويب',
      icon: Monitor,
      colorClass: 'bg-slate-800 border-white/10 text-slate-300',
      iconClass: 'text-teal-400',
    };
  };

  // Export CSV of filtered logs
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['نوع العملية', 'تفاصيل النشاط والتعديل', 'المسؤول', 'نوع الجهاز والمصدر', 'التاريخ والتوقيت'];
    const rows = filteredLogs.map((log) => [
      `"${log.action_type.replace(/"/g, '""')}"`,
      `"${log.description.replace(/"/g, '""')}"`,
      `"${(log.performed_by || log.admin_email || 'مدير النظام').replace(/"/g, '""')}"`,
      `"${(log.device_info || 'لابتوب ويندوز').replace(/"/g, '""')}"`,
      `"${log.created_at}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity-audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-[#00B8A9] shadow-[0_0_20px_rgba(0,184,169,0.2)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-white">سجل تدقيق نشاطات الإدارة (Activity Audit Trail)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-[#00B8A9] border border-teal-500/30">
                Audit Trail Live
              </span>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(true)}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition flex items-center gap-1 cursor-pointer"
                title="اضغط لعرض تفاصيل سياسة الاحتفاظ وكود SQL للجدولة التلقائية"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>سياسة الاحتفاظ: 30 يوماً (Auto-Archived)</span>
                <Info className="w-2.5 h-2.5 opacity-70" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              متابعة دقيقة وفورية لجميع عمليات التعديل، الحجوزات، تغيير الفروع، والإعدادات مع التوثيق التلقائي للأجهزة
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Manual 30-Day Cleanup Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setCleanupResult(null);
              setIsCleanupModalOpen(true);
            }}
            className="p-2.5 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="فحص وحذف السجلات التي مر عليها أكثر من 30 يوماً لتوفير المساحة"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-400" />
            <span>تنظيف أقدم من 30 يوماً</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="p-2.5 px-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-[#00B8A9]/50 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            title="تصدير السجل كملف CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00B8A9]" />
            <span className="hidden sm:inline">تصدير CSV</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2.5 px-4 rounded-xl bg-[#00B8A9]/15 border border-[#00B8A9]/40 hover:bg-[#00B8A9]/25 text-xs font-bold text-[#00B8A9] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00B8A9]' : ''}`} />
            <span>تحديث السجل</span>
          </button>
        </div>
      </div>

      {/* Quick Overview Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#00B8A9] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">إجمالي العمليات المسجلة</span>
            <span className="text-base font-black text-white">{logs.length} عملية</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">جهازك الحالي النشط</span>
            <span className="text-sm font-bold text-sky-300 font-mono truncate block">{currentDevice}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">هوية المسؤول المعتمد</span>
            <span className="text-sm font-bold text-white truncate block">مدير النظام</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-emerald-500/20 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">سياسة الاحتفاظ بالبيانات</span>
            <span className="text-xs font-black text-emerald-300 flex items-center gap-1">
              <span>آخر 30 يوماً فقط</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث في تفاصيل العمليات، نوع الجهاز، أو نوع النشاط..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-900/40 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00B8A9] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/40 border border-white/10 overflow-x-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'bookings', label: 'الحجوزات' },
            { id: 'holidays', label: 'العطلات' },
            { id: 'branches', label: 'الفروع' },
            { id: 'settings', label: 'الإعدادات' },
            { id: 'auth', label: 'تسجيل الدخول' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-[#00B8A9] text-slate-950 shadow-[0_0_12px_rgba(0,184,169,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="p-1 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/50 text-slate-400 text-xs font-bold">
                <th className="p-4 whitespace-nowrap">نوع العملية</th>
                <th className="p-4">تفاصيل النشاط والتعديل</th>
                <th className="p-4 whitespace-nowrap">المسؤول</th>
                <th className="p-4 whitespace-nowrap">نوع الجهاز والمصدر</th>
                <th className="p-4 whitespace-nowrap">التوقيت والتاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.created_at);
                  const isValidDate = !isNaN(dateObj.getTime());
                  const formattedTime = isValidDate
                    ? dateObj.toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--';
                  const formattedDate = isValidDate
                    ? dateObj.toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '--';

                  const deviceVisual = getDeviceVisual(log.device_info);
                  const DeviceIcon = deviceVisual.icon;
                  const performerName =
                    log.performed_by && log.performed_by !== 'admin@androderma.com'
                      ? log.performed_by
                      : 'مدير النظام';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Action Badge */}
                      <td className="p-4 whitespace-nowrap">{getActionBadge(log.action_type)}</td>

                      {/* Description */}
                      <td className="p-4 font-medium text-slate-200 leading-relaxed max-w-md">
                        {log.description}
                      </td>

                      {/* Performer */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00B8A9]" />
                          <span className="font-bold text-xs">{performerName}</span>
                        </div>
                      </td>

                      {/* Detected Device Info */}
                      <td className="p-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${deviceVisual.colorClass}`}
                          title={`الجهاز المسجل: ${deviceVisual.label}`}
                        >
                          <DeviceIcon className={`w-3.5 h-3.5 ${deviceVisual.iconClass}`} />
                          <span className="font-semibold text-[11px]">{deviceVisual.label}</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-[#00B8A9]" />
                          <span className="font-mono text-slate-200">{formattedTime}</span>
                          <span className="text-slate-600">—</span>
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-30 text-teal-400" />
                    <p className="text-xs font-semibold">لا توجد عمليات مطابقة لخيارات البحث المحددة</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      جرب تغيير كلمة البحث أو اختيار تبويب تصفية آخر
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 MODAL 1: MANUAL 30-DAY LOGS RETENTION CLEANUP CONFIRMATION */}
      {/* ========================================================================= */}
      {isCleanupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div
            className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/10 shadow-2xl p-6 space-y-5"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">تنظيف السجلات الأقدم من 30 يوماً</h3>
                  <p className="text-xs text-slate-400">تطبيق سياسة الاحتفاظ بالبيانات وإخلاء المساحة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isCleaning) setIsCleanupModalOpen(false);
                }}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body & Safe Retention Guarantee */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-white text-xs">ماذا سيحدث عند تأكيد التنظيف؟</span>
                  <p className="text-[11px] text-amber-200/90 leading-normal">
                    سيتم حذف السجلات والأنشطة المؤرخة قبل تاريخ{' '}
                    <strong className="text-white underline">{thirtyDaysCutoffDate}</strong> (أكثر من 30 يوماً مضت) من جدول{' '}
                    <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300">activity_logs</code> في Supabase.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-white text-xs">ضمان أمان السجلات الحديثة (Zero Regressions)</span>
                  <p className="text-[11px] text-emerald-200/90 leading-normal">
                    جميع السجلات والأنشطة الحديثة المسجلة خلال آخر 30 يوماً محفوظة ومحمية بنسبة 100% ولن يطرأ عليها أي تعديل أو حذف.
                  </p>
                </div>
              </div>

              {cleanupResult && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                    cleanupResult.success
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {cleanupResult.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{cleanupResult.message}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCleanupModalOpen(false)}
                disabled={isCleaning}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition disabled:opacity-50"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={handleExecuteCleanup}
                disabled={isCleaning}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isCleaning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التنظيف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تأكيد التنظيف الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 MODAL 2: SUPABASE SQL & PG_CRON RETENTION POLICY GUIDE */}
      {/* ========================================================================= */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/10 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00B8A9]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">إعداد الجدولة التلقائية في Supabase (30-Day Retention)</h3>
                  <p className="text-xs text-slate-400">كود SQL لتثبيت دالة التنظيف وتفعيل إضافة pg_cron</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              تقوم لوحة التحكم بتنظيف السجلات القديمة تلقائياً في الخلفية عند الفتح. لضبط تشغيل التنظيف التلقائي على مستوى خادم Supabase بشكل أسبوعي دون الحاجة لفتح لوحة التحكم، نفذ الكود التالي في{' '}
              <span className="text-teal-300 font-bold">SQL Editor</span> بـ Supabase Dashboard:
            </p>

            {/* SQL Snippet Box */}
            <div className="relative rounded-2xl bg-slate-950/90 border border-white/10 p-4 font-mono text-[11px] text-teal-200 text-left overflow-x-auto" dir="ltr">
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                {isCopiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">نسخ الكود</span>
                  </>
                )}
              </button>
              <pre className="text-slate-300 whitespace-pre leading-relaxed pr-24">
{`-- 1. الدالة المسؤولة عن حذف السجلات الأقدم من 30 يوماً
CREATE OR REPLACE FUNCTION clean_old_activity_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < (NOW() - INTERVAL '30 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION clean_old_activity_logs() TO authenticated, service_role, anon;

-- 2. تفعيل الجدولة التلقائية الأسبوعية عبر pg_cron (كل أحد الساعة 3:00 ص بتوقيت UTC)
SELECT cron.schedule(
  'clean_old_activity_logs_weekly',
  '0 3 * * 0',
  'SELECT clean_old_activity_logs();'
);`}
              </pre>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200 space-y-1">
              <span className="font-bold block text-white">معلومة مهمة:</span>
              <p className="text-[11px] text-teal-200/90 leading-normal">
                تم حفظ هذا الملف أيضاً في مشروعك باسم <code className="bg-black/30 px-1 py-0.5 rounded text-white">supabase_activity_log_retention.sql</code> ويمكن الرجوع إليه في أي وقت.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#00B8A9] text-slate-950 text-xs font-bold hover:bg-teal-400 transition cursor-pointer"
              >
                فهمت ذلك، إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
