import { motion } from 'framer-motion';
import { Mail, Phone, X, Sun, Moon } from 'lucide-react';
import { navLinks, clinic } from '@/data/clinicData';
import { LogoMark } from './LogoMark';
import { useTheme } from '@/context/ThemeContext';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  active: string;
}

export function MobileMenu({ open, onClose, active }: MobileMenuProps) {
  const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      className="fixed inset-0 z-[60] lg:hidden"
      initial={false}
      animate={open ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-ivory-50 dark:bg-[#15181e] text-charcoal-950 dark:text-white shadow-lift overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-ivory-300 dark:border-gray-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <LogoMark size="md" />
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold leading-tight text-charcoal-950 dark:text-white">عيادات Androderma</span>
              <span className="text-[10px] font-bold tracking-wider text-sage-700 dark:text-sage-300">عناية متقدمة بالجلدية والليزر</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full bg-ivory-200 dark:bg-gray-800 text-charcoal-800 dark:text-gray-200 transition hover:bg-ivory-300 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Switcher within Mobile Menu */}
        <div className="px-6 pt-4 pb-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-ivory-200/70 dark:bg-gray-800/80 border border-ivory-300/60 dark:border-gray-700/60 text-xs font-bold transition-all hover:bg-ivory-200 dark:hover:bg-gray-700"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-sage-600" />}
              {theme === 'dark' ? 'الوضع النهاري (Light Mode)' : 'الوضع الليلي (Dark Mode)'}
            </span>
            <span className="text-[10px] uppercase font-bold text-sage-600 dark:text-sage-300">
              {theme === 'dark' ? 'تفعيل' : 'تفعيل'}
            </span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.id}
              href={link.href}
              onClick={onClose}
              initial={{ opacity: 0, x: 20 }}
              animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
              className={`rounded-2xl px-4 py-3.5 text-base font-bold transition-colors ${
                active === link.id
                  ? 'bg-sage-100 dark:bg-sage-900/40 font-bold text-sage-800 dark:text-sage-300'
                  : 'text-charcoal-800 dark:text-gray-200 hover:bg-ivory-200 dark:hover:bg-gray-800'
              }`}
            >
              {link.labelAr}
            </motion.a>
          ))}
        </nav>

        <div className="mt-auto space-y-4 border-t border-ivory-300 dark:border-gray-800 px-6 py-6 text-xs text-charcoal-800/75 dark:text-gray-400">
          <div className="space-y-2">
            <a
              href={`mailto:${clinic.email}`}
              className="flex items-center gap-2.5 rounded-xl border border-ivory-300/80 dark:border-gray-800 bg-ivory-100/70 dark:bg-gray-800/60 px-3.5 py-2.5 text-xs text-charcoal-900 dark:text-gray-200 transition hover:border-sage-400"
            >
              <Mail className="h-3.5 w-3.5 text-sage-600 dark:text-sage-400 shrink-0" />
              <span className="font-medium text-[11px]">{clinic.email}</span>
            </a>
            <a
              href={`tel:${clinic.phone}`}
              className="flex items-center gap-2.5 rounded-xl border border-ivory-300/80 dark:border-gray-800 bg-ivory-100/70 dark:bg-gray-800/60 px-3.5 py-2.5 text-xs text-charcoal-900 dark:text-gray-200 transition hover:border-sage-400"
            >
              <Phone className="h-3.5 w-3.5 text-sage-600 dark:text-sage-400 shrink-0" />
              <span dir="ltr" className="font-medium text-xs">{clinic.phoneDisplay}</span>
            </a>
          </div>

          <div className="space-y-2.5 pt-1">
            <a href={waLink} target="_blank" rel="noreferrer" className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700 w-full text-center">
              تواصل على واتساب
            </a>
            <a href={`tel:${clinic.phone}`} className="btn-primary w-full text-center">
              اتصل للحجز الآن
            </a>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
