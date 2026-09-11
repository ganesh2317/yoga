import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import type { JointStatus } from '../../types';

interface StatusPillProps {
  status: JointStatus;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<JointStatus, {
  icon: React.ElementType;
  bg: string;
  text: string;
  defaultLabel: string;
}> = {
  Good: {
    icon: CheckCircle2,
    bg: 'bg-good-soft',
    text: 'text-good',
    defaultLabel: 'Good',
  },
  Slight: {
    icon: AlertTriangle,
    bg: 'bg-slight-soft',
    text: 'text-slight',
    defaultLabel: 'Adjust',
  },
  Poor: {
    icon: XCircle,
    bg: 'bg-poor-soft',
    text: 'text-poor',
    defaultLabel: 'Correct',
  },
  Unknown: {
    icon: HelpCircle,
    bg: 'bg-surface-2',
    text: 'text-text-3',
    defaultLabel: 'Unknown',
  },
};

/**
 * StatusPill — posture feedback status with icon + text.
 * Never uses colour alone (accessibility).
 */
export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label ?? config.defaultLabel;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-pill font-medium
        ${config.bg} ${config.text}
        ${size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-3 py-1 text-label'}
        ${className}
      `}
      role="status"
      aria-label={`${displayLabel} — ${status}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{displayLabel}</span>
    </span>
  );
};
