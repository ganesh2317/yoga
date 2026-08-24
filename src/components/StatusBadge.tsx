import React from 'react';

export type StatusType = 'Good' | 'Slight' | 'Poor' | 'Beginner' | 'Intermediate' | 'Advanced' | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const displayLabel = label || status;

  const styles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    Good: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    },
    Slight: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    },
    Poor: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    },
    Beginner: {
      bg: 'bg-teal-500/12',
      text: 'text-teal-300',
      border: 'border-teal-500/25',
      dot: 'bg-teal-400',
    },
    Intermediate: {
      bg: 'bg-indigo-500/12',
      text: 'text-indigo-300',
      border: 'border-indigo-500/25',
      dot: 'bg-indigo-400',
    },
    Advanced: {
      bg: 'bg-purple-500/12',
      text: 'text-purple-300',
      border: 'border-purple-500/25',
      dot: 'bg-purple-400',
    },
  };

  const current = styles[status] || {
    bg: 'bg-white/8',
    text: 'text-text-secondary',
    border: 'border-white/12',
    dot: 'bg-text-secondary',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${current.bg} ${current.text} ${current.border} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{displayLabel}</span>
    </span>
  );
};
