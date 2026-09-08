import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  CalendarClock,
  Sparkles,
  Lock,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Building2,
  CalendarDays,
  Receipt,
  HelpCircle,
  Sun,
  Moon,
  ChevronLeft,
} from 'lucide-react';
import { clinic } from '@/data/clinicData';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

interface LegalPageProps {
  onNavigateHome?: (targetAnchor?: string) => void;
  onOpenBooking?: () => void;
}

interface NavSection {
  id: string;
  num: string;
  title: string;
  badge: string;
  icon: React.ElementType;
}

const SECTIONS: NavSection[] = [
  {
    id: 'booking-fees',
    num: '01',
    title: 'سداد الرسوم وقائمة الكشف',
    badge: 'المعاملات المالية',
    icon: Wallet,
  },
  {
    id: 'rescheduling-cancellation',
    num: '02',
    title: 'تعديل وإلغاء الحجز',
    badge: 'المرونة الطبية',
    icon: CalendarClock,
  },
  {
    id: 'skin-assessment',
    num: '03',
    title: 'إخلاء مسؤولية تقييم البشرة',
    badge: 'إخلاء المسؤولية',
    icon: Sparkles,
  },
  {
    id: 'privacy-confidentiality',
    num: '04',
    title: 'الخصوصية وسرية البيانات',
    badge: 'الأمان والخصوصية',
    icon: Lock,
  },
];

