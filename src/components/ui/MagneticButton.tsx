import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  magneticRadius?: number;
  strength?: number;
  asChild?: boolean;
}

export function MagneticButton({
  children,
  className = '',
  magneticRadius = 50,
  strength = 0.35,
  onClick,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Framer motion values with spring physics for natural elasticity
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 180, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    // Apply magnetic pull if cursor approaches within radius
    if (distance < rect.width / 2 + magneticRadius) {
      x.set(distanceX * strength);
      y.set(distanceY * strength);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={buttonRef}
      style={{
        x: springX,
        y: springY,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex items-center justify-center transition-shadow duration-300 ${
        isHovered ? 'shadow-[0_0_25px_rgba(0,184,169,0.45)] ring-1 ring-[#00B8A9]/50' : ''
      } ${className}`}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* Subtle radial sheen glow that follows magnetic state */}
      <span
        className={`pointer-events-none absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : ''
        }`}
      />
    </motion.button>
  );
}
