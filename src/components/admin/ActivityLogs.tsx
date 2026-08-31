import React, { useState } from 'react';
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
} from 'lucide-react';
import { ActivityLogRecord } from '@/types/admin';

interface ActivityLogsProps {
  logs: ActivityLogRecord[];
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export function ActivityLogs({ logs, onRefresh, isLoading }: ActivityLogsProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.admin_email && log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'holidays') return matchesSearch && log.action_type.includes('holiday');
    if (selectedFilter === 'branches') return matchesSearch && log.action_type.includes('branch');
    if (selectedFilter === 'settings') return matchesSearch && log.action_type.includes('settings');

    return matchesSearch;
  });

  const getActionBadge = (actionType: string) => {
    if (actionType.includes('holiday')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-950/60 border border-red-500/40 text-red-300">
          <CalendarOff className="w-3 h-3" />
          عطلة / استثناء
        </span>
      );
    }
    if (actionType.includes('branch')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-950/60 border border-amber-500/40 text-amber-300">
          <Building2 className="w-3 h-3" />
          فروع ومواقع
        </span>
      );
    }
    if (actionType.includes('settings')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-teal-950/60 border border-teal-500/40 text-teal-300">
          <Sliders className="w-3 h-3" />
          إعدادات وهوية
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-800 border border-white/10 text-slate-300">
        <CheckCircle2 className="w-3 h-3" />
        مزامنة عامة
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-[#00B8A9]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">سجل تدقيق نشاطات الإدارة (Activity Audit Trail)</h2>
            <p className="text-xs text-slate-400">متابعة حية لجميع عمليات التعديل والإلغاء وتغيير المواعيد والإعدادات</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="p-2.5 px-4 rounded-xl bg-slate-950/60 border border-white/10 hover:border-[#00B8A9]/50 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00B8A9]' : ''}`} />
          <span>تحديث السجل</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث في تفاصيل العمليات والمسؤولين..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-900/40 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00B8A9]"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/40 border border-white/10 overflow-x-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'holidays', label: 'العطلات' },
            { id: 'branches', label: 'الفروع' },
            { id: 'settings', label: 'الإعدادات' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedFilter === f.id
                  ? 'bg-[#00B8A9] text-slate-950 shadow-sm'
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
              <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs font-bold">
                <th className="p-4">نوع العملية</th>
                <th className="p-4">تفاصيل النشاط والتعديل</th>
                <th className="p-4">المسؤول</th>
                <th className="p-4">التوقيت والتاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.created_at);
                  const formattedTime = dateObj.toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const formattedDate = dateObj.toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 whitespace-nowrap">{getActionBadge(log.action_type)}</td>
                      <td className="p-4 font-medium text-slate-200">{log.description}</td>
                      <td className="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.admin_email || 'admin@androderma.com'}
                      </td>
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Clock className="w-3 h-3 text-[#00B8A9]" />
                          <span>{formattedTime}</span>
                          <span className="text-slate-600">—</span>
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-30 text-teal-400" />
                    <p className="text-xs">لا توجد عمليات مطابقة لخيارات البحث المحددة</p>
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
