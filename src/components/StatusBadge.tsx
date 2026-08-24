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
      bg: 'bg-accent-green/15',
      text: 'text-accent-mint',
      border: 'border-accent-green/30',
      dot: 'bg-accent-green shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    },
    Slight: {
      bg: 'bg-status-slight/15',
      text: 'text-amber-300',
      border: 'border-status-slight/30',
      dot: 'bg-status-slight shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    },
    Poor: {
      bg: 'bg-status-poor/15',
      text: 'text-red-300',
      border: 'border-status-poor/30',
      dot: 'bg-status-poor shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    },
    Beginner: {
      bg: 'bg-teal-500/15',
      text: 'text-teal-300',
      border: 'border-teal-500/30',
      dot: 'bg-teal-400',
    },
    Intermediate: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-300',
      border: 'border-blue-500/30',
      dot: 'bg-blue-400',
    },
    Advanced: {
      bg: 'bg-purple-500/15',
      text: 'text-purple-300',
      border: 'border-purple-500/30',
      dot: 'bg-purple-400',
    },
  };

  const current = styles[status] || {
    bg: 'bg-white/10',
    text: 'text-text-secondary',
    border: 'border-white/15',
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
