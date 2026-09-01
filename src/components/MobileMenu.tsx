import { motion } from 'framer-motion';
import { Mail, Phone, X, Sun, Moon, Stethoscope } from 'lucide-react';
import { navLinks, clinic } from '@/data/clinicData';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { useTheme } from '@/context/ThemeContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  active: string;
  onSelectTab?: (tab: 'home' | 'diagnostic' | 'admin' | 'about', targetAnchor?: string) => void;
}

export function MobileMenu({ open, onClose, active, onSelectTab }: MobileMenuProps) {
  const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;
  const { theme, toggleTheme } = useTheme();
  const { logoUrl, clinicName } = useSiteSettings();

  const handleLinkClick = (e: React.MouseEvent, linkId: string, href: string) => {
    e.preventDefault();
    onClose();
    if (linkId === 'diagnostic-quiz') {
      if (onSelectTab) {
        onSelectTab('diagnostic');
      } else {
        const el = document.getElementById('diagnostic-quiz');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (linkId === 'about') {
      if (onSelectTab) {
        onSelectTab('about');
      } else {
        window.location.pathname = '/about';
      }
    } else {
      if (onSelectTab) {
        onSelectTab('home', linkId);
      } else {
        const el = document.getElementById(linkId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.hash = href;
        }
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] lg:hidden"
      initial={false}
      animate={open ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      <motion.aside
        className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white dark:bg-[#15181e] text-slate-900 dark:text-white shadow-2xl overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl || CLINIC_LOGO}
              alt="Androderma Logo"
              className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,184,169,0.3)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = CLINIC_LOGO;
              }}
            />
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold leading-tight text-slate-900 dark:text-white">
                {clinicName || 'عيادات Androderma'}
              </span>
              <span className="text-[10px] font-bold tracking-wider text-teal-700 dark:text-teal-400">عناية متقدمة بالجلدية والليزر</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200 transition hover:bg-slate-200 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>


        {/* Theme Switcher within Mobile Menu */}
        <div className="px-6 pt-4 pb-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-100/90 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700/60 text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-gray-700"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-teal-600" />}
              {theme === 'dark' ? 'الوضع النهاري (Light Mode)' : 'الوضع الليلي (Dark Mode)'}
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300">
              تبديل
            </span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link, i) => (
            <motion.button
              key={link.id}
              type="button"
              onClick={(e) => handleLinkClick(e, link.id, link.href)}
              initial={{ opacity: 0, x: 20 }}
              animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
              className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-bold text-right transition-colors ${
                active === link.id
                  ? 'bg-teal-50 dark:bg-teal-900/40 font-bold text-teal-800 dark:text-teal-300'
                  : 'text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{link.labelAr}</span>
              {link.id === 'diagnostic-quiz' && (
                <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              )}
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 border-t border-slate-200 dark:border-gray-800 px-6 py-6 text-xs text-slate-700 dark:text-gray-400">
          <div className="space-y-2">
            <a
              href={`mailto:${clinic.email}`}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-gray-200 transition hover:border-teal-400"
            >
              <Mail className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="font-medium text-[11px]">{clinic.email}</span>
            </a>
            <a
              href={`tel:${clinic.phone}`}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-gray-200 transition hover:border-teal-400"
            >
              <Phone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
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
