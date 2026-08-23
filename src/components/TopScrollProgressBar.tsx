import { useEffect, useState } from 'react';

export function TopScrollProgressBar() {
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
      className="w-full h-1 bg-charcoal-900/10 rounded-full overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-sage-600 via-charcoal-900 to-sage-600 transition-all duration-75 ease-out rounded-full shadow-sm"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
