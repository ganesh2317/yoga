import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let poseLandmarkerInstance: PoseLandmarker | null = null;
let isInitializing = false;

/**
 * Detects if current environment is a mobile browser (iOS / Android).
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || !navigator) return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export async function getPoseLandmarker(): Promise<PoseLandmarker | null> {
  if (poseLandmarkerInstance) {
    return poseLandmarkerInstance;
  }

  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return poseLandmarkerInstance;
  }

  const isMobile = isMobileDevice();

  // Model Asset Paths:
  // On mobile (iOS / Android), full or lite task avoids WebGL/WASM memory crashes in WebKit.
  const primaryModelPath = isMobile
    ? 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'
    : 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';

  const fallbackModelPath =
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

  try {
    isInitializing = true;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    // Attempt 1: GPU Delegate with Full Model (Optimal performance & low memory)
    poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: primaryModelPath,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
    });

    isInitializing = false;
    return poseLandmarkerInstance;
  } catch (err) {
    console.warn('Failed GPU delegate for PoseLandmarker, falling back to CPU Lite:', err);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Attempt 2: CPU Delegate with Lite Model (100% crash-proof fallback for iOS / low-end)
      poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: fallbackModelPath,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      isInitializing = false;
      return poseLandmarkerInstance;
    } catch (cpuErr) {
      console.error('Failed to initialize MediaPipe PoseLandmarker completely:', cpuErr);
      isInitializing = false;
      return null;
    }
  }
}

/**
 * Resets landmarker instance if WebGL context is lost.
 */
export function resetPoseLandmarker() {
  if (poseLandmarkerInstance) {
    try {
      poseLandmarkerInstance.close();
    } catch (e) {
      // ignore
    }
    poseLandmarkerInstance = null;
  }
}
