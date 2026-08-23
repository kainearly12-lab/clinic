import { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#faf8f5] dark:bg-[#0f1115] transition-all duration-700 ease-out ${
        fading ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
      aria-hidden={!visible}
    >
      {/* Background ambient light */}
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-sage-300/30 dark:bg-sage-600/15 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Animated Brand Logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-sage-400/25 blur-md animate-pulse" />
          <LogoMark size="xl" className="shadow-2xl ring-2 ring-sage-400/40" />
        </div>

        {/* Brand Typography */}
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-charcoal-950 dark:text-white">
          عيادات Androderma
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-semibold tracking-wider text-sage-700 dark:text-sage-300">
          عناية متقدمة بالجلدية والليزر
        </p>

        {/* Sleek Medical Loading Shimmer Bar (without any text) */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative h-1.5 w-44 overflow-hidden rounded-full bg-ivory-300 dark:bg-charcoal-800">
            <div className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-sage-500 via-charcoal-900 to-sage-600 dark:from-sage-400 dark:via-sage-200 dark:to-sage-500 animate-shimmer-slide" />
          </div>
        </div>
      </div>
    </div>
  );
}
