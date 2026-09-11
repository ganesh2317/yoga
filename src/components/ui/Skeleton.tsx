import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'line' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton — loading placeholder with subtle pulse animation.
 */
export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
}) => {
  const baseClasses = 'animate-pulse bg-surface-2';

  const variantClasses: Record<string, string> = {
    line: 'h-4 rounded-control',
    circle: 'rounded-full',
    rect: 'rounded-card',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};
