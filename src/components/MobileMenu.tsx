import { motion } from 'framer-motion';
import { Mail, Phone, X } from 'lucide-react';
import { navLinks, clinic } from '@/data/clinicData';
import { LogoMark } from './LogoMark';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  active: string;
}

export function MobileMenu({ open, onClose, active }: MobileMenuProps) {
  const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;

  return (
    <motion.div
      className="fixed inset-0 z-[60] lg:hidden"
      initial={false}
      animate={open ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-charcoal-950/40 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-ivory-50 shadow-lift overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-ivory-300 px-6 py-5">
          <div className="flex items-center gap-3">
            <LogoMark size="sm" />
            <div className="flex flex-col">
              <span className="font-display font-bold leading-none text-charcoal-950">Androderma</span>
              <span className="text-[10px] font-medium tracking-widest text-sage-600 uppercase">Laser Clinic</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full bg-ivory-200 text-charcoal-800 transition hover:bg-ivory-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-6">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.id}
              href={link.href}
              onClick={onClose}
              initial={{ opacity: 0, x: 20 }}
              animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
              className={`rounded-2xl px-4 py-3.5 text-base font-medium transition-colors ${
                active === link.id
                  ? 'bg-sage-100 font-semibold text-charcoal-950'
                  : 'text-charcoal-800 hover:bg-ivory-200'
              }`}
            >
              {link.labelAr}
            </motion.a>
          ))}
        </nav>

        <div className="mt-auto space-y-4 border-t border-ivory-300 px-6 py-6 text-xs text-charcoal-800/75">
          <div className="space-y-2">
            <a
              href={`mailto:${clinic.email}`}
              className="flex items-center gap-2.5 rounded-xl border border-ivory-300/80 bg-ivory-100/70 px-3.5 py-2.5 text-xs text-charcoal-900 transition hover:border-sage-400"
            >
              <Mail className="h-3.5 w-3.5 text-sage-600 shrink-0" />
              <span className="font-medium text-[11px]">{clinic.email}</span>
            </a>
            <a
              href={`tel:${clinic.phone}`}
              className="flex items-center gap-2.5 rounded-xl border border-ivory-300/80 bg-ivory-100/70 px-3.5 py-2.5 text-xs text-charcoal-900 transition hover:border-sage-400"
            >
              <Phone className="h-3.5 w-3.5 text-sage-600 shrink-0" />
              <span dir="ltr" className="font-medium text-xs">{clinic.phoneDisplay}</span>
            </a>
          </div>

          <div className="space-y-2.5 pt-1">
            <a href={waLink} target="_blank" rel="noreferrer" className="btn-secondary w-full text-center">
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
