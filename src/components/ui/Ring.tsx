import React from 'react';

interface RingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'accent' | 'good' | 'slight' | 'poor' | 'auto' | 'tier';
  tierColor?: string;
  children?: React.ReactNode;
  className?: string;
  label?: string;
}

/**
 * Ring — circular progress indicator. Replaces CircularProgressRing.
 * Supports auto-coloring based on value percentage.
 */
export const Ring: React.FC<RingProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'accent',
  tierColor,
  children,
  className = '',
  label,
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const resolvedVariant = variant === 'auto'
    ? percent >= 75 ? 'good' : percent >= 50 ? 'slight' : 'poor'
    : variant;

  const colorMap: Record<string, string> = {
    accent: 'var(--accent)',
    good: 'var(--good)',
    slight: 'var(--slight)',
    poor: 'var(--poor)',
    tier: tierColor ?? 'var(--accent)',
  };

  const strokeColor = colorMap[resolvedVariant] ?? colorMap.accent;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label ?? `${Math.round(percent)}%`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-enter ease-smooth"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};
