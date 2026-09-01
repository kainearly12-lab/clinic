import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  CalendarOff,
  RefreshCw,
  Trash2,
  Check,
  Building2,
  Clock,
  Layers,
  Zap,
  MapPin,
  Sparkles,
  AlertCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  BranchRecord,
  ScheduleExceptionRecord,
  DailyBranchOverrideRecord,
  WeeklyScheduleRecord,
  WeeklyScheduleItem,
} from '@/types/schedule';
import {
  fetchDailyBranchOverrides,
  saveDailyBranchOverride,
  deleteDailyBranchOverride,
  getIsoDateString,
  fetchWeeklyScheduleWithBranches,
  updateWeeklyScheduleDay,
  saveFullWeeklySchedule,
  formatTimeRange12h,
} from '@/services/scheduleService';

interface ScheduleManagerProps {
  exceptions: ScheduleExceptionRecord[];
  branches: BranchRecord[];
  onSaveException: (payload: Partial<ScheduleExceptionRecord> & { exception_date: string }) => Promise<void>;
  onDeleteException: (idOrDate: string) => Promise<void>;
  isLoading?: boolean;
}

const ARABIC_DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const REASON_CHIPS = [
  'حضور مؤتمر طبي علمي خارج القاهرة',
  'إجازة سنوية / سفر خاص',
  'إجازة طارئة — ظرف طبي خاص',
  'يوم مخصص للعمليات الجراحية والتدريب',
  'عطلة رسمية عامة — العيادة مغلقة',
];

