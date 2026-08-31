import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { clinic } from '@/data/clinicData';

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem('androderma_preloaded') !== 'true';
    } catch {
      return true;
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;

    const ctx = gsap.context(() => {
      const counterObj = { value: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem('androderma_preloaded', 'true');
          } catch {
            // Ignore session storage errors if restricted
          }
          setVisible(false);
        },
      });

      // 1. Initial Reveal of Logo & Typography
      tl.fromTo(
        logoRef.current,
        { scale: 0.82, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }
      )
        .fromTo(
          '.preloader-fade-in',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
          '-=0.3'
        )

        // 2. Animated 00% to 100% Counter & Progress Track
        .to(
          counterObj,
          {
            value: 100,
            duration: 1.6,
            ease: 'power2.inOut',
            onUpdate: () => {
              const current = Math.floor(counterObj.value);
              if (counterRef.current) {
                counterRef.current.textContent = `${current.toString().padStart(2, '0')}%`;
              }
              if (progressBarRef.current) {
                progressBarRef.current.style.width = `${current}%`;
              }
            },
          },
          '-=0.2'
        )

        // 3. Subtle Hold at 100%
        .to({}, { duration: 0.2 })

        // 4. Content scale & fade out
        .to(contentRef.current, {
          opacity: 0,
          scale: 1.06,
          y: -25,
          duration: 0.45,
          ease: 'power3.in',
        })

        // 5. Container slides smoothly upward (Awwwards curtain reveal)
        .to(
          containerRef.current,
          {
            yPercent: -100,
            duration: 0.85,
            ease: 'power4.inOut',
          },
          '-=0.15'
        );
    }, containerRef);

    return () => ctx.revert();
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0F17] text-white overflow-hidden select-none"
      aria-label="شاشة التحميل"
    >
      {/* Ambient background glowing orbs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#00B8A9]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-teal-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,184,169,0.06)_0%,transparent_70%)]" />

      {/* Main Preloader Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full"
      >
        {/* Official Clinic Logo with Teal Glow Filter */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#00B8A9]/20 blur-2xl animate-pulse" />
          <img
            ref={logoRef}
            src="https://i.postimg.cc/5N8zRfpb/327194266-596823435614064-703957778024686372-n-removebg-preview.png"
            alt={clinic.name}
            className="relative w-28 sm:w-36 h-auto object-contain drop-shadow-[0_0_30px_rgba(0,184,169,0.35)]"
            loading="eager"
          />
        </div>

        {/* Brand Titles */}
        <h1 className="preloader-fade-in font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
          عيادات Androderma
        </h1>
        <p className="preloader-fade-in mt-1.5 text-xs sm:text-sm font-semibold tracking-wider text-teal-300">
          عناية متقدمة بالجلدية والتجميل والليزر
        </p>

        {/* Dynamic Percentage Counter & Progress Line */}
        <div className="preloader-fade-in mt-8 flex flex-col items-center w-full max-w-[240px]">
          <div className="flex items-center justify-between w-full mb-2">
            <span
              ref={counterRef}
              className="text-lg sm:text-xl font-mono font-black tracking-wider text-[#00B8A9] drop-shadow-[0_0_10px_rgba(0,184,169,0.4)]"
            >
              00%
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              جاري التحميل
            </span>
          </div>

          {/* Glowing Track & Progress Bar */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90 border border-white/10 shadow-inner">
            <div
              ref={progressBarRef}
              className="absolute inset-y-0 left-0 w-0 rounded-full bg-gradient-to-r from-teal-500 via-[#00B8A9] to-emerald-400 shadow-[0_0_12px_rgba(0,184,169,0.7)] transition-[width] duration-75 ease-linear"
            />
          </div>

          {/* Micro-Typography Prompt */}
          <p className="mt-3.5 text-[11px] font-medium text-slate-400/90 tracking-wide text-center">
            جاري تجهيز تجربة العناية بالبشرة...
          </p>
        </div>
      </div>
    </div>
  );
}
