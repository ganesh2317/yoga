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
      bg: 'bg-[#22C55E]/15',
      text: 'text-[#34D399]',
      border: 'border-[#22C55E]/35',
      dot: 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    },
    Slight: {
      bg: 'bg-[#F59E0B]/15',
      text: 'text-[#FBBF24]',
      border: 'border-[#F59E0B]/35',
      dot: 'bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    },
    Poor: {
      bg: 'bg-[#EF4444]/15',
      text: 'text-[#F87171]',
      border: 'border-[#EF4444]/35',
      dot: 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    },
    Beginner: {
      bg: 'bg-[#22C55E]/12',
      text: 'text-[#34D399]',
      border: 'border-[#22C55E]/30',
      dot: 'bg-[#22C55E]',
    },
    Intermediate: {
      bg: 'bg-[#F59E0B]/12',
      text: 'text-[#FBBF24]',
      border: 'border-[#F59E0B]/30',
      dot: 'bg-[#F59E0B]',
    },
    Advanced: {
      bg: 'bg-[#EF4444]/12',
      text: 'text-[#F87171]',
      border: 'border-[#EF4444]/30',
      dot: 'bg-[#EF4444]',
    },
  };

  const current = styles[status] || {
    bg: 'bg-white/8',
    text: 'text-[#94A3B8]',
    border: 'border-white/12',
    dot: 'bg-[#94A3B8]',
  };

  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${current.bg} ${current.text} ${current.border} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{displayLabel}</span>
    </span>
  );
};
