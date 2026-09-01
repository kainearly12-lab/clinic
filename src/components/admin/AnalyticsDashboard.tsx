import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  CheckCircle,
  Clock,
  Sparkles,
  PieChart as PieChartIcon,
  RefreshCw,
  FileDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import gsap from 'gsap';
import { fetchAppointments, computeAnalytics } from '@/services/appointmentService';
import { exportAppointmentsPdfReport } from '@/services/pdfReportService';
import { branches as defaultBranches } from '@/data/clinicData';
import { AppointmentRecord } from '@/types/admin';

interface AnalyticsDashboardProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

const COLORS = ['#00B8A9', '#38BDF8', '#818CF8', '#F59E0B', '#EC4899', '#10B981'];

export const AnalyticsDashboard = React.memo(function AnalyticsDashboard({ onNotify }: AnalyticsDashboardProps) {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [selectedExportBranch, setSelectedExportBranch] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadData迷 = useCallback(async () => {
    try {
      setIsLoading(true);
      const rawAppointments迷 = await fetchAppointments();
      setAppointments(rawAppointments迷);
    } catch (err) {
      console.error('Failed to compute analytics:', err);
      onNotify('error', 'حدث خطأ في معالجة بيانات التحليلات');
    } finally {
      setIsLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    loadData迷();
  }, [loadData迷]);

  // Memoized analytical summary computation to prevent expensive recalculations
  const summary = useMemo(() => {
    if (appointments.length === 0 && !isLoading) {
      return computeAnalytics([]);
    }
    return computeAnalytics(appointments);
  }, [appointments, isLoading]);

  // Export PDF Handler
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const handleExportPdf = useCallback(async () => {
    try {
      setIsExportingPdf(true);
      const branchObj = defaultBranches.find((b) => b.id === selectedExportBranch);
      const branchName = selectedExportBranch === 'all' ? 'جميع الفروع' : (branchObj ? branchObj.nameAr : selectedExportBranch);

      await exportAppointmentsPdfReport({
        branchId: selectedExportBranch,
        branchName,
        appointments,
        dateRangeLabel: 'تقرير التحليلات والإيرادات الشامل',
      });

      onNotify('success', `تم تصدير تقرير PDF بنجاح لـ (${branchName})`);
    } catch (err) {
      console.error('Analytics PDF export error:', err);
      onNotify('error', 'حدث خطأ أثناء تصدير تقرير الـ PDF');
    } finally {
      setIsExportingPdf(false);
    }
  }, [selectedExportBranch, appointments, onNotify]);

  useEffect(() => {
    if (!containerRef.current || !summary || isLoading) return;
    const items = containerRef.current.querySelectorAll('.animate-item');
    if (items.length > 0) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
      );
    }
  }, [summary, isLoading]);

  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin text-[#00B8A9]" />
          <span>جاري تجميع وحساب تحليلات الطلب والإيرادات...</span>
        </div>
      </div>
    );
  }

  const {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalRevenue,
    paidCount,
    unpaidCount,
    collectionRatePercentage,
    highestDemandBranch,
    branchDemandList,
    dailyTrend,
    serviceBreakdown,
  } = summary;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Controls & PDF Export Toolbar */}
      <div className="animate-item flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/15 text-[#00B8A9] border border-teal-500/30">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">التقارير التحليلية والمالية للفروع</h3>
            <p className="text-[11px] text-slate-400">تصدير كشوفات الإيرادات والطلب لكل فرع بصيغة PDF معتمدة</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Select for Export */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2">
            <MapPin className="h-3.5 w-3.5 text-[#00B8A9]" />
            <select
              value={selectedExportBranch}
              onChange={(e) => setSelectedExportBranch(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">تقرير جميع الفروع</option>
              {defaultBranches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.nameAr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 rounded-xl bg-[#00B8A9] px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#00d6c4] hover:shadow-[0_0_15px_rgba(0,184,169,0.4)] cursor-pointer disabled:opacity-50"
          >
            <FileDown className={`h-4 w-4 ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span>{isExportingPdf ? 'جاري تجهيز الـ PDF...' : 'تصدير تقرير PDF'}</span>
          </button>
        </div>
      </div>

      {/* Highest Demand Highlight Banner */}
      {highestDemandBranch && (
        <div className="animate-item relative overflow-hidden rounded-3xl border border-[#00B8A9]/40 bg-gradient-to-r from-slate-900/90 via-teal-950/40 to-slate-900/90 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(0,184,169,0.15)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#00B8A9] to-teal-700 text-slate-950 shadow-lg shadow-[#00B8A9]/25">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#00B8A9]/20 px-2.5 py-0.5 text-[11px] font-black text-[#00B8A9] border border-[#00B8A9]/40">
                    الأعلى طلباً بين الفروع ⭐
                  </span>
                  <span className="text-xs text-slate-400">حسب إحصائيات الحجوزات الفعلية</span>
                </div>
                <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">
                  {highestDemandBranch.branchName}
                </h3>
                <p className="text-xs text-slate-300">
                  يستحوذ الفرع على <strong className="text-[#00B8A9]">{highestDemandBranch.percentage}%</strong> من إجمالي حجوزات المرضى بإجمالي {highestDemandBranch.count} حجز محقق.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:border-r sm:border-white/10 sm:pr-6">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-center min-w-[110px]">
                <span className="text-[10px] text-slate-400">إيرادات الفرع المحصلة</span>
                <p className="font-mono text-base font-black text-emerald-400">
                  {highestDemandBranch.revenue.toLocaleString()} ج.م
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-center min-w-[90px]">
                <span className="text-[10px] text-slate-400">عدد الحجوزات</span>
                <p className="font-mono text-base font-black text-white">
                  {highestDemandBranch.count}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings */}
        <div className="animate-item rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي الحجوزات</span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/15 text-[#00B8A9] border border-teal-500/30">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalBookings}</span>
            <span className="text-xs text-slate-400">مريض</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> {confirmedBookings} مؤكد
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {pendingBookings} معلق
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="animate-item rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي الإيرادات المحصلة</span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              {totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-300">ج.م</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            تم تحصيلها من {paidCount} موعد تم سداده
          </p>
        </div>

        {/* Collection Rate */}
        <div className="animate-item rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">نسبة التحصيل (Paid Rate)</span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{collectionRatePercentage}%</span>
            <span className="text-xs text-slate-400">من إجمالي الحجوزات</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-[#00B8A9]"
              style={{ width: `${collectionRatePercentage}%` }}
            />
          </div>
        </div>

        {/* Unpaid Pending */}
        <div className="animate-item rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">حجوزات غير مسددة</span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{unpaidCount}</span>
            <span className="text-xs text-slate-400">حجز بانتظار الدفع</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            يمكن للمريض السداد بالفرع أو كاش عند الحضور
          </p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Branch Demand Bar Chart */}
        <div className="animate-item rounded-3xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-xl shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#00B8A9]" />
              <h4 className="text-sm font-bold text-white">توزيع الطلب والحجوزات حسب الفروع</h4>
            </div>
            <span className="text-[11px] text-slate-400">مقارنة أعداد المرضى</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchDemandList} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis
                  dataKey="branchName"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3 text-xs shadow-2xl backdrop-blur-md">
                          <p className="font-bold text-white">{data.branchName}</p>
                          <p className="mt-1 text-[#00B8A9]">عدد الحجوزات: {data.count}</p>
                          <p className="text-emerald-400">الإيراد: {data.revenue.toLocaleString()} ج.م</p>
                          <p className="text-slate-400">النسبة: {data.percentage}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#00B8A9"
                  radius={[8, 8, 0, 0]}
                >
                  {branchDemandList.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isHighestDemand ? '#00B8A9' : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Demand & Revenue Trend Area Chart */}
        <div className="animate-item rounded-3xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-xl shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#00B8A9]" />
              <h4 className="text-sm font-bold text-white">منحنى حركة الحجوزات اليومية</h4>
            </div>
            <span className="text-[11px] text-slate-400">توزيع التواريخ</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B8A9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00B8A9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data主管 = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3 text-xs shadow-2xl backdrop-blur-md">
                          <p className="font-bold text-white">التاريخ: {data主管.date}</p>
                          <p className="mt-1 text-[#00B8A9]">الحجوزات: {data主管.bookings}</p>
                          <p className="text-emerald-400">الإيراد: {data主管.revenue.toLocaleString()} ج.م</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#00B8A9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#bookingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Demand Share and Top Services Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Branch Share Donut Chart */}
        <div className="animate-item rounded-3xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-xl shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-[#00B8A9]" />
              <h4 className="text-sm font-bold text-white">الحصة النسبية للفروع</h4>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchDemandList}
                  dataKey="count"
                  nameKey="branchName"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {branchDemandList.map((entry, index) => (
                    <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-white/10 bg-slate-950/90 p-2 text-xs shadow-2xl">
                          <p className="font-bold text-white">{data.branchName}</p>
                          <p className="text-[#00B8A9]">{data.count} حجز ({data.percentage}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-1.5 text-xs">
            {branchDemandList.map((b, i) => (
              <div key={b.branchId} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span>{b.branchName}</span>
                </div>
                <span className="font-mono text-slate-400">{b.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clinical Services Breakdown */}
        <div className="animate-item rounded-3xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-xl shadow-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#00B8A9]" />
              <h4 className="text-sm font-bold text-white">أكثر الخدمات والبروتوكولات طلباً</h4>
            </div>
            <span className="text-[11px] text-slate-400">تفضيلات المرضى</span>
          </div>

          <div className="space-y-3">
            {serviceBreakdown.map((svc, idx) => {
              const pct在前 = totalBookings > 0 ? Math.round((svc.count / totalBookings) * 100) : 0;
              return (
                <div key={svc.name} className="space-y-1 rounded-2xl border border-white/5 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      #{idx + 1} {svc.name}
                    </span>
                    <span className="font-mono text-[#00B8A9] font-semibold">
                      {svc.count} حجز ({pct在前}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-[#00B8A9]"
                      style={{ width: `${pct在前}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
