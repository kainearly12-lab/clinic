import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ShieldCheck, MapPin, Star, Award, Stethoscope } from 'lucide-react';

export function DoctorCard3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for high-end organic physics
  const springConfig = { damping: 25, stiffness: 180, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

  // Spotlight position relative to card
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[530px] select-none py-6 [perspective:1400px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
    >
      {/* Ambient background glow matching luxury mint & emerald palette */}
      <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-teal-500/20 via-emerald-400/15 to-teal-600/10 blur-2xl transition-opacity duration-700 dark:from-teal-600/20 dark:via-emerald-500/15 dark:to-transparent" />

      {/* Main 3D Card Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative rounded-[2.25rem] border border-emerald-900/10 dark:border-white/10 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/90 dark:from-[#141820]/95 dark:via-[#11141a]/90 dark:to-[#0d1015]/95 p-4 sm:p-6 shadow-[0_20px_50px_rgba(15,118,110,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-shadow duration-500"
      >
        {/* Dynamic Light Spotlight / Glare Overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[2.25rem] opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: `radial-gradient(650px circle at ${glareX.get()}% ${glareY.get()}%, rgba(20,184,166,0.25), transparent 70%)`,
          }}
        />

        {/* Card Header Tag */}
        <div className="flex items-center justify-between pb-3 px-2" style={{ transform: 'translateZ(25px)' }}>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest text-teal-800 dark:text-teal-300 uppercase font-sans">
              CONSULTANT SPECIALIST
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 px-2.5 py-1 text-[11px] font-bold text-teal-800 dark:text-teal-300 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>معتمد طبياً</span>
          </div>
        </div>

        {/* Doctor Image Container with Layered Framing & Backdrop */}
        <div className="relative aspect-[0.88] overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-teal-100/60 via-slate-100/80 to-teal-50/50 dark:from-slate-800/70 dark:via-slate-900/80 dark:to-[#0f131a] border border-teal-900/5 dark:border-white/5 shadow-inner">
          {/* Subtle Decorative Geometric Backdrop Circles */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-300/10 blur-xl" />
          <div className="pointer-events-none absolute bottom-4 -left-10 h-44 w-44 rounded-full bg-teal-600/15 blur-lg" />
          <div className="pointer-events-none absolute inset-x-8 top-12 h-44 rounded-full border border-teal-500/15 dark:border-teal-400/10" />

          {/* EXACT Doctor PNG Image - direct URL without AI modification */}
          <div
            className="relative h-full w-full flex items-end justify-center pt-4"
            style={{ transform: 'translateZ(40px)' }}
          >
            <img
              src="https://i.postimg.cc/m2W4gjwt/106929042-3317889038271540-2818272907474417516-n-1-removebg-preview.png"
              alt="دكتور استشاري الجلدية والليزر - عيادات Androderma"
              className="h-[96%] w-auto object-contain object-bottom drop-shadow-[0_15px_25px_rgba(15,118,110,0.22)] dark:drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)] transition-transform duration-500"
              loading="eager"
            />
          </div>

          {/* Bottom Gradient Fade for Seamless Integration */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-[#11141a] dark:via-[#11141a]/50 dark:to-transparent" />

          {/* Overlay Doctor Title Badge inside the Image Frame */}
          <div
            className="absolute bottom-3 inset-x-3 rounded-2xl bg-white/90 dark:bg-[#151922]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-3 shadow-md"
            style={{ transform: 'translateZ(50px)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    نخبة استشاريي الجلدية والليزر
                  </h3>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  تشخيص دقيق وخطة علاج مخصصة لكل حالة
                </p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-700/40 px-2.5 py-1 rounded-xl text-amber-900 dark:text-amber-300 text-xs font-bold shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>3.9</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Luxury Glass Badges with 3D Depth Offsets */}
        {/* Badge 1: Experience (+12 Years) */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-3 -right-2 sm:-right-5 z-20 flex items-center gap-2.5 rounded-2xl bg-white/90 dark:bg-[#1a202c]/90 backdrop-blur-xl border border-teal-600/20 dark:border-teal-500/30 px-3.5 py-2.5 shadow-[0_10px_25px_rgba(15,118,110,0.15)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
          style={{ transform: 'translateZ(60px)' }}
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white shadow-xs">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-900 dark:text-white">
              +12 سنة خبرة
            </span>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
              استشارات سريرية متقدمة
            </span>
          </div>
        </motion.div>

        {/* Badge 2: Certified 4 Branches */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -bottom-3 -left-2 sm:-left-5 z-20 flex items-center gap-2.5 rounded-2xl bg-white/90 dark:bg-[#1a202c]/90 backdrop-blur-xl border border-slate-200 dark:border-teal-500/30 px-3.5 py-2.5 shadow-[0_10px_25px_rgba(15,118,110,0.15)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
          style={{ transform: 'translateZ(65px)' }}
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-900 dark:text-white">
              4 فروع معتمدة
            </span>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              مدينة نصر • التجمع • المعادي • نيو جيزة
            </span>
          </div>
        </motion.div>

        {/* Badge 3: Clinical Diagnostic Guarantee */}
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="hidden sm:flex absolute top-1/2 -left-6 -translate-y-1/2 z-20 items-center gap-2 rounded-2xl bg-white/90 dark:bg-[#151922]/90 backdrop-blur-xl border border-teal-500/20 px-3 py-2 shadow-lg"
          style={{ transform: 'translateZ(45px)' }}
        >
          <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            أحدث أجهزة الليزر العالمية
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
