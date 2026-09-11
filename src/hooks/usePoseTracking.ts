import { useEffect, useRef, useState } from 'react';
import { getPoseLandmarker, isMobileDevice, resetPoseLandmarker } from '../lib/mediaPipeLoader';
import { OneEuroFilterBank } from '../lib/oneEuroFilter';
import type { NormalizedLandmark, WorldLandmark } from '../types';

export interface UsePoseTrackingReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarks: NormalizedLandmark[] | null;
  worldLandmarks: WorldLandmark[] | null;
  fps: number;
  cameraState: 'loading' | 'active' | 'denied' | 'error';
  errorMessage: string;
  isFullBodyVisible: boolean;
  activeTier: string;
}

export function usePoseTracking(): UsePoseTrackingReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Performance & filter refs
  const lastTimeRef = useRef<number>(performance.now());
  const lastDetectTimeRef = useRef<number>(0);
  const lastStateCommitTimeRef = useRef<number>(0);
  const filterBankNormRef = useRef<OneEuroFilterBank>(new OneEuroFilterBank(33));
  const filterBankWorldRef = useRef<OneEuroFilterBank>(new OneEuroFilterBank(33));

  // Current latest values in ref (high frequency)
  const currentLandmarksRef = useRef<NormalizedLandmark[] | null>(null);
  const currentWorldLandmarksRef = useRef<WorldLandmark[] | null>(null);
  const currentFpsRef = useRef<number>(0);
  const isFullBodyVisibleRef = useRef<boolean>(true);

  // React states (throttled commit at ~10Hz to prevent re-render storms)
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [worldLandmarks, setWorldLandmarks] = useState<WorldLandmark[] | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFullBodyVisible, setIsFullBodyVisible] = useState<boolean>(true);
  const [activeTier, setActiveTier] = useState<string>('mid');

  useEffect(() => {
    let isSubscribed = true;

    async function initPipeline() {
      try {
        setCameraState('loading');
        setErrorMessage('');

        const landmarker = await getPoseLandmarker();
        if (!isSubscribed) return;

        const isMobile = isMobileDevice();
        setActiveTier(isMobile ? 'lite' : 'full');
        const videoConstraints: MediaTrackConstraints = isMobile
          ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });

        streamRef.current = stream;

        if (!isSubscribed) {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (!isSubscribed) return;

          setCameraState('active');

          const processFrame = () => {
            if (!isSubscribed) return;

            const now = performance.now();
            const delta = now - lastTimeRef.current;
            lastTimeRef.current = now;

            if (delta > 0) {
              currentFpsRef.current = Math.round(1000 / delta);
            }

            // Process inference at ~30 FPS (at least 33ms interval)
            if (now - lastDetectTimeRef.current >= 33) {
              lastDetectTimeRef.current = now;

              if (videoRef.current && videoRef.current.readyState >= 2 && landmarker) {
                try {
                  const results = landmarker.detectForVideo(videoRef.current, now);
                  if (results && results.landmarks && results.landmarks.length > 0) {
                    const rawNorm = results.landmarks[0] as unknown as NormalizedLandmark[];
                    const rawWorld = (results.worldLandmarks && results.worldLandmarks.length > 0)
                      ? (results.worldLandmarks[0] as unknown as WorldLandmark[])
                      : null;

                    // 1. One-Euro adaptive filtering
                    const filteredNorm = filterBankNormRef.current.filter(rawNorm, now) as NormalizedLandmark[];
                    currentLandmarksRef.current = filteredNorm;

                    if (rawWorld) {
                      const filteredWorld = filterBankWorldRef.current.filter(rawWorld, now) as WorldLandmark[];
                      currentWorldLandmarksRef.current = filteredWorld;
                    } else {
                      currentWorldLandmarksRef.current = null;
                    }

                    // 2. Full-Body visibility check (ankles & knees: 25, 26, 27, 28)
                    if (filteredNorm.length >= 29) {
                      const k1 = filteredNorm[25]?.visibility ?? 1;
                      const k2 = filteredNorm[26]?.visibility ?? 1;
                      const a1 = filteredNorm[27]?.visibility ?? 1;
                      const a2 = filteredNorm[28]?.visibility ?? 1;
                      const lowerVisAvg = (k1 + k2 + a1 + a2) / 4;
                      isFullBodyVisibleRef.current = lowerVisAvg >= 0.55;
                    }
                  } else {
                    currentLandmarksRef.current = null;
                    currentWorldLandmarksRef.current = null;
                  }
                } catch (e: any) {
                  if (e && e.message && e.message.includes('context lost')) {
                    resetPoseLandmarker();
                  }
                }
              }
            }

            // Throttled UI State Commit (~10 Hz = 100ms) to avoid React re-render flood
            if (now - lastStateCommitTimeRef.current >= 100) {
              lastStateCommitTimeRef.current = now;
              setLandmarks(currentLandmarksRef.current);
              setWorldLandmarks(currentWorldLandmarksRef.current);
              setFps(currentFpsRef.current);
              setIsFullBodyVisible(isFullBodyVisibleRef.current);
            }

            if (isSubscribed) {
              animFrameRef.current = requestAnimationFrame(processFrame);
            }
          };

          animFrameRef.current = requestAnimationFrame(processFrame);
        }
      } catch (err: any) {
        if (isSubscribed) {
          const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
          setCameraState(isDenied ? 'denied' : 'error');
          setErrorMessage(err.message || 'Camera access error.');
        }
      }
    }

    initPipeline();

    // Guaranteed Cleanup on Unmount / Navigation
    return () => {
      isSubscribed = false;

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return {
    videoRef,
    landmarks,
    worldLandmarks,
    fps,
    cameraState,
    errorMessage,
    isFullBodyVisible,
    activeTier,
  };
}
