import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'good' | 'slight' | 'poor';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-surface-2 text-text-2 border-border',
  accent: 'bg-accent-soft text-accent border-accent/20',
  good: 'bg-good-soft text-good border-good/20',
  slight: 'bg-slight-soft text-slight border-slight/20',
  poor: 'bg-poor-soft text-poor border-poor/20',
};

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1 border rounded-pill font-medium
        ${size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-3 py-1 text-label'}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
