import { Sparkles } from 'lucide-react';

interface LogoMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LogoMark({ size = 'md', className = '' }: LogoMarkProps) {
  const dimensions = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-12 w-12 rounded-2xl',
  }[size];

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size];

  return (
    <div
      className={`relative grid shrink-0 place-items-center bg-gradient-to-br from-charcoal-900 via-charcoal-950 to-charcoal-900 text-sage-300 shadow-sm ring-1 ring-sage-400/30 ${dimensions} ${className}`}
    >
      <div className="absolute inset-0 rounded-inherit bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sage-400/20 via-transparent to-transparent" />
      <div className="relative flex items-center justify-center">
        {/* Medical Dermatology Aesthetic Vector Icon */}
        <Sparkles className={`${iconSize} text-sage-300 transition-transform duration-300 group-hover:scale-110`} />
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-sage-500 ring-2 ring-ivory-50" />
    </div>
  );
}
