import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CameraOff, Play, RefreshCw, Sparkles, X, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
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
  const { videoRef, landmarks, fps: _, cameraState, setCameraState, errorMessage, isFullBodyVisible } = usePoseTracking();

  const [detectedPose, setDetectedPose] = useState<{ pose: YogaPose; score: number } | null>(null);
  const [matchSustainedCount, setMatchSustainedCount] = useState<number>(0);
  const [promptDismissedForPose, setPromptDismissedForPose] = useState<string | null>(null);
  const [showSessionPrompt, setShowSessionPrompt] = useState<boolean>(false);
  const [showGuideDrawer, setShowGuideDrawer] = useState<boolean>(false);
  const [selectedGuidePose, setSelectedGuidePose] = useState<YogaPose>(YOGA_POSES[0]);

  // Rolling Hysteresis Window (last 12 evaluations) to stabilize auto-detection without flicker
  const rollingWindowRef = useRef<{ poseId: string; score: number }[]>([]);

  // Live Auto Pose Recognition Engine with Hysteresis
  useEffect(() => {
    if (!landmarks || landmarks.length < 29) {
      setDetectedPose(null);
      setMatchSustainedCount(0);
      rollingWindowRef.current = [];
      return;
    }

    const angles = computeAnglesFromLandmarks(landmarks);

    let currentBestMatch: { pose: YogaPose; score: number } | null = null;
    let highestScore = 0;

    YOGA_POSES.forEach((pose) => {
      const evaluation = evaluatePoseFrame(angles, pose);
      if (evaluation.score > highestScore) {
        highestScore = evaluation.score;
        currentBestMatch = { pose, score: evaluation.score };
      }
    });

    const activeMatch = currentBestMatch as { pose: YogaPose; score: number } | null;

    if (activeMatch && highestScore >= 68) {
      const targetPose: YogaPose = activeMatch.pose;
      // Append to rolling window (max 12 entries)
      rollingWindowRef.current.push({ poseId: targetPose.id, score: highestScore });
      if (rollingWindowRef.current.length > 12) {
        rollingWindowRef.current.shift();
      }

      // Hysteresis check: check if same pose dominates rolling window
      const poseCounts: Record<string, { count: number; totalScore: number }> = {};
      rollingWindowRef.current.forEach((entry) => {
        if (!poseCounts[entry.poseId]) {
          poseCounts[entry.poseId] = { count: 0, totalScore: 0 };
        }
        poseCounts[entry.poseId].count += 1;
        poseCounts[entry.poseId].totalScore += entry.score;
      });

      let dominantPoseId = '';
      let maxCount = 0;
      let avgScore = 0;

      Object.entries(poseCounts).forEach(([pId, data]) => {
        if (data.count > maxCount) {
          maxCount = data.count;
          dominantPoseId = pId;
          avgScore = Math.round(data.totalScore / data.count);
        }
      });

      // Require pose to be present in >= 60% of rolling window entries to stabilize detection
      if (maxCount >= Math.min(6, rollingWindowRef.current.length * 0.55)) {
        const matchedPose = YOGA_POSES.find((p) => p.id === dominantPoseId) || targetPose;
        setDetectedPose({ pose: matchedPose, score: avgScore });
        setMatchSustainedCount((prev) => prev + 1);
      }
    } else {
      setDetectedPose(null);
      setMatchSustainedCount(0);
      rollingWindowRef.current = [];
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
    <div className="relative min-h-screen bg-[#0A0E14] overflow-hidden flex flex-col justify-between p-4 max-w-md mx-auto z-10 pb-28">
      <TopBar title="Free Practice & Auto Detect" showBack onBack={() => navigate('/home')} />

      {/* Camera & Skeleton Viewport */}
      <div className="relative w-full h-[58vh] rounded-3xl overflow-hidden border border-white/12 bg-black/70 shadow-glass-glow flex items-center justify-center mt-2">
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

          <SkeletonOverlayCanvas landmarks={landmarks} width={380} height={480} />
        </div>

        {/* Top HUD: Mode & Drawer Toggle */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/12 text-xs text-[#F5F7FA]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="font-bold text-[#34D399]">Auto Detect</span>
          </div>

          <button
            onClick={() => setShowGuideDrawer(!showGuideDrawer)}
            className="px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-xs font-bold text-[#F59E0B] flex items-center gap-1.5 hover:bg-black/85 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Pose Guide</span>
            {showGuideDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Full-Body-in-Frame Guard Warning Badge */}
        {!isFullBodyVisible && cameraState === 'active' && (
          <div className="absolute bottom-4 left-4 right-4 z-20 px-3.5 py-2 rounded-2xl bg-[#F59E0B]/20 border border-[#F59E0B]/50 backdrop-blur-md text-center flex items-center justify-center gap-2 text-xs text-[#FBBF24] font-bold animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span>Step back so your full body is visible</span>
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
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">
              Reference Pose Guide (20 Poses)
            </span>
            <button onClick={() => setShowGuideDrawer(false)} className="text-[#94A3B8] hover:text-[#F5F7FA]">
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
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#22C55E] to-[#34D399] text-[#0A0E14] shadow-sm'
                      : 'bg-white/5 text-[#94A3B8] hover:bg-white/10'
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
              <PoseReferenceIllustration poseId={selectedGuidePose.id} strokeColor="#FBBF24" />
            </div>

            <div className="space-y-1 min-w-0">
              <h4 className="font-display font-bold text-sm text-[#F5F7FA] truncate">
                {selectedGuidePose.name} <span className="text-xs text-[#F59E0B] font-normal italic">({selectedGuidePose.sanskritName})</span>
              </h4>
              <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                {selectedGuidePose.setupSteps[0]}
              </p>
              <button
                onClick={() => navigate(`/live/${selectedGuidePose.id}`)}
                className="text-xs font-bold text-[#F59E0B] hover:underline flex items-center gap-1 mt-1"
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
                  <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-widest block">
                    Pose Recognized
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-[#F5F7FA]">
                    {detectedPose.pose.name}
                  </h3>
                  <p className="text-xs text-[#F59E0B] font-medium italic">
                    {detectedPose.pose.sanskritName}
                  </p>
                </div>

                <StatusBadge status="Good" label={`${detectedPose.score}% Match`} />
              </div>

              {/* Auto-detected Prompt with Reference Illustration */}
              {showSessionPrompt && (
                <div className="p-3.5 rounded-2xl glass-amber-modal space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center">
                      <PoseReferenceIllustration poseId={detectedPose.pose.id} strokeColor="#FBBF24" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#F5F7FA] block">
                        Looks like {detectedPose.pose.name}! Start a tracked session?
                      </span>
                      <p className="text-[11px] text-[#94A3B8]">
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
                      className="shrink-0 text-xs text-[#94A3B8]"
                    >
                      Dismiss
                    </GlassButton>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2 space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#94A3B8] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                Move freely — I'll recognize your pose
              </span>
              <p className="text-[11px] text-[#64748B]">
                Hold any of our 20 reference yoga poses to trigger auto-detection
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
