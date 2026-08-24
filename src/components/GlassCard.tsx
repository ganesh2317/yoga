import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'interactive' | 'glow' | 'subtle';
  className?: string;
  glowColor?: 'green' | 'amber' | 'red';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  glowColor = 'green',
  ...props
}) => {
  const glowClasses = {
    green: 'shadow-green-glow border-accent-green/30',
    amber: 'shadow-amber-glow border-status-slight/30',
    red: 'shadow-red-glow border-status-poor/30',
  };

  const baseStyle =
    'relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/12 backdrop-blur-xl shadow-glass-glow transition-all duration-300';
  const innerHighlight =
    'before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none';

  const variantStyle = {
    default: `${baseStyle} ${innerHighlight}`,
    interactive: `${baseStyle} ${innerHighlight} hover:bg-white/[0.09] hover:border-white/20 active:scale-[0.98] cursor-pointer`,
    glow: `${baseStyle} ${innerHighlight} ${glowClasses[glowColor]}`,
    subtle: 'rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md',
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
