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
      bg: 'bg-[#3F6B4F]/20',
      text: 'text-[#88C49D]',
      border: 'border-[#3F6B4F]/40',
      dot: 'bg-[#3F6B4F] shadow-[0_0_8px_rgba(63,107,79,0.5)]',
    },
    Slight: {
      bg: 'bg-[#C9A66B]/20',
      text: 'text-[#E2C389]',
      border: 'border-[#C9A66B]/40',
      dot: 'bg-[#C9A66B] shadow-[0_0_8px_rgba(201,166,107,0.5)]',
    },
    Poor: {
      bg: 'bg-[#C1502E]/20',
      text: 'text-[#F4F1EC]',
      border: 'border-[#C1502E]/40',
      dot: 'bg-[#C1502E] shadow-[0_0_8px_rgba(193,80,46,0.5)]',
    },
    Beginner: {
      bg: 'bg-[#3F6B4F]/15',
      text: 'text-[#88C49D]',
      border: 'border-[#3F6B4F]/30',
      dot: 'bg-[#528364]',
    },
    Intermediate: {
      bg: 'bg-[#C9A66B]/15',
      text: 'text-[#C9A66B]',
      border: 'border-[#C9A66B]/30',
      dot: 'bg-[#C9A66B]',
    },
    Advanced: {
      bg: 'bg-[#C1502E]/15',
      text: 'text-[#F4F1EC]',
      border: 'border-[#C1502E]/30',
      dot: 'bg-[#C1502E]',
    },
  };

  const current = styles[status] || {
    bg: 'bg-[#F4F1EC]/8',
    text: 'text-[#A8A29B]',
    border: 'border-[#F4F1EC]/12',
    dot: 'bg-[#A8A29B]',
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
