import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'focal' | 'interactive' | 'glow' | 'subtle';
  className?: string;
  glowColor?: 'sage' | 'green' | 'amber' | 'red';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  glowColor = 'sage',
  ...props
}) => {
  const glowClasses = {
    sage: 'shadow-sage-glow border-accent-sage/30',
    green: 'shadow-sage-glow border-accent-sage/30',
    amber: 'shadow-warm-glow border-accent-warm/30',
    red: 'shadow-red-glow border-status-poor/30',
  };

  const baseStyle =
    'relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.09] backdrop-blur-xl shadow-glass-subtle transition-all duration-300';
  const innerHighlight =
    'before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none';

  const variantStyle = {
    default: `${baseStyle} ${innerHighlight}`,
    focal: `relative overflow-hidden rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-2xl shadow-glass-glow ${innerHighlight}`,
    interactive: `${baseStyle} ${innerHighlight} hover:bg-white/[0.08] hover:border-white/18 active:scale-[0.98] cursor-pointer`,
    glow: `${baseStyle} ${innerHighlight} ${glowClasses[glowColor]}`,
    subtle: 'rounded-2xl bg-white/[0.025] border border-white/[0.06] backdrop-blur-md',
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
