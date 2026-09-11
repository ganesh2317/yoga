import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Volume2, VolumeX, Square, RefreshCw, AlertCircle } from 'lucide-react';
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
import { PosePrimerOverlay } from '../components/PosePrimerOverlay';
import { MiniDemoPlayer } from '../components/MiniDemoPlayer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Ring } from '../components/ui/Ring';
import type { FrameEvaluation, JointStatus, SessionSummary } from '../types';

export const LiveDetectScreen: React.FC = () => {
  const { poseId } = useParams<{ poseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addCompletedSession } = useSessionStore();
  const { recordSession } = useJourneyStore();

  const pose = YOGA_POSES.find((p) => p.id === poseId) || YOGA_POSES[0];

  const {
    videoRef,
    landmarks,
    worldLandmarks,
    fps,
    cameraState,
    errorMessage,
  } = usePoseTracking();

  // Primer State
  const [showPrimer, setShowPrimer] = useState<boolean>(true);

  // Tracking & Engine Refs
  const accuracyTrackerRef = useRef<AccuracyTracker>(new AccuracyTracker());
  const hysteresisRef = useRef<JointHysteresisTracker>(new JointHysteresisTracker());
  const frameScoresRef = useRef<number[]>([]);
  const lastEvalRef = useRef<FrameEvaluation | null>(null);

  // Live Display States
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(0);
  const [currentHoldSeconds, setCurrentHoldSeconds] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
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

  // Timer: Runs only when primer is dismissed
  useEffect(() => {
    if (showPrimer) return;

    accuracyTrackerRef.current.reset();
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showPrimer]);

  // Frame Processing Loop
  useEffect(() => {
    if (showPrimer || !landmarks || landmarks.length < 29) {
      if (landmarks) {
        const framing = getFramingInstruction(landmarks);
        setFramingMsg(framing);
        const quality = computeTrackingQuality(landmarks, fps);
        setTrackingQuality(quality.score);
      }
      return;
    }

    const now = performance.now();

    // 1. Framing & Quality
    const framing = getFramingInstruction(landmarks);
    setFramingMsg(framing);
    const quality = computeTrackingQuality(landmarks, fps);
    setTrackingQuality(quality.score);

    // 2. Angle Computation
    const angles = worldLandmarks
      ? computeWorldAngles(worldLandmarks)
      : computeImageAngles(landmarks);

    // 3. Honest Pose Evaluation
    const evaluation = evaluatePose(angles, pose, landmarks);
    lastEvalRef.current = evaluation;

    if (evaluation.score !== null) {
      setLiveScore(evaluation.score);
      frameScoresRef.current.push(evaluation.score);
      if (frameScoresRef.current.length > 1500) frameScoresRef.current.shift();
    } else {
      setLiveScore(null);
    }

    // 4. Accuracy Tracker
    accuracyTrackerRef.current.processFrame(evaluation.score, now);
    setLiveAccuracy(Math.round(accuracyTrackerRef.current.getAccuracyPercent()));
    setCurrentHoldSeconds(Math.round(accuracyTrackerRef.current.getCurrentHoldSeconds()));

    // 5. Hysteresis on Joint Statuses
    const rawStatuses: Record<string, JointStatus> = {};
    for (const [key, jointEval] of Object.entries(evaluation.jointEvaluations)) {
      rawStatuses[key] = jointEval.status;
    }
    const smoothStatuses = hysteresisRef.current.update(rawStatuses);
    setDisplayedStatuses(smoothStatuses);

    // 6. Feedback Cues & Spoken Voice Coach
    const tips = generateFeedbackTips(evaluation.jointEvaluations, pose);
    setLiveCues(tips);

    if (!isVoiceMuted && evaluation.score !== null) {
      voiceCoach.speakFeedback(evaluation, pose);
    }
  }, [landmarks, worldLandmarks, fps, showPrimer, pose, isVoiceMuted]);

  // Handle End Practice
  const handleEndPractice = async () => {
    const totalTracked = elapsedSeconds;
    const scores = frameScoresRef.current;
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const longestHold = Math.round(accuracyTrackerRef.current.getLongestHoldSeconds());
    const finalAccuracy = Math.round(accuracyTrackerRef.current.getAccuracyPercent());
    const lastEval = lastEvalRef.current;

    const summary: SessionSummary = {
      id: `session_${Date.now()}`,
      userId: user?.id || 'guest',
      poseId: pose.id,
      poseName: pose.name,
      sanskritName: pose.sanskritName,
      timestamp: new Date().toISOString(),
      dateString: localDateKey(),
      durationSeconds: totalTracked,
      averageScore: avgScore,
      accuracyPercent: finalAccuracy,
      inPositionSeconds: longestHold,
      longestHoldSeconds: longestHold,
      totalTrackedSeconds: totalTracked,
      trackingQualityAvg: trackingQuality,
      categoryBreakdown: lastEval
        ? lastEval.categoryBreakdown
        : { overall: avgScore, shoulder: 0, hip: 0, knee: 0, torso: 0, balance: 0 },
      jointEvaluations: lastEval ? lastEval.jointEvaluations : {},
      feedbackTips: liveCues,
      caloriesBurned: Math.round((pose.estimatedCaloriesPerMin * totalTracked) / 60),
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center select-none">
      {/* 1. Pose Primer Overlay */}
      {showPrimer && (
        <PosePrimerOverlay
          pose={pose}
          framingInstruction={framingMsg}
          trackingQualityScore={trackingQuality}
          onStart={() => setShowPrimer(false)}
        />
      )}

      {/* 2. Video Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
      />

      {/* 3. Skeleton Canvas Overlay */}
      <SkeletonOverlayCanvas
        landmarks={landmarks}
        videoElement={videoRef.current}
        jointStatuses={displayedStatuses}
        isMirrored={true}
      />

      {/* 4. Top Header HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto bg-surface-1/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-surface-border shadow-lg">
          <div>
            <div className="text-xs font-bold text-primary-400">{pose.category}</div>
            <h1 className="text-base font-display font-bold text-text-primary">
              {pose.name}
            </h1>
          </div>
          <Badge variant="default">
            {formatTime(elapsedSeconds)}
          </Badge>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={toggleVoice}
            className="w-10 h-10 rounded-2xl bg-surface-1/80 backdrop-blur-md border border-surface-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shadow-lg"
            title={isVoiceMuted ? 'Unmute Audio Coach' : 'Mute Audio Coach'}
          >
            {isVoiceMuted ? (
              <VolumeX className="w-5 h-5 text-text-muted" />
            ) : (
              <Volume2 className="w-5 h-5 text-primary-400" />
            )}
          </button>

          <Button
            variant="danger"
            size="md"
            onClick={handleEndPractice}
            className="shadow-lg shadow-danger-500/20"
          >
            <Square className="w-4 h-4 fill-current mr-1.5" />
            End Practice
          </Button>
        </div>
      </div>

      {/* 5. Left Side HUD: Score & Accuracy */}
      <div className="absolute top-20 left-4 z-20 flex flex-col space-y-3 pointer-events-none">
        <div className="bg-surface-1/85 backdrop-blur-md p-3.5 rounded-2xl border border-surface-border shadow-lg flex items-center space-x-3 pointer-events-auto">
          <Ring
            value={liveAccuracy}
            size={52}
            strokeWidth={5}
            variant="auto"
          >
            <span className="text-xs font-bold tabular-nums">{liveAccuracy}%</span>
          </Ring>
          <div>
            <div className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
              Alignment
            </div>
            <div className="text-xl font-bold tabular-nums text-text-primary">
              {liveScore !== null ? `${liveScore}/100` : '--'}
            </div>
          </div>
        </div>

        {currentHoldSeconds > 0 && (
          <div className="bg-surface-1/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-primary-500/40 shadow-lg flex items-center space-x-2 pointer-events-auto animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping" />
            <span className="text-xs font-semibold text-text-primary">
              Hold: <strong className="text-primary-400 font-bold tabular-nums">{currentHoldSeconds}s</strong>
            </span>
          </div>
        )}
      </div>

      {/* 6. Right Side HUD: Mini Demo Player */}
      <div className="absolute top-20 right-4 z-20 pointer-events-auto">
        <MiniDemoPlayer pose={pose} jointStatuses={displayedStatuses} />
      </div>

      {/* 7. Bottom Corrective Cue Banner */}
      <div className="absolute bottom-6 left-4 right-4 z-20 flex flex-col items-center pointer-events-none">
        {framingMsg && framingMsg !== 'Good framing' && (
          <div className="mb-2 bg-surface-1/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-warning-500/40 text-xs font-semibold text-warning-400 shadow-lg pointer-events-auto animate-bounce">
            {framingMsg}
          </div>
        )}

        {liveCues.length > 0 && (
          <div className="max-w-md w-full bg-surface-1/90 backdrop-blur-md p-3.5 rounded-2xl border border-surface-border shadow-xl text-center pointer-events-auto animate-in slide-in-from-bottom duration-200">
            <p className="text-xs md:text-sm font-medium text-text-primary">
              {liveCues[0]}
            </p>
          </div>
        )}
      </div>

      {/* 8. Camera Error Fallback */}
      {cameraState === 'denied' || cameraState === 'error' ? (
        <div className="absolute inset-0 z-50 bg-background/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-danger-500" />
          <h2 className="text-2xl font-bold font-display">Camera Permission Required</h2>
          <p className="text-sm text-text-muted max-w-sm">
            {errorMessage || 'YogaSense requires webcam access to analyze posture.'}
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Access
          </Button>
        </div>
      ) : null}
    </div>
  );
};
