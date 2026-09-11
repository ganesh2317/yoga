import React, { useEffect, useRef, useState } from 'react';
import { POSE_ANIMATIONS, type KeyframeJoints, type Point2D } from '../data/poseAnimations';

interface AsanaAnimationProps {
  poseId: string;
  size?: number; // width & height in px, default 240
  speed?: number; // multiplier, default 1.0
  loop?: boolean; // default true
  showStepLabel?: boolean; // default true
  highlightJoints?: string[]; // joint keys to highlight in amber/red
  isMirrored?: boolean;
  className?: string;
}

// Ease-in-out cubic interpolation
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpPoint(p1: Point2D, p2: Point2D, t: number, mirror: boolean): Point2D {
  const x = p1.x + (p2.x - p1.x) * t;
  const y = p1.y + (p2.y - p1.y) * t;
  return {
    x: mirror ? 100 - x : x,
    y,
  };
}

function interpolateJoints(
  j1: KeyframeJoints,
  j2: KeyframeJoints,
  t: number,
  mirror: boolean
): KeyframeJoints {
  const eased = easeInOutCubic(t);
  const result: any = {};
  for (const key of Object.keys(j1) as (keyof KeyframeJoints)[]) {
    result[key] = lerpPoint(j1[key], j2[key], eased, mirror);
  }
  return result as KeyframeJoints;
}

