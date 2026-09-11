import React from 'react';

interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaPositive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Stat — label + tabular value + optional delta.
 * Uses tabular-nums so live values don't jitter horizontally.
 */
export const Stat: React.FC<StatProps> = ({
  label,
  value,
  unit,
  delta,
  deltaPositive,
  size = 'md',
  className = '',
}) => {
  const valueSizes: Record<string, string> = {
    sm: 'text-h3 font-display',
    md: 'text-h1 font-display',
    lg: 'text-display font-display',
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-caption text-text-3 font-medium">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`${valueSizes[size]} font-semibold text-text tabular-nums`}>
          {value}
        </span>
        {unit && <span className="text-caption text-text-3">{unit}</span>}
      </div>
      {delta && (
        <span
          className={`text-caption font-medium mt-0.5 ${
            deltaPositive === true ? 'text-good' : deltaPositive === false ? 'text-poor' : 'text-text-3'
          }`}
        >
          {delta}
        </span>
      )}
    </div>
  );
};
