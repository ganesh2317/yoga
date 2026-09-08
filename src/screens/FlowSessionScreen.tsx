import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CameraOff,
  RefreshCw,
  Square,
  Sparkles,
  Play,
  BookOpen,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Wind,
  SkipForward,
  CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonOverlayCanvas } from '../components/SkeletonOverlayCanvas';
import { PoseReferenceIllustration } from '../components/PoseReferenceIllustration';
import { BreathGuide } from '../components/BreathGuide';
import { YOGA_FLOWS } from '../data/flows';
import { YOGA_POSES } from '../data/poses';
import { usePoseTracking } from '../hooks/usePoseTracking';
import { computeAnglesFromLandmarks } from '../lib/poseGeometry';
import { evaluatePoseFrame } from '../lib/scoreEngine';
import { generatePersonalizedFeedback } from '../lib/feedbackEngine';
import { voiceCoach } from '../lib/voiceCoach';
import { AccuracyTracker } from '../lib/accuracyTracker';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import type { FrameEvaluation, SessionSummary, YogaPose } from '../types';

export const FlowSessionScreen: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addCompletedSession } = useSessionStore();

  const flow = YOGA_FLOWS.find((f) => f.id === flowId) || YOGA_FLOWS[0];

  const {
    videoRef,
    landmarks,
    fps,
    cameraState,
    setCameraState,
    errorMessage,
    isFullBodyVisible,
  } = usePoseTracking();

  const [currentPoseIndex, setCurrentPoseIndex] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [showInSessionGuide, setShowInSessionGuide] = useState<boolean>(false);
  const [showBreathGuide, setShowBreathGuide] = useState<boolean>(false);
  const [liveScore, setLiveScore] = useState<number>(85);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);
  const [holdSeconds, setHoldSeconds] = useState<number>(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(voiceCoach.getMuted());

  const accuracyTrackerRef = useRef<AccuracyTracker>(new AccuracyTracker());

  const currentFlowPoseConfig = flow.poses[currentPoseIndex] || flow.poses[0];
  const currentPose: YogaPose =
    YOGA_POSES.find((p) => p.id === currentFlowPoseConfig.poseId) || YOGA_POSES[0];

  const poseScoresRef = useRef<Record<number, number[]>>({});
  const poseLastEvalRef = useRef<Record<number, FrameEvaluation>>({});
  const lastHoldTickTimeRef = useRef<number>(0);

  // Overall session timer
  useEffect(() => {
    if (!isReady) return;
    const timer = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isReady]);

  // Voice coach cleanup
  useEffect(() => {
    return () => {
      voiceCoach.reset();
    };
  }, []);

  // Announce pose when step changes
  useEffect(() => {
    if (isReady) {
      voiceCoach.speak(`Pose ${currentPoseIndex + 1} of ${flow.poses.length}. ${currentPose.name}.`);
    }
  }, [currentPoseIndex, isReady, currentPose.name, flow.poses.length]);

  // Frame processing and posture hold timer logic
  useEffect(() => {
    if (!isReady || !landmarks || landmarks.length < 29) return;

    const angles = computeAnglesFromLandmarks(landmarks);
    const evalRes = evaluatePoseFrame(angles, currentPose);

    poseLastEvalRef.current[currentPoseIndex] = evalRes;
    setLiveScore(evalRes.score);

    if (!poseScoresRef.current[currentPoseIndex]) {
      poseScoresRef.current[currentPoseIndex] = [];
    }
    poseScoresRef.current[currentPoseIndex].push(evalRes.score);

    voiceCoach.processFrame(evalRes.jointEvaluations, evalRes.score);

    // Accuracy tracker update using actual wall-clock time & full-body visibility check
    const isTrackingValid = Boolean(cameraState === 'active' || cameraState === 'simulated') && isFullBodyVisible;
    accuracyTrackerRef.current.update(evalRes.score, isTrackingValid);
    setLiveAccuracy(accuracyTrackerRef.current.getAccuracyPercent());

    // Track hold duration if posture score is acceptable (>= 65)
    if (evalRes.score >= 65) {
      const now = performance.now();
      if (now - lastHoldTickTimeRef.current >= 1000) {
        lastHoldTickTimeRef.current = now;
        setHoldSeconds((prev) => {
          const next = prev + 1;
          if (next >= currentFlowPoseConfig.targetHoldSeconds) {
            // Auto-advance trigger!
            handleNextPose();
          }
          return next;
        });
      }
    }
  }, [landmarks, currentPose, currentPoseIndex, isReady, currentFlowPoseConfig.targetHoldSeconds, cameraState, isFullBodyVisible]);

  const handleNextPose = async () => {
    voiceCoach.speak('Great hold!');
    if (currentPoseIndex < flow.poses.length - 1) {
      setCurrentPoseIndex((prev) => prev + 1);
      setHoldSeconds(0);
      setIsReady(false);
    } else {
      // Flow complete!
      await handleCompleteFlow();
    }
  };

  const handleCompleteFlow = async () => {
    // Collect all scores across poses
    let allScores: number[] = [];
    Object.values(poseScoresRef.current).forEach((sc) => {
      allScores = allScores.concat(sc);
    });

    const avgScore =
      allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 88;

    const lastEval =
      poseLastEvalRef.current[currentPoseIndex] || evaluatePoseFrame({}, currentPose);
    const feedbackTips = generatePersonalizedFeedback(lastEval.jointEvaluations, currentPose);

    const totalDuration = Math.max(10, totalElapsedSeconds);
    const caloriesBurned = Math.max(2, Math.round((totalDuration / 60) * 4.0));
    const accuracyStats = accuracyTrackerRef.current.getStats();

    const sessionId = 'flow_ses_' + Date.now();
    const todayStr = new Date().toISOString().split('T')[0];

    const sessionSummary: SessionSummary = {
      id: sessionId,
      userId: user?.id || 'guest',
      poseId: flow.id,
      poseName: flow.name,
      sanskritName: flow.sanskritName,
      timestamp: new Date().toISOString(),
      dateString: todayStr,
      durationSeconds: totalDuration,
      averageScore: avgScore,
      accuracyPercent: accuracyStats.accuracyPercent,
      inPositionSeconds: accuracyStats.inPositionSeconds,
      totalTrackedSeconds: accuracyStats.totalTrackedSeconds,
      categoryBreakdown: lastEval.categoryBreakdown,
      jointEvaluations: lastEval.jointEvaluations,
      feedbackTips,
      caloriesBurned,
    };

    await addCompletedSession(sessionSummary, user?.dailyGoalMinutes || 20);
    navigate(`/score/${sessionId}`);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const holdProgress = Math.min(
    100,
    Math.round((holdSeconds / currentFlowPoseConfig.targetHoldSeconds) * 100)
  );

  return (
    <div className="relative min-h-screen bg-[#0A0E14] overflow-hidden flex flex-col justify-between p-4 max-w-md mx-auto z-10">
      {/* Video Stream + Skeleton Viewport */}
      <div className="relative w-full h-[60vh] rounded-3xl overflow-hidden border border-white/12 bg-black/70 shadow-glass-glow flex items-center justify-center">
        {/* SINGLE MIRROR CONTAINER */}
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

        {/* Top HUD: Flow Progress & Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/12 text-xs text-[#F5F7FA]">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="font-bold text-[#34D399]">
              Pose {currentPoseIndex + 1}/{flow.poses.length}
            </span>
            <span className="text-[11px] font-mono text-[#94A3B8]">
              ({formatTimer(totalElapsedSeconds)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceMuted(voiceCoach.toggleMute())}
              className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-[11px] font-bold flex items-center gap-1 transition-all ${
                isVoiceMuted
                  ? 'bg-[#EF4444]/20 border-[#EF4444]/40 text-[#EF4444]'
                  : 'bg-black/65 border-white/15 text-[#34D399] hover:bg-black/85'
              }`}
              title={isVoiceMuted ? 'Unmute Voice Coach' : 'Mute Voice Coach'}
            >
              {isVoiceMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span>{isVoiceMuted ? 'Muted' : 'Coach'}</span>
            </button>

            <button
              onClick={() => setShowBreathGuide(!showBreathGuide)}
              className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-[11px] font-bold flex items-center gap-1 transition-all ${
                showBreathGuide
                  ? 'bg-[#34D399]/20 border-[#34D399]/40 text-[#34D399]'
                  : 'bg-black/65 border-white/15 text-[#94A3B8] hover:bg-black/85 hover:text-[#F5F7FA]'
              }`}
              title={showBreathGuide ? 'Hide Breath Guide' : 'Show Breath Guide'}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Breath</span>
            </button>

            {isReady && (
              <button
                onClick={() => setShowInSessionGuide(!showInSessionGuide)}
                className="px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[11px] font-bold text-[#F59E0B] hover:bg-black/85 flex items-center gap-1 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guide</span>
                {showInSessionGuide ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}

            <div className="px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/10 text-[11px] text-[#94A3B8]">
              <span>FPS: {fps}</span>
            </div>
          </div>
        </div>

        {/* Breath Pacing Guide Overlay */}
        {showBreathGuide && (
          <div className="absolute top-16 left-4 z-30 animate-in fade-in duration-200">
            <BreathGuide onClose={() => setShowBreathGuide(false)} />
          </div>
        )}

        {/* Full-Body Guard Warning Badge */}
        {!isFullBodyVisible && isReady && cameraState === 'active' && (
          <div className="absolute bottom-4 left-4 right-4 z-20 px-3.5 py-2 rounded-2xl bg-[#F59E0B]/20 border border-[#F59E0B]/50 backdrop-blur-md text-center flex items-center justify-center gap-2 text-xs text-[#FBBF24] font-bold animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span>Step back so your full body is visible</span>
          </div>
        )}

        {/* Collapsible Reference Overlay */}
        {isReady && showInSessionGuide && (
          <div className="absolute top-16 right-4 left-4 z-30 p-4 rounded-2xl glass-amber-modal space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center">
                <PoseReferenceIllustration poseId={currentPose.id} strokeColor="#FBBF24" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#F5F7FA]">
                  {currentPose.name}
                </h4>
                <p className="text-[11px] text-[#F59E0B] italic">
                  {currentPose.sanskritName}
                </p>
              </div>
            </div>
            <div className="space-y-1 pt-1 border-t border-white/10">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block">
                Quick Form Reminders
              </span>
              <ul className="space-y-1">
                {currentPose.alignmentCues.map((cue, idx) => (
                  <li key={idx} className="text-[11px] text-[#F5F7FA] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Get Ready Step Overlay (Before Tracking Each Pose) */}
        {!isReady && (
          <div className="absolute inset-0 z-30 p-6 flex flex-col justify-between glass-amber-modal overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-widest block">
                    Flow Step {currentPoseIndex + 1} of {flow.poses.length}
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-[#F5F7FA]">
                    {currentPose.name}
                  </h3>
                  <p className="text-xs text-[#F59E0B] font-medium italic">
                    {currentPose.sanskritName} • Target Hold: {currentFlowPoseConfig.targetHoldSeconds}s
                  </p>
                </div>
                <StatusBadge status={currentPose.difficulty} size="sm" />
              </div>

              {/* Reference Illustration */}
              <div className="w-28 h-28 mx-auto rounded-2xl bg-white/10 border border-white/15 p-3 flex items-center justify-center shadow-inner">
                <PoseReferenceIllustration poseId={currentPose.id} strokeColor="#34D399" />
              </div>

              {/* Setup Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
                  Setup Instructions
                </h4>
                <ol className="space-y-2">
                  {currentPose.setupSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#F5F7FA] leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/50 text-[#34D399] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Alignment Cues */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
                  Key Form Cues
                </h4>
                <ul className="space-y-1">
                  {currentPose.alignmentCues.map((cue, idx) => (
                    <li key={idx} className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
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
              Start Pose {currentPoseIndex + 1} Tracking
            </GlassButton>
          </div>
        )}

        {/* Camera Denied / Fallback Message */}
        {cameraState === 'denied' && (
          <div className="absolute inset-0 z-40 p-6 flex flex-col items-center justify-center text-center bg-black/85 backdrop-blur-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
              <CameraOff className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#F5F7FA]">
                Camera Access Needed
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-xs">
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

      {/* Live Bottom Card: Pose Info, Auto-Hold Progress & Controls */}
      <GlassCard
        variant="focal"
        glowColor={liveScore >= 85 ? 'emerald' : liveScore >= 65 ? 'amber' : 'red'}
        className="p-5 mt-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-widest block">
              Flow Step {currentPoseIndex + 1} of {flow.poses.length}
            </span>
            <h2 className="font-display font-extrabold text-xl text-[#F5F7FA]">
              {currentPose.name}
            </h2>
            <p className="text-xs text-[#F59E0B] font-medium italic">
              {currentPose.sanskritName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[#94A3B8] mb-1 font-bold uppercase tracking-widest">
                Alignment
              </span>
              <div className="px-3 py-1 rounded-2xl bg-white/10 border border-white/20 font-display font-extrabold text-xl text-[#34D399]">
                {liveScore}<span className="text-xs text-[#94A3B8] font-normal">/100</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[#94A3B8] mb-1 font-bold uppercase tracking-widest">
                Accuracy
              </span>
              <div className="px-3 py-1 rounded-2xl bg-white/10 border border-white/20 font-display font-extrabold text-xl text-[#F59E0B]">
                {liveAccuracy}%
              </div>
            </div>
          </div>
        </div>

        {/* Hold Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
              Form Hold Progress
            </span>
            <span className="font-mono font-bold text-[#34D399]">
              {holdSeconds}s / {currentFlowPoseConfig.targetHoldSeconds}s
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/10 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#22C55E] to-[#34D399] transition-all duration-300 rounded-full"
              style={{ width: `${holdProgress}%` }}
            />
          </div>
        </div>

        {/* Bottom Actions: Manual Skip & End Flow */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-3">
          <GlassButton
            onClick={handleNextPose}
            variant="secondary"
            size="sm"
            leftIcon={<SkipForward className="w-4 h-4" />}
          >
            {currentPoseIndex < flow.poses.length - 1 ? 'Skip Pose' : 'Finish Flow'}
          </GlassButton>

          <GlassButton
            onClick={handleCompleteFlow}
            variant="danger"
            size="sm"
            leftIcon={<Square className="w-4 h-4 fill-current" />}
          >
            End Flow Early
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
