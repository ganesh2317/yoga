import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, AlertCircle, RefreshCw, X } from 'lucide-react';
import { YOGA_POSES } from '../data/poses';
import { usePoseTracking } from '../hooks/usePoseTracking';
import { computeWorldAngles, computeImageAngles } from '../lib/poseGeometry';
import { PoseMatcher } from '../lib/poseMatcher';
import { SkeletonOverlayCanvas } from '../components/SkeletonOverlayCanvas';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Surface } from '../components/ui/Surface';
import { Ring } from '../components/ui/Ring';
import type { YogaPose } from '../types';

export const FreeTrackScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    videoRef,
    landmarks,
    worldLandmarks,
    cameraState,
    errorMessage,
  } = usePoseTracking();

  const poseMatcherRef = useRef<PoseMatcher>(new PoseMatcher());
  const [matchedPose, setMatchedPose] = useState<{
    pose: YogaPose;
    score: number;
    margin: number;
  } | null>(null);

  useEffect(() => {
    if (!landmarks || landmarks.length < 29) {
      setMatchedPose(null);
      return;
    }

    const angles = worldLandmarks
      ? computeWorldAngles(worldLandmarks)
      : computeImageAngles(landmarks);

    const match = poseMatcherRef.current.match(angles, YOGA_POSES);

    if (match.matched && match.pose) {
      setMatchedPose({
        pose: match.pose,
        score: Math.round(match.score),
        margin: Math.round(match.confidence),
      });
    } else {
      setMatchedPose(null);
    }
  }, [landmarks, worldLandmarks]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Video Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
      />

      {/* Skeleton Overlay */}
      <SkeletonOverlayCanvas
        landmarks={landmarks}
        videoElement={videoRef.current}
        isMirrored={true}
      />

      {/* Header HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-surface-1/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-surface-border shadow-lg pointer-events-auto">
          <Badge variant="accent" size="sm">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Free Practice Mode
          </Badge>
          <div className="text-xs text-text-muted mt-0.5">
            Move into any posture for automatic detection
          </div>
        </div>

        <Button
          variant="secondary"
          size="md"
          className="pointer-events-auto shadow-lg"
          onClick={() => navigate('/')}
        >
          <X className="w-4 h-4 mr-1.5" /> Exit
        </Button>
      </div>

      {/* Live Pose Detection Card (Floats when a pose is locked) */}
      {matchedPose && (
        <div className="absolute bottom-10 left-4 right-4 z-20 flex justify-center pointer-events-none">
          <Surface
            variant="raised"
            className="max-w-md w-full p-5 bg-surface-1/90 backdrop-blur-xl border-primary-500/40 shadow-2xl flex items-center justify-between pointer-events-auto animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-center space-x-4">
              <Ring
                value={matchedPose.score}
                size={56}
                strokeWidth={5}
                label={`${matchedPose.score}`}
                variant="good"
              />
              <div>
                <div className="text-xs font-semibold text-primary-400 uppercase tracking-wide">
                  Pose Detected
                </div>
                <h3 className="text-lg font-display font-bold text-text-primary">
                  {matchedPose.pose.name}
                </h3>
                <p className="text-xs text-text-muted italic">
                  {matchedPose.pose.sanskritName}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/live/${matchedPose.pose.id}`)}
            >
              <Play className="w-4 h-4 mr-1.5 fill-current" /> Start Session
            </Button>
          </Surface>
        </div>
      )}

      {/* Camera Error Fallback */}
      {cameraState === 'denied' || cameraState === 'error' ? (
        <div className="absolute inset-0 z-50 bg-background/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-danger-500" />
          <h2 className="text-2xl font-bold font-display">Camera Access Required</h2>
          <p className="text-sm text-text-muted max-w-sm">
            {errorMessage || 'Webcam access is needed for real-time tracking.'}
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
};
