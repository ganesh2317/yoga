/**
 * Framing Coach (§3.9) — emits one actionable instruction based on landmark
 * visibility, bounding-box fill, and positioning.
 */

import type { JointLandmark } from '../types';
import { REQUIRED_LANDMARKS } from './poseTopology';

export type FramingInstruction =
  | 'step_back'
  | 'step_closer'
  | 'move_left'
  | 'move_right'
  | 'raise_camera'
  | 'lower_camera'
  | 'full_body_ok';

export interface FramingResult {
  instruction: FramingInstruction;
  message: string;
  isReady: boolean;
}

const instructionMessages: Record<FramingInstruction, string> = {
  step_back: 'Step back so your full body is visible',
  step_closer: 'Step a little closer to the camera',
  move_left: 'Move slightly to your left',
  move_right: 'Move slightly to your right',
  raise_camera: 'Raise your camera or step back',
  lower_camera: 'Lower your camera angle',
  full_body_ok: 'Great framing — hold steady',
};

/**
 * Evaluates framing from normalized landmarks (0-1 coordinates).
 */
export function evaluateFraming(landmarks: JointLandmark[] | null): FramingResult {
  const defaultResult: FramingResult = {
    instruction: 'step_back',
    message: instructionMessages.step_back,
    isReady: false,
  };

  if (!landmarks || landmarks.length < 33) {
    return defaultResult;
  }

  // Check required landmark visibility
  const visibilityThreshold = 0.6;
  let visibleCount = 0;
  for (const idx of REQUIRED_LANDMARKS) {
    const lm = landmarks[idx];
    if (lm && (lm.visibility ?? 0) >= visibilityThreshold) {
      visibleCount++;
    }
  }

  const visibilityRatio = visibleCount / REQUIRED_LANDMARKS.length;

  if (visibilityRatio < 0.7) {
    return defaultResult;
  }

  // Bounding box from visible landmarks
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const lm of landmarks) {
    if (lm && (lm.visibility ?? 0) >= 0.3) {
      minX = Math.min(minX, lm.x);
      maxX = Math.max(maxX, lm.x);
      minY = Math.min(minY, lm.y);
      maxY = Math.max(maxY, lm.y);
    }
  }

  const bboxHeight = maxY - minY;
  const bboxCenterX = (minX + maxX) / 2;

  // Too close: bbox fills > 90% of frame height
  if (bboxHeight > 0.90) {
    return {
      instruction: 'step_back',
      message: instructionMessages.step_back,
      isReady: false,
    };
  }

  // Too far: bbox fills < 55% of frame height
  if (bboxHeight < 0.55) {
    return {
      instruction: 'step_closer',
      message: instructionMessages.step_closer,
      isReady: false,
    };
  }

  // Off-center horizontally
  if (bboxCenterX < 0.35) {
    return {
      instruction: 'move_right',
      message: instructionMessages.move_right,
      isReady: false,
    };
  }
  if (bboxCenterX > 0.65) {
    return {
      instruction: 'move_left',
      message: instructionMessages.move_left,
      isReady: false,
    };
  }

  // Head cut off (nose too high)
  if (minY > 0.15) {
    return {
      instruction: 'lower_camera',
      message: instructionMessages.lower_camera,
      isReady: false,
    };
  }

  // Feet cut off (ankles too low)
  if (maxY < 0.85 && bboxHeight < 0.6) {
    return {
      instruction: 'raise_camera',
      message: instructionMessages.raise_camera,
      isReady: false,
    };
  }

  return {
    instruction: 'full_body_ok',
    message: instructionMessages.full_body_ok,
    isReady: true,
  };
}

export function getFramingInstruction(landmarks: JointLandmark[] | null): string {
  return evaluateFraming(landmarks).message;
}
