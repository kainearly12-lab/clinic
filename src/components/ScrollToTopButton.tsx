import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;

          // Toggle visibility threshold
          if (currentScroll > 300) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }

          // Calculate percentage (0 to 100)
          if (totalHeight <= 0) {
            setScrollProgress(0);
          } else {
            const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
            setScrollProgress(progress);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG circular calculation: radius = 20, circumference = 2 * PI * 20 ≈ 125.66
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={scrollToTop}
          aria-label="الرجوع إلى أعلى الصفحة"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-800 dark:text-white backdrop-blur-md border border-slate-200/60 dark:border-white/10 shadow-lg transition-all duration-300 hover:shadow-[0_0_22px_rgba(0,184,169,0.35)] hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/50"
        >
          {/* Circular Scroll Progress Ring */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none p-0.5"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            {/* Background Track Circle */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-slate-200/80 dark:stroke-white/10"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Dynamic Progress Circle */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="#00B8A9"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>

          {/* Arrow Icon */}
          <ArrowUp className="h-5 w-5 text-slate-700 dark:text-[#00B8A9] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-[#00B8A9]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

