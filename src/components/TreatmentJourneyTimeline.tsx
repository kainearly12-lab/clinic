import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FileText,
  Microscope,
  Sliders,
  RefreshCw,
  Award,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { GsapTextReveal } from '@/components/ui/GsapTextReveal';

// Register GSAP ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface JourneyStep {
  number: string;
  titleAr: string;
  subtitleAr: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  highlights: string[];
}

const journeySteps: JourneyStep[] = [
  {
    number: '01',
    titleAr: 'الاستشارة والتقييم الشامل',
    subtitleAr: 'الاستماع لاحتياجاتك وتاريخ الحالة',
    descriptionAr:
      'جلسة استماع سريرية مفصلة مع د. أحمد زغلول لمناقشة شكواك، العوامل الوراثية والبيئية، وتاريخ العلاجات السابقة لتحديد الأولويات الطبية والتجميلية بدقة.',
    icon: FileText,
    tag: 'الخطوة الأولى',
    highlights: ['فحص تاريخ البشرة الكامل', 'تحديد الأهداف التجميلية والعلاجية', 'مناقشة نمط الحياة والروتين'],
  },
  {
    number: '02',
    titleAr: 'التشخيص الطبي الدقيق',
    subtitleAr: 'رؤية ما تحت سطح الجلد',
    descriptionAr:
      'فحص سريري واستخدام أدوات الفحص المتطورة لتحديد عمق التصبغات، نشاط الغدد الدهنية، حالة المسام، ونوعية ألياف الكولاجين لوضع أساس علمي صلب.',
    icon: Microscope,
    tag: 'التشخيص السريري',
    highlights: ['تحديد نوع ودرجة المشكلة الجلدية', 'فحص دقيق لكثافة وبصيلات الشعر', 'تحديد حساسية واستجابة البشرة'],
  },
  {
    number: '03',
    titleAr: 'تصميم الخطة العلاجية المخصصة',
    subtitleAr: 'بروتوكول فردي بدون قوالب جاهزة',
    descriptionAr:
      'بناء برنامج علاجي متكامل يجمع بدقة بين الجلسات السريرية بالعيادة، الأجهزة المناسبة، والروتين الطبي المنزلي مع جدول زمني واضح للنتائج المتوقعة.',
    icon: Sliders,
    tag: 'الخطة الفردية',
    highlights: ['اختيار أجهزة الليزر أو المقشرات المناسبة', 'تحديد عدد الجلسات والفواصل الزمنية', 'روتين عناية طبي داعم للنتائج'],
  },
  {
    number: '04',
    titleAr: 'المتابعة الدورية وتعديل المسار',
    subtitleAr: 'مرافقة مستمرة حتى التعافي التام',
    descriptionAr:
      'إجراء الجلسات المحددة ومتابعة استجابة الجلد في كل زيارة، مع تعديل معايير الأجهزة أو تركيزات العلاجات حسب سرعة تحسن الحالة لضمان أفضل نتيجة بأمان.',
    icon: RefreshCw,
    tag: 'الرعاية المستمرة',
    highlights: ['تقييم سريري بعد كل جلسة', 'ضبط دقيق لطاقة وأجهزة الليزر', 'دعم واستشارات مستمرة'],
  },
  {
    number: '05',
    titleAr: 'الوصول للنتيجة المستهدفة والحفاظ عليها',
    subtitleAr: 'بشرة صحية متألقة تدوم طويلاً',
    descriptionAr:
      'تحقيق التحسن المستهدف والوصول لبشرة نقية ومتجددة، مع تسليم خطة وقائية طويلة المدى لضمان استدامة النتائج وحماية البشرة من الانتكاس.',
    icon: Award,
    tag: 'النتيجة النهائية',
    highlights: ['تحسن ملموس في ملمس ونضارة الجلد', 'بروتوكول وقائي منزلي مستدام', 'مراجعات موسمية للمحافظة'],
  },
];

