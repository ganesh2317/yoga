import React, { useState } from 'react';
import type { YogaPose, JointStatus } from '../types';
import { AsanaAnimation } from './AsanaAnimation';
import { Sheet } from './ui/Sheet';
import { Badge } from './ui/Badge';

interface MiniDemoPlayerProps {
  pose: YogaPose;
  jointStatuses?: Record<string, JointStatus>;
  className?: string;
}

export const MiniDemoPlayer: React.FC<MiniDemoPlayerProps> = ({
  pose,
  jointStatuses = {},
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Extract joints that are off-target (Poor or Slight)
  const highlightJoints = Object.entries(jointStatuses)
    .filter(([_, status]) => status === 'Poor' || status === 'Slight')
    .map(([jointKey]) => jointKey);

  return (
    <>
      {/* Compact Docked Widget */}
      <div
        onClick={() => setIsExpanded(true)}
        className={`group relative cursor-pointer bg-surface-1/85 hover:bg-surface-2/90 backdrop-blur-md rounded-2xl border border-surface-border/80 p-2 shadow-xl hover:border-primary-500/50 transition-all duration-200 flex flex-col items-center select-none ${className}`}
        title="Tap to expand reference demo"
      >
        <div className="text-[10px] font-semibold text-text-muted mb-1 flex items-center space-x-1">
          <span>Target Form</span>
          {highlightJoints.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
          )}
        </div>
        <AsanaAnimation
          poseId={pose.id}
          size={96}
          speed={0.9}
          showStepLabel={false}
          highlightJoints={highlightJoints}
        />
        <span className="text-[9px] text-primary-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Tap to expand
        </span>
      </div>

      {/* Expanded Modal / Half Sheet */}
      <Sheet
        open={isExpanded}
        onClose={() => setIsExpanded(false)}
        title={pose.name}
      >
        <div className="flex flex-col items-center space-y-4 pb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="accent">{pose.category}</Badge>
            <Badge variant="default">{pose.difficulty}</Badge>
          </div>
          <p className="text-sm italic text-text-muted">{pose.sanskritName}</p>

          <AsanaAnimation
            poseId={pose.id}
            size={220}
            speed={1.0}
            showStepLabel={true}
            highlightJoints={highlightJoints}
          />

          <div className="w-full text-left space-y-2 mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Alignment Focus
            </p>
            <ul className="space-y-1 text-xs text-text-secondary">
              {pose.alignmentCues.map((cue, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-primary-400 font-bold">•</span>
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Sheet>
    </>
  );
};
