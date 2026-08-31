interface LogoMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LogoMark({ size = 'md', className = '' }: LogoMarkProps) {
  const dimensions = {
    sm: 'h-9 w-9 rounded-xl',
    md: 'h-11 w-11 rounded-2xl',
    lg: 'h-13 w-13 rounded-2xl',
    xl: 'h-16 w-16 rounded-3xl',
  }[size];

  const svgSize = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  }[size];

  return (
    <div
      className={`relative grid shrink-0 place-items-center bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-teal-300 shadow-md ring-1 ring-teal-500/30 ${dimensions} ${className}`}
    >
      <div className="absolute inset-0 rounded-inherit bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-400/30 via-transparent to-transparent" />
      <div className="relative flex items-center justify-center">
        {/* Modern luxury clinical vector icon (Medical Shield + Cross) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${svgSize} text-teal-300 transition-transform duration-300 group-hover:scale-105`}
        >
          {/* Outer Medical Shield */}
          <path
            d="M12 3.5C8 5.8 4.5 6.4 4.5 12C4.5 17.8 8.2 21.2 12 22.5C15.8 21.2 19.5 17.8 19.5 12C19.5 6.4 16 5.8 12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal-400"
          />
          {/* Inner Clinical Medical Cross */}
          <path
            d="M12 8.5V15.5M8.5 12H15.5"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-xs" />
    </div>
  );
}

