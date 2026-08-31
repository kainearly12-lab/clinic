import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Clock3,
  Calendar,
  ExternalLink,
  Navigation,
  CheckCircle2,
  MessageCircle,
  Building2,
  Mail,
} from 'lucide-react';
import { branches, clinic } from '@/data/clinicData';
import { BookingButton } from '@/components/BookingModal';

interface BranchHubWithMatrixProps {
  onBookBranch: (branchId: string) => void;
}

interface DaySchedule {
  dayIndex: number; // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  dayNameAr: string;
  dayNameEn: string;
  branchId: string;
  branchNameAr: string;
  hoursAr: string;
  isSpecialDay?: boolean;
}

const weeklyRotationSchedule: DaySchedule[] = [
  {
    dayIndex: 6,
    dayNameAr: 'السبت',
    dayNameEn: 'Saturday',
    branchId: 'fifth-settlement',
    branchNameAr: 'فرع التجمع الخامس',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 0,
    dayNameAr: 'الأحد',
    dayNameEn: 'Sunday',
    branchId: 'nasr-city',
    branchNameAr: 'فرع مدينة نصر',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 1,
    dayNameAr: 'الإثنين',
    dayNameEn: 'Monday',
    branchId: 'maadi',
    branchNameAr: 'فرع المعادي',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 2,
    dayNameAr: 'الثلاثاء',
    dayNameEn: 'Tuesday',
    branchId: 'new-giza',
    branchNameAr: 'فرع نيو جيزة',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 3,
    dayNameAr: 'الأربعاء',
    dayNameEn: 'Wednesday',
    branchId: 'fifth-settlement',
    branchNameAr: 'فرع التجمع الخامس',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 4,
    dayNameAr: 'الخميس',
    dayNameEn: 'Thursday',
    branchId: 'nasr-city',
    branchNameAr: 'فرع مدينة نصر',
    hoursAr: '1:00 ظهراً — 9:00 مساءً',
  },
  {
    dayIndex: 5,
    dayNameAr: 'الجمعة',
    dayNameEn: 'Friday',
    branchId: 'maadi',
    branchNameAr: 'فرع المعادي (استشارات محددة مسبقاً)',
    hoursAr: '2:00 ظهراً — 8:00 مساءً',
    isSpecialDay: true,
  },
];

