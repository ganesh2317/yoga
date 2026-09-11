import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  label: string;
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  label,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  id,
}) => {
  const sizeClass = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const variantClass = variant === 'ghost'
    ? 'bg-transparent hover:bg-surface-2 text-text-2 hover:text-text'
    : 'bg-surface-2 border border-border hover:border-border-strong text-text-2 hover:text-text';

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-control
        transition-all duration-state ease-smooth
        ${sizeClass} ${variantClass}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon}
    </button>
  );
};
