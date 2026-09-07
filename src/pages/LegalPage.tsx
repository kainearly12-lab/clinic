import React, { useEffect } from 'react';
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
} from 'lucide-react';
import { clinic } from '@/data/clinicData';
import { CLINIC_LOGO } from '@/data/clinicLogo';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useLanguage } from '@/context/LanguageContext';

interface LegalPageProps {
  onNavigateHome?: (targetAnchor?: string) => void;
  onOpenBooking?: () => void;
}

export function LegalPage({ onNavigateHome, onOpenBooking }: LegalPageProps) {
  const { clinicName, logoUrl, contactPhone, phone: dynamicPhone, settings } = useSiteSettings();
  const { language } = useLanguage();

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

  return (
    <div className="min-h-screen bg-[#0c0e12] text-slate-100 font-sans selection:bg-teal-500 selection:text-white" dir="rtl">
      {/* Ambient Lighting Accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[140px]" />
        <div className="absolute top-1/2 left-0 h-[450px] w-[450px] rounded-full bg-emerald-600/10 blur-[150px]" />
        <div className="absolute -bottom-20 right-10 h-[400px] w-[400px] rounded-full bg-teal-600/10 blur-[120px]" />
      </div>

      {/* Top Navigation Banner */}
      <header className="sticky top-0 z-50 bg-[#0c0e12]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <button
            type="button"
            onClick={handleBackToHome}
            className="flex items-center gap-3.5 group text-start focus:outline-none"
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
              <span className="block font-display text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight">
                {clinicName || (language === 'en' ? 'Androderma Clinics' : 'عيادات Androderma')}
              </span>
              <span className="block text-[11px] font-bold text-teal-400">
                الشروط والخصوصية المعتمدة
              </span>
            </div>
          </button>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <ArrowRight className="h-4 w-4 text-teal-400" />
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
      <section className="relative z-10 pt-12 sm:pt-16 pb-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-black tracking-wide mb-5">
            <ShieldCheck className="h-4 w-4" />
            <span>ميثاق الشفافية والمسؤولية الطبية</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            الشروط والأحكام وسياسة الخصوصية
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            نلتزم في عيادات Androderma بأعلى معايير الشفافية الطبية والمهنية، وحماية خصوصية بيانات مراجعينا، وتوفير تجربة حجز دقيقة ومريحة لكافة خدمات الجلدية والليزر.
          </p>

          {/* Quick Jump Anchors */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="#booking-fees"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-teal-500/15 border border-white/10 hover:border-teal-500/30 text-xs font-bold text-slate-300 hover:text-teal-300 transition-colors"
            >
              سداد الرسوم وقائمة الكشف
            </a>
            <a
              href="#rescheduling-cancellation"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-teal-500/15 border border-white/10 hover:border-teal-500/30 text-xs font-bold text-slate-300 hover:text-teal-300 transition-colors"
            >
              تعديل وإلغاء الحجز
            </a>
            <a
              href="#skin-assessment"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-teal-500/15 border border-white/10 hover:border-teal-500/30 text-xs font-bold text-slate-300 hover:text-teal-300 transition-colors"
            >
              إخلاء مسؤولية تقييم البشرة
            </a>
            <a
              href="#privacy-confidentiality"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-teal-500/15 border border-white/10 hover:border-teal-500/30 text-xs font-bold text-slate-300 hover:text-teal-300 transition-colors"
            >
              الخصوصية وسرية البيانات
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* SECTION 1: Booking Fees & Queue System */}
        <section
          id="booking-fees"
          className="p-6 sm:p-8 rounded-3xl bg-[#12151b] border border-white/10 hover:border-teal-500/30 transition-all shadow-xl space-y-6"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-400 tracking-wider uppercase block mb-1">
                القسم الأول • المعاملات المالية والحجز
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                حجز الكشف وسداد الرسوم وقائمة الانتظار المعتمدة
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3.5">
              <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-1">
                  سداد سعر الكشف الكامل (Full Examination Fees):
                </strong>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  يتم تأكيد وتثبيت الموعد الطبي للمريض في كشف العيادة المعتمد بسداد <span className="text-teal-300 font-bold">سعر الكشف الكامل</span> مقدماً. يضمن هذا الإجراء حجز وقت الاستشارة المخصص لك مع استشاري العيادة وتجهيز الملف الطبي قبل وصولك.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3.5">
              <Receipt className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-1">
                  طرق الدفع المعتمدة (محافظ إلكترونية وإنستاباي فقط):
                </strong>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  تتم كافة عمليات سداد الرسوم إلكترونياً حصرياً عبر قنوات الدفع الرقمية المحلية المعتمدة في مصر:
                  <strong className="text-white mx-1">المحافظ الإلكترونية الذكية (فودافون كاش، أورنج كاش، إي آند كاش، وي باي)</strong>
                  أو تطبيق
                  <strong className="text-white mx-1">إنستاباي (InstaPay)</strong>
                  المباشر للتحويل اللحظي لحساب العيادة الرسمي. يتم بعد التحويل رفع لقطة شاشة / إيصال العملية لإتمام المراجعة الفورية.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3.5">
              <Clock className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-1">
                  ترتيب الدور وقائمة الكشف المعتمدة (#X):
                </strong>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  يمنحك النظام الآلي فور تسجيل الطلب رقم ترتيب في كشف العيادة المعتمد (<span className="text-teal-300 font-bold">رقمك في قائمة الحجز: #X</span>). يضمن هذا الترتيب أسبقيتك في مراجعة الطبيب بمجرد التحقق من إيصال السداد، مما يمنع التكدس ويقلل وقت الانتظار داخل صالة الاستقبال.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Rescheduling & Cancellation (Reception Only) */}
        <section
          id="rescheduling-cancellation"
          className="p-6 sm:p-8 rounded-3xl bg-[#12151b] border border-white/10 hover:border-teal-500/30 transition-all shadow-xl space-y-6"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase block mb-1">
                القسم الثاني • المرونة الطبية والتنظيم
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                تعديل وإلغاء المواعيد واسترداد الرسوم
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
            <p className="text-slate-200 leading-relaxed">
              نحرص في عيادات Androderma على تقديم أقصى درجات المرونة لمرضانا ومراعاة الظروف الشخصية والطارئة بكل تفهم واحترام متبادل.
            </p>

            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <strong className="text-white block font-bold mb-1">
                    إجراءات مرنة بالتنسيق المباشر مع العيادة فقط:
                  </strong>
                  في حال رغبتك في <span className="text-emerald-300 font-bold">تعديل موعد الكشف</span> أو نقله ليوم آخر، أو الرغبة في <span className="text-emerald-300 font-bold">إلغاء الحجز واسترداد الرسوم</span>، يتم ذلك بكل سلاسة عبر التواصل والتنسيق المباشر مع فريق الاستقبال بالعيادة هاتفياً أو عبر تطبيق واتساب.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <strong className="text-white block font-bold mb-1">
                    تنسيق فوري دون قيود زمنية معقدة:
                  </strong>
                  لا يخضع التعديل لأي شروط معقدة؛ فبمجرد إبلاغ موظف الاستقبال برقم الحجز والاسم، يقوم الفريق بتعديل الموعد حسب المواعيد المتاحة للفرع أو معالجة طلب الاسترداد وفقاً لتعليمات قسم الحسابات والإدارة الطبية.
                </p>
              </div>
            </div>

            {/* Quick Contact Reception Box */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-start">
                <span className="text-xs font-bold text-slate-400 block">
                  لتعديل موعدك أو التنسيق مع إدارة الاستقبال:
                </span>
                <span className="text-sm font-black text-white">
                  فريق خدمة العملاء واستقبال الفروع متاح للرد الفوري
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <a
                  href={`tel:${directPhone}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-teal-400" />
                  <span>اتصال بالعيادة</span>
                </a>
                <a
                  href={activeWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>واتساب الاستقبال</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Skin Assessment Disclaimer (Text-Only, No Photos, Not Doctor Substitute) */}
        <section
          id="skin-assessment"
          className="p-6 sm:p-8 rounded-3xl bg-[#12151b] border border-white/10 hover:border-teal-500/30 transition-all shadow-xl space-y-6"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase block mb-1">
                القسم الثالث • إخلاء المسؤولية الطبية
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                طبيعة تقييم البشرة والاستبيان التفاعلي
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
            {/* Zero Image Upload Guarantee Card */}
            <div className="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <strong className="text-amber-100 font-black block text-sm sm:text-base">
                    تقييم استرشادي نصي بالكامل — بدون رفع أي صور أو لقطات للبشرة نهائياً:
                  </strong>
                  <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                    استبيان تقييم البشرة المتاح على موقعنا هو أداة استرشادية مبنية على أسئلة وخيارات نصية فقط لمساعدتك في التعرف المبدئي على احتياجات بشرتك.
                    <span className="underline decoration-amber-400 font-bold mx-1">
                      لا يُطلب أو يُسمح للمريض برفع أي صور أو لقطات شخصية للبشرة أو الوجه نهائياً
                    </span>
                    عبر الموقع، وذلك التزاماً بحماية خصوصيتك التامة وأخلاقيات الممارسة الطبية.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white block font-bold mb-1">
                    لا يغني عن الفحص السريري المباشر للطبيب:
                  </strong>
                  نتائج هذا الاستبيان استرشادية وتثقيفية فقط، ولا تُعد تشخيصاً طبياً نهائياً ولا تحل بأي حال من الأحوال محل الفحص السريري المجهري الدقيق الذي يُجريه الاستشاري داخل عيادة الجلدية المتخصصة.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white block font-bold mb-1">
                    تحديد البروتوكول العلاجي يتم داخل العيادة:
                  </strong>
                  يتم إقرار خطة العلاج المناسبة والأدوية الموصوفة ونوع جلسات الليزر بناءً على تقييم الطبيب المباشر لحالتك ونوع البشرة وسجلك الدوائي والمرضي.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Privacy & Data Confidentiality */}
        <section
          id="privacy-confidentiality"
          className="p-6 sm:p-8 rounded-3xl bg-[#12151b] border border-white/10 hover:border-teal-500/30 transition-all shadow-xl space-y-6"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-400 tracking-wider uppercase block mb-1">
                القسم الرابع • الأمان والخصوصية
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                سياسة الخصوصية وسرية البيانات الطبية
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
            <p className="text-slate-200 leading-relaxed">
              تعتبر سرية بيانات المرضى ركيزة مقدسة في ممارستنا الطبية. نضمن لك حفظ وإدارة بياناتك بأعلى معايير الحماية الرقمية والسرية المهنية.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <UserCheck className="h-4 w-4" />
                  <span>سرية أرقام الهواتف والبيانات الشخصية</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  رقم هاتفك واسمك المسجلان أثناء الحجز يُستخدمان حصرياً للتواصل معك لتأكيد الموعد، وإرسال تفاصيل الفرع والموقع الجغرافي، وإشعارك برقم الترتيب.
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span>عدم مشاركة البيانات مع أي طرف ثالث</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  لا نقوم ببيع أو تأجير أو مشاركة بيانات المرضى مع أي جهات تسويقية أو شركات إعلانية أو أطراف خارجية تحت أي ظرف من الظروف.
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <Lock className="h-4 w-4" />
                  <span>تشفير الاتصال والبيانات</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  تتم كافة الاتصالات عبر بروتوكول التشفير الآمن (HTTPS / SSL)، وتُحفظ السجلات الطبية وفقاً لمعايير أمن المعلومات الطبية المعمول بها.
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <Building2 className="h-4 w-4" />
                  <span>حقوق المريض وإمكانية التعديل</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  يحق لكل مراجع في أي وقت طلب مراجعة بياناته المسجلة أو تحديث رقم هاتفه أو إزالة سجله من قوائم المتابعة بالتواصل مع إدارة العيادة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Clinic Directory & Support Contacts */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#161a22] to-[#12151b] border border-white/10 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-teal-500/20 text-teal-300 mx-auto">
            <HelpCircle className="h-6 w-6" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              هل لديك أي استفسار حول المواعيد أو الشروط؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              فريق الاستقبال وإدارة علاقات المرضى في عيادات Androderma مستعد للإجابة على جميع تساؤلاتك ومساعدتك في اختيار الفرع الأنسب لك.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={`tel:${directPhone}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-teal-600/25 transition-all"
            >
              <PhoneCall className="h-4 w-4" />
              <span>اتصال مباشر: {directPhone}</span>
            </a>
            <a
              href={activeWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/25 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <span>محادثة واتساب سريعة</span>
            </a>
            <button
              type="button"
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs sm:text-sm font-bold transition-all"
            >
              <ArrowRight className="h-4 w-4 text-teal-400" />
              <span>العودة للصفحة الرئيسية</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-slate-400">
            عيادات Androderma للأمراض الجلدية والليزر وتجميل البشرة • كافة الحقوق محفوظة © {new Date().getFullYear()}
          </div>
        </section>

      </main>
    </div>
  );
}
