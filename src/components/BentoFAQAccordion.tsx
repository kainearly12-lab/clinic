import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Plus,
  Minus,
  MessageCircle,
  ArrowLeft,
  CalendarDays,
  Flame,
  Stethoscope,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { gsap } from 'gsap';
import { Reveal } from '@/components/ui/Reveal';
import { GsapTextReveal } from '@/components/ui/GsapTextReveal';
import { faqs, clinic } from '@/data/clinicData';

type FAQCategory = 'all' | 'consultation' | 'laser' | 'booking';

interface CategoryTab {
  key: FAQCategory;
  labelAr: string;
  icon: typeof Stethoscope;
  count: number;
}

const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(
  'مرحباً، لدي استفسار عن خدمات وأسعار عيادات Androderma.'
)}`;

export function BentoFAQAccordion() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('all');
  const [openId, setOpenId] = useState<string>('faq-1');
  const accordionContainerRef = useRef<HTMLDivElement | null>(null);

  const categories: CategoryTab[] = [
    {
      key: 'all',
      labelAr: 'جميع الأسئلة',
      icon: HelpCircle,
      count: faqs.length,
    },
    {
      key: 'consultation',
      labelAr: 'الاستشارة الأولى والفحص',
      icon: Stethoscope,
      count: faqs.filter((f) => f.category === 'consultation').length,
    },
    {
      key: 'laser',
      labelAr: 'جلسات الليزر والعناية',
      icon: Zap,
      count: faqs.filter((f) => f.category === 'laser').length,
    },
    {
      key: 'booking',
      labelAr: 'المواعيد والحجز والفروع',
      icon: CalendarDays,
      count: faqs.filter((f) => f.category === 'booking').length,
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    activeCategory === 'all' ? true : faq.category === activeCategory
  );

  // GSAP Staggered entry animation on category change
  useEffect(() => {
    if (!accordionContainerRef.current) return;
    const items = accordionContainerRef.current.querySelectorAll('.faq-item-card');
    if (items.length > 0) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
        }
      );
    }
  }, [activeCategory]);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? '' : id);
  };

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-[#F8FAF9] dark:bg-[#0c0e12] py-24 sm:py-32 transition-colors duration-300 border-b border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/3 top-10 h-80 w-80 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[120px]" />

      <div className="container-px relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <Reveal>
          <div className="mb-14 text-right">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-3">
              <HelpCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <GsapTextReveal className="text-3xl font-extrabold leading-[1.35] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              إجابات طبية واضحة <br />
              <span className="text-teal-700 dark:text-[#00B8A9]">عن كل ما يدور في ذهنك</span>
            </GsapTextReveal>
            <p className="mt-3 max-w-xl text-sm sm:text-base font-medium leading-relaxed text-slate-600 dark:text-gray-300">
              اختر التصنيف للاطلاع على تفاصيل الاستشارات، أجهزة الليزر، وتسهيلات الحجز في كافة فروعنا.
            </p>
          </div>
        </Reveal>

        {/* Large Bento Card Container */}
        <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr] lg:gap-10 items-start">
          
          {/* Sidebar Column: Categories & Glowing Floating Glassmorphic Live Receptionist Card */}
          <div className="space-y-5">
            
            {/* Category Filter Tabs */}
            <div className="rounded-3xl bg-white/90 dark:bg-[#151922]/90 border border-slate-200/90 dark:border-gray-800 p-4 shadow-sm backdrop-blur-md space-y-1.5">
              <span className="px-3 py-1 block text-xs font-black text-slate-600 dark:text-gray-400 uppercase">
                تصنيفات الاستفسارات
              </span>

              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-xs sm:text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'bg-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-xl transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-300 group-hover:text-teal-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{cat.labelAr}</span>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Glowing Floating Glassmorphic Live Receptionist Card with Doctor Status Indicator */}
            <div className="group relative rounded-3xl bg-slate-900/85 dark:bg-slate-900/90 backdrop-blur-xl text-white p-6 shadow-[0_10px_35px_rgba(16,185,129,0.15)] border border-emerald-500/30 text-right overflow-hidden transition-all duration-300 hover:border-emerald-500/50">
              {/* Subtle Ambient Radial Highlight */}
              <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

              {/* Status Header with Live Pulsing Indicator */}
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span>الاستقبال الطبي متاح الآن</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  استجابة فورية
                </span>
              </div>

              <div className="flex items-start gap-3.5 mb-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold leading-snug text-white">
                    استشارة مخصصة لحالتك مباشرة
                  </h4>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed font-medium">
                    د. أحمد زغلول وفريق الاستشارات متاحون للإجابة وتحديد أنسب موعد في أقرب فرع لك.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 my-3.5 text-[11px] font-semibold text-emerald-300/90">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>تحديد مواعيد سريعة دون انتظار</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>معرفة أسعار الباقات والعروض الحالية</span>
                </div>
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-xs font-black text-slate-950 transition-all duration-300 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <span>تحدث معنا على واتساب الآن</span>
                <ArrowLeft className="h-4 w-4" />
              </a>
            </div>

          </div>

          {/* Main Accordion Column */}
          <div ref={accordionContainerRef} className="space-y-3.5 text-right">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`faq-item-card overflow-hidden rounded-3xl transition-all duration-300 border ${
                    isOpen
                      ? 'bg-gradient-to-l from-teal-50/90 via-emerald-50/40 to-white dark:from-emerald-950/30 dark:to-slate-900/80 border-emerald-500/30 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                      : 'bg-white/80 dark:bg-[#151922]/80 border-slate-200/90 dark:border-gray-800/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-right"
                  >
                    <div className="flex flex-1 flex-col items-start gap-1">
                      {faq.isPopular && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-700/40 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300 mb-1">
                          <Flame className="h-3 w-3 text-amber-500" />
                          <span>الأكثر استفساراً</span>
                        </span>
                      )}
                      <span
                        className={`text-sm sm:text-base font-bold leading-relaxed transition-colors ${
                          isOpen
                            ? 'text-teal-800 dark:text-teal-300'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {faq.q}
                      </span>
                    </div>

                    {/* Interactive Toggle Icon with soft glow */}
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl transition-all duration-300 ${
                        isOpen
                          ? 'bg-teal-700 text-white shadow-md scale-105 rotate-90'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-teal-50 hover:text-teal-700'
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-teal-900/10 dark:border-emerald-500/20 px-5 pb-6 pt-4 sm:px-6">
                          <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-700 dark:text-gray-300">
                            {faq.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
