import { useState } from 'react';
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
} from 'lucide-react';
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
          
          {/* Sidebar Column: Categories & Direct WhatsApp Box */}
          <div className="space-y-4">
            
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

            {/* Direct WhatsApp Prompt Box */}
            <div className="rounded-3xl bg-gradient-to-br from-teal-900 to-slate-900 text-white p-6 shadow-xl border border-teal-500/30 text-right">
              <div className="flex items-center gap-2 mb-3 text-teal-300">
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs font-black">استفسار مخصص لحالتك؟</span>
              </div>
              <h4 className="text-base font-bold leading-snug">
                فريقنا الطبي متاح للإجابة المباشرة
              </h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed font-medium">
                تواصل معنا عبر واتساب للحصول على استشارة سريعة وتحديد موعد مناسب في أقرب فرع لك.
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl bg-teal-500 py-3 text-xs font-black text-slate-950 transition hover:bg-teal-400 shadow-md"
              >
                <span>تحدث معنا على واتساب</span>
                <ArrowLeft className="h-4 w-4" />
              </a>
            </div>

          </div>

          {/* Main Accordion Column */}
          <div className="space-y-3.5 text-right">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-3.5"
              >
                {filteredFaqs.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`overflow-hidden rounded-3xl transition-all duration-300 border ${
                        isOpen
                          ? 'bg-white dark:bg-[#161a24] border-teal-600/40 dark:border-teal-500/40 shadow-lg'
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
                            <div className="border-t border-slate-100 dark:border-gray-800 px-5 pb-6 pt-4 sm:px-6">
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
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
