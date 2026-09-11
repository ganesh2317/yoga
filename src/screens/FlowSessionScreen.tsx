import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  Square,
  SkipForward,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { YOGA_FLOWS } from '../data/flows';
import { YOGA_POSES } from '../data/poses';
import { usePoseTracking } from '../hooks/usePoseTracking';
import { computeWorldAngles, computeImageAngles } from '../lib/poseGeometry';
import { evaluatePose } from '../lib/scoreEngine';
import { AccuracyTracker } from '../lib/accuracyTracker';
import { getFramingInstruction } from '../lib/framingCoach';
import { computeTrackingQuality } from '../lib/trackingQuality';
import { JointHysteresisTracker } from '../lib/hysteresis';
import { voiceCoach } from '../lib/voiceCoach';
import { generateFeedbackTips } from '../lib/feedbackEngine';
import { localDateKey } from '../lib/localDate';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import { useJourneyStore } from '../store/useJourneyStore';

import { SkeletonOverlayCanvas } from '../components/SkeletonOverlayCanvas';
import { MiniDemoPlayer } from '../components/MiniDemoPlayer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Ring } from '../components/ui/Ring';
import type { FrameEvaluation, JointStatus, SessionSummary } from '../types';

export const FlowSessionScreen: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addCompletedSession } = useSessionStore();
  const { recordSession } = useJourneyStore();

  const flow = YOGA_FLOWS.find((f) => f.id === flowId) || YOGA_FLOWS[0];

  const {
    videoRef,
    landmarks,
    worldLandmarks,
    fps,
    cameraState,
    errorMessage,
  } = usePoseTracking();

  const [currentPoseIdx, setCurrentPoseIdx] = useState<number>(0);
  const currentConfig = flow.poses[currentPoseIdx] || flow.poses[0];
  const currentPose =
    YOGA_POSES.find((p) => p.id === currentConfig.poseId) || YOGA_POSES[0];

  // Tracking & Engine Refs
  const accuracyTrackerRef = useRef<AccuracyTracker>(new AccuracyTracker());
  const hysteresisRef = useRef<JointHysteresisTracker>(new JointHysteresisTracker());
  const frameScoresRef = useRef<number[]>([]);
  const lastEvalRef = useRef<FrameEvaluation | null>(null);

  // Live Display States
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(0);
  const [currentHoldSeconds, setCurrentHoldSeconds] = useState<number>(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [liveCues, setLiveCues] = useState<string[]>([]);
  const [displayedStatuses, setDisplayedStatuses] = useState<Record<string, JointStatus>>({});
  const [framingMsg, setFramingMsg] = useState<string>('Step into view');
  const [trackingQuality, setTrackingQuality] = useState<number>(100);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(voiceCoach.getMuted());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceCoach.reset();
      accuracyTrackerRef.current.reset();
    };
  }, []);

  // Total Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset trackers on pose advance
  useEffect(() => {
    accuracyTrackerRef.current.reset();
    setCurrentHoldSeconds(0);
    setLiveScore(null);
  }, [currentPoseIdx]);

  // Frame processing loop
  useEffect(() => {
    if (!landmarks || landmarks.length < 29) {
      if (landmarks) {
        const framing = getFramingInstruction(landmarks);
        setFramingMsg(framing);
        const quality = computeTrackingQuality(landmarks, fps);
        setTrackingQuality(quality.score);
      }
      return;
    }

    const now = performance.now();

    const framing = getFramingInstruction(landmarks);
    setFramingMsg(framing);
    const quality = computeTrackingQuality(landmarks, fps);
    setTrackingQuality(quality.score);

    const angles = worldLandmarks
      ? computeWorldAngles(worldLandmarks)
      : computeImageAngles(landmarks);

    const evaluation = evaluatePose(angles, currentPose, landmarks);
    lastEvalRef.current = evaluation;

    if (evaluation.score !== null) {
      setLiveScore(evaluation.score);
      frameScoresRef.current.push(evaluation.score);
      if (frameScoresRef.current.length > 2000) frameScoresRef.current.shift();
    } else {
      setLiveScore(null);
    }

    accuracyTrackerRef.current.processFrame(evaluation.score, now);
    const currentAcc = Math.round(accuracyTrackerRef.current.getAccuracyPercent());
    const hold = Math.round(accuracyTrackerRef.current.getCurrentHoldSeconds());
    setLiveAccuracy(currentAcc);
    setCurrentHoldSeconds(hold);

    // Auto Advance when target hold reached!
    if (hold >= currentConfig.targetHoldSeconds) {
      if (currentPoseIdx < flow.poses.length - 1) {
        setCurrentPoseIdx((prev) => prev + 1);
      } else {
        handleEndFlow();
      }
    }

    const rawStatuses: Record<string, JointStatus> = {};
    for (const [key, jointEval] of Object.entries(evaluation.jointEvaluations)) {
      rawStatuses[key] = jointEval.status;
    }
    const smoothStatuses = hysteresisRef.current.update(rawStatuses);
    setDisplayedStatuses(smoothStatuses);

    const tips = generateFeedbackTips(evaluation.jointEvaluations, currentPose);
    setLiveCues(tips);

    if (!isVoiceMuted && evaluation.score !== null) {
      voiceCoach.speakFeedback(evaluation, currentPose);
    }
  }, [landmarks, worldLandmarks, fps, currentPose, currentPoseIdx, isVoiceMuted]);

  const handleNextPose = () => {
    if (currentPoseIdx < flow.poses.length - 1) {
      setCurrentPoseIdx((prev) => prev + 1);
    } else {
      handleEndFlow();
    }
  };

  const handleEndFlow = async () => {
    const scores = frameScoresRef.current;
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const longestHold = Math.round(accuracyTrackerRef.current.getLongestHoldSeconds());
    const finalAccuracy = Math.round(accuracyTrackerRef.current.getAccuracyPercent());

    const summary: SessionSummary = {
      id: `flow_${Date.now()}`,
      userId: user?.id || 'guest',
      poseId: flow.id,
      poseName: flow.name,
      sanskritName: flow.sanskritName,
      timestamp: new Date().toISOString(),
      dateString: localDateKey(),
      durationSeconds: totalElapsedSeconds,
      averageScore: avgScore,
      accuracyPercent: finalAccuracy,
      inPositionSeconds: longestHold,
      longestHoldSeconds: longestHold,
      totalTrackedSeconds: totalElapsedSeconds,
      trackingQualityAvg: trackingQuality,
      categoryBreakdown: lastEvalRef.current
        ? lastEvalRef.current.categoryBreakdown
        : { overall: avgScore, shoulder: 0, hip: 0, knee: 0, torso: 0, balance: 0 },
      jointEvaluations: lastEvalRef.current ? lastEvalRef.current.jointEvaluations : {},
      feedbackTips: liveCues,
      caloriesBurned: Math.round((4.5 * totalElapsedSeconds) / 60),
    };

    if (user) {
      await addCompletedSession(summary, user.dailyGoalMinutes);
      await recordSession(summary);
    }

    navigate('/score', { state: { summary } });
  };

  const toggleVoice = () => {
    const nextMuted = !isVoiceMuted;
    voiceCoach.setMuted(nextMuted);
    setIsVoiceMuted(nextMuted);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center select-none">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
      />

      <SkeletonOverlayCanvas
        landmarks={landmarks}
        videoElement={videoRef.current}
        jointStatuses={displayedStatuses}
        isMirrored={true}
      />

      {/* Top Multi-Pose Progress Rail HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col space-y-2 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="bg-surface-1/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-surface-border shadow-lg flex items-center space-x-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-accent-400">
                {flow.name} • Pose {currentPoseIdx + 1} of {flow.poses.length}
              </div>
              <h1 className="text-base font-display font-bold text-text-primary">
                {currentPose.name}
              </h1>
            </div>
            <Badge variant="accent" size="sm">
              Hold: {currentHoldSeconds} / {currentConfig.targetHoldSeconds}s
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleVoice}
              className="w-10 h-10 rounded-2xl bg-surface-1/80 backdrop-blur-md border border-surface-border flex items-center justify-center text-text-secondary shadow-lg"
            >
              {isVoiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-primary-400" />}
            </button>
            <Button
              variant="secondary"
              size="md"
              onClick={handleNextPose}
              className="shadow-lg"
            >
              <SkipForward className="w-4 h-4 mr-1" /> Skip
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleEndFlow}
              className="shadow-lg"
            >
              <Square className="w-4 h-4 fill-current mr-1" /> End
            </Button>
          </div>
        </div>

        {/* Progress Dots Rail */}
        <div className="w-full bg-surface-1/70 backdrop-blur-md p-1.5 rounded-xl border border-surface-border flex items-center space-x-1.5 pointer-events-auto max-w-sm self-center">
          {flow.poses.map((_p, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                i < currentPoseIdx
                  ? 'bg-primary-500'
                  : i === currentPoseIdx
                  ? 'bg-accent-500 animate-pulse'
                  : 'bg-surface-3'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Left HUD Score */}
      <div className="absolute top-28 left-4 z-20 pointer-events-none">
        <div className="bg-surface-1/85 backdrop-blur-md p-3 rounded-2xl border border-surface-border shadow-lg flex items-center space-x-3 pointer-events-auto">
          <Ring
            value={liveAccuracy}
            size={50}
            strokeWidth={5}
            label={`${liveAccuracy}%`}
            variant="accent"
          />
          <div>
            <div className="text-[10px] uppercase font-semibold text-text-muted">
              Live Score
            </div>
            <div className="text-xl font-bold tabular-nums text-text-primary">
              {liveScore !== null ? `${liveScore}/100` : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Right HUD Mini Demo */}
      <div className="absolute top-28 right-4 z-20 pointer-events-auto">
        <MiniDemoPlayer pose={currentPose} jointStatuses={displayedStatuses} />
      </div>

      {/* Framing Coach Prompt when tracking is suboptimal */}
      {trackingQuality < 70 && (
        <div className="absolute top-44 left-4 right-4 z-20 flex justify-center pointer-events-none">
          <div className="bg-poor-soft border border-poor text-poor text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-md">
            {framingMsg}
          </div>
        </div>
      )}

      {/* Bottom Cue */}
      <div className="absolute bottom-6 left-4 right-4 z-20 flex justify-center pointer-events-none">
        {liveCues.length > 0 && (
          <div className="max-w-md w-full bg-surface-1/90 backdrop-blur-md p-3.5 rounded-2xl border border-surface-border shadow-xl text-center pointer-events-auto">
            <p className="text-xs md:text-sm font-medium text-text-primary">
              {liveCues[0]}
            </p>
          </div>
        )}
      </div>

      {/* Camera Error Fallback */}
      {cameraState === 'denied' || cameraState === 'error' ? (
        <div className="absolute inset-0 z-50 bg-background/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-danger-500" />
          <h2 className="text-2xl font-bold font-display">Camera Permission Required</h2>
          <p className="text-sm text-text-muted max-w-sm">
            {errorMessage || 'YogaSense requires camera access for flow tracking.'}
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
};
