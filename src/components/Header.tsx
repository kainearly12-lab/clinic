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
          {/* Main Ultra-Transparent Glassmorphic Container matching Center K */}
          <div className="relative overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/40 dark:border-gray-800/40 shadow-xl rounded-2xl sm:rounded-full transition-all duration-300">
            
            <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
              {/* Brand Logo & Name */}
              <a href="#home" className="group flex items-center gap-3" aria-label={clinic.name}>
                <LogoMark size="sm" />
                <div className="flex flex-col">
                  <span className="font-display font-black text-lg sm:text-xl tracking-tight text-charcoal-950 dark:text-white">
                    عيادات Androderma
                  </span>
                  <span className="hidden sm:block text-[10px] font-bold tracking-wider text-sage-700 dark:text-sage-300">
                    عناية متقدمة بالجلدية والليزر
                  </span>
                </div>
              </a>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1.5 bg-ivory-100/60 dark:bg-charcoal-800/60 p-1 rounded-full border border-ivory-200/50 dark:border-white/10">
                {navLinks.map((link) => {
                  const isActive = active === link.id;
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      className={`relative rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                        isActive
                          ? 'text-ivory-50 bg-charcoal-900 dark:bg-sage-600 dark:text-white shadow-sm'
                          : 'text-charcoal-800/80 dark:text-gray-200/90 hover:text-charcoal-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'
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
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/40 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 text-charcoal-900 dark:text-yellow-300 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-white dark:hover:bg-gray-800"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4.5 w-4.5 text-amber-300 transition-transform duration-300 hover:rotate-45" />
                  ) : (
                    <Moon className="h-4.5 w-4.5 text-charcoal-800 transition-transform duration-300 hover:-rotate-12" />
                  )}
                </button>

                {/* Primary Booking Button */}
                <button
                  onClick={() => setBookingOpen(true)}
                  className="btn-primary py-2.5 px-4 sm:px-6 text-xs sm:text-sm font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  احجز موعدك
                </button>

                {/* Mobile Hamburger Menu */}
                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="القائمة الرئيسية"
                  className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800 text-charcoal-900 dark:text-white shadow-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
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
