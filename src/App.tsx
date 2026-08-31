import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Plus,
  Quote,
  Sparkles,
  Star,
  X,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { LuxuryFooter } from '@/components/LuxuryFooter';
import { SplashScreen } from '@/components/SplashScreen';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { BookingButton, BookingModal } from '@/components/BookingModal';
import { DoctorCard3D } from '@/components/DoctorCard3D';
import { SkinDiagnosticQuiz } from '@/components/SkinDiagnosticQuiz';
import { BranchHubWithMatrix } from '@/components/BranchHubWithMatrix';
import { Reveal, Stagger, staggerItem } from '@/components/ui/Reveal';
import { clinic, faqs, galleryItems, reviews, services } from '@/data/clinicData';
import { useCountUp } from '@/hooks/useCountUp';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;

function TrustBar() {
  const [visible, setVisible] = useState(false);
  const reviewsValue = useCountUp(clinic.reviewsCount, 1100, visible);

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-y border-slate-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-[#121419] backdrop-blur-md"
    >
      <div className="container-px grid grid-cols-2 divide-x divide-x-reverse divide-slate-200/80 dark:divide-gray-800/80 sm:grid-cols-4">
        {[
          { icon: Star, value: clinic.rating.toFixed(1), label: 'التقييم على Google', suffix: ' / 5' },
          { icon: Quote, value: Math.round(reviewsValue).toString(), label: 'تقييمات موثقة', suffix: '+' },
          { icon: Building2, value: '4 فروع', label: 'القاهرة والجيزة', suffix: '' },
          { icon: Clock3, value: '11 PM', label: 'يغلق يومياً', suffix: '' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              ref={i === 1 ? () => setVisible(true) : undefined}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex min-h-[96px] flex-col justify-center gap-1 px-4 py-5 sm:px-7"
            >
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {item.value}
                  <small className="text-xs font-semibold mr-0.5">{item.suffix}</small>
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-gray-400">{item.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  const scrollToDiagnostic = () => {
    const el = document.getElementById('diagnostic-quiz');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const servicesEl = document.getElementById('services');
      if (servicesEl) servicesEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = () => {
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.section
      id="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-[740px] overflow-hidden bg-gradient-to-b from-[#F8FAF9] via-[#F4F9F7] to-[#F8FAF9] dark:from-[#0c0e12] dark:via-[#0f1217] dark:to-[#0c0e12] pt-32 sm:min-h-[820px] sm:pt-36 lg:pt-40"
    >
      {/* Refined Ambient Lighting Blobs */}
      <div className="pointer-events-none absolute -left-32 top-24 h-[450px] w-[450px] rounded-full bg-teal-300/25 dark:bg-teal-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-0 top-10 h-[500px] w-[500px] rounded-full bg-emerald-200/20 dark:bg-emerald-600/10 blur-[120px]" />

      <div className="container-px relative grid items-center gap-12 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
        {/* Left Column: Headlines & CTAs */}
        <div className="relative z-10 max-w-xl lg:order-2">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-slate-800/80 px-3.5 py-1.5 border border-teal-900/10 dark:border-teal-500/20 shadow-xs"
          >
            <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
            <span className="text-xs font-black tracking-wider text-teal-800 dark:text-teal-300 uppercase">
              ANDRODERMA DERMATOLOGY & LASER
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.25rem] font-extrabold leading-[1.38] text-slate-900 dark:text-white sm:text-5xl sm:leading-[1.3] lg:text-[3.6rem] lg:leading-[1.25]"
          >
            بشرتك تستحق خطة علاج تُبنى على{' '}
            <span className="relative inline-block text-teal-700 dark:text-teal-400">
              تشخيص حقيقي.
              <span className="absolute bottom-1.5 inset-x-0 h-3 bg-teal-300/30 dark:bg-teal-500/20 -z-10 rounded-sm" />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="mt-6 text-base leading-relaxed text-slate-700 dark:text-gray-300 sm:text-lg font-medium"
          >
            جلدية، ليزر وتجميل طبي — بخطة مخصصة لكل حالة، في فروعنا بالقاهرة والجيزة.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3.5"
          >
            {/* Primary CTA */}
            <BookingButton
              onClick={onBook}
              className="py-3.5 px-7 text-sm font-black shadow-md hover:shadow-xl hover:bg-teal-800"
            >
              احجز كشفك الآن
            </BookingButton>

            {/* Secondary Discovery CTA */}
            <button
              onClick={scrollToDiagnostic}
              className="btn-secondary py-3.5 px-6 text-sm font-bold shadow-xs hover:shadow-md"
            >
              <span>🧴 اكتشف الخدمة المناسبة لك</span>
            </button>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.8 }}
            className="mt-9 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-gray-400 sm:gap-5"
          >
            <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-gray-200">
              <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" /> مدينة نصر • التجمع • المعادي • نيو جيزة
            </span>
            <span className="hidden h-3.5 w-px bg-slate-300 dark:bg-gray-700 sm:inline-block" />
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-gray-300">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 3.9 • 54 تقييم على Google
            </span>
          </motion.div>
        </div>

        {/* Right Column: 3D Doctor Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:order-1"
        >
          <DoctorCard3D />
        </motion.div>
      </div>

      {/* Hero Bottom Bar */}
      <div className="container-px hidden items-center justify-between border-t border-slate-200/80 dark:border-gray-800/80 py-3.5 text-[11px] font-bold tracking-[0.2em] text-slate-500 dark:text-gray-400 sm:flex">
        <span className="flex items-center gap-2 text-teal-800 dark:text-teal-400 font-sans">
          <Sparkles className="h-3.5 w-3.5" /> CLINICAL EXCELLENCE & ADVANCED LASER
        </span>
        <button
          onClick={scrollToServices}
          className="flex items-center gap-1 text-slate-600 dark:text-gray-300 hover:text-teal-700 transition-colors"
        >
          <span>اكتشف المزيد</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </div>
    </motion.section>
  );
}

function Services({ onBook }: { onBook: () => void }) {
  return (
    <motion.section
      id="services"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-[#F8FAF9] dark:bg-[#121419] py-24 sm:py-32 transition-colors duration-300"
    >
      <div className="container-px">
        <Reveal>
          <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">WHAT WE DO</span>
              <h2 className="mt-4 max-w-xl text-3xl font-extrabold leading-[1.45] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                خدمات تضع <span className="text-teal-700 dark:text-teal-400">احتياجاتك</span> أولاً
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed font-medium text-slate-600 dark:text-gray-300">
              الخدمات المتاحة تُقدم بعناية واهتمام بالتفاصيل، وتبدأ دائمًا من فهم ما تحتاجه بشرتك.
            </p>
          </div>
        </Reveal>

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {services.map((service, i) => (
            <motion.article
              key={service.id}
              variants={staggerItem}
              whileHover={{ y: -8 }}
              className={`group relative overflow-hidden rounded-3xl bg-white/90 dark:bg-charcoal-900 border border-teal-900/10 dark:border-gray-800/60 shadow-lg shadow-teal-950/5 dark:shadow-[0_0_20px_rgba(16,185,129,0.06)] hover:shadow-2xl hover:border-teal-600/30 dark:hover:border-teal-500/50 transition-all duration-500 ${
                i === 1 ? 'lg:translate-y-8' : ''
              }`}
            >
              <div className="aspect-[0.85] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={service.image}
                  alt={service.titleAr}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="mb-2 inline-block rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-teal-200">
                  0{i + 1}
                </span>
                <h3 className="text-xl font-bold leading-relaxed">{service.titleAr}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-200/90">{service.descriptionAr}</p>
                <button
                  onClick={onBook}
                  className="mt-4 flex items-center gap-2 text-xs font-bold text-teal-300 transition-all group-hover:gap-3 group-hover:text-teal-200"
                >
                  {service.ctaAr}
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.article>
          ))}
        </Stagger>
      </div>
    </motion.section>
  );
}

function About() {
  return (
    <motion.section
      id="about"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="overflow-hidden bg-white/80 dark:bg-[#0e1014] py-24 text-slate-900 dark:text-ivory-50 sm:py-32 border-y border-slate-200/80 dark:border-gray-800/80"
    >
      <div className="container-px grid items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative mx-auto max-w-md">
            <div className="aspect-[0.82] overflow-hidden rounded-[2.25rem] bg-teal-700/10 shadow-lift">
              <img
                src="https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="مساحة هادئة للعناية في عيادات Androderma"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-5 hidden w-48 rounded-2xl border border-teal-900/10 dark:border-teal-500/30 bg-white/95 dark:bg-charcoal-800 p-4 sm:block shadow-lg">
              <span className="eyebrow text-teal-700 dark:text-teal-300">THE EXPERIENCE</span>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-800 dark:text-ivory-100/90">
                احترافية تبدأ من أول لحظة.
              </p>
            </div>
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-teal-500/20" />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="order-1 lg:order-2">
          <span className="eyebrow text-teal-700 dark:text-teal-300">A DIFFERENT APPROACH</span>
          <h2 className="mt-4 max-w-lg text-3xl font-extrabold leading-[1.45] text-slate-900 dark:text-ivory-50 sm:text-4xl lg:text-5xl">
            لأن العناية الحقيقية<br className="hidden sm:block" />
            <span className="text-teal-700 dark:text-teal-300 block mt-2 sm:mt-1">تبدأ بالاستماع والتشخيص</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-700 dark:text-ivory-100/80 font-medium">
            في عيادات Androderma، نؤمن أن كل بشرة لها قصتها الخاصة. لذلك نمنحك مساحة هادئة لفهم احتياجاتك، ونعمل معك على تجربة عناية تناسبك في كافة فروعنا.
          </p>
          <div className="mt-9 grid max-w-md grid-cols-2 gap-4 border-t border-slate-200/80 dark:border-ivory-50/15 pt-6">
            <div className="rounded-2xl p-4 bg-slate-50 dark:bg-charcoal-800/50 border border-slate-200/80 dark:border-teal-500/20 shadow-xs">
              <span className="mb-2 block text-teal-700 dark:text-teal-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold leading-relaxed text-slate-900 dark:text-white">اهتمام بالتفاصيل</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-ivory-100/60">كل خطوة محسوبة لراحتك.</p>
            </div>
            <div className="rounded-2xl p-4 bg-slate-50 dark:bg-charcoal-800/50 border border-slate-200/80 dark:border-teal-500/20 shadow-xs">
              <span className="mb-2 block text-teal-700 dark:text-teal-300">
                <CalendarDays className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold leading-relaxed text-slate-900 dark:text-white">تواصل أسهل</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-ivory-100/60">نحن هنا للإجابة عن أسئلتك.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </motion.section>
  );
}

function Gallery() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <motion.section
      id="gallery"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-[#F8FAF9] dark:bg-[#0c0e12] py-24 sm:py-32 transition-colors duration-300"
    >
      <div className="container-px">
        <Reveal>
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="eyebrow">A GLIMPSE INSIDE</span>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.45] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                من داخل <span className="text-teal-700 dark:text-teal-400">عيادات Androderma</span>
              </h2>
            </div>
            <span className="hidden text-xs font-bold text-slate-600 dark:text-gray-400 sm:block">اضغط على الصورة للتكبير</span>
          </div>
        </Reveal>
        <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-4 sm:gap-5">
          {galleryItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setSelected(item.src)}
              whileHover={{ scale: 0.985 }}
              className={`group relative overflow-hidden rounded-2xl text-right border border-slate-200/80 dark:border-gray-800/50 shadow-sm transition-all duration-300 ${
                item.span === 'tall' ? 'row-span-2' : item.span === 'wide' ? 'col-span-2' : ''
              }`}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/20" />
              <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 dark:bg-gray-800 text-slate-900 dark:text-white opacity-0 shadow-md transition group-hover:opacity-100">
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          ))}
          <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-gray-800/50 shadow-md transition-all duration-300">
            <img
              src="https://images.pexels.com/photos/6899554/pexels-photo-6899554.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="مساحة العيادة الداخلية"
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <ImageIcon className="mb-4 h-5 w-5 text-teal-300" />
              <span className="eyebrow text-teal-300">OUR SPACE</span>
              <p className="mt-3 text-lg font-bold leading-relaxed text-white">
                مساحة صُممت لتشعر فيها بالراحة والثقة.
              </p>
              <a
                href={clinic.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center gap-2 text-xs font-bold text-teal-300 transition-all hover:gap-3"
              >
                اكتشف فروعنا <ArrowLeft className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-5"
            onClick={() => setSelected(null)}
          >
            <button
              aria-label="إغلاق"
              onClick={() => setSelected(null)}
              className="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              src={selected}
              alt="صورة مكبرة من العيادة"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Reviews() {
  return (
    <motion.section
      id="reviews"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white/60 dark:bg-[#121419] py-24 sm:py-32 transition-colors duration-300 border-y border-slate-200/80 dark:border-gray-800/80"
    >
      <div className="container-px">
        <Reveal>
          <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">GOOGLE REVIEWS</span>
              <h2 className="mt-4 max-w-lg text-3xl font-extrabold leading-[1.45] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                تجارب حقيقية،<br className="hidden sm:block" />
                <span className="text-teal-700 dark:text-teal-400 block mt-2 sm:mt-1">بكلمات أصحابها</span>
              </h2>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-[#181b22] px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-xs">
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">3.9</div>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${
                        n < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-gray-800" />
              <span className="max-w-[100px] text-xs font-bold leading-relaxed text-slate-600 dark:text-gray-400">
                54 تقييمًا على Google
              </span>
            </div>
          </div>
        </Reveal>
        <Stagger className="grid gap-6 md:grid-cols-2" stagger={0.12}>
          {reviews.map((review) => (
            <motion.blockquote
              key={review.id}
              variants={staggerItem}
              className="relative rounded-3xl border border-teal-900/10 dark:border-gray-800 bg-white/90 dark:bg-[#181b22] p-7 shadow-sm sm:p-9 hover:shadow-lg dark:hover:border-teal-500/40 transition-all duration-300"
            >
              <Quote className="mb-5 h-7 w-7 text-teal-600 dark:text-teal-400" />
              <p className="text-base font-medium leading-relaxed text-slate-800 dark:text-gray-200 sm:text-lg">
                {review.text}
              </p>
              <footer className="mt-7 flex items-center justify-between border-t border-slate-100 dark:border-gray-800 pt-5">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-400">{review.author ?? 'مراجع Google'}</span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-gray-400">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-50 dark:bg-gray-700 text-[10px] font-black text-blue-600 dark:text-blue-400">
                    G
                  </span>{' '}
                  Google Reviews
                </span>
              </footer>
            </motion.blockquote>
          ))}
        </Stagger>
      </div>
    </motion.section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <motion.section
      id="faq"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-[#F8FAF9] dark:bg-[#0c0e12] py-24 sm:py-32 transition-colors duration-300"
    >
      <div className="container-px grid gap-12 lg:grid-cols-[0.75fr_1fr] lg:gap-24">
        <Reveal>
          <span className="eyebrow">NEED TO KNOW</span>
          <h2 className="mt-4 max-w-sm text-3xl font-extrabold leading-[1.45] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            أسئلة قد<br className="hidden sm:block" />
            <span className="text-teal-700 dark:text-teal-400 block mt-2 sm:mt-1">تخطر ببالك</span>
          </h2>
          <p className="mt-6 max-w-xs text-sm font-medium leading-relaxed text-slate-600 dark:text-gray-300">
            لم تجد إجابتك؟ تواصل معنا مباشرة وسيسعد فريقنا بمساعدتك في أي من فروعنا.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost mt-6 -mr-4 text-teal-800 dark:text-teal-300 font-bold"
          >
            اسألنا على واتساب <ArrowLeft className="h-4 w-4" />
          </a>
        </Reveal>
        <div>
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 0.06}>
              <div className="border-b border-slate-200/90 dark:border-gray-800">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-right"
                >
                  <span className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">{faq.q}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${
                      open === i
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-200/80 dark:bg-gray-800 text-slate-800 dark:text-gray-200'
                    }`}
                  >
                    {open === i ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pl-12 text-sm font-medium leading-relaxed text-slate-700 dark:text-gray-300">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function MobileBottomBar({ onBook }: { onBook: () => void }) {
  return (
    <div className="glass dark:bg-[#15181e]/90 fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-2xl border border-slate-200/90 dark:border-emerald-500/30 p-2 shadow-lift sm:hidden">
      <button onClick={onBook} className="btn-primary flex-1 py-3 text-xs font-bold">
        <CalendarDays className="h-3.5 w-3.5" /> احجز كشفك الآن
      </button>
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="grid w-14 place-items-center rounded-xl bg-teal-700 text-white transition hover:bg-teal-800 shadow-sm"
        aria-label="واتساب"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}

function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialService, setInitialService] = useState('');
  const [initialBranch, setInitialBranch] = useState('');

  // Initialize Lenis smooth momentum scroll
  useSmoothScroll();

  const handleOpenBooking = (serviceName = '', branchId = '') => {
    setInitialService(serviceName);
    setInitialBranch(branchId);
    setBookingOpen(true);
  };

  return (
    <div className="overflow-hidden bg-[#F8FAF9] dark:bg-[#0c0e12] text-slate-900 dark:text-gray-100 min-h-screen">
      <SplashScreen />
      <Header />
      <main>
        <Hero onBook={() => handleOpenBooking()} />
        <TrustBar />
        <Services onBook={() => handleOpenBooking()} />
        <SkinDiagnosticQuiz onBook={(svc) => handleOpenBooking(svc)} />
        <About />
        <Gallery />
        <Reviews />
        <FAQ />
        <BranchHubWithMatrix onBookBranch={(branchId) => handleOpenBooking('', branchId)} />
      </main>
      <LuxuryFooter />
      <ScrollToTopButton />
      {/* Strict note: No floating WhatsApp corner button */}
      <MobileBottomBar onBook={() => handleOpenBooking()} />
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialService={initialService}
        initialBranch={initialBranch}
      />
    </div>
  );
}

export default App;
