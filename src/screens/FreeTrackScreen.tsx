import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CameraOff, Play, RefreshCw, Sparkles, X, ChevronUp, ChevronDown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonOverlayCanvas } from '../components/SkeletonOverlayCanvas';
import { PoseReferenceIllustration } from '../components/PoseReferenceIllustration';
import { TopBar } from '../components/TopBar';
import { YOGA_POSES } from '../data/poses';
import { usePoseTracking } from '../hooks/usePoseTracking';
import { computeAnglesFromLandmarks } from '../lib/poseGeometry';
import { evaluatePoseFrame } from '../lib/scoreEngine';
import type { YogaPose } from '../types';

export const FreeTrackScreen: React.FC = () => {
  const navigate = useNavigate();
  const { videoRef, landmarks, fps: _, cameraState, setCameraState, errorMessage } = usePoseTracking();

  const [detectedPose, setDetectedPose] = useState<{ pose: YogaPose; score: number } | null>(null);
  const [matchSustainedCount, setMatchSustainedCount] = useState<number>(0);
  const [promptDismissedForPose, setPromptDismissedForPose] = useState<string | null>(null);
  const [showSessionPrompt, setShowSessionPrompt] = useState<boolean>(false);
  const [showGuideDrawer, setShowGuideDrawer] = useState<boolean>(false);
  const [selectedGuidePose, setSelectedGuidePose] = useState<YogaPose>(YOGA_POSES[0]);

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

  // Show prompt if pose is sustained for ~1.5s
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
    <div className="relative min-h-screen bg-[#0C0D10] overflow-hidden flex flex-col justify-between p-4 max-w-md mx-auto z-10 pb-28">
      <TopBar title="Free Practice & Auto Detect" showBack onBack={() => navigate('/home')} />

      {/* Camera & Skeleton Viewport */}
      <div className="relative w-full h-[58vh] rounded-3xl overflow-hidden border border-white/12 bg-black/70 shadow-glass-glow flex items-center justify-center mt-2">
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

          <SkeletonOverlayCanvas landmarks={landmarks} width={380} height={480} />
        </div>

        {/* Top HUD: FPS & Drawer Toggle */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/12 text-xs text-[#F4F1EC]">
            <span className="w-2 h-2 rounded-full bg-[#3F6B4F] animate-pulse" />
            <span className="font-bold text-[#6EE7B7]">Auto Detect</span>
          </div>

          <button
            onClick={() => setShowGuideDrawer(!showGuideDrawer)}
            className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-bold text-[#C9A66B] flex items-center gap-1.5 hover:bg-black/80"
          >
            <BookOpen className="w-4 h-4" />
            <span>Pose Guide</span>
            {showGuideDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

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

      {/* Horizontally Scrollable Pose Reference Drawer */}
      {showGuideDrawer && (
        <GlassCard variant="focal" className="p-4 mt-2 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#A8A29B] uppercase tracking-widest">
              Reference Pose Guide
            </span>
            <button onClick={() => setShowGuideDrawer(false)} className="text-[#A8A29B] hover:text-[#F4F1EC]">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Pose Selector Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {YOGA_POSES.map((p) => {
              const isSelected = selectedGuidePose.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedGuidePose(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#3F6B4F] text-[#F4F1EC] border border-[#6EE7B7]/40 shadow-sm'
                      : 'bg-white/5 text-[#A8A29B] hover:bg-white/10'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Selected Pose Reference Illustration & Steps */}
          <div className="flex items-start gap-3 pt-1 border-t border-white/10">
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 p-1.5 shrink-0 flex items-center justify-center">
              <PoseReferenceIllustration poseId={selectedGuidePose.id} />
            </div>

            <div className="space-y-1 min-w-0">
              <h4 className="font-serif font-bold text-sm text-[#F4F1EC] truncate">
                {selectedGuidePose.name} <span className="text-xs text-[#C9A66B] font-normal italic">({selectedGuidePose.sanskritName})</span>
              </h4>
              <p className="text-[11px] text-[#A8A29B] line-clamp-2 leading-relaxed">
                {selectedGuidePose.setupSteps[0]}
              </p>
              <button
                onClick={() => navigate(`/live/${selectedGuidePose.id}`)}
                className="text-xs font-bold text-[#C9A66B] hover:underline flex items-center gap-1 mt-1"
              >
                Practice this pose <Play className="w-3 h-3 fill-current" />
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Auto Pose Recognition Card */}
      {!showGuideDrawer && (
        <GlassCard variant="focal" className="p-5 mt-3 space-y-4">
          {detectedPose ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#6EE7B7] uppercase tracking-widest block">
                    Pose Recognized
                  </span>
                  <h3 className="font-serif font-extrabold text-xl text-[#F4F1EC]">
                    {detectedPose.pose.name}
                  </h3>
                  <p className="text-xs text-[#C9A66B] font-medium italic">
                    {detectedPose.pose.sanskritName}
                  </p>
                </div>

                <StatusBadge status="Good" label={`${detectedPose.score}% Match`} />
              </div>

              {/* Auto-detected Prompt with Reference Illustration */}
              {showSessionPrompt && (
                <div className="p-3.5 rounded-2xl bg-[#3F6B4F]/20 border border-[#3F6B4F]/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    {/* Illustration preview alongside prompt */}
                    <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center">
                      <PoseReferenceIllustration poseId={detectedPose.pose.id} />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#F4F1EC] block">
                        Looks like {detectedPose.pose.name}! Start a tracked session?
                      </span>
                      <p className="text-[11px] text-[#A8A29B]">
                        Target form is ready for scoring.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-white/10">
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#A8A29B] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
                Move freely — I'll recognize your pose
              </span>
              <p className="text-[11px] text-[#635E58]">
                Hold any of our 8 reference yoga poses to trigger auto-detection
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
      )}
    </div>
  );
};
