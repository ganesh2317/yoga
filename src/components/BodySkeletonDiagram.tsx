import React from 'react';
import type { JointEvaluation } from '../types';

interface BodySkeletonDiagramProps {
  jointEvaluations: Record<string, JointEvaluation>;
}

export const BodySkeletonDiagram: React.FC<BodySkeletonDiagramProps> = ({ jointEvaluations }) => {
  const getStatusColor = (key: string) => {
    const status = jointEvaluations[key]?.status;
    if (status === 'Good') return { fill: '#3F6B4F', stroke: '#88C49D' };
    if (status === 'Slight') return { fill: '#C9A66B', stroke: '#E2C389' };
    if (status === 'Poor') return { fill: '#C1502E', stroke: '#F4F1EC' };
    return { fill: '#635E58', stroke: '#A8A29B' };
  };

  const joints = [
    { key: 'leftShoulder', cx: 38, cy: 30, name: 'L Shoulder' },
    { key: 'rightShoulder', cx: 62, cy: 30, name: 'R Shoulder' },
    { key: 'leftElbow', cx: 28, cy: 45, name: 'L Elbow' },
    { key: 'rightElbow', cx: 72, cy: 45, name: 'R Elbow' },
    { key: 'leftHip', cx: 42, cy: 55, name: 'L Hip' },
    { key: 'rightHip', cx: 58, cy: 55, name: 'R Hip' },
    { key: 'leftKnee', cx: 40, cy: 75, name: 'L Knee' },
    { key: 'rightKnee', cx: 60, cy: 75, name: 'R Knee' },
    { key: 'spineTilt', cx: 50, cy: 42, name: 'Spine' },
  ];

  return (
    <div className="relative w-full h-56 bg-white/[0.03] rounded-2xl border border-white/10 p-4 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full max-h-52">
        {/* Head */}
        <circle cx="50" cy="16" r="7" fill="none" stroke="#A8A29B" strokeWidth="2.5" />

        {/* Skeleton Bone Lines */}
        <line x1="38" y1="30" x2="62" y2="30" stroke="#635E58" strokeWidth="2.5" />
        <line x1="50" y1="23" x2="50" y2="55" stroke="#635E58" strokeWidth="2.5" />
        <line x1="38" y1="30" x2="28" y2="45" stroke="#635E58" strokeWidth="2.5" />
        <line x1="62" y1="30" x2="72" y2="45" stroke="#635E58" strokeWidth="2.5" />
        <line x1="42" y1="55" x2="58" y2="55" stroke="#635E58" strokeWidth="2.5" />
        <line x1="42" y1="55" x2="40" y2="75" stroke="#635E58" strokeWidth="2.5" />
        <line x1="58" y1="55" x2="60" y2="75" stroke="#635E58" strokeWidth="2.5" />
        <line x1="40" y1="75" x2="40" y2="92" stroke="#635E58" strokeWidth="2.5" />
        <line x1="60" y1="75" x2="60" y2="92" stroke="#635E58" strokeWidth="2.5" />

        {/* Joint status glowing circles */}
        {joints.map((j) => {
          const colors = getStatusColor(j.key);
          return (
            <g key={j.key}>
              <circle
                cx={j.cx}
                cy={j.cy}
                r="4.5"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              <circle
                cx={j.cx}
                cy={j.cy}
                r="8"
                fill={colors.fill}
                opacity="0.2"
                className="animate-pulse"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
