import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Stethoscope,
  Info,
  ArrowRight,
} from 'lucide-react';
import { clinic } from '@/data/clinicData';

interface SkinDiagnosticQuizProps {
  onBook: (serviceName: string) => void;
  onBackToHome?: () => void;
}

interface ConcernOption {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  categoryTag: string;
  recommendation: {
    serviceName: string;
    description: string;
    protocol: string;
    sessions: string;
    estimatedPrice: string;
  };
}

const concernOptions: ConcernOption[] = [
  {
    id: 'acne',
    title: 'حب الشباب والبثور النشطة',
    subtitle: 'التهابات متكررة، رؤوس بيضاء وسوداء وتورم',
    emoji: '🔴',
    categoryTag: 'علاج سريري متخصص',
    recommendation: {
      serviceName: 'بروتوكول علاج حب الشباب وتنقية المسام الطبي',
      description:
        'فحص دقيق لتحديد سبب النشاط البكتيري والإفراز الدهني، ووضع خطة علاجية مخصصة تجمع بين العلاج الطبي الموضعي والجلسات السريرية لتطهير البشرة ومنع تكرار البثور.',
      protocol: 'تنظيف طبي عميق + تقشير خفيف مضاد للبكتيريا + روتين علاجي منزلي موجه',
      sessions: 'من 3 إلى 6 جلسات حسب استجابة البشرة',
      estimatedPrice: 'كشف استشاري 650 ج.م • جلسات العلاج تبدأ من 900 ج.م',
    },
  },
  {
    id: 'pigmentation',
    title: 'التصبغات والكلف وآثار الشمس',
    subtitle: 'بقع داكنة، كلف هرموني وعدم توحد لون البشرة',
    emoji: '✨',
    categoryTag: 'تفتيح وتقشير سريري',
    recommendation: {
      serviceName: 'جلسات التقشير الكيميائي الطبي وعلاج التصبغات',
      description:
        'تشخيص عمق التصبغات في طبقات الجلد تحت إشراف د. أحمد زغلول، واستخدام مقشرات طبية متطورة لتفتيح البقع الداكنة وتوحيد لون البشرة بأمان تام.',
      protocol: 'جلسات تقشير كيميائي مخصص (بارد أو أحماض فواكه) + ميزوثيرابي تفتيح مكثف',
      sessions: 'من 3 إلى 5 جلسات (بفاصل 3 أسابيع)',
      estimatedPrice: 'كشف استشاري 650 ج.م • الجلسات من 1,200 إلى 2,200 ج.م',
    },
  },
  {
    id: 'scars',
    title: 'آثار الحبوب والندبات والمسام الواسعة',
    subtitle: 'حفر سطحية وعميقة وتفاوت في ملمس الجلد',
    emoji: '🔍',
    categoryTag: 'ليزر متطور وتجديد خلايا',
    recommendation: {
      serviceName: 'جلسات الفراكشنال ليزر وتجديد طبقات الجلد',
      description:
        'إعادة بناء ألياف الكولاجين وتحفيز تجديد خلايا البشرة لتقليص حجم المسام وتنعيم الندبات السطحية والعميقة باستخدام أحدث أجهزة الفراكشنال ليزر.',
      protocol: 'فراكشنال ليزر Fractional CO2 / Erbium + جلسات بلازما PRP محفزة للالتئام',
      sessions: 'من 4 إلى 6 جلسات (بفاصل شهر)',
      estimatedPrice: 'كشف استشاري 650 ج.م • الجلسات من 1,500 إلى 2,800 ج.م',
    },
  },
  {
    id: 'hair_loss',
    title: 'تساقط الشعر وفراغات فروة الرأس',
    subtitle: 'ضعف البصيلات، ترقق الشعر وتساقط وراثي أو كربي',
    emoji: '💇‍♂️',
    categoryTag: 'علاج البصيلات والميزوثيرابي',
    recommendation: {
      serviceName: 'بروتوكول حقن البلازما (PRP) والميزوثيرابي للشعر',
      description:
        'فحص طبي شامل لفروة الرأس وتحديد أسباب التساقط، وحقن تركيزات غنية بعوامل النمو والفيتامينات لتحفيز البصيلات وزيادة سمك الشعرة وكثافتها.',
      protocol: 'جلسات بلازما سويسرية مجمعة + كوكتيل فيتامينات ميزوثيرابي موجه للبصيلات',
      sessions: 'من 4 إلى 8 جلسات علاجية دورية',
      estimatedPrice: 'كشف استشاري 650 ج.م • الجلسات من 1,100 إلى 2,400 ج.م',
    },
  },
  {
    id: 'aging',
    title: 'التجاعيد وترهل البشرة وعلامات التقدم',
    subtitle: 'خطوط التعبير، فقدان الامتلاء وترهل الخدين والرقبة',
    emoji: '⏳',
    categoryTag: 'تجميل طبي غير جراحي',
    recommendation: {
      serviceName: 'حقن البوتوكس، الفيلر، وخيوط الشد التجميلي',
      description:
        'إبراز ملامح الوجه واستعادة شباب البشرة بنتائج طبيعية غير متكلفة، من خلال حقن دقيق ومخصص للبوتوكس والفيلر وفق أعلى معايير الأمان الطبي.',
      protocol: 'تحديد مناطق الحقن بدقة ديناميكية للمحافظة على التعبيرات الطبيعية مع إخفاء التجاعيد',
      sessions: 'جلسة واحدة أساسية + رتوش مراجعة بعد أسبوعين',
      estimatedPrice: 'كشف استشاري 650 ج.م • التكلفة حسب عدد الوحدات ونوع المواد',
    },
  },
  {
    id: 'laser_hair',
    title: 'إزالة الشعر غير المرغوب فيه بالليزر',
    subtitle: 'جلسات تبريد مريحة وسريعة لأعلى درجات النعومة',
    emoji: '⚡',
    categoryTag: 'أحدث أجهزة الليزر العالمية',
    recommendation: {
      serviceName: 'جلسات إزالة الشعر بالليزر المزدوج مع التبريد',
      description:
        'جلسات ليزر عالية الكفاءة تناسب جميع أنواع البشرة بأحدث الأجهزة العالمية مع أنظمة تبريد هوائي متطورة لضمان أقصى درجات الراحة والأمان.',
      protocol: 'تحديد نوع الجهاز والطول الموجي الأنسب للون ونوع الشعر والبشرة',
      sessions: 'من 6 إلى 8 جلسات للحصول على نتائج دائمة',
      estimatedPrice: 'باقات جلسات تبدأ من 500 ج.م للمناطق و 1,800 ج.م للجسم كامل',
    },
  },
  {
    id: 'dullness',
    title: 'بهتان البشرة وفقدان النضارة والإشراق',
    subtitle: 'جفاف، شحوب، إرهاق يحتاج لترطيب وإنعاش فوري',
    emoji: '💧',
    categoryTag: 'نضارة وسكين بوستر فوري',
    recommendation: {
      serviceName: 'جلسات الهيدرافيشيل الطبي وحقن السكين بوستر (Skin Booster)',
      description:
        'تنظيف عميق للمسام مع حقن حمض الهيالورونيك النقي ومضادات الأكسدة لاستعادة الامتلاء المائي والنضارة الفورية للبشرة الشاحبة.',
      protocol: 'تنظيف هيدرافيشيل عميق + حقن سكين بوستر نضارة طبيعي',
      sessions: 'جلسة شهرية للنضارة الدائمة أو كورس مكثف من 3 جلسات',
      estimatedPrice: 'كشف استشاري 650 ج.م • جلسات النضارة تبدأ من 1,000 ج.م',
    },
  },
];

