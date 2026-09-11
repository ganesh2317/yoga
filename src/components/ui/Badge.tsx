import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'tier';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variantClass = {
    default: 'bg-surface-2 text-text-3',
    accent: 'bg-accent-soft text-accent',
    tier: 'bg-surface-2 text-text-2',
  }[variant];

  const sizeClass = {
    sm: 'px-2 py-0.5 text-caption',
    md: 'px-2.5 py-1 text-caption font-semibold',
    lg: 'px-3 py-1.5 text-label font-semibold',
  }[size];

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-pill
        ${variantClass} ${sizeClass} ${className}
      `}
    >
      {children}
    </span>
  );
};

