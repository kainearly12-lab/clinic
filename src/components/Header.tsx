import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Sun, Moon, Stethoscope } from 'lucide-react';
import { navLinks } from '@/data/clinicData';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { MagneticButton } from './ui/MagneticButton';
import { MobileMenu } from './MobileMenu';
import { BookingModal } from './BookingModal';
import { TopScrollProgressBar } from './TopScrollProgressBar';
import { useTheme } from '@/context/ThemeContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useLanguage } from '@/context/LanguageContext';

export interface HeaderProps {
  activeTab?: 'home' | 'diagnostic' | 'admin' | 'about';
  onSelectTab?: (tab: 'home' | 'diagnostic' | 'admin' | 'about', targetAnchor?: string) => void;
  onOpenBooking?: () => void;
}

export function Header({ activeTab = 'home', onSelectTab, onOpenBooking }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme, toggleTheme } = useTheme();
  const { logoUrl, clinicName } = useSiteSettings();
  const { t } = useLanguage();

  useEffect(() => {
    if (activeTab === 'diagnostic') {
      setActiveSection('diagnostic-quiz');
      return;
    }
    if (activeTab === 'about') {
      setActiveSection('about');
      return;
    }

    const ids = navLinks.filter((l) => l.id !== 'diagnostic-quiz' && l.id !== 'about').map((l) => l.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [activeTab]);

  const handleNavClick = (e: React.MouseEvent, linkId: string, href: string) => {
    e.preventDefault();
    if (linkId === 'diagnostic-quiz') {
      if (onSelectTab) {
        onSelectTab('diagnostic');
      } else {
        const el = document.getElementById('diagnostic-quiz');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (linkId === 'about') {
      if (onSelectTab) {
        onSelectTab('about');
      } else {
        window.location.pathname = '/about';
      }
      return;
    }

    if (activeTab === 'diagnostic' || activeTab === 'about') {
      if (onSelectTab) {
        onSelectTab('home', linkId);
      }
    } else {
      const el = document.getElementById(linkId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = href;
      }
    }
  };

  const handleOpenBookingModal = () => {
    if (onOpenBooking) {
      onOpenBooking();
    } else {
      setBookingOpen(true);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-2.5 sm:top-4 inset-x-0 z-50 px-2.5 sm:px-6 pointer-events-none max-w-full overflow-x-hidden"
      >
        <div className="mx-auto max-w-7xl w-full pointer-events-auto">
          {/* Glassmorphism Luxury Floating Header */}
          <div className="relative overflow-hidden backdrop-blur-xl bg-slate-900/75 dark:bg-slate-900/65 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-full px-3.5 sm:px-6 py-2 sm:py-3 transition-all duration-300 hover:border-[#00B8A9]/50 hover:shadow-[0_0_20px_rgba(0,184,169,0.2)] text-white">
            
            <div className="flex items-center justify-between gap-2">
              {/* Brand Logo & Name */}
              <button
                type="button"
                onClick={(e) => handleNavClick(e, 'home', '#home')}
                className="group flex items-center gap-2.5 sm:gap-3 text-start focus:outline-hidden shrink-0 cursor-pointer min-w-0"
                aria-label={clinicName || 'عيادات Androderma'}
              >
                <img
                  src={logoUrl || CLINIC_LOGO}
                  alt="Androderma Logo"
                  className="h-9 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(0,184,169,0.3)] shrink-0"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CLINIC_LOGO;
                  }}
                />
                <div className="flex flex-col text-start min-w-0">
                  <span className="font-display font-black text-sm sm:text-lg tracking-tight text-white group-hover:text-[#00B8A9] transition-colors whitespace-nowrap truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
                    {clinicName || 'عيادات Androderma'}
                  </span>
                  <span className="hidden sm:block text-[10px] font-bold tracking-wider text-teal-300 whitespace-nowrap">
                    {t('nav.tagline')}
                  </span>
                </div>
              </button>

              {/* Desktop Navigation Links with Fluid Active Pill & Micro-Interactions */}
              <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
                {navLinks.map((link) => {
                  const isCurrent =
                    activeTab === 'diagnostic'
                      ? link.id === 'diagnostic-quiz'
                      : activeTab === 'about'
                      ? link.id === 'about'
                      : activeSection === link.id;

                  const label = link.labelAr;

                  return (
                    <motion.button
                      key={link.id}
                      type="button"
                      onClick={(e) => handleNavClick(e, link.id, link.href)}
                      whileHover={{ scale: isCurrent ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className={`relative rounded-full px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-bold transition-colors cursor-pointer select-none ${
                        isCurrent
                          ? 'text-white'
                          : 'text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(0,184,169,0.6)]'
                      }`}
                    >
                      {/* Fluid Active Pill with Layout Animation */}
                      {isCurrent && (
                        <motion.div
                          layoutId="navbar-active-indicator"
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 30,
                          }}
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 via-[#00B8A9] to-emerald-500 shadow-[0_0_16px_rgba(0,184,169,0.5)] z-0"
                        />
                      )}

                      <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                        {link.id === 'diagnostic-quiz' && (
                          <Stethoscope className="h-3.5 w-3.5 text-teal-200" />
                        )}
                        <span>{label}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* Header Actions: Theme Toggle + Booking CTA + Mobile Menu */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Dark / Light Mode Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white shadow-xs transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-[#00B8A9]/40 cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-300 transition-transform duration-300 hover:rotate-45" />
                  ) : (
                    <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-teal-300 transition-transform duration-300 hover:-rotate-12" />
                  )}
                </button>

                {/* Primary Magnetic Booking Button - Hidden on mobile (< md) to keep top bar uncluttered and prevent horizontal overflow */}
                <div className="hidden md:block">
                  <MagneticButton
                    onClick={handleOpenBookingModal}
                    className="btn-primary py-2 px-3.5 sm:px-5 text-xs sm:text-sm font-bold shadow-sm hover:shadow-[0_0_20px_rgba(0,184,169,0.3)] transition-all duration-300 whitespace-nowrap cursor-pointer"
                  >
                    {t('nav.bookNow')}
                  </MagneticButton>
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  aria-label={t('nav.menu')}
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white shadow-xs transition-all hover:bg-white/20 lg:hidden cursor-pointer active:scale-95"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Top Scroll Progress Bar: Seamlessly Flush at the bottom edge of the navbar pill */}
            <div className="absolute inset-x-0 bottom-0">
              <TopScrollProgressBar />
            </div>

          </div>
        </div>
      </motion.header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active={activeTab === 'diagnostic' ? 'diagnostic-quiz' : activeTab === 'about' ? 'about' : activeSection}
        onSelectTab={(tab, anchor) => {
          setMenuOpen(false);
          if (onSelectTab) onSelectTab(tab, anchor);
        }}
        onOpenBooking={handleOpenBookingModal}
      />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}

