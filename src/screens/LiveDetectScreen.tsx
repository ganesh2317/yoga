import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CameraOff, RefreshCw, Square, Sparkles, Play, BookOpen, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonOverlayCanvas } from '../components/SkeletonOverlayCanvas';
import { PoseReferenceIllustration } from '../components/PoseReferenceIllustration';
import { YOGA_POSES } from '../data/poses';
import { usePoseTracking } from '../hooks/usePoseTracking';
import { computeAnglesFromLandmarks } from '../lib/poseGeometry';
import { evaluatePoseFrame } from '../lib/scoreEngine';
import { generatePersonalizedFeedback } from '../lib/feedbackEngine';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import type { FrameEvaluation, SessionSummary } from '../types';

export const LiveDetectScreen: React.FC = () => {
  const { poseId } = useParams<{ poseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addCompletedSession } = useSessionStore();

  const pose = YOGA_POSES.find((p) => p.id === poseId) || YOGA_POSES[0];

  const { videoRef, landmarks, fps, cameraState, setCameraState, errorMessage } = usePoseTracking();

  const frameScoresRef = useRef<number[]>([]);
  const lastEvalRef = useRef<FrameEvaluation | null>(null);

  const [isReady, setIsReady] = useState<boolean>(false); // "Get Ready" state
  const [showInSessionGuide, setShowInSessionGuide] = useState<boolean>(false);
  const [liveScore, setLiveScore] = useState<number>(85);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Session timer - only ticks when isReady is true
  useEffect(() => {
    if (!isReady) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isReady]);

  // Compute live angles & score on landmarks update (only when isReady is true)
  useEffect(() => {
    if (!isReady || !landmarks || landmarks.length < 29) return;

    const angles = computeAnglesFromLandmarks(landmarks);
    const evalRes = evaluatePoseFrame(angles, pose);
    lastEvalRef.current = evalRes;
    setLiveScore(evalRes.score);
    frameScoresRef.current.push(evalRes.score);
  }, [landmarks, pose, isReady]);

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
    <div className="relative min-h-screen bg-[#0C0D10] overflow-hidden flex flex-col justify-between p-4 max-w-md mx-auto z-10">
      {/* Video Stream + Skeleton Viewport */}
      <div className="relative w-full h-[62vh] rounded-3xl overflow-hidden border border-white/10 bg-black/70 shadow-glass-glow flex items-center justify-center">
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

          <SkeletonOverlayCanvas landmarks={landmarks} width={380} height={500} />
        </div>

        {/* Top HUD: FPS & Timer */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-[#F4F1EC]">
            <span className="w-2 h-2 rounded-full bg-[#3F6B4F] animate-pulse" />
            <span className="font-mono font-bold">{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-2">
            {isReady && (
              <button
                onClick={() => setShowInSessionGuide(!showInSessionGuide)}
                className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-[#C9A66B] hover:bg-black/80 flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guide</span>
                {showInSessionGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-[#A8A29B]">
              <span>FPS: {fps}</span>
            </div>
          </div>
        </div>

        {/* Collapsible Mid-Session Reference Overlay */}
        {isReady && showInSessionGuide && (
          <div className="absolute top-16 right-4 left-4 z-30 p-4 rounded-2xl bg-black/85 border border-white/15 backdrop-blur-md space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 shrink-0">
                <PoseReferenceIllustration poseId={pose.id} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#F4F1EC]">{pose.name}</h4>
                <p className="text-[11px] text-[#C9A66B] italic">{pose.sanskritName}</p>
              </div>
            </div>
            <div className="space-y-1 pt-1 border-t border-white/10">
              <span className="text-[10px] font-bold text-[#A8A29B] uppercase tracking-widest block">
                Quick Form Reminders
              </span>
              <ul className="space-y-1">
                {pose.alignmentCues.map((cue, idx) => (
                  <li key={idx} className="text-[11px] text-[#F4F1EC] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] shrink-0" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Get Ready Step Overlay (Before Tracking Starts) */}
        {!isReady && (
          <div className="absolute inset-0 z-30 p-6 flex flex-col justify-between bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#C9A66B] uppercase tracking-widest block">
                    Get Into Position
                  </span>
                  <h3 className="font-serif font-extrabold text-2xl text-[#F4F1EC]">
                    {pose.name}
                  </h3>
                  <p className="text-xs text-[#C9A66B] font-medium italic">
                    {pose.sanskritName}
                  </p>
                </div>
                <StatusBadge status={pose.difficulty} size="sm" />
              </div>

              {/* Pose Line Art Reference Illustration */}
              <div className="w-28 h-28 mx-auto rounded-2xl bg-white/[0.04] border border-white/12 p-3 flex items-center justify-center shadow-inner">
                <PoseReferenceIllustration poseId={pose.id} />
              </div>

              {/* Numbered Setup Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#A8A29B] uppercase tracking-widest">
                  Setup Instructions
                </h4>
                <ol className="space-y-2">
                  {pose.setupSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#F4F1EC] leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-[#3F6B4F]/30 border border-[#3F6B4F]/50 text-[#6EE7B7] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Alignment Cues */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-[#A8A29B] uppercase tracking-widest">
                  Key Alignment Cues
                </h4>
                <ul className="space-y-1">
                  {pose.alignmentCues.map((cue, idx) => (
                    <li key={idx} className="text-xs text-[#A8A29B] flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A66B] shrink-0" />
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <GlassButton
              onClick={() => setIsReady(true)}
              variant="primary"
              size="lg"
              fullWidth
              className="mt-4"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
            >
              Start Session Tracking
            </GlassButton>
          </div>
        )}

        {/* Camera Denied / Fallback Message */}
        {cameraState === 'denied' && (
          <div className="absolute inset-0 z-40 p-6 flex flex-col items-center justify-center text-center bg-black/85 backdrop-blur-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C1502E]/20 border border-[#C1502E]/40 flex items-center justify-center text-[#C1502E]">
              <CameraOff className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#F4F1EC]">
                Camera Access Needed
              </h3>
              <p className="text-xs text-[#A8A29B] mt-1 max-w-xs">
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
                Enable Simulator Mode
              </GlassButton>
            </div>
          </div>
        )}
      </div>

      {/* Live Bottom Card: Pose Info & Reactive Score */}
      <GlassCard variant="focal" glowColor={liveScore >= 85 ? 'sage' : liveScore >= 65 ? 'amber' : 'red'} className="p-5 mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#A8A29B] uppercase tracking-widest block">
              Active Pose
            </span>
            <h2 className="font-serif font-extrabold text-xl text-[#F4F1EC]">
              {pose.name}
            </h2>
            <p className="text-xs text-[#C9A66B] font-medium italic">
              {pose.sanskritName}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#A8A29B] mb-1 font-bold uppercase tracking-widest">
              Alignment
            </span>
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/20 font-serif font-extrabold text-2xl text-[#F4F1EC] shadow-inner">
              {liveScore}<span className="text-xs text-[#A8A29B] font-normal">/100</span>
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
                ? 'Needs Adjustment'
                : 'Correction Required'
            }
          />

          <GlassButton
            onClick={handleStopSession}
            variant="danger"
            size="md"
            leftIcon={<Square className="w-4 h-4 fill-current" />}
          >
            End Session
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
