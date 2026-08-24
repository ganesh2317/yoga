import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CameraOff, Play, RefreshCw, Sparkles, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonOverlayCanvas } from '../components/SkeletonOverlayCanvas';
import { TopBar } from '../components/TopBar';
import { YOGA_POSES } from '../data/poses';
import { usePoseTracking } from '../hooks/usePoseTracking';
import { computeAnglesFromLandmarks } from '../lib/poseGeometry';
import { evaluatePoseFrame } from '../lib/scoreEngine';
import type { YogaPose } from '../types';

export const FreeTrackScreen: React.FC = () => {
  const navigate = useNavigate();
  const { videoRef, landmarks, fps, cameraState, setCameraState, errorMessage } = usePoseTracking();

  const [detectedPose, setDetectedPose] = useState<{ pose: YogaPose; score: number } | null>(null);
  const [matchSustainedCount, setMatchSustainedCount] = useState<number>(0);
  const [promptDismissedForPose, setPromptDismissedForPose] = useState<string | null>(null);
  const [showSessionPrompt, setShowSessionPrompt] = useState<boolean>(false);

  // Live Auto Pose Recognition Engine
  useEffect(() => {
    if (!landmarks || landmarks.length < 29) {
      setDetectedPose(null);
      setMatchSustainedCount(0);
      return;
    }

    const angles = computeAnglesFromLandmarks(landmarks);

    let bestMatch: { pose: YogaPose; score: number } | null = null;
    let highestScore = 0;

    YOGA_POSES.forEach((pose) => {
      const evaluation = evaluatePoseFrame(angles, pose);
      if (evaluation.score > highestScore) {
        highestScore = evaluation.score;
        bestMatch = { pose, score: evaluation.score };
      }
    });

    if (bestMatch && highestScore >= 68) {
      setDetectedPose(bestMatch);
      setMatchSustainedCount((prev) => prev + 1);
    } else {
      setDetectedPose(null);
      setMatchSustainedCount(0);
    }
  }, [landmarks]);

  // Show prompt if pose is sustained for ~1.5s (15 frames/ticks)
  useEffect(() => {
    if (
      detectedPose &&
      matchSustainedCount >= 12 &&
      promptDismissedForPose !== detectedPose.pose.id
    ) {
      setShowSessionPrompt(true);
    }
  }, [detectedPose, matchSustainedCount, promptDismissedForPose]);

  const handleDismissPrompt = () => {
    if (detectedPose) {
      setPromptDismissedForPose(detectedPose.pose.id);
    }
    setShowSessionPrompt(false);
  };

  const handleStartTrackedSession = () => {
    if (detectedPose) {
      navigate(`/live/${detectedPose.pose.id}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-darkest overflow-hidden flex flex-col justify-between p-4 max-w-md mx-auto z-10 pb-28">
      <TopBar title="Free Practice & Auto Detect" showBack onBack={() => navigate('/home')} />

      {/* Camera & Skeleton Viewport */}
      <div className="relative w-full h-[60vh] rounded-3xl overflow-hidden border border-white/15 bg-black/60 shadow-glass-glow flex items-center justify-center mt-2">
        {/* 
          SINGLE MIRROR CONTAINER:
          Mirrors both the video feed and skeleton canvas overlay together.
          MediaPipe outputs anatomical landmarks (left_wrist = user's actual left arm).
          DO NOT add another scaleX(-1) or flip elsewhere!
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

        {/* Top HUD: FPS & Live Mode Indicator */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/12 text-xs text-text-primary">
            <span className="w-2 h-2 rounded-full bg-accent-sage animate-pulse" />
            <span className="font-bold text-accent-mint">Auto-Detect Mode</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/12 text-[11px] text-text-tertiary">
            <span>FPS: {fps}</span>
          </div>
        </div>

        {/* Camera Denied / Fallback Message */}
        {cameraState === 'denied' && (
          <div className="absolute inset-0 z-30 p-6 flex flex-col items-center justify-center text-center bg-black/85 backdrop-blur-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <CameraOff className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text-primary">
                Camera Access Needed
              </h3>
              <p className="text-xs text-text-secondary mt-1 max-w-xs">
                {errorMessage || 'Please allow camera access in your browser settings.'}
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

      {/* Live Pose Recognition Indicator / Sustained Match Prompt */}
      <GlassCard variant="focal" className="p-5 mt-3 space-y-4">
        {detectedPose ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-accent-mint uppercase tracking-widest block">
                  Pose Recognized
                </span>
                <h3 className="font-display font-extrabold text-xl text-text-primary">
                  {detectedPose.pose.name}
                </h3>
                <p className="text-xs text-accent-emerald font-medium italic">
                  {detectedPose.pose.sanskritName}
                </p>
              </div>

              <StatusBadge status="Good" label={`${detectedPose.score}% Match`} />
            </div>

            {/* Auto-detected Prompt */}
            {showSessionPrompt && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/12 border border-emerald-500/30 space-y-3 animate-in fade-in slide-in-from-bottom duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-mint shrink-0" />
                    <span className="text-xs font-bold text-text-primary">
                      Looks like {detectedPose.pose.name}! Start a tracked session?
                    </span>
                  </div>
                  <button
                    onClick={handleDismissPrompt}
                    className="text-text-tertiary hover:text-text-primary p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton
                    onClick={handleStartTrackedSession}
                    variant="primary"
                    size="sm"
                    fullWidth
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                  >
                    Start Tracked Session
                  </GlassButton>

                  <GlassButton
                    onClick={handleDismissPrompt}
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                  >
                    Dismiss
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2 space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-text-secondary font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent-emerald" />
              Move freely — I'll recognize your pose
            </span>
            <p className="text-[11px] text-text-tertiary">
              Hold any of our 8 yoga poses for instant auto-detection
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <GlassButton
            onClick={() => navigate('/library')}
            variant="secondary"
            size="sm"
            fullWidth
            leftIcon={<BookOpen className="w-4 h-4" />}
          >
            Browse Pose Library Instead
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
