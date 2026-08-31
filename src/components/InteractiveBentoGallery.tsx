import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images,
  Maximize2,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal,
} from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { galleryItems } from '@/data/clinicData';

type FilterCategory = 'all' | 'clinic' | 'devices' | 'rooms';

interface FilterOption {
  key: FilterCategory;
  labelAr: string;
}

const filterOptions: FilterOption[] = [
  { key: 'all', labelAr: 'جميع الصور' },
  { key: 'clinic', labelAr: 'الاستقبال والتعقيم' },
  { key: 'devices', labelAr: 'الأجهزة والتقنيات' },
  { key: 'rooms', labelAr: 'غرف الفحص والليزر' },
];

export function InteractiveBentoGallery() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');
  const [isPaused, setIsPaused] = useState(false);

  const filteredItems = galleryItems.filter((item) =>
    activeFilter === 'all' ? true : item.category === activeFilter
  );

  // Keep carouselIndex in bounds when filtered items change
  useEffect(() => {
    setCarouselIndex(0);
  }, [activeFilter]);

  // Autoplay carousel if in slider mode and not paused or modal open
  useEffect(() => {
    if (viewMode !== 'slider' || isPaused || activeModalIndex !== null || filteredItems.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [viewMode, isPaused, activeModalIndex, filteredItems.length]);

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleOpenModal = (index: number) => {
    setActiveModalIndex(index);
  };

  const handleNextModal = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (activeModalIndex !== null) {
        setActiveModalIndex((activeModalIndex + 1) % filteredItems.length);
      }
    },
    [activeModalIndex, filteredItems.length]
  );

  const handlePrevModal = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (activeModalIndex !== null) {
        setActiveModalIndex(
          (activeModalIndex - 1 + filteredItems.length) % filteredItems.length
        );
      }
    },
    [activeModalIndex, filteredItems.length]
  );

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalIndex === null) return;
      if (e.key === 'Escape') setActiveModalIndex(null);
      if (e.key === 'ArrowRight') handlePrevModal();
      if (e.key === 'ArrowLeft') handleNextModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalIndex, handleNextModal, handlePrevModal]);

  const currentModalItem = activeModalIndex !== null ? filteredItems[activeModalIndex] : null;

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-[#F8FAF9] dark:bg-[#0c0e12] py-20 sm:py-28 transition-colors duration-300 border-b border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Background Decor */}
      <div className="pointer-events-none absolute right-10 top-20 h-72 w-72 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[100px]" />
      <div className="pointer-events-none absolute left-10 bottom-20 h-72 w-72 rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[100px]" />

      <div className="container-px relative mx-auto max-w-7xl">
        {/* Section Header */}
        <Reveal>
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-3">
                <Images className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>INSIDE ANDRODERMA CLINICS</span>
              </div>
              <h2 className="text-3xl font-extrabold leading-[1.35] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                جولة داخل <span className="text-teal-700 dark:text-teal-400">عياداتنا وأجنحة العلاج</span>
              </h2>
            </div>
            <p className="max-w-md text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-gray-300 text-right">
              بيئة طبية متطورة صُممت بأعلى معايير النظافة والخصوصية والراحة النفسية في كافة فروعنا بالقاهرة والجيزة.
            </p>
          </div>
        </Reveal>

        {/* Controls Toolbar: Filters & View Switcher */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          {/* Category Filtering Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`relative rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'bg-white/80 dark:bg-[#161a22]/80 text-slate-700 dark:text-gray-300 border border-slate-200/80 dark:border-gray-800 hover:border-teal-500/40 hover:text-teal-800 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeGalleryFilter"
                      className="absolute inset-0 rounded-xl bg-teal-700 dark:bg-teal-600 shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{filter.labelAr}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle & Carousel Controls */}
          <div className="flex items-center gap-2 mr-auto sm:mr-0">
            <div className="flex items-center rounded-xl bg-white dark:bg-[#161a22] border border-slate-200 dark:border-gray-800 p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                title="عرض سلايدر تفاعلي"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'slider'
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">سلايدر</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="عرض شبكي مدمج"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">شبكة 3 أعمدة</span>
              </button>
            </div>

            {viewMode === 'slider' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="الصورة السابقة"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#161a22] text-slate-700 dark:text-gray-200 shadow-xs hover:border-teal-500 hover:text-teal-700 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="الصورة التالية"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#161a22] text-slate-700 dark:text-gray-200 shadow-xs hover:border-teal-500 hover:text-teal-700 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Presentation Container */}
        {viewMode === 'slider' ? (
          /* RESPONSIVE INTERACTIVE SLIDER VIEW */
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="overflow-hidden rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map((item, idx) => {
                  // Focus display: calculate relative position for smooth multi-card carousel or single card
                  const isCurrent = idx === carouselIndex;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      onClick={() => handleOpenModal(idx)}
                      className={`group relative cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#151922] border shadow-sm transition-all duration-500 ${
                        isCurrent
                          ? 'border-teal-500/60 ring-2 ring-teal-500/20 shadow-lg'
                          : 'border-slate-200/90 dark:border-gray-800 hover:border-teal-500/50 hover:shadow-md'
                      }`}
                    >
                      {/* Image container */}
                      <div className="aspect-[1.3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={item.src}
                          alt={item.alt}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                        />
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span className="rounded-lg bg-teal-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-teal-500/20 shadow-xs">
                          {item.categoryLabelAr}
                        </span>
                      </div>

                      {/* Zoom Trigger Button */}
                      <div className="absolute top-3.5 left-3.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/85 dark:bg-[#12161f]/85 text-slate-800 dark:text-white opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                        <Maximize2 className="h-4 w-4" />
                      </div>

                      {/* Caption Card */}
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-right">
                        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {item.titleAr}
                        </h3>
                        <p className="mt-0.5 text-xs text-teal-200/90 font-medium line-clamp-1">
                          {item.alt}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Slider Dots / Progress Indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              {filteredItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCarouselIndex(idx)}
                  aria-label={`الانتقال للشريحة ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    carouselIndex === idx
                      ? 'w-8 bg-teal-700 dark:bg-teal-400'
                      : 'w-2 bg-slate-300 dark:bg-gray-700 hover:bg-teal-500'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* COMPACT 3-COLUMN GRID VIEW */
          <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleOpenModal(idx)}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#151922] border border-slate-200/90 dark:border-gray-800 shadow-sm transition-all duration-500 hover:border-teal-500/50 hover:shadow-xl"
                >
                  <div className="aspect-[1.3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span className="rounded-lg bg-teal-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-teal-500/20 shadow-xs">
                      {item.categoryLabelAr}
                    </span>
                  </div>

                  <div className="absolute top-3.5 left-3.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/80 dark:bg-[#12161f]/80 text-slate-800 dark:text-white opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                    <Maximize2 className="h-4 w-4" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-right">
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {item.titleAr}
                    </h3>
                    <p className="mt-0.5 text-xs text-teal-200/90 font-medium line-clamp-1">
                      {item.alt}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Advanced Lightbox Modal with Carousel Nav and Thumbnails */}
      <AnimatePresence>
        {currentModalItem && activeModalIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6"
            onClick={() => setActiveModalIndex(null)}
          >
            {/* Close Button */}
            <button
              type="button"
              aria-label="إغلاق المعاينة"
              onClick={() => setActiveModalIndex(null)}
              className="absolute left-4 sm:left-6 top-4 sm:top-6 z-20 grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-white/20 text-white transition hover:bg-white/30 hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Next & Prev Buttons */}
            <button
              type="button"
              aria-label="الصورة السابقة"
              onClick={handlePrevModal}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/50 text-white border border-white/20 transition hover:bg-teal-700 hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <button
              type="button"
              aria-label="الصورة التالية"
              onClick={handleNextModal}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/50 text-white border border-white/20 transition hover:bg-teal-700 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Lightbox Dialog Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] max-w-4xl w-full overflow-hidden rounded-3xl bg-white dark:bg-[#151922] shadow-2xl border border-slate-200/40 dark:border-teal-500/20"
            >
              <div className="aspect-[1.5] max-h-[65vh] w-full overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={currentModalItem.src}
                  alt={currentModalItem.alt}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Caption & Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 text-right bg-white dark:bg-[#161a22] border-t border-slate-100 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block rounded-md bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                      {currentModalItem.categoryLabelAr}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-gray-500">
                      {activeModalIndex + 1} من {filteredItems.length}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {currentModalItem.titleAr}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-300 mt-0.5 font-medium">
                    {currentModalItem.alt}
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
