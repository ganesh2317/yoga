import React from 'react';

interface MeterProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'accent' | 'good' | 'slight' | 'poor' | 'auto';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Meter — linear progress bar with label and optional value display.
 */
export const Meter: React.FC<MeterProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  variant = 'accent',
  size = 'md',
  className = '',
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const resolvedVariant = variant === 'auto'
    ? percent >= 75 ? 'good' : percent >= 50 ? 'slight' : 'poor'
    : variant;

  const fillColor: Record<string, string> = {
    accent: 'bg-accent',
    good: 'bg-good',
    slight: 'bg-slight',
    poor: 'bg-poor',
  };

  const heightClass = size === 'sm' ? 'h-1' : 'h-2';

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-caption text-text-2">{label}</span>}
          {showValue && (
            <span className="text-caption text-text-3 tabular-nums">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${heightClass} rounded-pill bg-surface-2 overflow-hidden`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`${heightClass} rounded-pill transition-all duration-enter ease-smooth ${fillColor[resolvedVariant]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