export function TreatmentJourneyTimeline({ onBook }: { onBook: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Progress line animation triggered on scroll
      if (progressBarRef.current && containerRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
              end: 'bottom 85%',
              scrub: 0.8,
            },
          }
        );
      }

      // Step cards entrance stagger and highlight trigger
      const stepElements = gsap.utils.toArray<HTMLElement>('.journey-step-item');
      stepElements.forEach((step) => {
        gsap.fromTo(
          step,
          {
            opacity: 0.3,
            y: 35,
            scale: 0.98,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 80%',
              end: 'top 50%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="treatment-journey"
      className="relative overflow-hidden bg-gradient-to-b from-[#F8FAF9] via-emerald-50/20 to-[#F8FAF9] dark:from-[#0f1217] dark:via-[#131920] dark:to-[#0f1217] py-24 sm:py-32 transition-colors duration-300 border-b border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Background Decor */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-teal-500/5 dark:bg-teal-500/5 blur-[140px]" />

      <div className="container-px relative mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-4">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>CLINICAL TREATMENT JOURNEY</span>
          </div>
          <GsapTextReveal className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.35]">
            رحلتك العلاجية <span className="text-teal-700 dark:text-[#00B8A9]">داخل العيادة</span>
          </GsapTextReveal>
          <p className="mt-3 text-sm sm:text-base font-medium text-slate-600 dark:text-gray-300 leading-relaxed">
            منهجية طبية من 5 خطوات محكمة تضمن حصولك على أقصى فائدة وأعلى مستويات الأمان مع د. أحمد زغلول
          </p>
        </div>

        {/* Interactive Animated Timeline */}
        <div className="relative">
          {/* Vertical Connecting Line */}
          <div className="absolute right-6 sm:right-1/2 top-6 bottom-6 w-1 -translate-x-1/2 bg-slate-200 dark:bg-gray-800 rounded-full hidden sm:block">
            <div
              ref={progressBarRef}
              className="h-full w-full origin-top rounded-full bg-gradient-to-b from-teal-600 via-emerald-500 to-teal-700 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            />
          </div>

          {/* Timeline Step Items */}
          <div className="space-y-12 sm:space-y-16">
            {journeySteps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={step.number}
                  className={`journey-step-item relative flex flex-col sm:flex-row items-center gap-6 sm:gap-12 ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Step Center Node (Circle on Timeline) */}
                  <div className="relative z-10 hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-[#161a22] border-2 border-teal-600 dark:border-teal-400 text-teal-800 dark:text-teal-300 shadow-lg shadow-teal-700/15">
                    <Icon className="h-6 w-6" />
                    <span className="absolute -bottom-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[10px] font-black text-white shadow-xs">
                      {step.number}
                    </span>
                  </div>

                  {/* Content Card (Light Glass Luxury with giant translucent number) */}
                  <motion.div
                    whileHover={{ scale: 1.01, y: -4 }}
                    className="group relative w-full sm:w-[calc(50%-2rem)] overflow-hidden rounded-3xl bg-white/90 dark:bg-[#161a22]/90 border border-emerald-900/10 dark:border-emerald-500/20 p-6 sm:p-8 shadow-md backdrop-blur-md transition-all duration-400 hover:border-emerald-500/50 hover:shadow-[0_15px_30px_rgba(16,185,129,0.12)] hover:ring-1 hover:ring-emerald-400/30 text-right"
                  >
                    {/* Giant Translucent Number in Background */}
                    <span className="pointer-events-none absolute -left-2 -bottom-6 select-none font-display text-8xl font-black text-teal-900/5 dark:text-teal-400/10 transition-transform duration-500 group-hover:scale-110">
                      {step.number}
                    </span>

                    {/* Step Tag & Icon */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 sm:hidden">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-black text-teal-700 dark:text-teal-400">
                          {step.number}
                        </span>
                      </div>

                      <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 px-3 py-0.5 text-[11px] font-bold text-teal-800 dark:text-teal-300">
                        {step.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                      {step.titleAr}
                    </h3>
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-1">
                      {step.subtitleAr}
                    </p>

                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                      {step.descriptionAr}
                    </p>

                    {/* Highlights List */}
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-gray-800/80 pt-3 text-xs">
                      {step.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-gray-300 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 rounded-3xl bg-white/95 dark:bg-[#161a22]/95 border border-teal-900/10 dark:border-emerald-500/20 p-6 sm:px-8 sm:py-5 shadow-lg backdrop-blur-md">
            <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-gray-800 sm:pl-6">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                جاهز لبدء رحلتك العلاجية مع د. أحمد زغلول؟
              </h4>
              <p className="text-xs text-slate-600 dark:text-gray-300 mt-0.5 font-medium">
                احجز استشارتك الأولى الآن في أقرب فرع إليك بالقاهرة أو الجيزة
              </p>
            </div>
            <button
              onClick={onBook}
              className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg gap-2 shrink-0"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>احجز كشفك وابدأ رحلتك</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
