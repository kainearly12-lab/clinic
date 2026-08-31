import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Plus,
  MessageCircle,
  ArrowLeft,
  CalendarDays,
  Flame,
  Stethoscope,
  Zap,
  CheckCircle2,
  ShieldCheck,
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
      {/* Ambient background glow matching medical mint & emerald */}
      <div className="pointer-events-none absolute left-1/3 top-10 h-80 w-80 rounded-full bg-teal-400/10 dark:bg-[#00B8A9]/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-10 bottom-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-[140px]" />

      <div className="container-px relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <Reveal>
          <div className="mb-14 text-right">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-3">
              <HelpCircle className="h-4 w-4 text-teal-600 dark:text-[#00B8A9]" />
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
          
          {/* Sidebar Column: Categories & Ultra-Modern Concierge Live Card */}
          <div className="space-y-6">
            
            {/* 1. Figma-Grade Category Tabs (Segmented Control Container) */}
            <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 rounded-2xl p-2 shadow-sm space-y-1">
              <div className="px-3 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  تصنيفات الاستفسارات
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {faqs.length} سؤال متاح
                </span>
              </div>

              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`relative flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-right text-xs sm:text-sm font-bold transition-all duration-300 ease-out z-10 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
                    }`}
                  >
                    {/* Floating Active Background Pill Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeFaqCategoryPill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-700 to-[#00B8A9] dark:from-teal-800 dark:to-emerald-600 shadow-md shadow-emerald-500/20 -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="leading-snug">{cat.labelAr}</span>
                    </div>

                    {/* Translucent Glass Pill Badge */}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-all ${
                        isActive
                          ? 'bg-white/20 border border-white/30 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-gray-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. Live Consultation Glass Card with Doctor Avatar & Concierge Sheen */}
            <div className="group relative rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-emerald-500/30 p-6 shadow-[0_15px_35px_rgba(0,184,169,0.12)] text-right overflow-hidden transition-all duration-300 hover:border-emerald-500/50">
              {/* Ambient radial lighting */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-teal-500/15 blur-2xl" />

              {/* Status Header with Live Pulsing Green Badge */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/10 pb-3.5">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span>الاستقبال الطبي متاح الآن</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-emerald-400" />
                  <span>استجابة فورية</span>
                </div>
              </div>

              {/* Doctor Concierge Profile Mesh */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="relative shrink-0">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-b from-teal-100 to-emerald-100 dark:from-slate-800 dark:to-slate-900 border-2 border-emerald-500/40 shadow-md">
                    <img
                      src="https://i.postimg.cc/m2W4gjwt/106929042-3317889038271540-2818272907474417516-n-1-removebg-preview.png"
                      alt="د. أحمد زغلول"
                      className="h-full w-full object-contain object-bottom drop-shadow-sm"
                      loading="lazy"
                    />
                  </div>
                  {/* Doctor Online Ping Dot */}
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold leading-snug text-slate-900 dark:text-white">
                    استشارة مباشرة مع الفريق الطبي
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-gray-300 font-medium">
                    تحت إشراف د. أحمد زغلول لتحديد أنسب بروتوكول وحجز موعدك.
                  </p>
                </div>
              </div>

              {/* Bullet Highlights */}
              <div className="space-y-1.5 my-3.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300/95">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>تأكيد المواعيد دون فترات انتظار</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>الاستفسار عن عروض الأجهزة والأسعار</span>
                </div>
              </div>

              {/* High-Converting CTA Button with Sheen Effect */}
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="group/btn relative mt-4 flex items-center justify-center gap-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#00B8A9] py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-500/20 hover:shadow-[0_0_20px_rgba(0,184,169,0.4)] transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Subtle Inner Animated Sheen */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                <MessageCircle className="h-4 w-4 relative z-10" />
                <span className="relative z-10">تحدث معنا على واتساب الآن</span>
                <ArrowLeft className="h-4 w-4 relative z-10 transition-transform group-hover/btn:-translate-x-1" />
              </a>
            </div>

          </div>

          {/* 2. Main Dynamic Accordion Column */}
          <div ref={accordionContainerRef} className="space-y-3.5 text-right">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`faq-item-card overflow-hidden rounded-2xl transition-all duration-300 backdrop-blur-md ${
                    isOpen
                      ? 'bg-gradient-to-l from-teal-50/90 via-emerald-50/40 to-white dark:bg-gradient-to-r dark:from-emerald-950/30 dark:via-slate-900/90 dark:to-slate-900 border-r-4 border-[#00B8A9] dark:border-emerald-400 border-t border-b border-l border-emerald-500/20 shadow-[0_10px_30px_-10px_rgba(0,184,169,0.15)]'
                      : 'border border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-900/40 hover:border-emerald-500/30 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-right"
                  >
                    <div className="flex flex-1 flex-col items-start gap-1">
                      {/* 2. Popular Badge Upgrade */}
                      {faq.isPopular && (
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-xs rounded-full text-xs px-3 py-1 font-black mb-1 backdrop-blur-xs">
                          <Flame className="h-3.5 w-3.5 text-amber-500" />
                          <span>الأكثر استفساراً</span>
                        </span>
                      )}
                      <span
                        className={`text-sm sm:text-base font-bold leading-relaxed transition-colors ${
                          isOpen
                            ? 'text-teal-800 dark:text-[#00B8A9]'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {faq.q}
                      </span>
                    </div>

                    {/* Icon Micro-Interaction: Smooth 135deg rotation & scale with emerald backdrop */}
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-300 ease-out ${
                        isOpen
                          ? 'bg-[#00B8A9] text-slate-950 shadow-[0_0_15px_rgba(0,184,169,0.5)] scale-110 rotate-[135deg]'
                          : 'bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-white/10 hover:text-emerald-400 rotate-0 scale-100'
                      }`}
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
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
                        <div className="border-t border-emerald-500/15 dark:border-emerald-500/20 px-5 pb-6 pt-4 sm:px-6">
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
