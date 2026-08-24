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

    // 1. Draw connection background lines (high performance glow simulation)
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.lineCap = 'round';
    POSE_CONNECTIONS.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];

      if (p1 && p2 && (p1.visibility ?? 1) > 0.4 && (p2.visibility ?? 1) > 0.4) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    });

    // 2. Draw sharp inner emerald lines
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#34D399';
    POSE_CONNECTIONS.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];

      if (p1 && p2 && (p1.visibility ?? 1) > 0.4 && (p2.visibility ?? 1) > 0.4) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    });

    // 3. Draw key joint nodes
    const keyLandmarkIndices = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    keyLandmarkIndices.forEach((idx) => {
      const p = landmarks[idx];
      if (p && (p.visibility ?? 1) > 0.4) {
        const x = p.x * width;
        const y = p.y * height;

        // Outer amber ring
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.fill();

        // Inner solid emerald dot
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#34D399';
        ctx.fill();
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
