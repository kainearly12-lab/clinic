import { useState, useEffect, useCallback } from 'react';
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
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminAuthModal } from '@/components/admin/AdminAuthModal';
import { AboutPage } from '@/pages/AboutPage';
import { clinic } from '@/data/clinicData';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { getSupabaseClient } from '@/lib/supabase';
import { getValidAdminSession, clearAdminSession } from '@/utils/adminAuth';

import { useLanguage } from '@/context/LanguageContext';

const waLink = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`;

interface HeroProps {
  onBook: () => void;
  onOpenDiagnostic: () => void;
}

function Hero({ onBook, onOpenDiagnostic }: HeroProps) {
  const { language, t } = useLanguage();

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
        {/* Text Column: Headlines & CTAs */}
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
              {t('hero.eyebrow')}
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.25rem] font-extrabold leading-[1.38] text-slate-900 dark:text-white sm:text-5xl sm:leading-[1.3] lg:text-[3.6rem] lg:leading-[1.25]"
          >
            {t('hero.title.part1')}{' '}
            <span className="relative inline-block text-teal-700 dark:text-teal-400">
              {t('hero.title.part2')}
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
            {t('hero.subtitle')}
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
              className="py-3.5 px-7 text-sm font-black shadow-md hover:shadow-xl hover:bg-teal-800 cursor-pointer"
            >
              {t('hero.cta.book')}
            </BookingButton>

            {/* Secondary Discovery CTA */}
            <button
              type="button"
              onClick={onOpenDiagnostic}
              className="btn-secondary py-3.5 px-6 text-sm font-bold shadow-xs hover:shadow-md border-teal-600/30 hover:border-teal-600 cursor-pointer flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>{t('hero.cta.quiz')}</span>
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
              <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" /> {t('hero.trust.branches')}
            </span>
            <span className="hidden h-3.5 w-px bg-slate-300 dark:bg-gray-700 sm:inline-block" />
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-gray-300">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {t('hero.trust.rating')}
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
          className="flex items-center gap-1 text-slate-600 dark:text-gray-300 hover:text-teal-700 transition-colors cursor-pointer"
        >
          <span>{language === 'en' ? 'Discover More' : 'اكتشف المزيد'}</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </div>
    </motion.section>
  );
}

function MobileBottomBar({ onBook }: { onBook: () => void }) {
  const { language } = useLanguage();
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/90 dark:bg-[#12151b]/90 backdrop-blur-xl border-t border-slate-200/90 dark:border-teal-500/20 px-3.5 pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(0,0,0,0.15)]">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <button
          onClick={onBook}
          className="btn-primary flex-1 py-3 px-4 text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <CalendarDays className="h-4 w-4 text-teal-100" />
          <span>{language === 'en' ? 'Book Your Consultation Now 📅' : 'احجز كشفك الآن 📅'}</span>
        </button>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm shrink-0 active:scale-95"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}

function App() {
  // Determine initial route based on window pathname and hash
  const isInitialAdminPath = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/admin') ||
    window.location.hash === '#admin'
  );
  const isInitialAboutPath = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/about') ||
    window.location.hash === '#about'
  );

  const [activeTab, setActiveTab] = useState<'home' | 'diagnostic' | 'admin' | 'about'>(
    isInitialAdminPath ? 'admin' : isInitialAboutPath ? 'about' : 'home'
  );
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialService, setInitialService] = useState('');
  const [initialBranch, setInitialBranch] = useState('');

  // Admin Auth Gate State with Cryptographic Session Validation
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const validSession = getValidAdminSession();
    return Boolean(validSession);
  });
  const [adminUserEmail, setAdminUserEmail] = useState<string>(() => {
    const validSession = getValidAdminSession();
    return validSession?.displayName || validSession?.email || 'مدير النظام';
  });

  // Initialize Lenis smooth momentum scroll
  useSmoothScroll();

  // Check Supabase & local token session on startup
  useEffect(() => {
    const checkAuthSession = async () => {
      const activeSession = getValidAdminSession();
      if (activeSession) {
        setIsAdminAuthenticated(true);
        setAdminUserEmail(activeSession.displayName || 'مدير النظام');
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) return;
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setIsAdminAuthenticated(true);
          setAdminUserEmail('مدير النظام');
        }
      } catch (err) {
        console.warn('Error checking existing Supabase session:', err);
      }
    };
    checkAuthSession();
  }, []);

  // Secure Admin Access Trigger
  const handleTriggerAdminAccess = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
    setActiveTab('admin');

    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAdminAuthenticated]);

  // Synchronize route and handle browser Back / Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path.startsWith('/admin') || hash === '#admin') {
        setActiveTab('admin');
        if (!isAdminAuthenticated) {
          setIsAdminAuthModalOpen(true);
        }
      } else if (path.startsWith('/about') || hash === '#about') {
        setActiveTab('about');
        setIsAdminAuthModalOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#diagnostic-quiz') {
        setActiveTab('diagnostic');
        setIsAdminAuthModalOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setActiveTab('home');
        setIsAdminAuthModalOpen(false);
      }
    };

    // Trigger on mount if starting at /admin
    if (isInitialAdminPath) {
      if (!isAdminAuthenticated) {
        setIsAdminAuthModalOpen(true);
      }
    }

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [isAdminAuthenticated, isInitialAdminPath]);

  // Auth Success Handler from Modal
  const handleAuthSuccess = (email: string) => {
    setIsAdminAuthenticated(true);
    setAdminUserEmail(email);
    setIsAdminAuthModalOpen(false);
    setActiveTab('admin');
    if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Sign Out Handler
  const handleAdminSignOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    clearAdminSession();
    setIsAdminAuthenticated(false);
    setActiveTab('home');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: 'home' | 'diagnostic' | 'admin' | 'about', targetAnchor?: string) => {
    if (tab === 'admin') {
      handleTriggerAdminAccess();
      return;
    }

    const targetPath = tab === 'about' ? '/about' : '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    setActiveTab(tab);
    if (tab === 'diagnostic' || tab === 'about') {
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

  // Dedicated Route: `/admin` authenticated view
  if (activeTab === 'admin' && isAdminAuthenticated) {
    return (
      <AdminDashboard
        onBackToSite={() => handleSelectTab('home')}
        onSignOut={handleAdminSignOut}
        adminEmail={adminUserEmail}
      />
    );
  }

  return (
    <div className="overflow-hidden bg-[#F8FAF9] dark:bg-[#0c0e12] text-slate-900 dark:text-gray-100 min-h-screen pb-20 md:pb-0">
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
          ) : activeTab === 'about' ? (
            <motion.div
              key="about-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <AboutPage
                onOpenBooking={(svc, branch) => handleOpenBooking(svc, branch)}
                onNavigateHome={(anchor) => handleSelectTab('home', anchor)}
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

      <LuxuryFooter onOpenAdmin={handleTriggerAdminAccess} />
      <ScrollToTopButton />
      {/* Strict note: No floating WhatsApp corner button */}
      <MobileBottomBar onBook={() => handleOpenBooking()} />
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialService={initialService}
        initialBranch={initialBranch}
      />
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => {
          setIsAdminAuthModalOpen(false);
          if (activeTab === 'admin' && !isAdminAuthenticated) {
            handleSelectTab('home');
          }
        }}
        onSuccess={handleAuthSuccess}
        onBackToSite={() => {
          setIsAdminAuthModalOpen(false);
          handleSelectTab('home');
        }}
      />
    </div>
  );
}

export default App;
