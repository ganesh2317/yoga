import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'focal' | 'interactive' | 'glow' | 'subtle';
  className?: string;
  glowColor?: 'forest' | 'ochre' | 'rust';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  glowColor = 'forest',
  ...props
}) => {
  const glowClasses = {
    forest: 'shadow-forest-glow border-[#3F6B4F]/40',
    ochre: 'shadow-ochre-glow border-[#C9A66B]/40',
    rust: 'shadow-rust-glow border-[#C1502E]/40',
  };

  const baseStyle =
    'relative overflow-hidden rounded-2xl bg-[#F4F1EC]/[0.045] border border-[#F4F1EC]/10 backdrop-blur-xl shadow-glass-subtle transition-all duration-300';
  const innerHighlight =
    'before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#F4F1EC]/20 before:to-transparent before:pointer-events-none';

  const variantStyle = {
    default: `${baseStyle} ${innerHighlight}`,
    focal: `relative overflow-hidden rounded-2xl bg-[#F4F1EC]/[0.07] border border-[#F4F1EC]/15 backdrop-blur-2xl shadow-glass-glow ${innerHighlight}`,
    interactive: `${baseStyle} ${innerHighlight} hover:bg-[#F4F1EC]/[0.08] hover:border-[#F4F1EC]/20 active:scale-[0.98] cursor-pointer`,
    glow: `${baseStyle} ${innerHighlight} ${glowClasses[glowColor]}`,
    subtle: 'rounded-2xl bg-[#F4F1EC]/[0.025] border border-[#F4F1EC]/[0.06] backdrop-blur-md',
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
