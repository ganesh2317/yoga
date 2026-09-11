/**
 * MediaPipe Loader — capability ladder with runtime downgrade (§3.2).
 *
 * Tier selection:
 * - High: pose_landmarker_heavy, GPU (desktop, WebGL2, ≥8GB or ≥8 cores)
 * - Mid:  pose_landmarker_full,  GPU (default desktop / strong mobile)
 * - Low:  pose_landmarker_lite,  CPU (weak mobile / no WebGL2 / GPU init failed)
 *
 * WASM CDN pinned to exact installed @mediapipe/tasks-vision version (0.10.14).
 */

import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export type ModelTier = 'high' | 'mid' | 'low';

/** Pinned to the exact installed version — NEVER @latest */
const MEDIAPIPE_VERSION = '0.10.14';
const WASM_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;

const MODEL_PATHS: Record<ModelTier, string> = {
  high: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
  mid: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
  low: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
};

let poseLandmarkerInstance: PoseLandmarker | null = null;
let isInitializing = false;
let activeTier: ModelTier | null = null;
let inferenceTimesMs: number[] = [];
let hasDowngraded = false;

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || !navigator) return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return gl !== null;
  } catch {
    return false;
  }
}

/**
 * Probes device capabilities to select the best model tier.
 */
function selectTier(): ModelTier {
  const mobile = isMobileDevice();
  const webgl2 = hasWebGL2();

  if (!webgl2) return 'low';

  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;

  if (!mobile && (memory >= 8 || cores >= 8)) return 'high';
  if (!mobile) return 'mid';
  if (memory >= 4 && cores >= 4) return 'mid';
  return 'low';
}

async function createLandmarker(tier: ModelTier): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_CDN);

  const delegate = tier === 'low' ? 'CPU' : 'GPU';

  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_PATHS[tier],
      delegate,
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    outputSegmentationMasks: false,
    minPoseDetectionConfidence: 0.6,
    minPosePresenceConfidence: 0.6,
    minTrackingConfidence: 0.7,
  });
}

export async function getPoseLandmarker(): Promise<PoseLandmarker | null> {
  if (poseLandmarkerInstance) return poseLandmarkerInstance;

  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return poseLandmarkerInstance;
  }

  isInitializing = true;
  const tiers: ModelTier[] = [];
  const selectedTier = selectTier();

  // Build fallback chain: selected → next lower → lowest
  if (selectedTier === 'high') tiers.push('high', 'mid', 'low');
  else if (selectedTier === 'mid') tiers.push('mid', 'low');
  else tiers.push('low');

  for (const tier of tiers) {
    try {
      poseLandmarkerInstance = await createLandmarker(tier);
      activeTier = tier;
      isInitializing = false;
      return poseLandmarkerInstance;
    } catch (err) {
      console.warn(`Failed to init PoseLandmarker at tier "${tier}":`, err);
    }
  }

  console.error('Failed to initialize MediaPipe PoseLandmarker on any tier');
  isInitializing = false;
  return null;
}

/**
 * Record inference time for runtime downgrade monitoring.
 * If rolling median exceeds 45ms for 3s (~90 frames), downgrade one tier (once).
 */
export function recordInferenceTime(ms: number): void {
  inferenceTimesMs.push(ms);
  if (inferenceTimesMs.length > 90) inferenceTimesMs.shift();

  if (hasDowngraded || !activeTier || activeTier === 'low') return;
  if (inferenceTimesMs.length < 90) return;

  const sorted = [...inferenceTimesMs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  if (median > 45) {
    hasDowngraded = true;
    const nextTier: ModelTier = activeTier === 'high' ? 'mid' : 'low';
    console.warn(`Runtime downgrade: ${activeTier} → ${nextTier} (median ${Math.round(median)}ms)`);

    // Async re-init
    resetPoseLandmarker();
    inferenceTimesMs = [];
    activeTier = nextTier;

    createLandmarker(nextTier)
      .then((lm) => { poseLandmarkerInstance = lm; })
      .catch((err) => console.error('Runtime downgrade failed:', err));
  }
}

export function getActiveModelTier(): ModelTier | null {
  return activeTier;
}

export function resetPoseLandmarker(): void {
  if (poseLandmarkerInstance) {
    try {
      poseLandmarkerInstance.close();
    } catch {
      // ignore
    }
    poseLandmarkerInstance = null;
  }
}
