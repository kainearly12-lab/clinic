import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Stethoscope,
  Zap,
  Droplets,
  HeartHandshake,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Award,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal } from '@/components/ui/Reveal';
import { GsapTextReveal } from '@/components/ui/GsapTextReveal';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ServicesGridProps {
  onBookService: (serviceTitle: string) => void;
}

interface ServiceItem {
  id: string;
  number: string;
  titleAr: string;
  subtitleAr: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  badge: string;
  features: string[];
  ctaAr: string;
  tagAr: string;
  tagIcon: React.ComponentType<{ className?: string }>;
}

const advancedServices: ServiceItem[] = [
  {
    id: 'consultation',
    number: '01',
    titleAr: 'استشارة وفحص الجلدية السريري',
    subtitleAr: 'تشخيص دقيق وخطة علاج مخصصة',
    descriptionAr:
      'تقييم شامل لحالة الجلد، حب الشباب، التصبغات، والأمراض الجلدية المزمنة مع د. أحمد زغلول لتحديد بروتوكول علاجي دوائي وجلساتي دقيق.',
    icon: Stethoscope,
    image:
      'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=900',
    badge: 'كشف استشاري متخصص',
    features: ['فحص دقيق لكافة طبقات الجلد', 'خطة دوائية وروتين طبي موجه', 'متابعة دورية مستمرة'],
    ctaAr: 'احجز موعد استشارة',
    tagAr: 'تشخيص طبي دقيق',
    tagIcon: ShieldCheck,
  },
  {
    id: 'laser',
    number: '02',
    titleAr: 'علاجات الليزر المتقدمة',
    subtitleAr: 'أحدث المنظومات العالمية المعتمدة',
    descriptionAr:
      'جلسات متطورة تشمل إزالة الشعر بالتبريد الفائق، الفراكشنال ليزر لعلاج آثار الحبوب والمسام، وتجديد خلايا البشرة بأمان تام.',
    icon: Zap,
    image:
      'https://images.pexels.com/photos/3757654/pexels-photo-3757654.jpeg?auto=compress&cs=tinysrgb&w=900',
    badge: 'تقنيات ليزر معتمدة FDA',
    features: ['تبريد هوائي مريح للبشرة', 'أجهزة مناسبة لجميع ألوان الجلد', 'جلسات سريعة ونتائج تدوم'],
    ctaAr: 'احجز جلسة ليزر',
    tagAr: 'أحدث تقنية',
    tagIcon: Sparkles,
  },
  {
    id: 'skincare',
    number: '03',
    titleAr: 'بروتوكولات العناية والنضارة',
    subtitleAr: 'تغذية عميقة وتجديد حيوي',
    descriptionAr:
      'جلسات الهيدرافيشيل الطبي، التقشير الكيميائي الموجه للتصبغات، وحقن السكين بوستر لاستعادة الامتلاء المائي والإشراقة الطبيعية.',
    icon: Droplets,
    image:
      'https://images.pexels.com/photos/6621339/pexels-photo-6621339.jpeg?auto=compress&cs=tinysrgb&w=900',
    badge: 'نضارة وسكين بوستر فوري',
    features: ['تنظيف طبي عميق للمسام', 'تفتيح وتوحيد لون البشرة', 'حمض هيالورونيك عالي النقاء'],
    ctaAr: 'احجز برنامج العناية',
    tagAr: 'نتائج فورية',
    tagIcon: Flame,
  },
  {
    id: 'aesthetic',
    number: '04',
    titleAr: 'الجلدية التجميلية الدقيقة',
    subtitleAr: 'تحديد الملامح واستعادة الشباب',
    descriptionAr:
      'حقن البوتوكس للتجاعيد التعبيرية، الفيلر التجميلي لتعويض الحجم، وحقن البلازما (PRP) والميزوثيرابي لإعادة إحياء بصيلات الشعر والبشرة.',
    icon: HeartHandshake,
    image:
      'https://images.pexels.com/photos/6492385/pexels-photo-6492385.jpeg?auto=compress&cs=tinysrgb&w=900',
    badge: 'نتائج طبيعية متناسقة',
    features: ['مواد أصلية معتمدة عالمياً', 'تقنيات حقن بدون ألم', 'رعاية فورية وتوجيه ما بعد الجلسة'],
    ctaAr: 'احجز موعد تجميل',
    tagAr: 'الأكثر طلباً',
    tagIcon: Award,
  },
];

const categoryTabs = [
  { id: 'all', labelAr: 'جميع الخدمات' },
  { id: 'consultation', labelAr: 'جلدية وتشخيص' },
  { id: 'laser', labelAr: 'ليزر وتبريد' },
  { id: 'skincare', labelAr: 'عناية ونضارة' },
  { id: 'aesthetic', labelAr: 'تجميل وحقن' },
];

interface ServiceCardProps {
  service: ServiceItem;
  onBook: (title: string) => void;
}