const durationOptions = [
  {
    id: 'short',
    title: 'أقل من شهر',
    desc: 'حالة حديثة أو طارئة ظهرت مؤخراً',
    tag: 'استجابة سريعة متوقعة',
  },
  {
    id: 'medium',
    title: 'من 1 إلى 6 أشهر',
    desc: 'مشكلة مستمرة أو متكررة بدرجة متوسطة',
    tag: 'تحتاج كورس علاجي منتظم',
  },
  {
    id: 'long',
    title: 'أكثر من سنة',
    desc: 'حالة مزمنة أو آثار قديمة بحاجة لخطة مكثفة',
    tag: 'تستلزم بروتوكولاً متكاملاً',
  },
];

export function SkinDiagnosticQuiz({ onBook, onBackToHome }: SkinDiagnosticQuizProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedConcern, setSelectedConcern] = useState<string>('acne');
  const [selectedDuration, setSelectedDuration] = useState<string>('medium');

  const currentConcernObj =
    concernOptions.find((c) => c.id === selectedConcern) || concernOptions[0];

  const handleRestart = () => {
    setStep(1);
    setSelectedConcern('acne');
    setSelectedDuration('medium');
  };

  const waServiceLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(
    `مرحبًا د. أحمد زغلول وعيادات Androderma، قمت باختبار تقييم البشرة وأرغب بحجز موعد استشارة بخصوص: (${currentConcernObj.recommendation.serviceName})`
  )}`;

  return (
    <section
      id="diagnostic-quiz"
      className="relative min-h-[85vh] overflow-hidden bg-gradient-to-b from-[#F8FAF9] via-[#F0FDF4]/40 to-[#F8FAF9] dark:from-[#0c0e12] dark:via-[#11161d] dark:to-[#0c0e12] pt-28 pb-16 sm:pt-36 sm:pb-24 transition-colors duration-300"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-[100px]" />

      <div className="container-px relative mx-auto max-w-4xl">
        {/* Navigation Breadcrumb / Back Button */}
        {onBackToHome && (
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/10 shadow-xs hover:border-[#00B8A9] hover:text-[#00B8A9] transition-all"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة إلى الصفحة الرئيسية</span>
            </button>

            <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
              تبويب تقييم البشرة المخصص
            </span>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-3">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400 animate-spin-slow" />
            <span>أداة تقييم البشرة والجلدية الذكية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.3]">
            اكتشف الخطة العلاجية <span className="text-teal-700 dark:text-teal-400">الأنسب لبشرتك</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-gray-300 leading-relaxed">
            أجب عن سؤالين سريعين للحصول على التوصية الطبية والبروتوكول الأنسب لحالتك مع د. أحمد زغلول
          </p>

          {/* Compact Progress Indicators */}
          <div className="flex items-center justify-center gap-2.5 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    step === s
                      ? 'bg-teal-700 text-white shadow-md scale-105'
                      : step > s
                      ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300'
                      : 'bg-slate-200 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-0.5 w-6 sm:w-10 rounded-full transition-colors duration-300 ${
                      step > s ? 'bg-teal-600' : 'bg-slate-200 dark:bg-gray-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] font-bold text-teal-800 dark:text-teal-400 mt-2">
            {step === 1 && 'الخطوة 1 من 3: تحديد المشكلة الأساسية'}
            {step === 2 && 'الخطوة 2 من 3: مدة ظهور المشكلة'}
            {step === 3 && 'الخطوة 3 من 3: التوصية والبروتوكول الطبي المقترح'}
          </p>
        </div>

        {/* Compact Multi-Step Card Box */}
        <div className="relative rounded-3xl bg-white/95 dark:bg-[#151922]/95 border border-teal-900/10 dark:border-white/10 p-5 sm:p-7 lg:p-8 shadow-xl backdrop-blur-xl transition-all duration-500">
          <AnimatePresence mode="wait">
            {/* STEP 1: CONCERN SELECTION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="text-right">
                  <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    السؤال الأول
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    ما أكثر مشكلة تزعجك في بشرتك أو شعرك؟
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5 font-medium">
                    اختر المشكلة الرئيسية ليتم توجيه التشخيص بأعلى دقة
                  </p>
                </div>

                {/* Cards Grid */}
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 pt-1">
                  {concernOptions.map((opt) => {
                    const isSelected = selectedConcern === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedConcern(opt.id)}
                        className={`group relative flex flex-col justify-between rounded-2xl p-3.5 sm:p-4 text-right transition-all duration-300 border ${
                          isSelected
                            ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-600 dark:border-teal-500 shadow-md scale-[1.01] ring-2 ring-teal-500/20'
                            : 'bg-white dark:bg-[#1a202c]/60 border-slate-200/90 dark:border-gray-800/80 hover:border-teal-500/50 hover:bg-slate-50/80 dark:hover:bg-[#1e2533]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xl">{opt.emoji}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              isSelected
                                ? 'bg-teal-700 text-white'
                                : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300'
                            }`}
                          >
                            {opt.categoryTag}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                            {opt.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                            {opt.subtitle}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>تم الاختيار</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-gray-800/80">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary py-2.5 px-6 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg gap-2"
                  >
                    <span>المتابعة للسؤال التالي</span>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DURATION SELECTION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="text-right">
                  <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    السؤال الثاني
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    منذ متى تعاني من هذه المشكلة؟
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5 font-medium">
                    المدة الزمنية تساعد في تقدير عدد الجلسات والبروتوكول العلاجي المناسب
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 pt-1">
                  {durationOptions.map((d) => {
                    const isSelected = selectedDuration === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDuration(d.id)}
                        className={`group relative flex flex-col justify-between rounded-2xl p-4 text-right transition-all duration-300 border ${
                          isSelected
                            ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-600 dark:border-teal-500 shadow-md scale-[1.01] ring-2 ring-teal-500/20'
                            : 'bg-white dark:bg-[#1a202c]/60 border-slate-200/90 dark:border-gray-800/80 hover:border-teal-500/50 hover:bg-slate-50/80 dark:hover:bg-[#1e2533]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              {d.title}
                            </span>
                            <span
                              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-teal-600 bg-teal-600 text-white'
                                  : 'border-slate-300 dark:border-gray-600'
                              }`}
                            >
                              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1.5 leading-relaxed font-medium">
                            {d.desc}
                          </p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-gray-800/80 text-[10px] font-bold text-teal-800 dark:text-teal-300">
                          {d.tag}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-gray-800/80">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary py-2 px-4 text-xs font-bold gap-1.5"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>الرجوع للخطوة السابقة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-primary py-2.5 px-6 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg gap-2"
                  >
                    <span>عرض التوصية والبروتوكول</span>
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CUSTOM MEDICAL RECOMMENDATION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35 }}
                className="space-y-5 text-right"
              >
                {/* Result Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-gray-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-white shadow-sm">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                        التوصية الطبية المخصصة
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        بإشراف: أ.د. أحمد زغلول
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300/60 dark:border-emerald-700/50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>تشخيص سريري موثوق</span>
                  </div>
                </div>

                {/* Primary Recommendation Card */}
                <div className="rounded-2xl border border-teal-900/10 dark:border-teal-500/30 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 dark:from-[#131b22] dark:via-[#161d27] dark:to-[#12161f] p-5 sm:p-6 shadow-xs">
                  <span className="inline-block rounded-md bg-teal-700 px-2.5 py-0.5 text-[10px] font-bold text-white mb-2">
                    الخدمة الموصى بها لحالتك
                  </span>

                  <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                    {currentConcernObj.recommendation.serviceName}
                  </h4>

                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-gray-300 font-medium">
                    {currentConcernObj.recommendation.description}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3 border-t border-slate-200/70 dark:border-gray-800 pt-4 text-xs">
                    <div className="rounded-xl bg-white/90 dark:bg-[#1a202c] p-3 border border-slate-200/70 dark:border-gray-700/60">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-0.5">
                        البروتوكول العلاجي
                      </span>
                      <span className="font-bold text-slate-800 dark:text-gray-100 text-[11px]">
                        {currentConcernObj.recommendation.protocol}
                      </span>
                    </div>

                    <div className="rounded-xl bg-white/90 dark:bg-[#1a202c] p-3 border border-slate-200/70 dark:border-gray-700/60">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-0.5">
                        الجلسات المتوقعة
                      </span>
                      <span className="font-bold text-slate-800 dark:text-gray-100 text-[11px]">
                        {currentConcernObj.recommendation.sessions}
                      </span>
                    </div>

                    <div className="rounded-xl bg-teal-50 dark:bg-teal-950/70 p-3 border border-teal-300/60 dark:border-teal-700/50">
                      <span className="block text-[10px] font-bold text-teal-800 dark:text-teal-300 mb-0.5">
                        التكلفة التقديرية (بالجنيه)
                      </span>
                      <span className="font-extrabold text-teal-950 dark:text-teal-200 text-[11px]">
                        {currentConcernObj.recommendation.estimatedPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Important Clinical Notice */}
                <div className="flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-[#181d26] p-3 border border-slate-200/80 dark:border-gray-800 text-[11px] font-medium text-slate-600 dark:text-gray-300">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    هذا التقييم يعتبر تقديراً استرشادياً أولياً؛ ويتم تأكيد الخطة العلاجية وعدد الجلسات بدقة متناهية أثناء جلسة الكشف السريري مع د. أحمد زغلول.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="btn-secondary py-2 px-3.5 text-xs font-bold gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>إعادة التقييم</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={waServiceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary py-2.5 px-4 text-xs font-bold text-teal-800 dark:text-teal-300"
                    >
                      استفسار على واتساب
                    </a>

                    <button
                      type="button"
                      onClick={() => onBook(currentConcernObj.recommendation.serviceName)}
                      className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-black shadow-md hover:shadow-lg gap-2"
                    >
                      <CalendarDays className="h-4 w-4" />
                      <span>احجز استشارتك لهذه الخدمة</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
