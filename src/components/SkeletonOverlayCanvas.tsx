import React, { useEffect, useRef } from 'react';
import { POSE_CONNECTIONS, LM } from '../lib/poseTopology';
import { toDisplayX } from '../lib/mirror';
import type { JointLandmark, JointStatus } from '../types';

interface SkeletonOverlayCanvasProps {
  landmarks: JointLandmark[] | null;
  videoElement?: HTMLVideoElement | null;
  jointStatuses?: Record<string, JointStatus>;
  isMirrored?: boolean;
}

// Map joints to landmark index for status coloring
const JOINT_TO_LM_INDEX: Record<string, number[]> = {
  neckTilt: [LM.NOSE],
  headYaw: [LM.NOSE],
  shoulderLevel: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  leftShoulder: [LM.LEFT_SHOULDER],
  rightShoulder: [LM.RIGHT_SHOULDER],
  leftElbow: [LM.LEFT_ELBOW],
  rightElbow: [LM.RIGHT_ELBOW],
  leftWrist: [LM.LEFT_WRIST],
  rightWrist: [LM.RIGHT_WRIST],
  spineUpper: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  spineLower: [LM.LEFT_HIP, LM.RIGHT_HIP],
  torsoLean: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP],
  hipLevel: [LM.LEFT_HIP, LM.RIGHT_HIP],
  leftHip: [LM.LEFT_HIP],
  rightHip: [LM.RIGHT_HIP],
  leftKnee: [LM.LEFT_KNEE],
  rightKnee: [LM.RIGHT_KNEE],
  leftAnkle: [LM.LEFT_ANKLE],
  rightAnkle: [LM.RIGHT_ANKLE],
  stanceWidth: [LM.LEFT_ANKLE, LM.RIGHT_ANKLE],
};

const STATUS_COLORS: Record<JointStatus, string> = {
  Good: '#22c55e',
  Slight: '#f59e0b',
  Poor: '#ef4444',
  Unknown: '#94a3b8',
};

export const SkeletonOverlayCanvas: React.FC<SkeletonOverlayCanvasProps> = ({
  landmarks,
  videoElement,
  jointStatuses = {},
  isMirrored = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI crisp rendering & ResizeObserver
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear previous frame
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Compute object-fit: cover mapping
    // Given video aspect ratio (videoWidth / videoHeight) vs container aspect ratio (width / height)
    let videoAspect = 4 / 3;
    if (videoElement && videoElement.videoWidth && videoElement.videoHeight) {
      videoAspect = videoElement.videoWidth / videoElement.videoHeight;
    }
    const containerAspect = width / height;

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (containerAspect > videoAspect) {
      // Container is wider than video -> scale by width, crop top/bottom
      scale = width;
      const renderedHeight = width / videoAspect;
      offsetY = (height - renderedHeight) / 2;
    } else {
      // Container is taller than video -> scale by height, crop left/right
      scale = height * videoAspect;
      offsetX = (width - scale) / 2;
    }

    const mapLandmark = (lm: JointLandmark) => {
      let normX = lm.x;
      if (isMirrored) {
        normX = toDisplayX(normX);
      }
      const px = offsetX + normX * scale;
      const py = offsetY + lm.y * (scale / videoAspect);
      return { x: px, y: py, visibility: lm.visibility ?? 1 };
    };

    const mapped = landmarks.map(mapLandmark);

    // Build reverse map of landmark index -> joint status
    const lmStatusMap: Record<number, JointStatus> = {};
    for (const [jointKey, status] of Object.entries(jointStatuses)) {
      const indices = JOINT_TO_LM_INDEX[jointKey];
      if (indices) {
        for (const idx of indices) {
          // Keep the worst status if multiple joints touch this landmark
          const existing = lmStatusMap[idx];
          if (!existing || status === 'Poor' || (status === 'Slight' && existing === 'Good')) {
            lmStatusMap[idx] = status;
          }
        }
      }
    }

    // 1. Draw Bones / Connections
    POSE_CONNECTIONS.forEach(([i, j]) => {
      const p1 = mapped[i];
      const p2 = mapped[j];

      if (p1 && p2 && p1.visibility > 0.35 && p2.visibility > 0.35) {
        const isLowConf = p1.visibility < 0.6 || p2.visibility < 0.6;
        const s1 = lmStatusMap[i] || 'Good';
        const s2 = lmStatusMap[j] || 'Good';

        let strokeColor = 'rgba(34, 197, 94, 0.75)'; // default good
        if (s1 === 'Poor' || s2 === 'Poor') {
          strokeColor = 'rgba(239, 68, 68, 0.85)';
        } else if (s1 === 'Slight' || s2 === 'Slight') {
          strokeColor = 'rgba(245, 158, 11, 0.85)';
        }

        ctx.save();
        ctx.beginPath();
        if (isLowConf) {
          ctx.setLineDash([4, 4]);
        }
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = strokeColor;
        ctx.lineCap = 'round';
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    });

    // 2. Draw Landmark Nodes
    mapped.forEach((pt, idx) => {
      if (pt.visibility > 0.35) {
        const status = lmStatusMap[idx] || 'Good';
        const color = STATUS_COLORS[status];

        // Outer aura
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.min(1, pt.visibility * 0.9);
        ctx.fill();

        // Inner bright core
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.fill();
      }
    });
  }, [landmarks, videoElement, jointStatuses, isMirrored]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
