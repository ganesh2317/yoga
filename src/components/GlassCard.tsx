import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'focal' | 'interactive' | 'glow' | 'subtle';
  className?: string;
  glowColor?: 'emerald' | 'amber' | 'red' | 'forest' | 'ochre' | 'rust';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  glowColor = 'emerald',
  ...props
}) => {
  // Map legacy color tokens to reference tokens seamlessly
  const activeGlow = glowColor === 'forest' ? 'emerald' : glowColor === 'ochre' ? 'amber' : glowColor === 'rust' ? 'red' : glowColor;

  const glowClasses = {
    emerald: 'shadow-emerald-glow border-[#22C55E]/40',
    amber: 'shadow-amber-glow border-[#F59E0B]/40',
    red: 'shadow-red-glow border-[#EF4444]/40',
  }[activeGlow];

  const baseStyle =
    'relative overflow-hidden rounded-2xl bg-[#151B24]/90 border border-white/8 backdrop-blur-xl shadow-glass-subtle transition-all duration-300';
  const innerHighlight =
    'before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/18 before:to-transparent before:pointer-events-none';
  const amberSweep =
    'after:absolute after:-top-1/2 after:-left-1/2 after:w-[200%] after:h-[200%] after:bg-gradient-to-r after:from-transparent after:via-amber-500/5 after:to-transparent after:pointer-events-none after:animate-liquid-sweep';

  const variantStyle = {
    default: `${baseStyle} ${innerHighlight} ${amberSweep}`,
    focal: `relative overflow-hidden rounded-2xl bg-[#151B24]/95 border border-white/12 backdrop-blur-2xl shadow-glass-glow ${innerHighlight} ${amberSweep}`,
    interactive: `${baseStyle} ${innerHighlight} hover:bg-[#1C2430] hover:border-white/18 active:scale-[0.98] active:shadow-[0_0_16px_rgba(245,158,11,0.25)] cursor-pointer`,
    glow: `${baseStyle} ${innerHighlight} ${glowClasses} ${amberSweep}`,
    subtle: 'rounded-2xl bg-[#151B24]/60 border border-white/[0.05] backdrop-blur-md',
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
