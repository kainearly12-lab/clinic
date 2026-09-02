import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  X,
  Sun,
  Moon,
  Stethoscope,
  Home,
  Sparkles,
  MapPin,
  Star,
  Users,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { navLinks, clinic } from '@/data/clinicData';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { useTheme } from '@/context/ThemeContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useLanguage } from '@/context/LanguageContext';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  active: string;
  onSelectTab?: (tab: 'home' | 'diagnostic' | 'admin' | 'about', targetAnchor?: string) => void;
  onOpenBooking?: () => void;
}

export function MobileMenu({ open, onClose, active, onSelectTab, onOpenBooking }: MobileMenuProps) {
  const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;
  const { theme, toggleTheme } = useTheme();
  const { logoUrl, clinicName } = useSiteSettings();
  const { t, isRTL, language } = useLanguage();

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'home':
        return <Home className="h-4.5 w-4.5" />;
      case 'services':
        return <Sparkles className="h-4.5 w-4.5" />;
      case 'treatment-journey':
        return <ShieldCheck className="h-4.5 w-4.5" />;
      case 'contact':
        return <MapPin className="h-4.5 w-4.5" />;
      case 'reviews':
        return <Star className="h-4.5 w-4.5" />;
      case 'diagnostic-quiz':
        return <Stethoscope className="h-4.5 w-4.5" />;
      case 'about':
        return <Users className="h-4.5 w-4.5" />;
      default:
        return <Sparkles className="h-4.5 w-4.5" />;
    }
  };

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

  const handleBookingClick = () => {
    onClose();
    if (onOpenBooking) {
      onOpenBooking();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] lg:hidden"
      initial={false}
      animate={open ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.aside
        className={`absolute top-0 flex h-full w-[88%] max-w-sm flex-col bg-white dark:bg-[#12151b] text-slate-900 dark:text-white shadow-2xl overflow-y-auto max-h-[100dvh] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] ${
          isRTL ? 'right-0' : 'left-0'
        }`}
        initial={{ x: isRTL ? '100%' : '-100%' }}
        animate={{ x: open ? 0 : isRTL ? '100%' : '-100%' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-gray-800/80 px-5 py-4 shrink-0 bg-slate-50/70 dark:bg-[#151820]">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logoUrl || CLINIC_LOGO}
              alt="Androderma Logo"
              className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,184,169,0.3)] shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = CLINIC_LOGO;
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-base sm:text-lg font-extrabold leading-tight text-slate-900 dark:text-white truncate">
                {clinicName || 'عيادات Androderma'}
              </span>
              <span className="text-[10px] font-bold tracking-wider text-teal-600 dark:text-teal-400 truncate">
                {t('nav.tagline')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('nav.close')}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-200/70 dark:bg-gray-800 text-slate-800 dark:text-gray-200 transition hover:bg-slate-300 dark:hover:bg-gray-700 cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Switcher Banner */}
        <div className="px-4 pt-3 pb-1 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-gray-800/80 border border-slate-200/90 dark:border-gray-700/60 text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            <span className="flex items-center gap-2 text-slate-800 dark:text-gray-200">
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-teal-600" />
              )}
              <span>{theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/50 dark:border-teal-800/50">
              {t('nav.switch')}
            </span>
          </button>
        </div>

        {/* Navigation Links Vertical Stack */}
        <nav className="flex flex-col gap-1 px-3 py-2">
          {navLinks.map((link, i) => {
            const label = link.labelAr;
            const isCurrent = active === link.id;

            return (
              <motion.button
                key={link.id}
                type="button"
                onClick={(e) => handleLinkClick(e, link.id, link.href)}
                initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
                animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: isRTL ? 15 : -15 }}
                transition={{ delay: 0.03 + i * 0.04, duration: 0.3 }}
                className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-bold text-start transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-r from-teal-500 via-[#00B8A9] to-emerald-500 text-white shadow-[0_4px_16px_rgba(0,184,169,0.35)]'
                    : 'text-slate-700 dark:text-gray-200 hover:bg-slate-100/90 dark:hover:bg-gray-800/80 active:scale-[0.99]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-lg ${
                      isCurrent
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400'
                    }`}
                  >
                    {getSectionIcon(link.id)}
                  </span>
                  <span>{label}</span>
                </span>
                {isRTL ? (
                  <ChevronLeft
                    className={`h-4 w-4 ${isCurrent ? 'text-white' : 'text-slate-400 dark:text-gray-500'}`}
                  />
                ) : (
                  <ChevronRight
                    className={`h-4 w-4 ${isCurrent ? 'text-white' : 'text-slate-400 dark:text-gray-500'}`}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Drawer Actions & CTAs */}
        <div className="mt-auto space-y-3.5 border-t border-slate-200/80 dark:border-gray-800/80 px-4 pt-4 shrink-0 bg-slate-50/50 dark:bg-[#12151b]">
          {/* Glowing Primary CTA Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleBookingClick}
            className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-[#00B8A9] to-emerald-600 py-3.5 px-4 text-center text-sm font-black text-white shadow-[0_0_20px_rgba(0,184,169,0.4)] transition-all hover:shadow-[0_0_28px_rgba(0,184,169,0.6)] cursor-pointer flex items-center justify-center gap-2"
          >
            <CalendarDays className="h-4.5 w-4.5 text-teal-100" />
            <span>{language === 'en' ? 'Book Your Consultation Now 📅' : 'احجز كشفك الآن 📅'}</span>
          </motion.button>

          {/* Quick WhatsApp Action Button */}
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 text-xs font-bold transition-colors shadow-xs"
          >
            <MessageCircle className="h-4 w-4" />
            <span>تواصل عبر واتساب</span>
          </a>

          {/* Direct Phone & Email Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href={`tel:${clinic.phone}`}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-800/70 p-2 text-[11px] font-medium text-slate-800 dark:text-gray-200 transition hover:border-teal-400"
            >
              <Phone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span dir="ltr">{clinic.phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${clinic.email}`}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-800/70 p-2 text-[11px] font-medium text-slate-800 dark:text-gray-200 transition hover:border-teal-400 truncate"
            >
              <Mail className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">البريد الإلكتروني</span>
            </a>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

