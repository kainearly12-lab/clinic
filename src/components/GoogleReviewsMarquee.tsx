import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { GsapTextReveal } from '@/components/ui/GsapTextReveal';
import { reviews, clinic } from '@/data/clinicData';

export function GoogleReviewsMarquee() {
  // Quadruple review list so 1st half (16 items) and 2nd half (16 items) are perfectly identical
  const marqueeCards = [...reviews, ...reviews, ...reviews, ...reviews];

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-white/80 dark:bg-[#121419] py-20 sm:py-28 transition-colors duration-300 border-b border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/3 h-80 w-80 rounded-full bg-amber-400/10 dark:bg-amber-500/5 blur-[120px]" />

      <div className="container-px mx-auto max-w-7xl">
        {/* Section Header with Google Summary Badge */}
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-3">
                <MessageSquareQuote className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>VERIFIED PATIENT EXPERIENCES</span>
              </div>
              <GsapTextReveal className="text-3xl font-extrabold leading-[1.35] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                تجارب حقيقية، <br />
                <span className="text-teal-700 dark:text-[#00B8A9]">بكلمات مراجعينا على Google</span>
              </GsapTextReveal>
            </div>

            {/* Google Rating Overview Glass Box */}
            <div className="flex items-center gap-4 rounded-2xl bg-white/95 dark:bg-[#181b24]/95 border border-[#00B8A9]/40 p-4 shadow-[0_0_15px_rgba(0,184,169,0.15)]">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-sans">
                  {clinic.rating.toFixed(1)}
                </span>
                <div className="mt-1 flex gap-0.5" title="تقييم 4.7 من 5 نجوم">
                  {[1, 2, 3, 4, 5].map((s) => {
                    if (s <= 4) {
                      return (
                        <Star
                          key={s}
                          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        />
                      );
                    }
                    if (s === 5) {
                      // 4.7 Rating -> 70% filled star for the 5th star
                      return (
                        <div key={s} className="relative h-3.5 w-3.5">
                          <Star className="absolute inset-0 h-3.5 w-3.5 fill-slate-200 text-slate-300 dark:fill-gray-700 dark:text-gray-600" />
                          <div className="absolute inset-0 overflow-hidden w-[70%]">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Star
                        key={s}
                        className="h-3.5 w-3.5 fill-slate-200 text-slate-300 dark:fill-gray-700 dark:text-gray-600"
                      />
                    );
                  })}
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-gray-800" />
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Reviews</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                  +{clinic.reviewsCount} تقييم موثق
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Infinite Zero-Gap Moving Marquee Slider (Smooth Continuous Auto-Scrolling with Pause on Hover) */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Soft Blur Fade Edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 sm:w-36 bg-gradient-to-r from-white dark:from-[#121419] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 sm:w-36 bg-gradient-to-l from-white dark:from-[#121419] to-transparent" />

        <div dir="ltr" className="w-full overflow-hidden">
          <div className="flex w-max gap-6 pr-6 animate-marquee-infinite hover:[animation-play-state:paused]">
            {marqueeCards.map((review, idx) => (
              <div
                key={`rev-card-${review.id}-${idx}`}
                dir="rtl"
                className="w-[340px] sm:w-[420px] shrink-0 rounded-3xl bg-white/90 dark:bg-[#181b24]/90 backdrop-blur-md border border-[#00B8A9]/40 hover:border-[#00B8A9] p-6 sm:p-7 shadow-[0_0_15px_rgba(0,184,169,0.15)] hover:shadow-[0_0_25px_rgba(0,184,169,0.25)] hover:-translate-y-1.5 transition-all duration-300 text-right flex flex-col justify-between select-none"
              >
                <div>
                  {/* Card Header: Google Badge & Stars */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black text-xs font-sans">
                        G
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400">
                        {review.branchAr ?? 'عيادات Androderma'}
                      </span>
                    </div>

                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Review Body */}
                  <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-gray-200 leading-relaxed">
                    "{review.text}"
                  </p>
                </div>

                {/* Card Footer: Patient Name & Verification */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-gray-800/80 pt-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {review.author}
                    </h4>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{review.roleAr ?? 'مراجعة موثقة'}</span>
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-slate-600 dark:text-gray-400">
                    {review.dateAr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