export function BranchHubWithMatrix({ onBookBranch }: BranchHubWithMatrixProps) {
  // Get current day of week (0-6)
  const currentDayIndex = useMemo(() => new Date().getDay(), []);

  // Today's schedule
  const todaySchedule = useMemo(() => {
    return (
      weeklyRotationSchedule.find((s) => s.dayIndex === currentDayIndex) ||
      weeklyRotationSchedule[0]
    );
  }, [currentDayIndex]);

  // Active selected branch for the detailed card
  const [activeBranchId, setActiveBranchId] = useState<string>(
    todaySchedule.branchId || branches[0].id
  );

  const currentBranch =
    branches.find((b) => b.id === activeBranchId) || branches[0];

  const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(
    `مرحبًا عيادات Androderma، أرغب بالاستفسار عن حجز كشف مع د. أحمد زغلول بفرع (${currentBranch.nameAr})`
  )}`;

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-slate-100/70 dark:bg-[#121419] py-24 sm:py-32 transition-colors duration-300 border-t border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-10 h-96 w-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />

      <div className="container-px relative mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-10 text-center sm:text-right">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-3">
            <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>نظام الفروع الأربعة وتناوب العيادات</span>
          </div>
          <h2 className="text-3xl font-extrabold leading-[1.4] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            فروعنا الأربعة <span className="text-teal-700 dark:text-teal-400">في خدمتك أسبوعياً</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base font-medium leading-relaxed text-slate-600 dark:text-gray-300 max-w-2xl">
            مواعيد منظمة تضمن تواجد د. أحمد زغلول شخصياً لتقديم الاستشارات وإجراء الجلسات في فروع القاهرة والجيزة
          </p>
        </div>

        {/* 1. Live Pulse Presence Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 overflow-hidden rounded-2xl border border-teal-600/30 dark:border-teal-500/40 bg-gradient-to-r from-teal-50 via-white to-emerald-50/80 dark:from-[#131c24] dark:via-[#161f2a] dark:to-[#131d23] p-4 sm:p-5 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600"></span>
              </span>
              <div className="text-right">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black tracking-wide text-teal-900 dark:text-teal-200">
                    🟢 اليوم ({todaySchedule.dayNameAr}): د. أحمد زغلول متواجد حالياً بـ{' '}
                    <span className="underline decoration-teal-500 underline-offset-4 font-black">
                      {todaySchedule.branchNameAr}
                    </span>
                  </span>
                  <span className="rounded-md bg-teal-700 text-white text-[11px] font-bold px-2 py-0.5 shadow-xs">
                    متاح للكشف
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 mt-0.5 flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  مواعيد التواجد اليوم: {todaySchedule.hoursAr}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveBranchId(todaySchedule.branchId);
                onBookBranch(todaySchedule.branchId);
              }}
              className="btn-primary shrink-0 py-2.5 px-5 text-xs font-bold shadow-xs hover:shadow-md"
            >
              احجز كشف اليوم بالفرع
            </button>
          </div>
        </motion.div>

        {/* 2. Weekly Rotation Schedule Matrix */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-700 dark:text-teal-400" />
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                جدول التناوب الأسبوعي للعيادات (Weekly Matrix)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 hidden sm:block">
              اضغط على أي يوم لعرض تفاصيل الفرع والحجز
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
            {weeklyRotationSchedule.map((item) => {
              const isToday = item.dayIndex === currentDayIndex;
              const isBranchActive = activeBranchId === item.branchId;

              return (
                <motion.button
                  key={item.dayNameAr}
                  whileHover={{ y: -3 }}
                  onClick={() => setActiveBranchId(item.branchId)}
                  className={`relative flex flex-col justify-between rounded-2xl p-3.5 sm:p-4 text-right transition-all duration-300 border ${
                    isToday
                      ? 'bg-white dark:bg-[#19222e] border-teal-600 dark:border-teal-500 shadow-md ring-2 ring-teal-500/20'
                      : isBranchActive
                      ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-400/50'
                      : 'bg-white/80 dark:bg-[#161a22]/80 border-slate-200/80 dark:border-gray-800 hover:border-teal-400/40 hover:bg-white dark:hover:bg-[#1a202c]'
                  }`}
                >
                  {/* Today Badge */}
                  {isToday && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 shadow-xs">
                      اليوم
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {item.dayNameAr}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-gray-500">
                        {item.dayNameEn}
                      </span>
                    </div>

                    <h4 className="mt-2 text-xs font-bold text-teal-800 dark:text-teal-300 leading-snug line-clamp-2">
                      {item.branchNameAr}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-gray-800/80 flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-gray-400">
                    <Clock3 className="h-3 w-3 text-teal-600 shrink-0" />
                    <span>{item.hoursAr.split('—')[0]}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 3. Four Branches Interactive Tabs with layoutId="activeBranch" */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-400">
              اختر الفرع لعرض بيانات التواصل والموقع
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 rounded-2xl border border-slate-200/90 dark:border-gray-800 bg-white/90 dark:bg-[#181b22]/90 p-2 shadow-xs sm:gap-3">
            {branches.map((b) => {
              const isActive = b.id === currentBranch.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveBranchId(b.id)}
                  className={`relative flex flex-1 min-w-[130px] items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-xs font-bold transition-colors duration-200 sm:text-sm z-10 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-700 dark:text-gray-300 hover:text-teal-800 dark:hover:text-white'
                  }`}
                >
                  {/* Framer Motion Smooth Sliding Active Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBranch"
                      className="absolute inset-0 rounded-xl bg-teal-700 dark:bg-teal-600 shadow-md"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <MapPin className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-200' : 'text-teal-700 dark:text-teal-400'}`} />
                    <span>{b.nameAr}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Branch Card with Map & Direction Links */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBranch.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="grid items-stretch overflow-hidden rounded-[2.25rem] bg-white dark:bg-[#161920] text-slate-900 dark:text-ivory-50 border border-slate-200/90 dark:border-gray-800/80 shadow-lift transition-all duration-500 lg:grid-cols-[1.05fr_0.95fr]"
          >
            {/* Left Column: Branch Details & Direct Contact */}
            <div className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-12 lg:p-14">
              <div>
                <div className="flex items-center gap-2">
                  <span className="eyebrow text-teal-800 dark:text-teal-300">BRANCH DETAILS</span>
                  <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:text-teal-300">
                    {currentBranch.cityAr}
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-extrabold leading-relaxed sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">
                  {currentBranch.nameAr}
                </h3>

                <div className="mt-8 space-y-5 border-t border-slate-100 dark:border-ivory-50/15 pt-7 text-xs sm:text-sm">
                  {/* Address */}
                  <div className="flex items-start gap-3.5">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
                    <div>
                      <span className="mb-1 block text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-ivory-100/50">
                        العنوان التفصيلي
                      </span>
                      <p className="leading-relaxed text-slate-800 dark:text-ivory-100/90 font-semibold">
                        {currentBranch.addressAr}
                      </p>
                    </div>
                  </div>

                  {/* Clickable Direct Phone(s) */}
                  <div className="flex items-start gap-3.5">
                    <Phone className="mt-1 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
                    <div>
                      <span className="mb-1 block text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-ivory-100/50">
                        أرقام الهاتف المباشرة (اضغط للاتصال الفوري)
                      </span>
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {currentBranch.phones.map((p) => (
                          <a
                            key={p.number}
                            href={`tel:${p.number}`}
                            dir="ltr"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-700/20 bg-teal-50/80 dark:bg-charcoal-800/90 px-3.5 py-1.5 font-bold text-teal-900 dark:text-teal-200 transition hover:border-teal-600 hover:bg-teal-700 hover:text-white"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>{p.display}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-center gap-3.5">
                    <Clock3 className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
                    <div>
                      <span className="mb-0.5 block text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-ivory-100/50">
                        مواعيد العمل بالعيادات
                      </span>
                      <p className="text-slate-700 dark:text-ivory-100/85 font-medium">
                        {clinic.closingNote} (يُرجى الحجز المسبق لتأكيد موعد استشارة د. أحمد زغلول)
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <Mail className="mt-1 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
                    <div>
                      <span className="mb-1 block text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-ivory-100/50">
                        البريد الإلكتروني
                      </span>
                      <a
                        href={`mailto:${clinic.email}`}
                        className="inline-block font-semibold text-teal-800 dark:text-teal-200 transition hover:underline"
                      >
                        {clinic.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-9 flex flex-wrap gap-3 pt-6 border-t border-slate-100 dark:border-ivory-50/15">
                <BookingButton onClick={() => onBookBranch(currentBranch.id)}>
                  احجز كشفك في {currentBranch.nameAr}
                </BookingButton>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  <MessageCircle className="h-4 w-4 text-teal-700" /> واتساب الفرع
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Location Preview & Directions */}
            <div className="relative flex flex-col justify-between overflow-hidden border-t border-slate-200/80 bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 dark:from-charcoal-950 dark:via-[#13161c] dark:to-charcoal-900 p-7 sm:p-10 lg:border-r lg:border-t-0">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
                    <Navigation className="h-4 w-4 animate-pulse text-teal-600" />
                    <span className="text-xs font-bold tracking-wider">الموقع الدقيق على الخريطة</span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> موقع موثّق ومعتمد
                  </span>
                </div>

                {/* Map Info Box */}
                <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-emerald-500/25 bg-white/90 dark:bg-[#14171e]/90 p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-100 dark:bg-teal-900/40 border border-teal-300/50 text-teal-800 dark:text-teal-300 shadow-xs">
                      <MapPin className="h-7 w-7 text-teal-700 dark:text-teal-400" />
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-600"></span>
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{currentBranch.nameAr}</h4>
                      <p className="text-xs text-slate-600 dark:text-ivory-100/70 mt-0.5 line-clamp-2 leading-relaxed font-medium">
                        {currentBranch.addressAr}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-ivory-50/10 pt-4 text-xs">
                    <div className="rounded-xl bg-slate-50 dark:bg-[#161920] p-3 border border-slate-200/70 dark:border-emerald-500/20">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-ivory-100/50 mb-0.5">سهولة الوصول</span>
                      <span className="font-bold text-slate-800 dark:text-ivory-100">موقع مميز ومواقف متاحة</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-[#161920] p-3 border border-slate-200/70 dark:border-emerald-500/20">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-ivory-100/50 mb-0.5">التوجيه المباشر</span>
                      <span className="font-bold text-slate-800 dark:text-ivory-100">GPS دقيق خطوة بخطوة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button for Google Maps */}
              <div className="relative z-10 mt-8 space-y-3">
                <a
                  href={currentBranch.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-700 px-6 py-4 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-teal-800 hover:shadow-teal-700/25 hover:scale-[1.01] active:scale-98"
                >
                  <MapPin className="h-4 w-4 text-teal-100 transition-transform group-hover:scale-110" />
                  <span>افتح على خرائط جوجل (Google Maps)</span>
                  <ExternalLink className="h-4 w-4 text-teal-200 transition-transform group-hover:translate-x-[-3px]" />
                </a>
                <p className="text-center text-[11px] font-medium text-slate-500 dark:text-ivory-100/50">
                  سيتم فتح موقع {currentBranch.nameAr} المباشر في تطبيق خرائط Google لتوجيهك بدقة.
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
