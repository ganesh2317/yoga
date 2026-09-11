import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover shadow-1 active:shadow-none',
  secondary: 'bg-surface-2 text-text border border-border hover:border-border-strong',
  ghost: 'bg-transparent text-text-2 hover:bg-surface-2 hover:text-text',
  danger: 'bg-poor text-white hover:opacity-90 shadow-1',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-caption gap-1.5 rounded-control',
  md: 'h-11 px-4 text-label gap-2 rounded-control',
  lg: 'h-12 px-6 text-body gap-2.5 rounded-card',
};

/**
 * Button — primary interactive element.
 * primary/secondary/ghost/danger × sm/md/lg with loading and disabled states.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  type = 'button',
  id,
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-state ease-smooth select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
