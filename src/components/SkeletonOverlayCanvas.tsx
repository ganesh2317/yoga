import React, { useEffect, useRef } from 'react';
import type { JointLandmark } from '../types';

interface SkeletonOverlayCanvasProps {
  landmarks: JointLandmark[] | null;
  width: number;
  height: number;
  jointScores?: Record<string, number>;
}

// MediaPipe 33 landmark connections
const POSE_CONNECTIONS = [
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15],
  // Right arm
  [12, 14], [14, 16],
  // Left leg
  [23, 25], [25, 27],
  // Right leg
  [24, 26], [26, 28],
];

export const SkeletonOverlayCanvas: React.FC<SkeletonOverlayCanvasProps> = ({
  landmarks,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Draw connection lines
    ctx.lineWidth = 3;
    POSE_CONNECTIONS.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];

      if (p1 && p2 && (p1.visibility ?? 1) > 0.3 && (p2.visibility ?? 1) > 0.3) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);

        // Glowing Emerald Line
        ctx.strokeStyle = '#34D399';
        ctx.shadowColor = '#22C55E';
        ctx.shadowBlur = 8;
        ctx.stroke();
      }
    });

    // Draw landmark dots
    landmarks.forEach((lm, index) => {
      if ((lm.visibility ?? 1) < 0.3) return;

      const x = lm.x * width;
      const y = lm.y * height;

      ctx.beginPath();
      ctx.arc(x, y, index >= 11 && index <= 28 ? 6 : 3, 0, 2 * Math.PI);
      ctx.fillStyle = index >= 11 && index <= 28 ? '#22C55E' : 'rgba(255,255,255,0.7)';
      ctx.shadowColor = '#22C55E';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Outer pulsing ring for key joints
      if ([11, 12, 13, 14, 23, 24, 25, 26].includes(index)) {
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
