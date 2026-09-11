import React, { useState, useEffect } from 'react';
import type { YogaPose } from '../types';
import { AsanaAnimation } from './AsanaAnimation';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Surface } from './ui/Surface';
import { Meter } from './ui/Meter';

interface PosePrimerOverlayProps {
  pose: YogaPose;
  onStart: () => void;
  framingInstruction?: string;
  trackingQualityScore?: number;
  onDontShowAgain?: (hide: boolean) => void;
}

export const PosePrimerOverlay: React.FC<PosePrimerOverlayProps> = ({
  pose,
  onStart,
  framingInstruction = 'Position your full body in the camera frame',
  trackingQualityScore = 80,
  onDontShowAgain,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dontShow, setDontShow] = useState<boolean>(false);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onStart();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onStart]);

  const handleStartCountdown = () => {
    setCountdown(3);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setDontShow(val);
    if (onDontShowAgain) {
      onDontShowAgain(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-lg flex flex-col items-center space-y-5 animate-in fade-in zoom-in duration-300">
        {/* Header Badges */}
        <div className="flex items-center space-x-2">
          <Badge variant="accent">{pose.category}</Badge>
          <Badge variant="default">{pose.difficulty}</Badge>
        </div>

        {/* Pose Title & Sanskrit */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-text-primary">
            {pose.name}
          </h2>
          <p className="text-sm font-medium text-text-muted italic mt-0.5">
            {pose.sanskritName}
          </p>
        </div>

        {/* Looping Articulated Pose Animation */}
        <div className="relative">
          <AsanaAnimation poseId={pose.id} size={220} speed={1.0} showStepLabel={true} />
          {countdown !== null && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center animate-in zoom-in duration-200">
              <span className="text-6xl font-display font-bold text-primary-500 animate-pulse">
                {countdown === 0 ? 'GO!' : countdown}
              </span>
              <p className="text-xs text-text-muted mt-2">Get into starting position...</p>
            </div>
          )}
        </div>

        {/* Framing & Tracking Quality Status */}
        <Surface variant="outline" className="w-full p-3 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Camera Framing:</span>
            <span className="font-medium text-primary-400">{framingInstruction}</span>
          </div>
          <Meter
            value={trackingQualityScore}
            max={100}
            label="Tracking Quality"
            variant={
              trackingQualityScore >= 75
                ? 'good'
                : trackingQualityScore >= 50
                ? 'slight'
                : 'poor'
            }
          />
        </Surface>

        {/* Key Setup Steps Checklist */}
        <div className="w-full space-y-1.5 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Setup Form & Cues
          </p>
          <div className="space-y-1">
            {pose.setupSteps.slice(0, 3).map((step, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 text-xs text-text-secondary bg-surface-1/60 p-2 rounded-lg border border-surface-border/50"
              >
                <span className="w-4 h-4 rounded-full bg-primary-500/20 text-primary-400 font-semibold flex items-center justify-center flex-shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions & Checkbox */}
        <div className="w-full flex flex-col items-center space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full shadow-lg shadow-primary-500/25"
            onClick={countdown === null ? handleStartCountdown : onStart}
          >
            {countdown === null ? 'Begin 3-2-1 Countdown' : 'Start Immediately'}
          </Button>

          <label className="flex items-center space-x-2 text-xs text-text-muted cursor-pointer select-none hover:text-text-secondary transition-colors">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={handleCheckboxChange}
              className="rounded border-surface-border bg-surface-2 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
            />
            <span>Skip demo preview for future sessions</span>
          </label>
        </div>
      </div>
    </div>
  );
};
