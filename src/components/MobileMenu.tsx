import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { navLinks, clinic } from '@/data/clinicData';

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
        className="absolute right-0 top-0 flex h-full w-[84%] max-w-sm flex-col bg-ivory-50 shadow-lift"
        initial={{ x: '100%' }}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-ivory-300 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-charcoal-900 font-display font-bold text-ivory-50">
              A
            </span>
            <span className="font-display font-bold">Androderma</span>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full bg-ivory-200 text-charcoal-800"
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
                  ? 'bg-sage-100 text-charcoal-950'
                  : 'text-charcoal-800 hover:bg-ivory-200'
              }`}
            >
              {link.labelAr}
            </motion.a>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-ivory-300 px-6 py-6">
          <a href={waLink} target="_blank" rel="noreferrer" className="btn-secondary w-full">
            تواصل على واتساب
          </a>
          <a href={`tel:${clinic.phone}`} className="btn-primary w-full">
            احجز موعدك
          </a>
        </div>
      </motion.aside>
    </motion.div>
  );
}
