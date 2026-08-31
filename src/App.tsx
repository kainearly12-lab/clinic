import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  ChevronDown,
  Stethoscope,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { LuxuryFooter } from '@/components/LuxuryFooter';
import { SplashScreen } from '@/components/SplashScreen';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { BookingButton, BookingModal } from '@/components/BookingModal';
import { LiveAvailabilityBadge } from '@/components/ui/LiveAvailabilityBadge';
import { DoctorCard3D } from '@/components/DoctorCard3D';
import { ServicesGrid } from '@/components/ServicesGrid';
import { TreatmentJourneyTimeline } from '@/components/TreatmentJourneyTimeline';
import { SkinDiagnosticQuiz } from '@/components/SkinDiagnosticQuiz';
import { BranchHubWithMatrix } from '@/components/BranchHubWithMatrix';
import { AnimatedStatsBar } from '@/components/AnimatedStatsBar';
import { MedicalPhilosophyBento } from '@/components/MedicalPhilosophyBento';
import { GoogleReviewsMarquee } from '@/components/GoogleReviewsMarquee';
import { BentoFAQAccordion } from '@/components/BentoFAQAccordion';
import { clinic } from '@/data/clinicData';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;

interface HeroProps {
  onBook: () => void;
  onOpenDiagnostic: () => void;
}

function Hero({ onBook, onOpenDiagnostic }: HeroProps) {
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

          {/* Live Availability Micro-Badge Floating Directly Above CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.6 }}
            className="mt-7 flex items-center"
          >
            <LiveAvailabilityBadge count={3} branchName="التجمع" />
          </motion.div>

          {/* Action CTAs with Magnetic Physics */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.7 }}
            className="mt-4 flex flex-wrap items-center gap-3.5"
          >
            {/* Primary Magnetic CTA */}
            <BookingButton
              onClick={onBook}
              className="py-3.5 px-7 text-sm font-black shadow-md hover:shadow-xl hover:bg-teal-800"
            >
              احجز كشفك الآن
            </BookingButton>

            {/* Secondary Discovery CTA - Navigates to dedicated Skin Diagnostic Quiz Tab */}
            <button
              type="button"
              onClick={onOpenDiagnostic}
              className="btn-secondary py-3.5 px-6 text-sm font-bold shadow-xs hover:shadow-md border-teal-600/30 hover:border-teal-600"
            >
              <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>🧴 فحص البشرة 3D التفاعلي</span>
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
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.7 • 54 تقييم على Google
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
  const [activeTab, setActiveTab] = useState<'home' | 'diagnostic'>('home');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialService, setInitialService] = useState('');
  const [initialBranch, setInitialBranch] = useState('');

  // Initialize Lenis smooth momentum scroll
  useSmoothScroll();

  // Listen to hash changes if someone navigates with #diagnostic-quiz
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#diagnostic-quiz') {
        setActiveTab('diagnostic');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectTab = (tab: 'home' | 'diagnostic', targetAnchor?: string) => {
    setActiveTab(tab);
    if (tab === 'diagnostic') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetAnchor) {
      setTimeout(() => {
        const el = document.getElementById(targetAnchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenBooking = (serviceName = '', branchId = '') => {
    setInitialService(serviceName);
    setInitialBranch(branchId);
    setBookingOpen(true);
  };

  return (
    <div className="overflow-hidden bg-[#F8FAF9] dark:bg-[#0c0e12] text-slate-900 dark:text-gray-100 min-h-screen">
      <SplashScreen />
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenBooking={() => handleOpenBooking()}
      />

      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'diagnostic' ? (
            <motion.div
              key="diagnostic-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <SkinDiagnosticQuiz
                onBook={(svc) => handleOpenBooking(svc)}
                onBackToHome={() => handleSelectTab('home')}
              />
            </motion.div>
          ) : (
            <motion.div
              key="home-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Hero
                onBook={() => handleOpenBooking()}
                onOpenDiagnostic={() => handleSelectTab('diagnostic')}
              />
              <AnimatedStatsBar />
              <ServicesGrid onBookService={(serviceName) => handleOpenBooking(serviceName)} />
              <TreatmentJourneyTimeline onBook={() => handleOpenBooking()} />
              <MedicalPhilosophyBento />
              <GoogleReviewsMarquee />
              <BentoFAQAccordion />
              <BranchHubWithMatrix onBookBranch={(branchId) => handleOpenBooking('', branchId)} />
            </motion.div>
          )}
        </AnimatePresence>
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
