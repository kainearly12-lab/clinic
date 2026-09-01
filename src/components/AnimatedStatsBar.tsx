import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { Star, MessageSquareQuote, Building2, Clock3 } from 'lucide-react';
import { clinic } from '@/data/clinicData';

interface CounterProps {
  from?: number;
  to: number;
  decimals?: number;
  duration?: number;
  inView: boolean;
}

function AnimatedCounter({ from = 0, to, decimals = 0, duration = 1.6, inView }: CounterProps) {
  const [current, setCurrent] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setCurrent(latest),
    });
    return () => controls.stop();
  }, [inView, from, to, duration]);

  return <span>{current.toFixed(decimals)}</span>;
}

export function AnimatedStatsBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-40px' });
  const [starsGlowing, setStarsGlowing] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setStarsGlowing(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <section className="relative z-20 -mt-8 sm:-mt-10 px-4 sm:px-6 mb-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] bg-white/90 dark:bg-[#151922]/90 border border-slate-200/90 dark:border-teal-500/20 p-4 sm:p-7 shadow-[0_12px_40px_rgba(15,118,110,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          {/* Subtle Accent Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-2xl" />

          <div className="grid grid-cols-2 gap-4 divide-y divide-slate-100 dark:divide-gray-800/80 sm:grid-cols-4 sm:divide-y-0 sm:gap-2 sm:divide-x sm:divide-x-reverse">
            
            {/* Stat 1: Google Reviews Count (+54) */}
            <div className="flex flex-col items-center justify-center p-3 text-center sm:px-4">
              <div className="mb-2 flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 px-2.5 py-1 text-xs font-bold text-teal-800 dark:text-teal-300">
                <MessageSquareQuote className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>تقييمات موثقة</span>
              </div>
              <div className="flex items-baseline justify-center font-black tracking-tight text-slate-900 dark:text-white">
                <span className="text-3xl sm:text-4xl font-sans">
                  <AnimatedCounter from={0} to={clinic.reviewsCount} inView={inView} duration={1.8} />
                </span>
                <span className="text-xl sm:text-2xl text-teal-700 dark:text-teal-400 mr-0.5 ml-0.5 font-bold">+</span>
              </div>
              <span className="mt-1 text-xs font-semibold text-slate-600 dark:text-gray-300">
                على منصة Google
              </span>
            </div>

            {/* Stat 2: Rating (4.7 / 5 with Glowing Golden Stars) */}
            <div className="flex flex-col items-center justify-center p-3 text-center sm:px-4">
              <div className="mb-2 flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-700/40 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span>التقييم العام</span>
              </div>
              <div className="flex items-baseline justify-center font-black tracking-tight text-slate-900 dark:text-white">
                <span className="text-3xl sm:text-4xl font-sans">
                  <AnimatedCounter from={0} to={clinic.rating} decimals={1} inView={inView} duration={1.5} />
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-gray-400 mr-1 ml-1">/ 5.0</span>
              </div>
              {/* Interactive glowing stars */}
              <div className="mt-1.5 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.div
                    key={s}
                    animate={
                      starsGlowing && s <= 4
                        ? { scale: [1, 1.2, 1], filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.6))' }
                        : {}
                    }
                    transition={{ delay: s * 0.1, duration: 0.4 }}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        s <= 4
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-amber-400/40 text-amber-400/40'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stat 3: 4 Branches */}
            <div className="flex flex-col items-center justify-center p-3 text-center sm:px-4 pt-4 sm:pt-3">
              <div className="mb-2 flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 px-2.5 py-1 text-xs font-bold text-teal-800 dark:text-teal-300">
                <Building2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>الفروع المعتمدة</span>
              </div>
              <div className="flex items-baseline justify-center font-black tracking-tight text-slate-900 dark:text-white">
                <span className="text-3xl sm:text-4xl font-sans">
                  <AnimatedCounter from={0} to={4} inView={inView} duration={1.2} />
                </span>
                <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400 mr-1.5 ml-1.5">
                  فروع
                </span>
              </div>
              <span className="mt-1 text-xs font-semibold text-slate-600 dark:text-gray-300">
                القاهرة والجيزة
              </span>
            </div>

            {/* Stat 4: 11:00 PM Working Hours */}
            <div className="flex flex-col items-center justify-center p-3 text-center sm:px-4 pt-4 sm:pt-3">
              <div className="mb-2 flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-700/50 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span>مواعيد العمل</span>
              </div>
              <div className="flex items-baseline justify-center font-black tracking-tight text-slate-900 dark:text-white">
                <span className="text-2xl sm:text-3xl font-sans">11:00</span>
                <span className="text-xs sm:text-sm font-extrabold text-teal-700 dark:text-teal-400 mr-1 ml-1">
                  مساءً
                </span>
              </div>
              <span className="mt-1 text-xs font-semibold text-slate-600 dark:text-gray-300 flex items-center gap-1">
                <Clock3 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>استقبال الحالات يومياً</span>
              </span>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
