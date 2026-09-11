import React from 'react';

interface SurfaceProps {
  children: React.ReactNode;
  variant?: 'flat' | 'raised' | 'outline';
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'section' | 'article';
  id?: string;
}

/**
 * Surface — the primary container component. Replaces GlassCard.
 * Variants: flat (default bg), raised (elevated bg + shadow), outline (bordered).
 */
export const Surface: React.FC<SurfaceProps> = ({
  children,
  variant = 'flat',
  className = '',
  onClick,
  as: Tag = 'div',
  id,
}) => {
  const baseClasses = 'rounded-card transition-all duration-enter ease-smooth';

  const variantClasses: Record<string, string> = {
    flat: 'bg-surface border border-border',
    raised: 'bg-raised border border-border shadow-1',
    outline: 'bg-transparent border border-border-strong',
  };

  const interactiveClasses = onClick
    ? 'cursor-pointer hover:border-border-strong active:scale-[0.98]'
    : '';

  return (
    <Tag
      id={id}
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </Tag>
  );
};
