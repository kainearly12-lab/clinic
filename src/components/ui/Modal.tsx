import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}

export function Modal({ open, onClose, children, labelledBy }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
        >
          <div
            className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-3xl bg-ivory-50 dark:bg-[#15181e] text-charcoal-900 dark:text-gray-100 shadow-2xl ring-1 ring-charcoal-900/10 dark:ring-white/10 sm:rounded-3xl"
            initial={{ y: 30, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-ivory-200/80 dark:bg-gray-800 text-charcoal-800 dark:text-gray-200 transition-colors hover:bg-ivory-300 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
