import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CameraOff, RefreshCw, Square, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonOverlayCanvas } from '../components/SkeletonOverlayCanvas';
import { YOGA_POSES } from '../data/poses';
import { computeAnglesFromLandmarks } from '../lib/poseGeometry';
import { evaluatePoseFrame } from '../lib/scoreEngine';
import { generatePersonalizedFeedback } from '../lib/feedbackEngine';
import { getPoseLandmarker } from '../lib/mediaPipeLoader';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import type { FrameEvaluation, JointLandmark, SessionSummary } from '../types';

export const LiveDetectScreen: React.FC = () => {
  const { poseId } = useParams<{ poseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addCompletedSession } = useSessionStore();

  const pose = YOGA_POSES.find((p) => p.id === poseId) || YOGA_POSES[0];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameScoresRef = useRef<number[]>([]);
  const lastEvalRef = useRef<FrameEvaluation | null>(null);

  const [landmarks, setLandmarks] = useState<JointLandmark[] | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [liveScore, setLiveScore] = useState<number>(85);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'simulated'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Start Session Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Webcam & MediaPipe
  useEffect(() => {
    let isSubscribed = true;

    async function initPipeline() {
      try {
        setCameraState('loading');
        setErrorMessage('');

        const landmarker = await getPoseLandmarker();

        // Request webcam access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });

        if (!isSubscribed) return;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraState('active');

          // Frame processing loop
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
                  const rawLm = results.landmarks[0];
                  setLandmarks(rawLm);

                  // Compute angles & evaluate pose
                  const angles = computeAnglesFromLandmarks(rawLm);
                  const evalRes = evaluatePoseFrame(angles, pose);
                  lastEvalRef.current = evalRes;
                  setLiveScore(evalRes.score);
                  frameScoresRef.current.push(evalRes.score);
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
  }, [pose]);

  // Fallback simulator loop if camera is denied/unavailable
  useEffect(() => {
    if (cameraState !== 'simulated' && cameraState !== 'denied') return;

    let simTick = 0;
    const interval = setInterval(() => {
      simTick += 0.1;
      // Generate synthetic landmarks for standing pose
      const simLandmarks: JointLandmark[] = Array.from({ length: 33 }, (_, i) => ({
        x: 0.5 + Math.sin(simTick + i) * 0.02,
        y: 0.2 + (i / 33) * 0.7,
        z: 0,
        visibility: 0.9,
      }));

      // Key joints simulation
      simLandmarks[11] = { x: 0.4, y: 0.3, z: 0, visibility: 0.95 }; // left shoulder
      simLandmarks[12] = { x: 0.6, y: 0.3, z: 0, visibility: 0.95 }; // right shoulder
      simLandmarks[13] = { x: 0.3, y: 0.45, z: 0, visibility: 0.95 }; // left elbow
      simLandmarks[14] = { x: 0.7, y: 0.45, z: 0, visibility: 0.95 }; // right elbow
      simLandmarks[15] = { x: 0.25, y: 0.6, z: 0, visibility: 0.95 }; // left wrist
      simLandmarks[16] = { x: 0.75, y: 0.6, z: 0, visibility: 0.95 }; // right wrist
      simLandmarks[23] = { x: 0.43, y: 0.55, z: 0, visibility: 0.95 }; // left hip
      simLandmarks[24] = { x: 0.57, y: 0.55, z: 0, visibility: 0.95 }; // right hip
      simLandmarks[25] = { x: 0.44, y: 0.75, z: 0, visibility: 0.95 }; // left knee
      simLandmarks[26] = { x: 0.56, y: 0.75, z: 0, visibility: 0.95 }; // right knee
      simLandmarks[27] = { x: 0.45, y: 0.92, z: 0, visibility: 0.95 }; // left ankle
      simLandmarks[28] = { x: 0.55, y: 0.92, z: 0, visibility: 0.95 }; // right ankle

      setLandmarks(simLandmarks);
      setFps(30);

      const angles = computeAnglesFromLandmarks(simLandmarks);
      const evalRes = evaluatePoseFrame(angles, pose);
      lastEvalRef.current = evalRes;
      setLiveScore(evalRes.score);
      frameScoresRef.current.push(evalRes.score);
    }, 100);

    return () => clearInterval(interval);
  }, [cameraState, pose]);

  // Stop session & persist to IndexedDB
  const handleStopSession = async () => {
    const scores = frameScoresRef.current;
    const avgScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;

    const finalEval = lastEvalRef.current || evaluatePoseFrame({}, pose);
    const feedbackTips = generatePersonalizedFeedback(finalEval.jointEvaluations, pose);
    const caloriesBurned = Math.max(
      1,
      Math.round((elapsedSeconds / 60) * pose.estimatedCaloriesPerMin)
    );

    const sessionId = 'ses_' + Date.now();
    const todayStr = new Date().toISOString().split('T')[0];

    const sessionSummary: SessionSummary = {
      id: sessionId,
      userId: user?.id || 'guest',
      poseId: pose.id,
      poseName: pose.name,
      sanskritName: pose.sanskritName,
      timestamp: new Date().toISOString(),
      dateString: todayStr,
      durationSeconds: Math.max(5, elapsedSeconds),
      averageScore: avgScore,
      categoryBreakdown: finalEval.categoryBreakdown,
      jointEvaluations: finalEval.jointEvaluations,
      feedbackTips,
      caloriesBurned,
    };

    await addCompletedSession(sessionSummary, user?.dailyGoalMinutes || 20);
    navigate(`/score/${sessionId}`);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="relative min-h-screen bg-bg-darkest overflow-hidden flex flex-col justify-between p-4 max-w-md mx-auto z-10">
      {/* Video Stream + Skeleton Viewport */}
      <div className="relative w-full h-[65vh] rounded-3xl overflow-hidden border border-white/15 bg-black/60 shadow-glass-glow flex items-center justify-center">
        {/* 
          SINGLE MIRROR CONTAINER:
          Mirrors both the video feed and skeleton canvas overlay together.
          MediaPipe outputs anatomical landmarks (left_wrist = user's actual left arm).
          By wrapping both video and canvas in scaleX(-1), anatomical landmarks align
          perfectly with the selfie-mirrored display stream without needing coordinate
          or label swaps downstream. DO NOT add another scaleX(-1) or flip elsewhere!
        */}
        <div className="absolute inset-0 w-full h-full transform -scale-x-100">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${
              cameraState === 'active' ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Skeleton Canvas Overlay */}
          <SkeletonOverlayCanvas landmarks={landmarks} width={380} height={520} />
        </div>

        {/* Top HUD: FPS & Timer */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs text-text-primary">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="font-mono font-bold">{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[11px] text-text-tertiary">
            <span>FPS: {fps}</span>
            <span className="text-accent-emerald">• CV GPU</span>
          </div>
        </div>

        {/* Camera Denied / Fallback Message */}
        {cameraState === 'denied' && (
          <div className="absolute inset-0 z-30 p-6 flex flex-col items-center justify-center text-center bg-black/80 backdrop-blur-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-status-slight/20 border border-status-slight/40 flex items-center justify-center text-amber-400">
              <CameraOff className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text-primary">
                Camera Access Needed
              </h3>
              <p className="text-xs text-text-secondary mt-1 max-w-xs">
                {errorMessage || 'Please allow webcam access in browser settings.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <GlassButton
                onClick={() => window.location.reload()}
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Retry Camera Access
              </GlassButton>

              <GlassButton
                onClick={() => setCameraState('simulated')}
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Enable Interactive Simulator Mode
              </GlassButton>
            </div>
          </div>
        )}
      </div>

      {/* Live Bottom Card: Pose Info & Reactive Score */}
      <GlassCard variant="glow" glowColor={liveScore >= 85 ? 'green' : liveScore >= 65 ? 'amber' : 'red'} className="p-5 mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
              Current Pose
            </span>
            <h2 className="font-display font-extrabold text-xl text-text-primary">
              {pose.name}
            </h2>
            <p className="text-xs text-accent-emerald font-medium italic">
              {pose.sanskritName}
            </p>
          </div>

          {/* Live Reactive Score Ring */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-text-tertiary mb-1 font-semibold uppercase">
              Alignment Score
            </span>
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/20 font-display font-extrabold text-2xl text-accent-mint shadow-inner">
              {liveScore}<span className="text-xs text-text-tertiary font-normal">/100</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <StatusBadge
            status={liveScore >= 85 ? 'Good' : liveScore >= 65 ? 'Slight' : 'Poor'}
            label={
              liveScore >= 85
                ? 'Great Alignment!'
                : liveScore >= 65
                ? 'Needs Slight Adjustment'
                : 'Form Correction Required'
            }
          />

          <GlassButton
            onClick={handleStopSession}
            variant="danger"
            size="md"
            leftIcon={<Square className="w-4 h-4 fill-current" />}
          >
            Stop Session
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
