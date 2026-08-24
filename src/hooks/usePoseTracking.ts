import { useEffect, useRef, useState } from 'react';
import { getPoseLandmarker } from '../lib/mediaPipeLoader';
import type { JointLandmark } from '../types';

export function usePoseTracking() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const [landmarks, setLandmarks] = useState<JointLandmark[] | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'simulated'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

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
                  setLandmarks(results.landmarks[0]);
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

  // Fallback simulator loop if camera is denied/unavailable
  useEffect(() => {
    if (cameraState !== 'simulated' && cameraState !== 'denied') return;

    let simTick = 0;
    const interval = setInterval(() => {
      simTick += 0.1;
      const simLandmarks: JointLandmark[] = Array.from({ length: 33 }, (_, i) => ({
        x: 0.5 + Math.sin(simTick + i) * 0.02,
        y: 0.2 + (i / 33) * 0.7,
        z: 0,
        visibility: 0.9,
      }));

      simLandmarks[11] = { x: 0.4, y: 0.3, z: 0, visibility: 0.95 };
      simLandmarks[12] = { x: 0.6, y: 0.3, z: 0, visibility: 0.95 };
      simLandmarks[13] = { x: 0.3, y: 0.45, z: 0, visibility: 0.95 };
      simLandmarks[14] = { x: 0.7, y: 0.45, z: 0, visibility: 0.95 };
      simLandmarks[15] = { x: 0.25, y: 0.6, z: 0, visibility: 0.95 };
      simLandmarks[16] = { x: 0.75, y: 0.6, z: 0, visibility: 0.95 };
      simLandmarks[23] = { x: 0.43, y: 0.55, z: 0, visibility: 0.95 };
      simLandmarks[24] = { x: 0.57, y: 0.55, z: 0, visibility: 0.95 };
      simLandmarks[25] = { x: 0.44, y: 0.75, z: 0, visibility: 0.95 };
      simLandmarks[26] = { x: 0.56, y: 0.75, z: 0, visibility: 0.95 };
      simLandmarks[27] = { x: 0.45, y: 0.92, z: 0, visibility: 0.95 };
      simLandmarks[28] = { x: 0.55, y: 0.92, z: 0, visibility: 0.95 };

      setLandmarks(simLandmarks);
      setFps(30);
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
  };
}
