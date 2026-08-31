import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '@/types/admin';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.5)] border backdrop-blur-xl ${
              t.type === 'success'
                ? 'bg-slate-900/90 border-[#00B8A9]/50 text-white'
                : t.type === 'error'
                ? 'bg-slate-900/90 border-red-500/50 text-white'
                : 'bg-slate-900/90 border-teal-500/30 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && (
                <div className="w-8 h-8 rounded-full bg-[#00B8A9]/20 flex items-center justify-center shrink-0 border border-[#00B8A9]/40">
                  <CheckCircle2 className="w-4 h-4 text-[#00B8A9]" />
                </div>
              )}
              {t.type === 'error' && (
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/40">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
              )}
              {t.type === 'info' && (
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 border border-teal-500/40">
                  <Info className="w-4 h-4 text-teal-300" />
                </div>
              )}
              <span className="text-xs font-bold leading-relaxed">{t.message}</span>
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
