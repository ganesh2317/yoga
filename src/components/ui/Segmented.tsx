import React from 'react';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Segmented — segmented control for category filtering.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedProps<T>): React.ReactElement {
  return (
    <div
      className={`inline-flex items-center bg-surface-2 rounded-control p-0.5 gap-0.5 ${className}`}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            role="radio"
            aria-checked={isActive}
            className={`
              px-3 py-1.5 text-caption font-medium rounded-control
              transition-all duration-state ease-smooth compact-touch
              ${isActive
                ? 'bg-bg-elev text-text shadow-1'
                : 'text-text-3 hover:text-text-2'
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