export const AsanaAnimation: React.FC<AsanaAnimationProps> = ({
  poseId,
  size = 240,
  speed = 1.0,
  loop = true,
  showStepLabel = true,
  highlightJoints = [],
  isMirrored = false,
  className = '',
}) => {
  const [currentLabel, setCurrentLabel] = useState<string>('');
  const [currentJoints, setCurrentJoints] = useState<KeyframeJoints | null>(null);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  const animData = POSE_ANIMATIONS[poseId] || POSE_ANIMATIONS.tadasana;

  useEffect(() => {
    if (!animData || animData.keyframes.length === 0) return;

    const keyframes = animData.keyframes;
    const totalDuration = keyframes.reduce((sum, k) => sum + k.durationMs, 0) / Math.max(0.1, speed);

    startTimeRef.current = performance.now();

    const renderLoop = (now: number) => {
      const elapsed = (now - startTimeRef.current) % totalDuration;
      let accumulated = 0;
      let fromIdx = 0;
      let toIdx = 0;
      let segmentT = 0;

      for (let i = 0; i < keyframes.length; i++) {
        const segDuration = keyframes[i].durationMs / speed;
        if (elapsed >= accumulated && elapsed < accumulated + segDuration) {
          fromIdx = i;
          toIdx = (i + 1) % keyframes.length;
          segmentT = (elapsed - accumulated) / segDuration;
          break;
        }
        accumulated += segDuration;
      }

      setCurrentLabel(keyframes[fromIdx].label);

      const kf1 = keyframes[fromIdx].joints;
      const kf2 = keyframes[toIdx].joints;
      const interpolated = interpolateJoints(kf1, kf2, segmentT, isMirrored);

      setCurrentJoints(interpolated);

      if (loop || elapsed < totalDuration - 50) {
        animRef.current = requestAnimationFrame(renderLoop);
      }
    };

    animRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [poseId, speed, loop, isMirrored]);

  if (!currentJoints) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-2 rounded-2xl ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const j = currentJoints;
  const isHigh = (key: string) => highlightJoints.includes(key);

  const boneColor = 'rgba(16, 185, 129, 0.85)'; // Emerald primary
  const highlightColor = '#f59e0b'; // Amber warning
  const headRadius = 7;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div
        className="relative bg-surface-2/70 backdrop-blur-md rounded-2xl border border-surface-border p-3 flex items-center justify-center shadow-lg"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.25))' }}
        >
          {/* Subtle Ground Reference Line */}
          <line
            x1="10"
            y1="94"
            x2="90"
            y2="94"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Bones / Segments */}
          {/* Torso Spine: Neck to Pelvis */}
          <line
            x1={j.neck.x}
            y1={j.neck.y}
            x2={j.pelvis.x}
            y2={j.pelvis.y}
            stroke={isHigh('spineUpper') || isHigh('torsoLean') ? highlightColor : boneColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Shoulders Bar */}
          <line
            x1={j.leftShoulder.x}
            y1={j.leftShoulder.y}
            x2={j.rightShoulder.x}
            y2={j.rightShoulder.y}
            stroke={isHigh('shoulderLevel') ? highlightColor : boneColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Hips Bar */}
          <line
            x1={j.leftHip.x}
            y1={j.leftHip.y}
            x2={j.rightHip.x}
            y2={j.rightHip.y}
            stroke={isHigh('hipLevel') ? highlightColor : boneColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Left Arm: Shoulder -> Elbow -> Wrist */}
          <line
            x1={j.leftShoulder.x}
            y1={j.leftShoulder.y}
            x2={j.leftElbow.x}
            y2={j.leftElbow.y}
            stroke={isHigh('leftShoulder') ? highlightColor : boneColor}
            strokeWidth="3.0"
            strokeLinecap="round"
          />
          <line
            x1={j.leftElbow.x}
            y1={j.leftElbow.y}
            x2={j.leftWrist.x}
            y2={j.leftWrist.y}
            stroke={isHigh('leftElbow') || isHigh('leftWrist') ? highlightColor : boneColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Right Arm: Shoulder -> Elbow -> Wrist */}
          <line
            x1={j.rightShoulder.x}
            y1={j.rightShoulder.y}
            x2={j.rightElbow.x}
            y2={j.rightElbow.y}
            stroke={isHigh('rightShoulder') ? highlightColor : boneColor}
            strokeWidth="3.0"
            strokeLinecap="round"
          />
          <line
            x1={j.rightElbow.x}
            y1={j.rightElbow.y}
            x2={j.rightWrist.x}
            y2={j.rightWrist.y}
            stroke={isHigh('rightElbow') || isHigh('rightWrist') ? highlightColor : boneColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Left Leg: Hip -> Knee -> Ankle */}
          <line
            x1={j.leftHip.x}
            y1={j.leftHip.y}
            x2={j.leftKnee.x}
            y2={j.leftKnee.y}
            stroke={isHigh('leftHip') ? highlightColor : boneColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line
            x1={j.leftKnee.x}
            y1={j.leftKnee.y}
            x2={j.leftAnkle.x}
            y2={j.leftAnkle.y}
            stroke={isHigh('leftKnee') || isHigh('leftAnkle') ? highlightColor : boneColor}
            strokeWidth="3.0"
            strokeLinecap="round"
          />

          {/* Right Leg: Hip -> Knee -> Ankle */}
          <line
            x1={j.rightHip.x}
            y1={j.rightHip.y}
            x2={j.rightKnee.x}
            y2={j.rightKnee.y}
            stroke={isHigh('rightHip') ? highlightColor : boneColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line
            x1={j.rightKnee.x}
            y1={j.rightKnee.y}
            x2={j.rightAnkle.x}
            y2={j.rightAnkle.y}
            stroke={isHigh('rightKnee') || isHigh('rightAnkle') ? highlightColor : boneColor}
            strokeWidth="3.0"
            strokeLinecap="round"
          />

          {/* Joint Nodes */}
          {Object.entries(j).map(([name, pt]) => {
            if (name === 'head') {
              return (
                <circle
                  key={name}
                  cx={pt.x}
                  cy={pt.y}
                  r={headRadius}
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              );
            }
            const isJointHigh = isHigh(name);
            return (
              <circle
                key={name}
                cx={pt.x}
                cy={pt.y}
                r={isJointHigh ? 3.5 : 2.5}
                fill={isJointHigh ? '#f59e0b' : '#ffffff'}
                stroke={isJointHigh ? '#d97706' : '#10b981'}
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      {showStepLabel && currentLabel && (
        <div className="mt-2 text-center text-xs font-medium text-text-secondary max-w-[240px] truncate px-2 py-1 bg-surface-1 rounded-full border border-surface-border">
          {currentLabel}
        </div>
      )}
    </div>
  );
};
