import { useEffect, useRef, useState } from 'react';
import { getPoseLandmarker } from '../lib/mediaPipeLoader';
import type { JointLandmark } from '../types';

export function usePoseTracking() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const prevLandmarksRef = useRef<JointLandmark[] | null>(null);

  const [landmarks, setLandmarks] = useState<JointLandmark[] | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'simulated'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFullBodyVisible, setIsFullBodyVisible] = useState<boolean>(true);

  useEffect(() => {
    let isSubscribed = true;

    async function initPipeline() {
      try {
        setCameraState('loading');
        setErrorMessage('');

        const landmarker = await getPoseLandmarker();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });

        if (!isSubscribed) return;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraState('active');

          const processFrame = () => {
            const now = performance.now();
            const delta = now - lastTimeRef.current;
            lastTimeRef.current = now;

            if (delta > 0) {
              setFps(Math.round(1000 / delta));
            }

            if (videoRef.current && videoRef.current.readyState >= 2 && landmarker) {
              try {
                const results = landmarker.detectForVideo(videoRef.current, now);
                if (results.landmarks && results.landmarks.length > 0) {
                  const raw = results.landmarks[0];

                  // 1. Temporal Exponential Moving Average (EMA) Smoothing
                  const alpha = 0.45;
                  const smoothed: JointLandmark[] = raw.map((lm, i) => {
                    const prev = prevLandmarksRef.current ? prevLandmarksRef.current[i] : null;
                    if (!prev) return lm;
                    return {
                      x: alpha * lm.x + (1 - alpha) * prev.x,
                      y: alpha * lm.y + (1 - alpha) * prev.y,
                      z: alpha * lm.z + (1 - alpha) * prev.z,
                      visibility: lm.visibility !== undefined ? lm.visibility : prev.visibility,
                    };
                  });

                  prevLandmarksRef.current = smoothed;
                  setLandmarks(smoothed);

                  // 2. Full-Body-in-Frame Guard Check (Knees & Ankles 25, 26, 27, 28)
                  if (smoothed.length >= 29) {
                    const k1 = smoothed[25]?.visibility ?? 1;
                    const k2 = smoothed[26]?.visibility ?? 1;
                    const a1 = smoothed[27]?.visibility ?? 1;
                    const a2 = smoothed[28]?.visibility ?? 1;
                    const lowerVisAvg = (k1 + k2 + a1 + a2) / 4;
                    setIsFullBodyVisible(lowerVisAvg >= 0.55);
                  }
                }
              } catch (e) {
                // Ignore transient frame errors
              }
            }

            animFrameRef.current = requestAnimationFrame(processFrame);
          };

          animFrameRef.current = requestAnimationFrame(processFrame);
        }
      } catch (err: any) {
        console.warn('Webcam permission denied or unavailable, switching to simulator mode:', err);
        if (isSubscribed) {
          setCameraState('denied');
          setErrorMessage(err.message || 'Camera access was denied or not found.');
        }
      }
    }

    initPipeline();

    return () => {
      isSubscribed = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Fallback simulator loop
  useEffect(() => {
    if (cameraState !== 'simulated' && cameraState !== 'denied') return;

    let simTick = 0;
    const interval = setInterval(() => {
      simTick += 0.1;
      const simLandmarks: JointLandmark[] = Array.from({ length: 33 }, (_, i) => ({
        x: 0.5 + Math.sin(simTick + i) * 0.02,
        y: 0.2 + (i / 33) * 0.7,
        z: 0,
        visibility: 0.95,
      }));

      setLandmarks(simLandmarks);
      setFps(30);
      setIsFullBodyVisible(true);
    }, 100);

    return () => clearInterval(interval);
  }, [cameraState]);

  return {
    videoRef,
    landmarks,
    fps,
    cameraState,
    setCameraState,
    errorMessage,
    isFullBodyVisible,
  };
}
