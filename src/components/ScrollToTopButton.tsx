import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={scrollToTop}
          aria-label="الرجوع إلى أعلى الصفحة"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal-900/90 dark:bg-gray-800/90 text-ivory-50 dark:text-white backdrop-blur-md border border-white/20 dark:border-gray-700/60 shadow-xl transition-all duration-300 hover:bg-sage-600 dark:hover:bg-sage-600 hover:border-sage-400/50 dark:hover:border-emerald-500/50 hover:scale-110 hover:shadow-2xl dark:shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] active:scale-95 group"
        >
          <ArrowUp className="h-5 w-5 text-ivory-100 transition-transform duration-300 group-hover:-translate-y-1 group-hover:text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
