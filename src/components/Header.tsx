import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { navLinks, clinic } from '@/data/clinicData';
import { LogoMark } from './LogoMark';
import { MobileMenu } from './MobileMenu';
import { BookingModal } from './BookingModal';
import { TopScrollProgressBar } from './TopScrollProgressBar';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [active, setActive] = useState('home');

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
        <div className="mx-auto max-w-7xl w-full flex flex-col items-center gap-1.5 pointer-events-auto">
          {/* Main Floating Glassmorphic Container */}
          <div className="w-full backdrop-blur-md bg-white/85 border border-gray-200/70 shadow-md rounded-2xl sm:rounded-full px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-300">
            
            {/* Brand Logo & Name */}
            <a href="#home" className="group flex items-center gap-3" aria-label={clinic.name}>
              <LogoMark size="sm" />
              <div className="flex flex-col">
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-charcoal-950">
                  عيادات Androderma
                </span>
                <span className="hidden sm:block text-[10px] font-bold tracking-wider text-sage-700">
                  عناية متقدمة بالجلدية والليزر
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-ivory-100/70 p-1 rounded-full border border-ivory-200/60">
              {navLinks.map((link) => {
                const isActive = active === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    className={`relative rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'text-ivory-50 bg-charcoal-900 shadow-sm'
                        : 'text-charcoal-800/80 hover:text-charcoal-950 hover:bg-white/80'
                    }`}
                  >
                    {link.labelAr}
                  </a>
                );
              })}
            </nav>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
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
                className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white/90 text-charcoal-900 shadow-sm transition-all hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

          </div>

          {/* Fixed Scroll Progress Bar directly underneath navbar */}
          <div className="w-full max-w-7xl px-2">
            <TopScrollProgressBar />
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