export function LegalPage({ onNavigateHome, onOpenBooking }: LegalPageProps) {
  const { clinicName, logoUrl, contactPhone, phone: dynamicPhone, settings } = useSiteSettings();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('booking-fees');

  const directPhone = (contactPhone && contactPhone.trim().length > 0)
    ? contactPhone.trim()
    : (dynamicPhone && dynamicPhone.trim().length > 0)
    ? dynamicPhone.trim()
    : (settings.whatsapp_number && settings.whatsapp_number.trim().length > 0)
    ? settings.whatsapp_number.trim()
    : clinic.phone;

  const currentWa = (settings.whatsapp_number && settings.whatsapp_number.trim().length > 0)
    ? settings.whatsapp_number.trim()
    : clinic.whatsapp;

  const cleanWaNumber = currentWa.replace(/[^0-9]/g, '');
  const activeWaLink = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent('مرحباً عيادات Androderma، أستفسر بخصوص شروط الحجز أو سياسة الخصوصية.')}`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'الشروط والخصوصية الطبية | عيادات Androderma';
  }, []);

  // IntersectionObserver for active section highlighting
  useEffect(() => {
    const handleScrollObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { rootMargin: '-10% 0px -60% 0px', threshold: 0.1 }
      );

      SECTIONS.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observer.observe(el);
      });

      return () => observer.disconnect();
    };

    const cleanup = handleScrollObserver();
    return () => cleanup && cleanup();
  }, []);

  const handleBackToHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleGoToBooking = () => {
    if (onOpenBooking) {
      onOpenBooking();
    } else {
      window.history.pushState(null, '', '/book');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0e12] text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500 selection:text-white transition-colors duration-300" dir="rtl">
      {/* Ambient Lighting Accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-[140px]" />
        <div className="absolute top-1/2 left-0 h-[450px] w-[450px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/10 blur-[150px]" />
        <div className="absolute -bottom-20 right-10 h-[400px] w-[400px] rounded-full bg-teal-600/10 dark:bg-teal-600/15 blur-[120px]" />
      </div>

      {/* Top Navigation Banner */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0c0e12]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <button
            type="button"
            onClick={handleBackToHome}
            className="flex items-center gap-3.5 group text-start focus:outline-none cursor-pointer"
            aria-label="العودة للرئيسية"
          >
            <img
              src={logoUrl || CLINIC_LOGO}
              alt="Androderma Logo"
              className="h-10 sm:h-11 w-auto object-contain drop-shadow-[0_0_12px_rgba(20,184,166,0.3)] transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = CLINIC_LOGO;
              }}
            />
            <div>
              <span className="block font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {clinicName || (language === 'en' ? 'Androderma Clinics' : 'عيادات Androderma')}
              </span>
              <span className="block text-[11px] font-bold text-teal-600 dark:text-teal-400">
                الشروط والخصوصية المعتمدة
              </span>
            </div>
          </button>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              aria-label="تبديل المظهر"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            <button
              type="button"
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl transition-all duration-200 cursor-pointer shadow-xs"
            >
              <ArrowRight className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>العودة للرئيسية</span>
            </button>

            <button
              type="button"
              onClick={handleGoToBooking}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-extrabold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg shadow-teal-600/25 transition-all duration-200 cursor-pointer"
            >
              <CalendarDays className="h-4 w-4" />
              <span>احجز كشفك الآن</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Headline Section */}
      <section className="relative z-10 pt-12 sm:pt-16 pb-12 sm:pb-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-400 text-xs font-black tracking-wide mb-5 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>ميثاق الشفافية والمسؤولية الطبية</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            الشروط والأحكام وسياسة الخصوصية
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            نلتزم في عيادات Androderma بأعلى معايير الشفافية الطبية والمهنية، وحماية خصوصية بيانات مراجعينا، وتوفير تجربة حجز دقيقة ومريحة لكافة خدمات الجلدية والليزر.
          </p>

          {/* Quick Jump Anchors (Horizontal Bar) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 border border-teal-500'
                    : 'bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300'
                }`}
              >
                <span className="text-[10px] font-mono opacity-70">[{sec.num}]</span>
                <span>{sec.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Sticky Side Navigation (Desktop lg+) */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-28 space-y-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#12151b] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    فهرس الوثيقة المعتمدة
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 rounded-md">
                  4 أقسام
                </span>
              </div>

              <nav className="space-y-1.5" aria-label="أقسام الوثيقة">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl text-right transition-all cursor-pointer ${
                        isActive
                          ? 'bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 text-teal-900 dark:text-teal-200 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-xs">
                          <span className="block font-mono text-[10px] text-slate-400 dark:text-slate-500">
                            {sec.num}
                          </span>
                          <span className="block leading-tight font-bold">
                            {sec.badge}
                          </span>
                        </div>
                      </div>

                      <ChevronLeft className={`h-4 w-4 transition-transform ${isActive ? 'text-teal-600 dark:text-teal-400 -translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`} />
                    </button>
                  );
                })}
              </nav>

              {/* Side Quick Contact Card */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  تحتاج مساعدة أو استفسار؟
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${directPhone}`}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-teal-50 dark:hover:bg-teal-500/10 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-white/5 text-[11px] font-bold transition-colors"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>اتصال</span>
                  </a>
                  <a
                    href={activeWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Reading Column */}
          <main className="flex-1 w-full space-y-12 lg:space-y-16">

            {/* SECTION 1: Booking Fees & Queue System */}
            <section
              id="booking-fees"
              className="scroll-mt-28 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#12151b] border border-slate-200 dark:border-slate-800 hover:border-teal-500/30 dark:hover:border-teal-500/30 transition-all shadow-sm dark:shadow-xl space-y-8"
            >
              {/* Pillar Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Wallet className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-500/20">
                      01 / 04
                    </span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
                      القسم الأول • المعاملات المالية والحجز
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
                    حجز الكشف وسداد الرسوم وقائمة الانتظار المعتمدة
                  </h2>
                </div>
              </div>

              {/* Scannable Cards Grid */}
              <div className="space-y-5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                
                {/* Point 1 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start gap-4 hover:border-teal-500/30 transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="space-y-1.5">
                    <strong className="text-slate-900 dark:text-white block font-bold text-base">
                      سداد سعر الكشف الكامل (Full Examination Fees):
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                      يتم تأكيد وتثبيت الموعد الطبي للمريض في كشف العيادة المعتمد بسداد <span className="text-teal-700 dark:text-teal-300 font-bold">سعر الكشف الكامل</span> مقدماً. يضمن هذا الإجراء حجز وقت الاستشارة المخصص لك مع استشاري العيادة وتجهيز الملف الطبي قبل وصولك.
                    </p>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start gap-4 hover:border-teal-500/30 transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Receipt className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="space-y-1.5">
                    <strong className="text-slate-900 dark:text-white block font-bold text-base">
                      طرق الدفع المعتمدة (محافظ إلكترونية وإنستاباي فقط):
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                      تتم كافة عمليات سداد الرسوم إلكترونياً حصرياً عبر قنوات الدفع الرقمية المحلية المعتمدة في مصر:
                      <strong className="text-slate-900 dark:text-white mx-1">المحافظ الإلكترونية الذكية (فودافون كاش، أورنج كاش، إي آند كاش، وي باي)</strong>
                      أو تطبيق
                      <strong className="text-slate-900 dark:text-white mx-1">إنستاباي (InstaPay)</strong>
                      المباشر للتحويل اللحظي لحساب العيادة الرسمي. يتم بعد التحويل رفع لقطة شاشة / إيصال العملية لإتمام المراجعة الفورية.
                    </p>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start gap-4 hover:border-teal-500/30 transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="space-y-1.5">
                    <strong className="text-slate-900 dark:text-white block font-bold text-base">
                      ترتيب الدور وقائمة الكشف المعتمدة (#X):
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                      يمنحك النظام الآلي فور تسجيل الطلب رقم ترتيب في كشف العيادة المعتمد (<span className="text-teal-700 dark:text-teal-300 font-bold">رقمك في قائمة الحجز: #X</span>). يضمن هذا الترتيب أسبقيتك في مراجعة الطبيب بمجرد التحقق من إيصال السداد، مما يمنع التكدس ويقلل وقت الانتظار داخل صالة الاستقبال.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* SECTION 2: Rescheduling & Cancellation */}
            <section
              id="rescheduling-cancellation"
              className="scroll-mt-28 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#12151b] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all shadow-sm dark:shadow-xl space-y-8"
            >
              {/* Pillar Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                  <CalendarClock className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                      02 / 04
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                      القسم الثاني • المرونة الطبية والتنظيم
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
                    تعديل وإلغاء المواعيد واسترداد الرسوم
                  </h2>
                </div>
              </div>

              <div className="space-y-5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  نحرص في عيادات Androderma على تقديم أقصى درجات المرونة لمرضانا ومراعاة الظروف الشخصية والطارئة بكل تفهم واحترام متبادل.
                </p>

                <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200/80 dark:border-emerald-500/20 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-slate-900 dark:text-white block font-bold text-sm sm:text-base">
                        إجراءات مرنة بالتنسيق المباشر مع العيادة فقط:
                      </strong>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        في حال رغبتك في <span className="text-emerald-700 dark:text-emerald-300 font-bold">تعديل موعد الكشف</span> أو نقله ليوم آخر، أو الرغبة في <span className="text-emerald-700 dark:text-emerald-300 font-bold">إلغاء الحجز واسترداد الرسوم</span>، يتم ذلك بكل سلاسة عبر التواصل والتنسيق المباشر مع فريق الاستقبال بالعيادة هاتفياً أو عبر تطبيق واتساب.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 pt-3 border-t border-emerald-200/60 dark:border-emerald-500/10">
                    <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-slate-900 dark:text-white block font-bold text-sm sm:text-base">
                        تنسيق فوري دون قيود زمنية معقدة:
                      </strong>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        لا يخضع التعديل لأي شروط معقدة؛ فبمجرد إبلاغ موظف الاستقبال برقم الحجز والاسم، يقوم الفريق بتعديل الموعد حسب المواعيد المتاحة للفرع أو معالجة طلب الاسترداد وفقاً لتعليمات قسم الحسابات والإدارة الطبية.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Contact Reception Box */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-start">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                      لتعديل موعدك أو التنسيق مع إدارة الاستقبال:
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      فريق خدمة العملاء واستقبال الفروع متاح للرد الفوري
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <a
                      href={`tel:${directPhone}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-900 dark:text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <PhoneCall className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <span>اتصال بالعيادة</span>
                    </a>
                    <a
                      href={activeWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>واتساب الاستقبال</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: Skin Assessment Disclaimer */}
            <section
              id="skin-assessment"
              className="scroll-mt-28 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#12151b] border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all shadow-sm dark:shadow-xl space-y-8"
            >
              {/* Pillar Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                      03 / 04
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
                      القسم الثالث • إخلاء المسؤولية الطبية
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
                    طبيعة تقييم البشرة والاستبيان التفاعلي
                  </h2>
                </div>
              </div>

              <div className="space-y-5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                
                {/* Zero Image Upload Guarantee Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="space-y-2">
                      <strong className="text-amber-950 dark:text-amber-100 font-black block text-sm sm:text-base">
                        تقييم استرشادي نصي بالكامل — بدون رفع أي صور أو لقطات للبشرة نهائياً:
                      </strong>
                      <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                        استبيان تقييم البشرة المتاح على موقعنا هو أداة استرشادية مبنية على أسئلة وخيارات نصية فقط لمساعدتك في التعرف المبدئي على احتياجات بشرتك.
                        <span className="underline decoration-amber-500 dark:decoration-amber-400 font-bold mx-1">
                          لا يُطلب أو يُسمح للمريض برفع أي صور أو لقطات شخصية للبشرة أو الوجه نهائياً
                        </span>
                        عبر الموقع، وذلك التزاماً بحماية خصوصيتك التامة وأخلاقيات الممارسة الطبية.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start gap-4 hover:border-teal-500/30 transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="space-y-1.5">
                    <strong className="text-slate-900 dark:text-white block font-bold text-base">
                      لا يغني عن الفحص السريري المباشر للطبيب:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                      نتائج هذا الاستبيان استرشادية وتثقيفية فقط، ولا تُعد تشخيصاً طبياً نهائياً ولا تحل بأي حال من الأحوال محل الفحص السريري المجهري الدقيق الذي يُجريه الاستشاري داخل عيادة الجلدية المتخصصة.
                    </p>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start gap-4 hover:border-teal-500/30 transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="space-y-1.5">
                    <strong className="text-slate-900 dark:text-white block font-bold text-base">
                      تحديد البروتوكول العلاجي يتم داخل العيادة:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                      يتم إقرار خطة العلاج المناسبة والأدوية الموصوفة ونوع جلسات الليزر بناءً على تقييم الطبيب المباشر لحالتك ونوع البشرة وسجلك الدوائي والمرضي.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* SECTION 4: Privacy & Data Confidentiality */}
            <section
              id="privacy-confidentiality"
              className="scroll-mt-28 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#12151b] border border-slate-200 dark:border-slate-800 hover:border-teal-500/30 dark:hover:border-teal-500/30 transition-all shadow-sm dark:shadow-xl space-y-8"
            >
              {/* Pillar Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-500/20">
                      04 / 04
                    </span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
                      القسم الرابع • الأمان والخصوصية
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
                    سياسة الخصوصية وسرية البيانات الطبية
                  </h2>
                </div>
              </div>

              <div className="space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  تعتبر سرية بيانات المرضى ركيزة مقدسة في ممارستنا الطبية. نضمن لك حفظ وإدارة بياناتك بأعلى معايير الحماية الرقمية والسرية المهنية.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  
                  {/* Card 1 */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-2 hover:border-teal-500/30 transition-colors">
                    <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400 font-bold text-sm sm:text-base">
                      <UserCheck className="h-5 w-5" />
                      <span>سرية أرقام الهواتف والبيانات الشخصية</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      رقم هاتفك واسمك المسجلان أثناء الحجز يُستخدمان حصرياً للتواصل معك لتأكيد الموعد، وإرسال تفاصيل الفرع والموقع الجغرافي، وإشعارك برقم الترتيب.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-2 hover:border-teal-500/30 transition-colors">
                    <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400 font-bold text-sm sm:text-base">
                      <ShieldCheck className="h-5 w-5" />
                      <span>عدم مشاركة البيانات مع أي طرف ثالث</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      لا نقوم ببيع أو تأجير أو مشاركة بيانات المرضى مع أي جهات تسويقية أو شركات إعلانية أو أطراف خارجية تحت أي ظرف من الظروف.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-2 hover:border-teal-500/30 transition-colors">
                    <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400 font-bold text-sm sm:text-base">
                      <Lock className="h-5 w-5" />
                      <span>تشفير الاتصال والبيانات</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      تتم كافة الاتصالات عبر بروتوكول التشفير الآمن (HTTPS / SSL)، وتُحفظ السجلات الطبية وفقاً لمعايير أمن المعلومات الطبية المعمول بها.
                    </p>
                  </div>

                  {/* Card 4 */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-2 hover:border-teal-500/30 transition-colors">
                    <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400 font-bold text-sm sm:text-base">
                      <Building2 className="h-5 w-5" />
                      <span>حقوق المريض وإمكانية التعديل</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      يحق لكل مراجع في أي وقت طلب مراجعة بياناته المسجلة أو تحديث رقم هاتفه أو إزالة سجله من قوائم المتابعة بالتواصل مع إدارة العيادة.
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* SECTION 5: Clinic Directory & Support Contacts (Closing CTA) */}
            <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-teal-50/80 via-white to-teal-50/40 dark:from-[#161a22] dark:to-[#12151b] border border-teal-200 dark:border-slate-800 text-center space-y-6 shadow-md dark:shadow-xl">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 mx-auto shadow-xs">
                <HelpCircle className="h-7 w-7" />
              </div>

              <div className="max-w-xl mx-auto space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  هل لديك أي استفسار حول المواعيد أو الشروط؟
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  فريق الاستقبال وإدارة علاقات المرضى في عيادات Androderma مستعد للإجابة على جميع تساؤلاتك ومساعدتك في اختيار الفرع الأنسب لك.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <a
                  href={`tel:${directPhone}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-teal-600/25 transition-all cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>اتصال مباشر: {directPhone}</span>
                </a>
                <a
                  href={activeWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>محادثة واتساب سريعة</span>
                </a>
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>العودة للصفحة الرئيسية</span>
                </button>
              </div>

              <div className="pt-6 border-t border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
                عيادات Androderma للأمراض الجلدية والليزر وتجميل البشرة • كافة الحقوق محفوظة © {new Date().getFullYear()}
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

