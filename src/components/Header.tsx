import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Sun, Moon } from 'lucide-react';
import { navLinks, clinic } from '@/data/clinicData';
import { LogoMark } from './LogoMark';
import { MobileMenu } from './MobileMenu';
import { BookingModal } from './BookingModal';
import { TopScrollProgressBar } from './TopScrollProgressBar';
import { useTheme } from '@/context/ThemeContext';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [active, setActive] = useState('home');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const ids = navLinks.map((l) => l.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-2.5 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none"
      >
        <div className="mx-auto max-w-7xl w-full pointer-events-auto">
          {/* Main Ultra-Transparent Glassmorphic Container matching Floating Light Glass Dock */}
          <div className="relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-[#12141a]/85 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-xl rounded-2xl sm:rounded-full transition-all duration-300">
            
            <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
              {/* Brand Logo & Name */}
              <a href="#home" className="group flex items-center gap-3" aria-label={clinic.name}>
                <LogoMark size="sm" />
                <div className="flex flex-col">
                  <span className="font-display font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                    عيادات Androderma
                  </span>
                  <span className="hidden sm:block text-[10px] font-bold tracking-wider text-teal-700 dark:text-teal-400">
                    عناية متقدمة بالجلدية والليزر
                  </span>
                </div>
              </a>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 dark:bg-charcoal-800/60 p-1 rounded-full border border-slate-200/60 dark:border-white/10">
                {navLinks.map((link) => {
                  const isActive = active === link.id;
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      className={`relative rounded-full px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                        isActive
                          ? 'text-white bg-teal-700 dark:bg-teal-600 shadow-xs'
                          : 'text-slate-700 dark:text-gray-200 hover:text-teal-800 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'
                      }`}
                    >
                      {link.labelAr}
                    </a>
                  );
                })}
              </nav>

              {/* Header Actions: Theme Toggle + Booking CTA + Mobile Menu */}
              <div className="flex items-center gap-2">
                {/* Dark / Light Mode Toggle Button */}
                <button
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-slate-200/90 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/70 text-slate-800 dark:text-yellow-300 shadow-xs transition-all duration-300 hover:scale-105 hover:bg-white dark:hover:bg-gray-800"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4.5 w-4.5 text-amber-300 transition-transform duration-300 hover:rotate-45" />
                  ) : (
                    <Moon className="h-4.5 w-4.5 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
                  )}
                </button>

                {/* Primary Booking Button */}
                <button
                  onClick={() => setBookingOpen(true)}
                  className="btn-primary py-2 px-4 sm:px-5 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  احجز كشفك الآن
                </button>

                {/* Mobile Hamburger Menu */}
                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="القائمة الرئيسية"
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800 text-slate-900 dark:text-white shadow-xs transition-all hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
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

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
