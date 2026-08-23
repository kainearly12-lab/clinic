import { useEffect, useState } from 'react';

export function TopScrollProgressBar({ className = '' }: { className?: string }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight <= 0) {
            setScrollProgress(0);
          } else {
            const currentScroll = window.scrollY;
            const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
            setScrollProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`w-full h-[3px] bg-charcoal-900/10 dark:bg-white/10 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-sage-500 via-sage-400 to-emerald-400 dark:from-sage-400 dark:via-emerald-400 dark:to-sage-300 transition-all duration-75 ease-out shadow-sm"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
