import { motion } from 'framer-motion';

interface LiveAvailabilityBadgeProps {
  text?: string;
  className?: string;
  count?: number;
  branchName?: string;
}

export function LiveAvailabilityBadge({
  text,
  className = '',
  count = 3,
  branchName = 'التجمع',
}: LiveAvailabilityBadgeProps) {
  const displayText = text || `متاح ${count} مواعيد اليوم بفرع ${branchName}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-[#00B8A9]/30 px-3 py-1 text-xs font-bold text-[#00B8A9] backdrop-blur-md shadow-lg select-none ${className}`}
    >
      {/* Animated pulsing green indicator light */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B8A9] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B8A9]" />
      </span>

      {/* Text with dynamic urgency */}
      <span className="tracking-tight leading-none">{displayText}</span>
    </motion.div>
  );
}
