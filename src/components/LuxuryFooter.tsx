import { Mail, Phone, MapPin, Instagram, Facebook, ArrowUpLeft } from 'lucide-react';
import { clinic, branches, navLinks } from '@/data/clinicData';
import { LogoMark } from './LogoMark';

export function LuxuryFooter() {
  return (
    <footer className="relative bg-[#121417] text-white overflow-hidden pt-16 sm:pt-20 pb-28 sm:pb-12 border-t border-charcoal-800">
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-sage-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-sage-700/10 blur-3xl" />

      <div className="container-px relative z-10">
        {/* Main 3-Column Luxury Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          
          {/* Column 1: Brand Identity & About (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3.5">
                <LogoMark size="lg" className="ring-1 ring-white/20" />
                <div className="flex flex-col">
                  <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    عيادات Androderma
                  </span>
                  <span className="text-xs font-bold tracking-wider text-sage-300">
                    عناية متقدمة بالجلدية والليزر
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-gray-300/80 max-w-md">
                {clinic.taglineAr} — صرح طبي متكامل يجمع بين أحدث تقنيات الليزر والعناية بالبشرة تحت إشراف نخبة من كبار أطباء الجلدية والتجميل في مصر.
              </p>
            </div>

            {/* Social Media & Contact Shortcuts */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.instagram.com/androdermaclinic/?hl=ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-sage-600 hover:text-white hover:border-sage-500 shadow-sm"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://web.facebook.com/androdermaclinic/?locale=ar_AR&_rdc=1&_rdr#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-sage-600 hover:text-white hover:border-sage-500 shadow-sm"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                <a
                  href={`tel:${clinic.phone}`}
                  className="inline-flex items-center gap-1.5 hover:text-sage-300 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-sage-400" />
                  <span dir="ltr">{clinic.phoneDisplay}</span>
                </a>
                <span className="text-white/20">•</span>
                <a
                  href={`mailto:${clinic.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-sage-300 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-sage-400" />
                  {clinic.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links & Services (3 cols) */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-sage-300 uppercase">
              روابط سريعة
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300/85 font-medium">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-[-4px] transition-all duration-200"
                  >
                    <ArrowUpLeft className="h-3.5 w-3.5 text-sage-400 opacity-70" />
                    {link.labelAr}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Clinic Branches Directory (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-sage-300 uppercase">
              فروعنا في القاهرة والجيزة
            </h3>
            <div className="grid grid-cols-1 gap-3 text-xs">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 dark:border-emerald-500/20 hover:border-sage-500/40 dark:hover:border-emerald-500/50 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span className="flex items-center gap-1.5 text-sage-300">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {b.nameAr}
                    </span>
                    <span className="text-[11px] font-mono text-gray-300" dir="ltr">
                      {b.phones[0]?.display}
                    </span>
                  </div>
                  <p className="text-gray-400 line-clamp-1 text-[11px] leading-relaxed">
                    {b.addressAr}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Developer Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span>© {new Date().getFullYear()} عيادات Androderma. جميع الحقوق محفوظة.</span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="text-gray-400">العناية التي تبدأ من الفهم والتطور الطبي</span>
          </div>

          {/* Developer Credit explicitly preserved */}
          <div className="text-center text-xs text-gray-400">
            Developed by{' '}
            <a
              href="https://www.instagram.com/mostavaahmed_/?utm_source=ig_web_button_share_sheet"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white underline hover:text-sage-300 transition-colors"
            >
              Mostafa Ahmed
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
