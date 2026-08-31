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
} from 'lucide-react';
import { ActivityLogRecord } from '@/types/admin';
import { getDeviceType } from '@/utils/deviceDetector';

interface ActivityLogsProps {
  logs: ActivityLogRecord[];
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export function ActivityLogs({ logs, onRefresh, isLoading }: ActivityLogsProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Current client device info
  const currentDevice = useMemo(() => getDeviceType(), []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-[#00B8A9] shadow-[0_0_20px_rgba(0,184,169,0.2)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">سجل تدقيق نشاطات الإدارة (Activity Audit Trail)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-[#00B8A9] border border-teal-500/30">
                Audit Trail Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              متابعة دقيقة وفورية لجميع عمليات التعديل، الحجوزات، تغيير الفروع، والإعدادات مع التوثيق التلقائي للأجهزة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="p-2.5 px-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-[#00B8A9]/50 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-40"
            title="تصدير السجل كملف CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00B8A9]" />
            <span className="hidden sm:inline">تصدير CSV</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2.5 px-4 rounded-xl bg-[#00B8A9]/15 border border-[#00B8A9]/40 hover:bg-[#00B8A9]/25 text-xs font-bold text-[#00B8A9] hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00B8A9]' : ''}`} />
            <span>تحديث السجل</span>
          </button>
        </div>
      </div>

      {/* Quick Overview Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#00B8A9]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">إجمالي العمليات المسجلة</span>
            <span className="text-base font-black text-white">{logs.length} عملية</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">جهازك الحالي النشط</span>
            <span className="text-sm font-bold text-sky-300 font-mono">{currentDevice}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">هوية المسؤول المعتمد</span>
            <span className="text-sm font-bold text-white">مدير النظام (System Admin)</span>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
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
    </div>
  );
}
