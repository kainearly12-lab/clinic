import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { BranchRecord, ScheduleExceptionRecord } from '@/types/schedule';

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

export function ScheduleManager({
  exceptions,
  branches,
  onSaveException,
  onDeleteException,
}: ScheduleManagerProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Modal / Form state for selected date
  const [isHolidayForm, setIsHolidayForm] = useState<boolean>(true);
  const [holidayTitle, setHolidayTitle] = useState<string>('عطلة رسمية — مغلق');
  const [holidayReason, setHolidayReason] = useState<string>('');
  const [selectedOverrideBranch, setSelectedOverrideBranch] = useState<string>(branches[0]?.id || 'nasr-city');
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
      setHolidayTitle(existing.title_ar || (isHol ? 'عطلة رسمية — مغلق' : 'تبديل فرع'));
      setHolidayReason(existing.reason_ar || '');
      setSelectedOverrideBranch(
        existing.override_branch_id || existing.replacement_branch_id || branches[0]?.id || 'nasr-city'
      );
    } else {
      setIsHolidayForm(true);
      setHolidayTitle('عطلة رسمية — مغلق');
      setHolidayReason('');
      setSelectedOverrideBranch(branches[0]?.id || 'nasr-city');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr) return;

    setIsSaving(true);
    try {
      if (isHolidayForm) {
        await onSaveException({
          exception_date: selectedDateStr,
          exception_type: 'holiday',
          is_holiday: true,
          is_closed: true,
          title_ar: holidayTitle.trim() || 'عطلة رسمية — مغلق',
          reason_ar: holidayReason.trim() || null,
        });
      } else {
        const replacementBranchObj = branches.find((b) => b.id === selectedOverrideBranch);
        await onSaveException({
          exception_date: selectedDateStr,
          exception_type: 'branch_swap',
          is_holiday: false,
          is_closed: false,
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

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-[#00B8A9]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إدارة المواعيد والعطلات وتبديل الفروع</h2>
            <p className="text-xs text-slate-400">انقر على أي يوم بالتقويم لتعيين عطلة شاملة أو تحويل العمل لفرع آخر</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
            aria-label="الشهر السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs font-black text-white min-w-[120px] text-center">
            {ARABIC_MONTHS[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
            aria-label="الشهر التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-xl">
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

              return (
                <button
                  key={day.dateStr}
                  onClick={() => handleSelectDate(day.dateStr)}
                  type="button"
                  className={`min-h-[72px] sm:min-h-[86px] p-2 rounded-xl border text-right transition-all flex flex-col justify-between relative group ${
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
                    <div className="mt-1">
                      {isHoliday ? (
                        <div className="text-[10px] font-bold text-red-300 bg-red-900/60 px-1.5 py-0.5 rounded border border-red-500/30 truncate">
                          ⛔ {exc.title_ar || 'عطلة'}
                        </div>
                      ) : isSwap ? (
                        <div className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-500/30 truncate">
                          🔄 {exc.title_ar || 'تبديل فرع'}
                        </div>
                      ) : null}
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
              <span>عطلة رسمية مغلقة (تعطيل الحجز فوراً)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-900/50 border border-amber-500/50" />
              <span>تبديل فرع مناوب (توجيه الواتساب للبديل)</span>
            </div>
          </div>
        </div>

        {/* Exception Action Sidebar (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-xl sticky top-28">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00B8A9]" />
              <h3 className="text-sm font-black text-white">
                {selectedDateStr ? `تعديل يوم: ${selectedDateStr}` : 'اختر يوماً من التقويم'}
              </h3>
            </div>

            {activeExceptionForSelected && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs flex items-center gap-1"
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
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isHolidayForm
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CalendarOff className="w-3.5 h-3.5" />
                  <span>عطلة كاملة</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsHolidayForm(false);
                    setHolidayTitle(`تبديل للعمل بفرع بديل`);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    !isHolidayForm
                      ? 'bg-[#00B8A9] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تبديل فرع</span>
                </button>
              </div>

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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9] appearance-none"
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
                className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isHolidayForm
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'
                    : 'bg-[#00B8A9] hover:bg-teal-400 text-slate-950 shadow-[#00B8A9]/20'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  'جاري الحفظ والمزامنة...'
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {isHolidayForm ? 'تطبيق العطلة وتعطيل الحجز' : 'تطبيق تبديل الفرع'}
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
  );
}
