import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images,
  Maximize2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { galleryItems, GalleryItem } from '@/data/clinicData';

type FilterCategory = 'all' | 'clinic' | 'devices' | 'rooms';

interface FilterOption {
  key: FilterCategory;
  labelAr: string;
}

const filterOptions: FilterOption[] = [
  { key: 'all', labelAr: 'جميع الصور' },
  { key: 'clinic', labelAr: 'العيادة والتعقيم' },
  { key: 'devices', labelAr: 'الأجهزة والتقنيات' },
  { key: 'rooms', labelAr: 'غرف الفحص والليزر' },
];

export function InteractiveBentoGallery() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  const filteredItems = galleryItems.filter((item) =>
    activeFilter === 'all' ? true : item.category === activeFilter
  );

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-[#F8FAF9] dark:bg-[#0c0e12] py-24 sm:py-32 transition-colors duration-300 border-b border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Background Decor */}
      <div className="pointer-events-none absolute right-10 top-20 h-72 w-72 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[100px]" />
      <div className="pointer-events-none absolute left-10 bottom-20 h-72 w-72 rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[100px]" />

      <div className="container-px relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-3">
                <Images className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>INSIDE ANDRODERMA CLINICS</span>
              </div>
              <h2 className="text-3xl font-extrabold leading-[1.35] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                جولة داخل <span className="text-teal-700 dark:text-teal-400">عياداتنا وأجنحة العلاج</span>
              </h2>
            </div>
            <p className="max-w-md text-sm font-medium leading-relaxed text-slate-600 dark:text-gray-300 text-right">
              بيئة طبية متطورة صُممت بأعلى معايير النظافة والخصوصية والراحة النفسية في كافة فروعنا بالقاهرة والجيزة.
            </p>
          </div>
        </Reveal>

        {/* Category Filtering Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`relative rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300 sm:text-sm ${
                  isActive
                    ? 'text-white'
                    : 'bg-white/80 dark:bg-[#161a22]/80 text-slate-700 dark:text-gray-300 border border-slate-200/80 dark:border-gray-800 hover:border-teal-500/40 hover:text-teal-800 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeGalleryFilter"
                    className="absolute inset-0 rounded-xl bg-teal-700 dark:bg-teal-600 shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{filter.labelAr}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Bento Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onClick={() => setActiveModalItem(item)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-gray-800 shadow-sm transition-all duration-500 hover:border-emerald-500/50 hover:shadow-xl"
              >
                {/* Visual Image */}
                <div className="aspect-[1.25] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                </div>

                {/* Always-Visible Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                {/* Floating Category Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="rounded-lg bg-teal-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-teal-500/20 shadow-xs">
                    {item.categoryLabelAr}
                  </span>
                </div>

                {/* Magnify Icon Trigger */}
                <div className="absolute top-4 left-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/80 dark:bg-[#12161f]/80 text-slate-800 dark:text-white opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                  <Maximize2 className="h-4 w-4" />
                </div>

                {/* Bottom Info Glass Card */}
                <div className="absolute inset-x-0 bottom-0 p-5 text-right transition-transform duration-300">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {item.titleAr}
                  </h3>
                  <p className="mt-1 text-xs text-teal-200/90 font-medium line-clamp-1">
                    {item.alt}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal with AnimatePresence & Blurred Backdrop */}
      <AnimatePresence>
        {activeModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-8"
            onClick={() => setActiveModalItem(null)}
          >
            <button
              aria-label="إغلاق المعاينة"
              onClick={() => setActiveModalItem(null)}
              className="absolute left-6 top-6 grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white transition hover:bg-white/30 hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-[2rem] bg-white dark:bg-[#151922] shadow-2xl border border-slate-200/40 dark:border-emerald-500/20"
            >
              <div className="aspect-[1.4] max-h-[70vh] w-full overflow-hidden bg-black">
                <img
                  src={activeModalItem.src}
                  alt={activeModalItem.alt}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Caption & Location Details Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 text-right bg-white dark:bg-[#161a22] border-t border-slate-100 dark:border-gray-800">
                <div>
                  <div className="inline-block rounded-md bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 text-xs font-bold text-teal-800 dark:text-teal-300 mb-1">
                    {activeModalItem.categoryLabelAr}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeModalItem.titleAr}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-300 mt-0.5 font-medium">
                    {activeModalItem.alt}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300">
                  <ShieldCheck className="h-4 w-4" />
                  <span>معايير تعقيم وتجهيز معتمدة</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
