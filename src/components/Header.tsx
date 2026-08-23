import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu } from 'lucide-react';
import { navLinks, clinic } from '@/data/clinicData';
import { MobileMenu } from './MobileMenu';
import { BookingModal } from './BookingModal';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [active, setActive] = useState('home');
  const { scrollY } = useScroll();
  const compact = useTransform(scrollY, [0, 80], [false, true]);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const unsub = compact.on('change', (v) => setIsCompact(v));
    return () => unsub();
  }, [compact]);

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
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isCompact ? 'glass border-b border-ivory-300/60' : 'bg-transparent'
        }`}
      >
        <div className="container-px">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              isCompact ? 'h-14' : 'h-20'
            }`}
          >
            <a href="#home" className="group flex items-center gap-2.5" aria-label={clinic.name}>
              <span
                className={`grid place-items-center rounded-xl bg-charcoal-900 font-display font-bold text-ivory-50 transition-all duration-300 ${
                  isCompact ? 'h-8 w-8 text-base' : 'h-10 w-10 text-lg'
                }`}
              >
                A
              </span>
              <span className="flex flex-col leading-tight">
                <span
                  className={`font-display font-bold tracking-tight transition-all duration-300 ${
                    isCompact ? 'text-sm' : 'text-base'
                  }`}
                >
                  Androderma
                </span>
                <span
                  className={`text-[10px] font-medium uppercase tracking-[0.22em] text-sage-600 transition-opacity duration-300 ${
                    isCompact ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  Laser Clinic
                </span>
              </span>
            </a>

            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    active === link.id
                      ? 'text-charcoal-950'
                      : 'text-charcoal-800/70 hover:text-charcoal-950'
                  }`}
                >
                  {link.labelAr}
                  {active === link.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-px h-px bg-sage-500"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost hidden text-sage-700 hover:bg-sage-100 sm:inline-flex"
              >
                واتساب
              </a>
              <button
                onClick={() => setBookingOpen(true)}
                className="btn-primary hidden sm:inline-flex"
              >
                احجز موعدك
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="القائمة"
                className="grid h-10 w-10 place-items-center rounded-full border border-ivory-300 bg-ivory-50/70 text-charcoal-900 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
