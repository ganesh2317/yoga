import React from 'react';
import { Check, Lock } from 'lucide-react';
import type { JourneyTier } from '../../data/journey';

interface LevelNodeProps {
  level: number;
  title: string;
  tier: JourneyTier;
  state: 'complete' | 'active' | 'locked';
  progress?: number;
  onClick?: () => void;
  className?: string;
}

const tierColors: Record<JourneyTier, string> = {
  Foundation: 'var(--good)',
  Alignment: 'var(--tier-breath)',
  Strength: 'var(--tier-strength)',
  Flow: 'var(--tier-balance)',
  Mastery: 'var(--tier-mastery)',
};

/**
 * LevelNode — a single node in the Journey level stepper.
 * States: complete (filled + check), active (accent ring + %), locked (muted + lock).
 */
export const LevelNode: React.FC<LevelNodeProps> = ({
  level,
  title,
  tier,
  state,
  progress = 0,
  onClick,
  className = '',
}) => {
  const color = tierColors[tier];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full text-left py-2 transition-opacity ${
        state === 'locked' ? 'opacity-50' : ''
      } ${className}`}
      aria-label={`Level ${level}: ${title} — ${state}`}
    >
      {/* Node circle */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center shrink-0
          transition-all duration-enter ease-smooth font-display font-semibold text-label
          ${state === 'complete'
            ? 'text-white'
            : state === 'active'
            ? 'border-2 text-text'
            : 'bg-surface-2 text-text-3 border border-border'
          }
        `}
        style={
          state === 'complete'
            ? { backgroundColor: color }
            : state === 'active'
            ? { borderColor: color }
            : undefined
        }
      >
        {state === 'complete' ? (
          <Check className="w-5 h-5" />
        ) : state === 'locked' ? (
          <Lock className="w-4 h-4" />
        ) : (
          <span className="tabular-nums">{level}</span>
        )}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-label font-medium truncate ${
            state === 'locked' ? 'text-text-3' : 'text-text'
          }`}>
            {title}
          </span>
          {state === 'active' && (
            <span
              className="text-caption font-semibold tabular-nums"
              style={{ color }}
            >
              {progress}%
            </span>
          )}
        </div>
        <span className="text-caption text-text-3">Level {level}</span>
      </div>
    </button>
  );
};
