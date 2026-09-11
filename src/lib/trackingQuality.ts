/**
 * Tracking Quality — 0-100 weighted blend score (§3.9).
 *
 * Components (weights):
 * - Mean visibility of required joints (40%)
 * - Share of required joints present (25%)
 * - Effective FPS vs 30 target (15%)
 * - Inverse jitter variance over last 1s (10%)
 * - Bbox-fill fitness (10%)
 */

import type { JointLandmark } from '../types';
import { REQUIRED_LANDMARKS } from './poseTopology';

export type TrackingLabel = 'Excellent' | 'Good' | 'Weak' | 'Lost';

export interface TrackingQualityResult {
  score: number;
  label: TrackingLabel;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function computeTrackingQuality(
  landmarks: JointLandmark[] | null,
  fps: number,
  jitterVariance: number = 0
): TrackingQualityResult {
  if (!landmarks || landmarks.length < 33) {
    return { score: 0, label: 'Lost' };
  }

  // 1. Mean visibility of required joints (40%)
  let visSum = 0;
  let presentCount = 0;
  for (const idx of REQUIRED_LANDMARKS) {
    const lm = landmarks[idx];
    if (lm) {
      visSum += lm.visibility ?? 0;
      if ((lm.visibility ?? 0) >= 0.6) presentCount++;
    }
  }
  const meanVis = visSum / REQUIRED_LANDMARKS.length;
  const visScore = clamp01(meanVis / 0.9); // normalize: 0.9 vis = perfect

  // 2. Share of required joints present (25%)
  const presenceScore = presentCount / REQUIRED_LANDMARKS.length;

  // 3. FPS ratio (15%)
  const fpsScore = clamp01(fps / 30);

  // 4. Inverse jitter variance (10%)
  // Lower jitter = better. Assume jitterVariance of 0 = perfect, 0.01 = bad
  const jitterScore = clamp01(1 - jitterVariance * 100);

  // 5. Bbox fill fitness (10%)
  let minY = 1, maxY = 0;
  for (const lm of landmarks) {
    if (lm && (lm.visibility ?? 0) >= 0.3) {
      minY = Math.min(minY, lm.y);
      maxY = Math.max(maxY, lm.y);
    }
  }
  const bboxHeight = maxY - minY;
  // Ideal: 55-90% fill
  const fillFitness = bboxHeight >= 0.55 && bboxHeight <= 0.90
    ? 1
    : bboxHeight < 0.55
    ? clamp01(bboxHeight / 0.55)
    : clamp01(1 - (bboxHeight - 0.9) * 5);

  // Weighted blend
  const score = Math.round(
    visScore * 40 +
    presenceScore * 25 +
    fpsScore * 15 +
    jitterScore * 10 +
    fillFitness * 10
  );

  let label: TrackingLabel;
  if (score >= 80) label = 'Excellent';
  else if (score >= 60) label = 'Good';
  else if (score >= 30) label = 'Weak';
  else label = 'Lost';

  return { score, label };
}
