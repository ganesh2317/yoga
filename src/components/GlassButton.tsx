import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl font-medium gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl font-semibold gap-2',
    lg: 'px-6 py-3.5 text-base rounded-2xl font-bold gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-accent-green to-accent-emerald text-bg-darkest font-bold shadow-lg shadow-accent-green/25 hover:shadow-accent-green/40 hover:brightness-110 active:scale-95 border border-emerald-400/30',
    secondary:
      'bg-white/10 text-text-primary border border-white/20 backdrop-blur-lg hover:bg-white/15 hover:border-white/30 active:scale-95 shadow-glass-glow',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-95 border border-transparent',
    danger:
      'bg-status-poor/20 text-red-200 border border-status-poor/40 hover:bg-status-poor/30 active:scale-95 shadow-red-glow',
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-200 ${
        fullWidth ? 'w-full' : ''
      } ${sizeStyles} ${variantStyles} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
