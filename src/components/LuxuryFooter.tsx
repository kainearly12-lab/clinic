import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, ArrowUpLeft, ArrowUpRight, Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clinic, branches, navLinks } from '@/data/clinicData';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useLanguage } from '@/context/LanguageContext';

interface LuxuryFooterProps {
  onOpenAdmin?: () => void;
}

export function LuxuryFooter({ onOpenAdmin }: LuxuryFooterProps) {
  const { logoUrl, clinicName, phone: dynamicPhone, contactPhone, email: dynamicEmail, facebookUrl, instagramUrl, tiktokUrl, youtubeUrl, vezeetaUrl, settings } = useSiteSettings();
  const { language, t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowUpLeft : ArrowUpRight;

  const displayPhone = (contactPhone && contactPhone.trim().length > 0)
    ? contactPhone.trim()
    : (dynamicPhone && dynamicPhone.trim().length > 0)
    ? dynamicPhone.trim()
    : (settings.whatsapp_number && settings.whatsapp_number.trim().length > 0)
    ? settings.whatsapp_number.trim()
    : clinic.phoneDisplay;
  const activeEmail = dynamicEmail || clinic.email;

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
                <img
                  src={logoUrl || CLINIC_LOGO}
                  alt="Androderma Logo"
                  className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,184,169,0.3)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CLINIC_LOGO;
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {clinicName || (language === 'en' ? 'Androderma Clinics' : 'عيادات Androderma')}
                  </span>
                  <span className="text-xs font-bold tracking-wider text-sage-300">
                    {t('nav.tagline')}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-gray-300/80 max-w-md">
                {t('footer.tagline')}
              </p>
            </div>

            {/* Social Media & Contact Shortcuts */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <div className="flex items-center gap-2.5">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-teal-600 hover:text-white hover:border-teal-500 shadow-sm"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-teal-600 hover:text-white hover:border-teal-500 shadow-sm"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-teal-600 hover:text-white hover:border-teal-500 shadow-sm"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.88-4.49v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.88-.09z"/>
                    </svg>
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-teal-600 hover:text-white hover:border-teal-500 shadow-sm"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                <a
                  href={`tel:${displayPhone}`}
                  className="inline-flex items-center gap-1.5 hover:text-teal-300 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-teal-400" />
                  <span dir="ltr">{displayPhone}</span>
                </a>
                <span className="text-white/20">•</span>
                <a
                  href={`mailto:${activeEmail}`}
                  className="inline-flex items-center gap-1.5 hover:text-teal-300 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-teal-400" />
                  {activeEmail}
                </a>
              </div>
            </div>

            {/* Official Booking Channels: Vezeeta Integration */}
            <div className="pt-3 border-t border-white/10">
              <span className="block text-[11px] font-bold text-gray-400 mb-2">
                {language === 'en' ? 'Official Booking Channels & Medical Directories:' : 'قنوات الحجز المعتمدة عبر المنصات الطبية:'}
              </span>
              <a
                href={vezeetaUrl || "https://www.vezeeta.com/en/dr/Clinic-Androderma-Laser-Clinic-Androderma-Laser-Clinic-Dermatology"}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-[#0070CD]/15 border border-white/15 hover:border-[#0070CD]/50 transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(0,112,205,0.2)]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-xl bg-[#0070CD] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    V
                  </div>
                  <div className="text-start">
                    <span className="block text-xs font-black text-white group-hover:text-[#60a5fa] transition-colors">
                      {t('footer.vezeeta')}
                    </span>
                    <span className="block text-[10px] text-gray-400">
                      {t('footer.vezeetaSub')}
                    </span>
                  </div>
                </div>
                <ArrowIcon className={`h-4 w-4 text-[#60a5fa] transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1 group-hover:-translate-y-0.5' : 'group-hover:translate-x-1 group-hover:-translate-y-0.5'}`} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links & Services (3 cols) */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-sage-300 uppercase">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300/85 font-medium">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 hover:text-white transition-all duration-200 ${isRTL ? 'hover:translate-x-[-4px]' : 'hover:translate-x-[4px]'}`}
                  >
                    <ArrowIcon className="h-3.5 w-3.5 text-sage-400 opacity-70" />
                    {language === 'en' ? link.labelEn : link.labelAr}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/terms"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`inline-flex items-center gap-1.5 text-teal-300 hover:text-teal-200 transition-all duration-200 ${isRTL ? 'hover:translate-x-[-4px]' : 'hover:translate-x-[4px]'}`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-400 opacity-80" />
                  {language === 'en' ? 'Legal & Privacy Policy' : 'الشروط والخصوصية الطبية'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Clinic Branches Directory (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-sage-300 uppercase">
              {t('footer.branchesTitle')}
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
                      {language === 'en' ? (b.id === 'nasr-city' ? 'Nasr City' : b.id === 'fifth-settlement' ? 'Fifth Settlement' : b.id === 'maadi' ? 'Maadi' : 'New Giza') : b.nameAr}
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

        {/* Legal & Policy Navigation Links (Dedicated Standalone Row) */}
        <div className="pt-6 pb-2 border-b border-white/5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-300">
          <Link
            to="/terms"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-teal-300 font-bold transition-colors cursor-pointer py-1"
          >
            {language === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
          </Link>
          <span className="text-white/20 select-none">•</span>
          <Link
            to="/terms#booking-fees"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-teal-300 font-bold transition-colors cursor-pointer py-1"
          >
            {language === 'en' ? 'Terms & Conditions' : 'الشروط والأحكام'}
          </Link>
          <span className="text-white/20 select-none">•</span>
          <Link
            to="/terms#skin-assessment"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-teal-300 font-bold transition-colors cursor-pointer py-1"
          >
            {language === 'en' ? 'Medical Disclaimer' : 'إخلاء المسؤولية'}
          </Link>
        </div>

        {/* Bottom Bar: Copyright & Developer Credit */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span>© {new Date().getFullYear()} {language === 'en' ? 'Androderma Clinics. All rights reserved.' : 'عيادات Androderma. جميع الحقوق محفوظة.'}</span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="text-gray-400">{t('footer.motto')}</span>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                title={language === 'en' ? 'Admin Portal' : 'بوابة الفريق الطبي والإدارة'}
                aria-label="Admin Portal"
                className="opacity-40 hover:opacity-100 text-slate-400 hover:text-teal-400 p-1 transition-all cursor-pointer"
              >
                <Lock className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Developer Credit explicitly preserved */}
          <div className="text-center text-xs text-gray-400">
            {t('footer.devCredit')}{' '}
            <a
              href="https://www.instagram.com/mostavaahmed_/?utm_source=ig_web_button_share_sheet"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-teal-400 hover:text-teal-300 underline transition-colors"
            >
              Mostafa Ahmed
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