export const ScheduleManager = React.memo(function ScheduleManager({
  exceptions,
  branches,
  onSaveException,
  onDeleteException,
}: ScheduleManagerProps) {
  // Navigation between sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'weekly' | 'exceptions'>('weekly');

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Weekly Matrix State
  const [weeklyItems, setWeeklyItems] = useState<WeeklyScheduleItem[]>([]);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState<boolean>(true);
  const [isSavingWeekly, setIsSavingWeekly] = useState<boolean>(false);
  const [weeklyFeedback, setWeeklyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Daily Branch Overrides State
  const [dailyOverrides, setDailyOverrides] = useState<DailyBranchOverrideRecord[]>([]);
  const [overrideDate, setOverrideDate] = useState<string>(() => getIsoDateString(new Date()));
  const [overrideBranchId, setOverrideBranchId] = useState<string>(branches[0]?.id || 'nasr-city');
  const [overrideReason, setOverrideReason] = useState<string>('تبديل استثنائي لموقع العيادة اليومي');
  const [isSavingDailyOverride, setIsSavingDailyOverride] = useState<boolean>(false);
  const [overrideFeedback, setOverrideFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal / Form state for calendar selected date
  const [isHolidayForm, setIsHolidayForm] = useState<boolean>(true);
  const [holidayTitle, setHolidayTitle] = useState<string>('عطلة رسمية — مغلق');
  const [holidayReason, setHolidayReason] = useState<string>('');
  const [targetHolidayBranch, setTargetHolidayBranch] = useState<string>('all');
  const [selectedOverrideBranch, setSelectedOverrideBranch] = useState<string>(branches[0]?.id || 'nasr-city');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load Weekly Schedule
  const loadWeeklyData = useCallback(async () => {
    setIsLoadingWeekly(true);
    try {
      const res = await fetchWeeklyScheduleWithBranches();
      setWeeklyItems(res.data);
    } catch (err) {
      console.warn('Failed to load weekly schedule:', err);
    } finally {
      setIsLoadingWeekly(false);
    }
  }, []);

  // Load Daily Overrides
  const loadDailyOverrides = useCallback(async () => {
    try {
      const data = await fetchDailyBranchOverrides();
      setDailyOverrides(data);
    } catch (err) {
      console.warn('Failed to load daily overrides:', err);
    }
  }, []);

  useEffect(() => {
    loadWeeklyData();
    loadDailyOverrides();
  }, [loadWeeklyData, loadDailyOverrides]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: dateStr === todayStr });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true, isToday: dateStr === todayStr });
    }

    // Next month padding to complete 35 or 42 grid slots
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: dateStr === todayStr });
    }

    return days;
  }, [year, month]);

  // Exception map for fast O(1) lookup
  const exceptionsMap = useMemo(() => {
    const map = new Map<string, ScheduleExceptionRecord>();
    exceptions.forEach((exc) => {
      map.set(exc.exception_date, exc);
    });
    return map;
  }, [exceptions]);

  const activeExceptionForSelected = selectedDateStr ? exceptionsMap.get(selectedDateStr) : null;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const existing = exceptionsMap.get(dateStr);
    if (existing) {
      const isHol = existing.is_holiday || existing.exception_type === 'holiday';
      setIsHolidayForm(Boolean(isHol));
      setHolidayTitle(existing.title_ar || existing.reason_ar || (isHol ? 'عطلة رسمية — مغلق' : 'تبديل فرع'));
      setHolidayReason(existing.reason_ar || existing.reason || '');
      setTargetHolidayBranch(existing.branch_id || existing.replacement_branch_id || 'all');
      setSelectedOverrideBranch(
        existing.override_branch_id || existing.replacement_branch_id || branches[0]?.id || 'nasr-city'
      );
    } else {
      setIsHolidayForm(true);
      setHolidayTitle('عطلة رسمية — مغلق');
      setHolidayReason('');
      setTargetHolidayBranch('all');
      setSelectedOverrideBranch(branches[0]?.id || 'nasr-city');
    }
  };

  // Handler: Update field in a weekly item
  const handleWeeklyItemChange = (
    dayIndex: number,
    field: 'branch_id' | 'isClosed' | 'openTime' | 'closeTime' | 'reason' | 'reasonAr',
    value: string | boolean | null
  ) => {
    setWeeklyItems((prev) =>
      prev.map((item) => {
        if (item.dayIndex !== dayIndex) return item;

        if (field === 'branch_id') {
          const strVal = String(value || '');
          const selectedBranch = branches.find((b) => b.id === strVal);
          return {
            ...item,
            branch_id: strVal,
            branch: {
              id: strVal,
              nameAr: selectedBranch?.name_ar || selectedBranch?.nameAr || strVal,
              nameEn: selectedBranch?.nameEn || strVal,
              cityAr: selectedBranch?.city_ar || selectedBranch?.cityAr || 'القاهرة',
            },
          };
        }

        if (field === 'isClosed') {
          const isClosedVal = Boolean(value);
          return {
            ...item,
            isClosed: isClosedVal,
            isHoliday: isClosedVal,
            is_working_day: !isClosedVal,
            reason: isClosedVal ? item.reason || 'إجازة أسبوعية' : null,
            reasonAr: isClosedVal ? item.reasonAr || 'إجازة أسبوعية' : null,
          };
        }

        if (field === 'openTime' || field === 'closeTime') {
          const strVal = String(value || '');
          const open = field === 'openTime' ? strVal : item.openTime;
          const close = field === 'closeTime' ? strVal : item.closeTime;
          const formatted = formatTimeRange12h(open, close);
          return {
            ...item,
            [field]: strVal,
            hoursAr: formatted,
          };
        }

        const strVal = typeof value === 'string' ? value : null;
        return {
          ...item,
          [field]: strVal,
          ...(field === 'reason' || field === 'reasonAr' ? { reason: strVal, reasonAr: strVal, reason_ar: strVal } : {}),
        };
      })
    );
  };

  // Save full weekly schedule
  const handleSaveAllWeekly = async () => {
    setIsSavingWeekly(true);
    setWeeklyFeedback(null);
    try {
      const recordsToSave: Partial<WeeklyScheduleRecord>[] = weeklyItems.map((item) => ({
        day_of_week: item.dayIndex,
        day_name_ar: item.dayNameAr,
        branch_id: item.branch.id,
        open_time: item.openTime,
        close_time: item.closeTime,
        is_working_day: !item.isClosed,
        is_closed: Boolean(item.isClosed),
        is_holiday: Boolean(item.isHoliday || item.isClosed),
        reason: item.reasonAr || item.reason || null,
        reason_ar: item.reasonAr || item.reason || null,
      }));

      const res = await saveFullWeeklySchedule(recordsToSave);
      if (res.success) {
        setWeeklyFeedback({
          type: 'success',
          message: 'تم حفظ جدول التناوب الأسبوعي بنجاح وتحديثه في قاعدة البيانات والواجهة العامة.',
        });
        await loadWeeklyData();
      } else {
        setWeeklyFeedback({
          type: 'error',
          message: res.error || 'حدث خطأ أثناء حفظ الجدول الأسبوعي',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setWeeklyFeedback({ type: 'error', message: msg });
    } finally {
      setIsSavingWeekly(false);
      setTimeout(() => setWeeklyFeedback(null), 5000);
    }
  };

  // Save single weekly day item
  const handleSaveSingleDay = async (dayIndex: number) => {
    const item = weeklyItems.find((i) => i.dayIndex === dayIndex);
    if (!item) return;

    setIsSavingWeekly(true);
    setWeeklyFeedback(null);
    try {
      const res = await updateWeeklyScheduleDay(dayIndex, {
        branch_id: item.branch.id,
        open_time: item.openTime,
        close_time: item.closeTime,
        is_working_day: !item.isClosed,
        is_closed: Boolean(item.isClosed),
        is_holiday: Boolean(item.isHoliday || item.isClosed),
        reason: item.reasonAr || item.reason || null,
        reason_ar: item.reasonAr || item.reason || null,
      });

      if (res.success) {
        setWeeklyFeedback({
          type: 'success',
          message: `تم تحديث مواعيد يوم (${item.dayNameAr}) بنجاح بـ ${item.branch.nameAr}.`,
        });
        await loadWeeklyData();
      } else {
        setWeeklyFeedback({
          type: 'error',
          message: res.error || 'حدث خطأ أثناء تحديث مواعيد اليوم',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setWeeklyFeedback({ type: 'error', message: msg });
    } finally {
      setIsSavingWeekly(false);
      setTimeout(() => setWeeklyFeedback(null), 5000);
    }
  };

  // Submit Daily Branch Override Quick Widget
  const handleSaveDailyOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate || !overrideBranchId) return;

    setIsSavingDailyOverride(true);
    setOverrideFeedback(null);

    try {
      const res = await saveDailyBranchOverride({
        override_date: overrideDate,
        branch_id: overrideBranchId,
        reason: overrideReason.trim() || 'تبديل استثنائي لموقع العيادة اليومي',
      });

      if (res.success) {
        setOverrideFeedback({
          type: 'success',
          message: `تم تفعيل تبديل الفرع بنجاح لتاريخ ${overrideDate}. سيظهر التغيير فوراً في البانر العام ونموذج الحجز.`,
        });
        await loadDailyOverrides();
        await onSaveException({
          exception_date: overrideDate,
          exception_type: 'branch_swap',
          is_holiday: false,
          is_closed: false,
          branch_id: overrideBranchId,
          replacement_branch_id: overrideBranchId,
          title_ar: `تبديل للعمل بـ ${getBranchName(overrideBranchId)}`,
          reason_ar: overrideReason.trim() || 'تبديل موقع العيادة اليومي',
        });
      } else {
        setOverrideFeedback({
          type: 'error',
          message: res.error || 'حدث خطأ أثناء حفظ التبديل اليومي',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOverrideFeedback({ type: 'error', message: msg });
    } finally {
      setIsSavingDailyOverride(false);
      setTimeout(() => setOverrideFeedback(null), 5000);
    }
  };

  // Delete Daily Branch Override
  const handleDeleteDailyOverride = async (dateOrId: string) => {
    try {
      await deleteDailyBranchOverride(dateOrId);
      await loadDailyOverrides();
      await onDeleteException(dateOrId);
      setOverrideFeedback({
        type: 'success',
        message: 'تم إلغاء التبديل اليومي والعودة إلى التوزيع الأسبوعي الطبيعي.',
      });
      setTimeout(() => setOverrideFeedback(null), 4000);
    } catch (err) {
      console.error('Delete daily override error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr) return;

    setIsSaving(true);
    try {
      if (isHolidayForm) {
        const targetBranchObj = branches.find((b) => b.id === targetHolidayBranch);
        const branchSpecificTitle = targetHolidayBranch !== 'all' && targetBranchObj
          ? `${holidayTitle.trim() || 'عطلة'} (${targetBranchObj.name_ar || targetBranchObj.nameAr || targetBranchObj.id})`
          : holidayTitle.trim() || 'عطلة رسمية — مغلق';

        await onSaveException({
          exception_date: selectedDateStr,
          exception_type: 'holiday',
          is_holiday: true,
          is_closed: true,
          branch_id: targetHolidayBranch === 'all' ? null : targetHolidayBranch,
          replacement_branch_id: targetHolidayBranch === 'all' ? null : targetHolidayBranch,
          title_ar: branchSpecificTitle,
          reason_ar: holidayReason.trim() || branchSpecificTitle,
        });
      } else {
        const replacementBranchObj = branches.find((b) => b.id === selectedOverrideBranch);
        await onSaveException({
          exception_date: selectedDateStr,
          exception_type: 'branch_swap',
          is_holiday: false,
          is_closed: false,
          branch_id: selectedOverrideBranch,
          override_branch_id: selectedOverrideBranch,
          replacement_branch_id: selectedOverrideBranch,
          title_ar: `تبديل للعمل بـ ${replacementBranchObj?.name_ar || replacementBranchObj?.nameAr || 'الفرع البديل'}`,
          reason_ar: holidayReason.trim() || null,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDateStr) return;
    setIsSaving(true);
    try {
      await onDeleteException(selectedDateStr);
    } finally {
      setIsSaving(false);
    }
  };

  const getBranchName = (bId?: string | null) => {
    if (!bId || bId === 'all') return 'جميع الفروع';
    const match = branches.find((b) => b.id === bId);
    return match ? (match.name_ar || match.nameAr || bId) : bId;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Module Header Bar with Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-[#00B8A9]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إدارة المواعيد وتناوب العيادات والإجازات</h2>
            <p className="text-xs text-slate-400">
              تحكم بجدول التناوب الأسبوعي الثابت، تبديل الفروع الفوري، وإجازات د. أحمد زغلول
            </p>
          </div>
        </div>

        {/* Sub-Tabs: Weekly Matrix vs Calendar Exceptions */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-white/10">
          <button
            onClick={() => setActiveSubTab('weekly')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'weekly'
                ? 'bg-[#00B8A9] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>جدول التناوب الأسبوعي (Weekly Matrix)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('exceptions')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'exceptions'
                ? 'bg-[#00B8A9] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarOff className="w-3.5 h-3.5" />
            <span>التبديلات اليومية والتقويم</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 SUB-TAB 1: DYNAMIC WEEKLY ROTATION SCHEDULE EDITOR (Request 2 Feature) */}
      {/* ========================================================================= */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-6">
          {/* Status Feedback Banner */}
          {weeklyFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                weeklyFeedback.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/60 border border-red-500/40 text-red-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{weeklyFeedback.message}</span>
            </div>
          )}

          {/* Quick Header with Save All CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900/80 to-slate-900/90 border border-teal-500/30 backdrop-blur-xl">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00B8A9]" />
                <span>تعديل جدول التناوب الأسبوعي الرسمي (د. أحمد زغلول)</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                  نظام 12 ساعة م/مساءً
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                يمكنك إعادة تعيين الفرع المناوب لكل يوم، تعيين أيام إجازة مع ذكر السبب، وتحديد مواعيد العمل
              </p>
            </div>

            <button
              onClick={handleSaveAllWeekly}
              disabled={isSavingWeekly}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#00B8A9] text-slate-950 text-xs font-black hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(0,184,169,0.3)] cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              {isSavingWeekly ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ الجدول في Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ جدول الأسبوع بالكامل</span>
                </>
              )}
            </button>
          </div>

          {/* Weekly Days Grid Cards */}
          {isLoadingWeekly ? (
            <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-900/40 rounded-2xl border border-white/10">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#00B8A9]" />
              <p className="text-xs font-bold">جاري تحميل جدول التناوب الأسبوعي من قاعدة البيانات...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weeklyItems.map((item) => {
                const isClosed = Boolean(item.isClosed || item.isHoliday);

                return (
                  <div
                    key={item.dayIndex}
                    className={`p-5 rounded-2xl border transition-all space-y-4 relative ${
                      isClosed
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                        : 'bg-slate-900/50 border-white/10 hover:border-teal-500/40 shadow-md'
                    }`}
                  >
                    {/* Day Title & Status Toggle */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-sm font-black text-white block">{item.dayNameAr}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{item.dayNameEn}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleWeeklyItemChange(item.dayIndex, 'isClosed', !isClosed)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isClosed
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                            : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {isClosed ? (
                          <>
                            <CalendarOff className="w-3 h-3" />
                            <span>إجازة / غير متاح</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" />
                            <span>يوم عمل نشط</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Branch Assignment Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#00B8A9]" />
                        <span>الفرع المناوب في هذا اليوم:</span>
                      </label>
                      <select
                        value={item.branch.id}
                        onChange={(e) => handleWeeklyItemChange(item.dayIndex, 'branch_id', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9] cursor-pointer"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                            {b.name_ar || b.nameAr || b.id} ({b.city_ar || b.cityAr || 'القاهرة'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Hours Inputs with Live 12h Preview */}
                    {!isClosed ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">من (فتح)</label>
                            <input
                              type="time"
                              value={item.openTime || '13:00'}
                              onChange={(e) => handleWeeklyItemChange(item.dayIndex, 'openTime', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-[#00B8A9]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">إلى (إغلاق)</label>
                            <input
                              type="time"
                              value={item.closeTime || '21:00'}
                              onChange={(e) => handleWeeklyItemChange(item.dayIndex, 'closeTime', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-[#00B8A9]"
                            />
                          </div>
                        </div>

                        {/* 12h Live Preview Tag */}
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">العرض للجمهور:</span>
                          <span className="font-bold text-teal-300 font-mono">
                            {formatTimeRange12h(item.openTime, item.closeTime)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Vacation Reason Customizer & Reason Chips */
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>سبب الإجازة / عدم التواجد (يظهر للجمهور):</span>
                        </label>
                        <input
                          type="text"
                          value={item.reasonAr || item.reason || ''}
                          onChange={(e) => handleWeeklyItemChange(item.dayIndex, 'reasonAr', e.target.value)}
                          placeholder="مثال: حضور مؤتمر طبي خارج القاهرة"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-amber-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                        />

                        {/* Reason Preset Quick Chips */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {REASON_CHIPS.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handleWeeklyItemChange(item.dayIndex, 'reasonAr', chip)}
                              className="text-[9px] px-2 py-0.5 rounded-md bg-amber-950/80 hover:bg-amber-900 border border-amber-500/30 text-amber-200 transition-all cursor-pointer"
                            >
                              {chip.split('—')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Individual Day Quick Save Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveSingleDay(item.dayIndex)}
                        disabled={isSavingWeekly}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 text-teal-400" />
                        <span>حفظ تعديل {item.dayNameAr}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 SUB-TAB 2: DAILY OVERRIDES & CALENDAR EXCEPTIONS */}
      {/* ========================================================================= */}
      {activeSubTab === 'exceptions' && (
        <div className="space-y-6">
          {/* Daily Branch Override Control Panel */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900/80 to-slate-900/90 border border-teal-500/30 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    لوحة التبديل السريع لموقع العيادة اليومي (Daily Branch Override)
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                      تأثير فوري ومباشر
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    غيّر موقع تواجد د. أحمد زغلول ليوم محدد في حالات الطوارئ مع تحديث فوري لشريط الموقع ونموذج الحجز
                  </p>
                </div>
              </div>
            </div>

            {overrideFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  overrideFeedback.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/60 border border-red-500/40 text-red-200'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{overrideFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveDailyOverrideSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              {/* Override Date & Quick Chips */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>تاريخ التبديل</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOverrideDate(getIsoDateString(new Date()))}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      اليوم
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        setOverrideDate(getIsoDateString(d));
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      غداً
                    </button>
                  </div>
                </label>
                <input
                  type="date"
                  required
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                />
              </div>

              {/* New Target Branch */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">الفرع البديل المراد النقل إليه</label>
                <select
                  value={overrideBranchId}
                  onChange={(e) => setOverrideBranchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      {b.name_ar || b.nameAr || b.id} ({b.city_ar || b.cityAr || 'القاهرة'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason / Notes */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">سبب التبديل أو الملاحظة</label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="مثال: نقل عيادة اليوم بسبب طوارئ التجمع"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00B8A9]"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-12 flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSavingDailyOverride}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B8A9] text-slate-950 text-xs font-black hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(0,184,169,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isSavingDailyOverride ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ التبديل ومزامنة الموقع...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>تفعيل تبديل الفرع لهذا اليوم (حفظ مباشر)</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Active Overrides Quick List */}
            {dailyOverrides.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <div className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>التبديلات والاستثناءات اليومية النشطة المسجلة ({dailyOverrides.length}):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {dailyOverrides.map((ov) => {
                    const bName = getBranchName(ov.branch_id);
                    return (
                      <div
                        key={ov.id || ov.override_date}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-teal-500/30 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-white flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#00B8A9]" />
                            <span className="truncate">{bName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {ov.override_date} — <span className="text-amber-300">{ov.reason || 'تبديل معتمد'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteDailyOverride(ov.override_date || ov.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition cursor-pointer"
                          title="إلغاء هذا التبديل والعودة للجدول الطبيعي"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Calendar Grid + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Calendar Grid (8 cols) */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-xl">
              {/* Calendar Month Navigation */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#00B8A9]" />
                  <span>التقويم الشهري للعطلات والاستثناءات</span>
                </span>

                <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    aria-label="الشهر السابق"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-xs font-black text-white min-w-[120px] text-center">
                    {ARABIC_MONTHS[month]} {year}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    aria-label="الشهر التالي"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekday Header */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {ARABIC_DAYS.map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`py-2 text-center text-xs font-bold ${
                      idx === 5 ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Calendar Slots */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const exc = exceptionsMap.get(day.dateStr);
                  const isSelected = selectedDateStr === day.dateStr;
                  const isHoliday = exc && (exc.is_holiday || exc.exception_type === 'holiday');
                  const isSwap = exc && !isHoliday && (exc.override_branch_id || exc.replacement_branch_id);
                  const branchLabel = exc?.branch_id || exc?.replacement_branch_id ? getBranchName(exc.branch_id || exc.replacement_branch_id) : 'كل الفروع';

                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => handleSelectDate(day.dateStr)}
                      type="button"
                      className={`min-h-[72px] sm:min-h-[86px] p-2 rounded-xl border text-right transition-all flex flex-col justify-between relative group cursor-pointer ${
                        isSelected
                          ? 'border-[#00B8A9] bg-[#00B8A9]/10 shadow-[0_0_15px_rgba(0,184,169,0.3)] ring-1 ring-[#00B8A9]'
                          : isHoliday
                          ? 'border-red-500/40 bg-red-950/20 hover:border-red-500/80'
                          : isSwap
                          ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/80'
                          : day.isCurrentMonth
                          ? 'border-white/5 bg-slate-950/40 hover:border-white/20 hover:bg-slate-900/60 text-slate-200'
                          : 'border-transparent bg-slate-950/20 text-slate-600 opacity-40 hover:opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-bold ${
                            day.isToday
                              ? 'w-6 h-6 rounded-full bg-[#00B8A9] text-slate-950 flex items-center justify-center font-black'
                              : isSelected
                              ? 'text-[#00B8A9]'
                              : isHoliday
                              ? 'text-red-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {day.dayNum}
                        </span>

                        {isHoliday && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="عطلة مغلقة" />
                        )}
                        {isSwap && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" title="تبديل فرع" />
                        )}
                      </div>

                      {/* Exception Badge Label in cell */}
                      {exc && (
                        <div className="mt-1 space-y-0.5">
                          {isHoliday ? (
                            <div className="text-[10px] font-bold text-red-300 bg-red-900/60 px-1.5 py-0.5 rounded border border-red-500/30 truncate">
                              ⛔ {exc.title_ar || exc.reason || 'عطلة'}
                            </div>
                          ) : isSwap ? (
                            <div className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-500/30 truncate">
                              🔄 {exc.title_ar || 'تبديل فرع'}
                            </div>
                          ) : null}
                          <div className="text-[9px] text-slate-400 truncate flex items-center gap-1 font-mono">
                            <Building2 className="w-2.5 h-2.5 inline" />
                            <span>{branchLabel}</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-white/5 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#00B8A9]/20 border border-[#00B8A9]" />
                  <span>اليوم المحدد</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-red-900/50 border border-red-500/50" />
                  <span>عطلة رسمية (فرع محدد أو شامل)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-900/50 border border-amber-500/50" />
                  <span>تبديل فرع مناوب للعمل</span>
                </div>
              </div>
            </div>

            {/* Exception Action Sidebar (4 cols) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-xl sticky top-28">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00B8A9]" />
                  <h3 className="text-sm font-black text-white">
                    {selectedDateStr ? `تعديل استثناء: ${selectedDateStr}` : 'اختر يوماً من التقويم'}
                  </h3>
                </div>

                {activeExceptionForSelected && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs flex items-center gap-1 cursor-pointer"
                    title="إلغاء الاستثناء والعودة للمواعيد المعتادة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إلغاء</span>
                  </button>
                )}
              </div>

              {selectedDateStr ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type Switcher */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/60 border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsHolidayForm(true);
                        setHolidayTitle('عطلة رسمية — مغلق');
                      }}
                      className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isHolidayForm
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <CalendarOff className="w-3.5 h-3.5" />
                      <span>عطلة / إغلاق</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsHolidayForm(false);
                        setHolidayTitle(`تبديل للعمل بفرع بديل`);
                      }}
                      className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        !isHolidayForm
                          ? 'bg-[#00B8A9] text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>تبديل فرع</span>
                    </button>
                  </div>

                  {/* Target Branch Selector for Holiday (All branches vs Specific Branch) */}
                  {isHolidayForm && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#00B8A9]" />
                        <span>نطاق تطبيق العطلة (Target Branch / Scope)</span>
                      </label>
                      <div className="relative">
                        <select
                          value={targetHolidayBranch}
                          onChange={(e) => setTargetHolidayBranch(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9] appearance-none cursor-pointer"
                        >
                          <option value="all" className="bg-slate-900 text-teal-400 font-bold">
                            🌟 جميع الفروع بالكامل (تعطيل العيادة شاملاً)
                          </option>
                          {branches.map((b) => (
                            <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                              🏢 {b.name_ar || b.nameAr || b.id} ({b.city_ar || b.cityAr || 'القاهرة'})
                            </option>
                          ))}
                        </select>
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {targetHolidayBranch === 'all'
                          ? 'سيتم إيقاف المواعيد في كافة فروع العيادة في هذا اليوم.'
                          : `سيتم إيقاف الحجز في ${getBranchName(targetHolidayBranch)} فقط مع استمرار باقي الفروع.`}
                      </p>
                    </div>
                  )}

                  {/* Title Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {isHolidayForm ? 'اسم العطلة أو المناسبة' : 'عنوان التبديل'}
                    </label>
                    <input
                      type="text"
                      value={holidayTitle}
                      onChange={(e) => setHolidayTitle(e.target.value)}
                      placeholder={isHolidayForm ? 'مثال: عطلة عيد الفطر المبارك' : 'مثال: تبديل مواعيد كشف المعادي'}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#00B8A9]"
                    />
                  </div>

                  {/* Branch Selector for Swap */}
                  {!isHolidayForm && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        الفرع البديل المناوب في هذا اليوم
                      </label>
                      <div className="relative">
                        <select
                          value={selectedOverrideBranch}
                          onChange={(e) => setSelectedOverrideBranch(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9] appearance-none cursor-pointer"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                              {b.name_ar || b.nameAr} ({b.city_ar || b.cityAr})
                            </option>
                          ))}
                        </select>
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                      <p className="text-[11px] text-amber-300/80 mt-1.5">
                        * سيتم تحويل كشوفات وواتساب هذا التاريخ تلقائياً إلى الفرع المختار.
                      </p>
                    </div>
                  )}

                  {/* Optional Reason */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      ملاحظات أو تفاصيل إضافية (اختياري)
                    </label>
                    <textarea
                      value={holidayReason}
                      onChange={(e) => setHolidayReason(e.target.value)}
                      rows={2}
                      placeholder="ملاحظات تظهر للإدارة وسجل العمليات..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#00B8A9] resize-none"
                    />
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                      isHolidayForm
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'
                        : 'bg-[#00B8A9] hover:bg-teal-400 text-slate-950 shadow-[#00B8A9]/20'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? (
                      'جاري الحفظ والمزامنة مع Supabase...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>
                          {isHolidayForm ? 'تطبيق العطلة وحفظ الاستثناء' : 'تطبيق تبديل الفرع'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <CalendarOff className="w-8 h-8 mx-auto opacity-40 text-teal-400" />
                  <p className="text-xs">اضغط على أي تاريخ في التقويم لعرض حالته وإضافة استثناء جديد</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
