import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  HeartPulse,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal, Stagger, staggerItem } from '@/components/ui/Reveal';
import { GsapTextReveal } from '@/components/ui/GsapTextReveal';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function MedicalPhilosophyBento() {
  const pillarsRef = useRef<HTMLDivElement | null>(null);
  const progressLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      if (pillarsRef.current && progressLineRef.current) {
        gsap.fromTo(
          progressLineRef.current,
          { scaleY: 0, transformOrigin: 'top' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: pillarsRef.current,
              start: 'top 75%',
              end: 'bottom 60%',
              scrub: 0.5,
            },
          }
        );
      }
    }, pillarsRef);

    return () => ctx.revert();
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-white/80 dark:bg-[#0e1014] py-20 sm:py-28 transition-colors duration-300 border-b border-slate-200/80 dark:border-gray-800/80"
    >
      {/* Soft Ambient Light Blobs */}
      <div className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -left-24 bottom-1/4 h-96 w-96 rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[120px]" />

      <div className="container-px relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          
          {/* Right Column (Visual Bento with Parallax & Floating Luxury Glass Badge) */}
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-lg">
              
              {/* Main Visual Frame */}
              <div className="group relative aspect-[0.88] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-slate-800 dark:to-slate-900 border border-emerald-900/10 dark:border-emerald-500/20 shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="الرعاية الطبية والتعقيم في عيادات Androderma"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
                
                {/* Visual Bottom Micro-Card */}
                <div className="absolute bottom-6 right-6 left-6 text-right">
                  <div className="inline-flex items-center gap-2 rounded-full bg-teal-800/80 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-teal-100 shadow-xs mb-2">
                    <Award className="h-3.5 w-3.5 text-teal-300" />
                    <span>إشراف طبي واستشاري مباشر</span>
                  </div>
                  <h4 className="text-lg font-bold text-white leading-relaxed">
                    د. أحمد زغلول — استشاري الأمراض الجلدية والليزر
                  </h4>
                </div>
              </div>

              {/* Floating Top-Left Glass Badge: "معايير تعقيم وعناية فائقة" */}
              <motion.div
                initial={{ opacity: 0, y: -20, x: -20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.7 }}
                whileHover={{ scale: 1.03 }}
                className="absolute -top-6 -left-4 sm:-left-6 max-w-[210px] rounded-2xl bg-white/95 dark:bg-[#161a22]/95 border border-emerald-900/15 dark:border-emerald-500/30 p-4 shadow-xl backdrop-blur-xl text-right"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                    معايير صارمة
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-200 leading-snug">
                  معايير تعقيم وعناية فائقة وفق البروتوكولات الطبية
                </p>
              </motion.div>

              {/* Decorative Accent Circles */}
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 rounded-full border-2 border-teal-500/20 -z-10" />
            </div>
          </Reveal>

          {/* Left Column: Clinical Philosophy Bento Cards */}
          <div className="order-1 lg:order-2 text-right">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-700/50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 shadow-xs mb-4">
                <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>A DIFFERENT CLINICAL APPROACH</span>
              </div>
              <GsapTextReveal className="text-3xl font-extrabold leading-[1.35] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                لأن العناية الحقيقية <br />
                <span className="text-teal-700 dark:text-[#00B8A9]">تبدأ بالاستماع والتشخيص</span>
              </GsapTextReveal>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-gray-300 font-medium max-w-xl">
                في عيادات Androderma، لا نعتمد على الحلول السريعة أو القوالب الجاهزة. نمنحك وقتاً كاملاً لفهم طبيعة بشرتك، وبناء بروتوكول طبي فردي يحقق أقصى نتائج آمنة ومستدامة.
              </p>
            </Reveal>

            {/* 3 Interactive Connected Bento Glass Cards with Glowing Timeline */}
            <div ref={pillarsRef} className="relative mt-8 pr-5 sm:pr-6 border-r-2 border-emerald-500/20">
              {/* GSAP Scrubbed Glowing Emerald Timeline Line */}
              <div
                ref={progressLineRef}
                className="absolute top-0 right-[-2px] bottom-0 w-[2px] bg-gradient-to-b from-[#00B8A9] via-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(0,184,169,0.7)] origin-top z-10"
              />

              <Stagger className="space-y-4" stagger={0.1}>
                
                {/* Bento Card 1: Detailed Consultation */}
                <motion.div
                  variants={staggerItem}
                  whileHover={{ x: -6 }}
                  onMouseMove={handleCardMouseMove}
                  className="group relative flex items-start gap-4 sm:gap-5 rounded-2xl bg-white/90 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xs transition-all duration-300 hover:border-[#00B8A9]/40 hover:bg-teal-50/20 dark:hover:bg-slate-900/60 group-hover:shadow-[0_10px_30px_-10px_rgba(0,184,169,0.1)] overflow-hidden"
                >
                  {/* Timeline Connection Indicator Dot */}
                  <span className="absolute -right-[27px] sm:-right-[31px] top-8 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#0e1014] bg-[#00B8A9] shadow-[0_0_8px_rgba(0,184,169,0.6)] z-20 group-hover:scale-125 transition-transform" />

                  {/* Top Ambient Glow + Dynamic Radial Spotlight */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        'radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 184, 169, 0.12), transparent 75%)',
                    }}
                  />

                  {/* Refined Minimal Icon Badge */}
                  <div className="relative z-10 w-12 h-12 shrink-0 rounded-xl bg-[#00B8A9]/10 border border-[#00B8A9]/20 flex items-center justify-center text-[#00B8A9] shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white text-right leading-relaxed group-hover:text-teal-700 dark:group-hover:text-[#00B8A9] transition-colors">
                      استشارة مفصلة وتشخيص سريري دقيق
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed text-right font-medium">
                      تقييم متعمق لتاريخ البشرة وعواملها الوراثية لتحديد السبب الجذري قبل البدء في أي إجراء.
                    </p>
                  </div>
                </motion.div>

                {/* Bento Card 2: Advanced Technologies */}
                <motion.div
                  variants={staggerItem}
                  whileHover={{ x: -6 }}
                  onMouseMove={handleCardMouseMove}
                  className="group relative flex items-start gap-4 sm:gap-5 rounded-2xl bg-white/90 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xs transition-all duration-300 hover:border-[#00B8A9]/40 hover:bg-teal-50/20 dark:hover:bg-slate-900/60 group-hover:shadow-[0_10px_30px_-10px_rgba(0,184,169,0.1)] overflow-hidden"
                >
                  {/* Timeline Connection Indicator Dot */}
                  <span className="absolute -right-[27px] sm:-right-[31px] top-8 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#0e1014] bg-[#00B8A9] shadow-[0_0_8px_rgba(0,184,169,0.6)] z-20 group-hover:scale-125 transition-transform" />

                  {/* Top Ambient Glow + Dynamic Radial Spotlight */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        'radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 184, 169, 0.12), transparent 75%)',
                    }}
                  />

                  {/* Refined Minimal Icon Badge */}
                  <div className="relative z-10 w-12 h-12 shrink-0 rounded-xl bg-[#00B8A9]/10 border border-[#00B8A9]/20 flex items-center justify-center text-[#00B8A9] shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white text-right leading-relaxed group-hover:text-teal-700 dark:group-hover:text-[#00B8A9] transition-colors">
                      أحدث التقنيات العالمية المعتمدة
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed text-right font-medium">
                      أجهزة ليزر وتبريد فائقة وتقنيات حقن أصلية معتمدة من FDA لضمان أمان تام وفاعلية مثبتة.
                    </p>
                  </div>
                </motion.div>

                {/* Bento Card 3: Personalized Protocol */}
                <motion.div
                  variants={staggerItem}
                  whileHover={{ x: -6 }}
                  onMouseMove={handleCardMouseMove}
                  className="group relative flex items-start gap-4 sm:gap-5 rounded-2xl bg-white/90 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xs transition-all duration-300 hover:border-[#00B8A9]/40 hover:bg-teal-50/20 dark:hover:bg-slate-900/60 group-hover:shadow-[0_10px_30px_-10px_rgba(0,184,169,0.1)] overflow-hidden"
                >
                  {/* Timeline Connection Indicator Dot */}
                  <span className="absolute -right-[27px] sm:-right-[31px] top-8 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#0e1014] bg-[#00B8A9] shadow-[0_0_8px_rgba(0,184,169,0.6)] z-20 group-hover:scale-125 transition-transform" />

                  {/* Top Ambient Glow + Dynamic Radial Spotlight */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        'radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 184, 169, 0.12), transparent 75%)',
                    }}
                  />

                  {/* Refined Minimal Icon Badge */}
                  <div className="relative z-10 w-12 h-12 shrink-0 rounded-xl bg-[#00B8A9]/10 border border-[#00B8A9]/20 flex items-center justify-center text-[#00B8A9] shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white text-right leading-relaxed group-hover:text-teal-700 dark:group-hover:text-[#00B8A9] transition-colors">
                      بروتوكول فردي ومتابعة مستمرة
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed text-right font-medium">
                      خطة علاجية مخصصة تجمع بين الجلسات والروتين المنزلي مع إشراف دائم حتى الوصول للنتيجة.
                    </p>
                  </div>
                </motion.div>

              </Stagger>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