const ServiceCard = React.forwardRef<HTMLElement, ServiceCardProps>(function ServiceCard(
  { service, onBook },
  forwardedRef
) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const internalCardRef = useRef<HTMLElement | null>(null);
  const Icon = service.icon;
  const TagIcon = service.tagIcon;

  const handleRef = (node: HTMLElement | null) => {
    internalCardRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!internalCardRef.current) return;
    const rect = internalCardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.article
      ref={handleRef}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="service-bento-card group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:border-[#00B8A9]/50 hover:shadow-[0_20px_40px_-15px_rgba(0,184,169,0.25)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,184,169,0.3)] will-change-transform"
    >
      {/* Mouse-Tracking Radial Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 -z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 184, 169, 0.14), transparent 75%)`,
        }}
      />

      {/* Subtle Top Border Glow Shimmer on Hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00B8A9]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top Media Block with Image Zoom */}
      <div className="relative z-10 -mx-6 -mt-6 mb-5 aspect-[1.15] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={service.image}
          alt={service.titleAr}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        {/* Top Badges: Number & Floating Micro Tag */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
          {/* Micro Tag with Emerald Pinstripe Glow */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00B8A9]/15 dark:bg-[#00B8A9]/20 border border-[#00B8A9]/40 text-[#00B8A9] text-xs font-bold px-3 py-1 backdrop-blur-md shadow-xs">
            <TagIcon className="h-3 w-3 shrink-0" />
            <span>{service.tagAr}</span>
          </div>

          {/* Number Badge */}
          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-xs font-black text-slate-800 dark:text-teal-300 border border-white/20 dark:border-teal-500/30 shadow-xs">
            <span>{service.number}</span>
          </div>
        </div>

        {/* Bottom Category Badge Overlaid on Image */}
        <div className="absolute bottom-3 right-4 left-4">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-teal-900/85 dark:bg-slate-950/85 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-teal-100 dark:text-teal-200 border border-teal-500/20 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00B8A9] animate-pulse" />
            <span>{service.badge}</span>
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex-1 text-right">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-700/50 text-[#00B8A9] transition-transform duration-300 group-hover:scale-110 shadow-xs">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
            {service.subtitleAr}
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug transition-colors duration-300 group-hover:text-teal-700 dark:group-hover:text-[#00B8A9]">
          {service.titleAr}
        </h3>

        <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-gray-300 font-medium line-clamp-3">
          {service.descriptionAr}
        </p>

        {/* Feature Highlights */}
        <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-white/10 pt-3.5">
          {service.features.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00B8A9] shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Micro-Interaction CTA Action Link */}
      <div className="relative z-10 mt-6 pt-3.5 border-t border-slate-100 dark:border-white/10">
        <button
          type="button"
          onClick={() => onBook(service.titleAr)}
          className="group/btn relative flex w-full items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-xs font-extrabold text-[#00B8A9] border border-teal-600/20 dark:border-white/10 transition-all duration-300 hover:bg-[#00B8A9] hover:text-white hover:border-[#00B8A9] hover:shadow-md"
        >
          <span className="tracking-wide">{service.ctaAr}</span>
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-x-1.5" />
        </button>
      </div>
    </motion.article>
  );
});

export function ServicesGrid({ onBookService }: ServicesGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Filter services by active tab
  const displayedServices =
    activeCategory === 'all'
      ? advancedServices
      : advancedServices.filter((s) => s.id === activeCategory);

  // GSAP Scroll-Triggered Staggered Entrance
  useEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('.service-bento-card');
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [activeCategory]);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative overflow-hidden bg-[#F8FAF9] dark:bg-[#101318] py-24 sm:py-32 transition-colors duration-300 border-b border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Soft Ambient Light Glows */}
      <div className="pointer-events-none absolute -right-24 top-20 h-[450px] w-[450px] rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[130px]" />
      <div className="pointer-events-none absolute -left-24 bottom-20 h-[450px] w-[450px] rounded-full bg-emerald-400/10 dark:bg-[#00B8A9]/5 blur-[130px]" />

      <div className="container-px relative mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-3">
                <Sparkles className="h-4 w-4 text-[#00B8A9]" />
                <span>EXCELLENCE IN CLINICAL DERMATOLOGY</span>
              </div>
              <GsapTextReveal className="max-w-2xl text-3xl font-extrabold leading-[1.4] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                خدمات تضع <span className="text-teal-700 dark:text-[#00B8A9]">صحة وجمال بشرتك</span> في المقام الأول
              </GsapTextReveal>
            </div>
            <p className="max-w-md text-sm leading-relaxed font-medium text-slate-600 dark:text-gray-300 text-right">
              جميع الخدمات تُقدم تحت الإشراف المباشر لـ د. أحمد زغلول، وتعتمد على تشخيص طبي متكامل وبروتوكولات فردية مصممة لكل حالة.
            </p>
          </div>
        </Reveal>

        {/* Interactive Figma-Grade Category Filter Bar (Segmented Control) */}
        <div className="flex justify-center mb-10">
          <div className="relative inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-full bg-slate-200/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-300/40 dark:border-white/10 shadow-inner">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`relative z-10 px-4 py-2 text-xs sm:text-sm font-bold transition-colors duration-300 rounded-full select-none ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeServiceTabPill"
                      className="absolute inset-0 bg-[#00B8A9] rounded-full shadow-[0_0_20px_rgba(0,184,169,0.35)] -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span>{tab.labelAr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Figma-Grade Glassmorphic Bento Cards Grid with GSAP Stagger */}
        <div
          ref={cardsContainerRef}
          className={`grid gap-6 ${
            displayedServices.length === 1
              ? 'max-w-md mx-auto grid-cols-1'
              : 'sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          <AnimatePresence mode="popLayout">
            {displayedServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={onBookService}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

