import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Sun, Moon, Stethoscope } from 'lucide-react';
import { navLinks, clinic } from '@/data/clinicData';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { MobileMenu } from './MobileMenu';
import { BookingModal } from './BookingModal';
import { TopScrollProgressBar } from './TopScrollProgressBar';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  activeTab?: 'home' | 'diagnostic';
  onSelectTab?: (tab: 'home' | 'diagnostic', targetAnchor?: string) => void;
  onOpenBooking?: () => void;
}

export function Header({ activeTab = 'home', onSelectTab, onOpenBooking }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (activeTab === 'diagnostic') {
      setActiveSection('diagnostic-quiz');
      return;
    }

    const ids = navLinks.filter((l) => l.id !== 'diagnostic-quiz').map((l) => l.id);
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

    if (activeTab === 'diagnostic') {
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
        className="fixed top-2.5 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none"
      >
        <div className="mx-auto max-w-7xl w-full pointer-events-auto">
          {/* Glassmorphism Luxury Floating Header */}
          <div className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 dark:bg-slate-900/40 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 hover:border-[#00B8A9]/50 hover:shadow-[0_0_20px_rgba(0,184,169,0.2)] text-white">
            
            <div className="flex items-center justify-between">
              {/* Brand Logo & Name */}
              <button
                type="button"
                onClick={(e) => handleNavClick(e, 'home', '#home')}
                className="group flex items-center gap-3 text-right focus:outline-hidden"
                aria-label={clinic.name}
              >
                <img
                  src={CLINIC_LOGO}
                  alt="Androderma Logo"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(0,184,169,0.3)]"
                  loading="eager"
                />
                <div className="flex flex-col">
                  <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-[#00B8A9] transition-colors">
                    عيادات Androderma
                  </span>
                  <span className="hidden sm:block text-[10px] font-bold tracking-wider text-teal-300">
                    عناية متقدمة بالجلدية والليزر
                  </span>
                </div>
              </button>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
                {navLinks.map((link) => {
                  const isCurrent =
                    activeTab === 'diagnostic'
                      ? link.id === 'diagnostic-quiz'
                      : activeSection === link.id;

                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={(e) => handleNavClick(e, link.id, link.href)}
                      className={`relative rounded-full px-3.5 py-1.5 text-xs xl:text-sm font-bold transition-all duration-200 ${
                        isCurrent
                          ? 'text-white bg-[#00B8A9] shadow-[0_0_12px_rgba(0,184,169,0.4)]'
                          : 'text-gray-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {link.id === 'diagnostic-quiz' ? (
                        <span className="flex items-center gap-1">
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>{link.labelAr}</span>
                        </span>
                      ) : (
                        link.labelAr
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Header Actions: Theme Toggle + Booking CTA + Mobile Menu */}
              <div className="flex items-center gap-2">
                {/* Dark / Light Mode Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white shadow-xs transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-[#00B8A9]/40"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4.5 w-4.5 text-amber-300 transition-transform duration-300 hover:rotate-45" />
                  ) : (
                    <Moon className="h-4.5 w-4.5 text-teal-300 transition-transform duration-300 hover:-rotate-12" />
                  )}
                </button>

                {/* Primary Booking Button */}
                <button
                  type="button"
                  onClick={handleOpenBookingModal}
                  className="btn-primary py-2 px-4 sm:px-5 text-xs sm:text-sm font-bold shadow-sm hover:shadow-[0_0_20px_rgba(0,184,169,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  احجز كشفك الآن
                </button>

                {/* Mobile Hamburger Menu */}
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  aria-label="القائمة الرئيسية"
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white shadow-xs transition-all hover:bg-white/20 lg:hidden"
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
        active={activeTab === 'diagnostic' ? 'diagnostic-quiz' : activeSection}
        onSelectTab={(tab, anchor) => {
          setMenuOpen(false);
          if (onSelectTab) onSelectTab(tab, anchor);
        }}
      />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
