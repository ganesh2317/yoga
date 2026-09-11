import React from 'react';
import type { JourneyTier } from '../../data/journey';

interface TierBadgeProps {
  tier: JourneyTier;
  className?: string;
}

const tierConfig: Record<JourneyTier, { color: string; label: string }> = {
  Foundation: { color: 'var(--good)', label: 'Foundation' },
  Alignment: { color: 'var(--tier-breath)', label: 'Alignment' },
  Strength: { color: 'var(--tier-strength)', label: 'Strength' },
  Flow: { color: 'var(--tier-balance)', label: 'Flow' },
  Mastery: { color: 'var(--tier-mastery)', label: 'Mastery' },
};

/**
 * TierBadge — displays the Journey tier name with its colour.
 */
export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  className = '',
}) => {
  const config = tierConfig[tier];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        text-caption font-medium rounded-pill
        bg-surface-2
        ${className}
      `}
      style={{ color: config.color }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
};
