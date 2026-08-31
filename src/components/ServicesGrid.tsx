import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Stethoscope,
  Zap,
  Droplets,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { Reveal, Stagger, staggerItem } from '@/components/ui/Reveal';

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
  },
];

export function ServicesGrid({ onBookService }: ServicesGridProps) {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[#F8FAF9] dark:bg-[#101318] py-24 sm:py-32 transition-colors duration-300 border-b border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Soft Ambient Light Glows */}
      <div className="pointer-events-none absolute -right-20 top-20 h-96 w-96 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 bottom-20 h-96 w-96 rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[120px]" />

      <div className="container-px relative mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-3">
                <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>EXCELLENCE IN CLINICAL DERMATOLOGY</span>
              </div>
              <h2 className="max-w-2xl text-3xl font-extrabold leading-[1.4] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                خدمات تضع <span className="text-teal-700 dark:text-teal-400">صحة وجمال بشرتك</span> في المقام الأول
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed font-medium text-slate-600 dark:text-gray-300 text-right">
              جميع الخدمات تُقدم تحت الإشراف المباشر لـ د. أحمد زغلول، وتعتمد على تشخيص طبي متكامل وبروتوكولات فردية مصممة لكل حالة.
            </p>
          </div>
        </Reveal>

        {/* 4 Light Glass Cards Grid with Explicit Numbering and Soft Green Edge Hover */}
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.09}>
          {advancedServices.map((service) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.id}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white/85 dark:bg-[#161a22]/90 border border-emerald-900/10 dark:border-emerald-500/20 p-6 shadow-sm backdrop-blur-md transition-all duration-500 hover:border-emerald-500/50 hover:shadow-[0_15px_35px_rgba(16,185,129,0.12)] hover:ring-1 hover:ring-emerald-400/30"
              >
                {/* Image & Overlay */}
                <div className="relative -mx-6 -mt-6 mb-5 aspect-[1.1] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={service.image}
                    alt={service.titleAr}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                  {/* Explicit Number Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-[#12161f]/90 backdrop-blur-md px-3 py-1 text-xs font-black text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 shadow-xs">
                    <span>{service.number}</span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 right-4 left-4">
                    <span className="inline-block rounded-lg bg-teal-800/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                      {service.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 text-teal-700 dark:text-teal-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400">
                      {service.subtitleAr}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {service.titleAr}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-gray-300 font-medium line-clamp-3">
                    {service.descriptionAr}
                  </p>

                  {/* Bullet features */}
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-gray-800/80 pt-3">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-gray-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-gray-800/80">
                  <button
                    type="button"
                    onClick={() => onBookService(service.titleAr)}
                    className="group/btn flex w-full items-center justify-between rounded-xl bg-slate-50 dark:bg-[#1c222e] px-4 py-2.5 text-xs font-bold text-teal-800 dark:text-teal-300 border border-teal-700/15 transition-all duration-300 hover:bg-teal-700 hover:text-white hover:border-teal-700"
                  >
                    <span>{service.ctaAr}</span>
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:-translate-x-1" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
