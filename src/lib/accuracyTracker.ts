import { ACCURACY_CORRECT_THRESHOLD } from './scoreEngine';

export class AccuracyTracker {
  private totalTrackedMs: number = 0;
  private inPositionMs: number = 0;
  private lastTimestamp: number | null = null;
  private correctThreshold: number;

  constructor(threshold: number = ACCURACY_CORRECT_THRESHOLD) {
    this.correctThreshold = threshold;
  }

  public reset(): void {
    this.totalTrackedMs = 0;
    this.inPositionMs = 0;
    this.lastTimestamp = null;
  }

  public update(alignmentScore: number, isTrackingValid: boolean): void {
    const now = performance.now();
    if (this.lastTimestamp === null) {
      this.lastTimestamp = now;
      return;
    }

    const deltaMs = now - this.lastTimestamp;
    this.lastTimestamp = now;

    // Ignore large time jumps (e.g., tab switching or pause)
    if (deltaMs <= 0 || deltaMs > 1000) {
      return;
    }

    // Exclude invalid/occluded tracking moments from both numerator and denominator entirely
    if (!isTrackingValid) {
      return;
    }

    this.totalTrackedMs += deltaMs;
    if (alignmentScore >= this.correctThreshold) {
      this.inPositionMs += deltaMs;
    }
  }

  public getAccuracyPercent(): number {
    if (this.totalTrackedMs === 0) return 0;
    const ratio = (this.inPositionMs / this.totalTrackedMs) * 100;
    return Math.min(100, Math.max(0, Math.round(ratio)));
  }

  public getStats(): {
    accuracyPercent: number;
    totalTrackedSeconds: number;
    inPositionSeconds: number;
  } {
    const accuracyPercent = this.getAccuracyPercent();
    const totalTrackedSeconds = Math.round(this.totalTrackedMs / 1000);
    const inPositionSeconds = Math.round(this.inPositionMs / 1000);
    return {
      accuracyPercent,
      totalTrackedSeconds,
      inPositionSeconds,
    };
  }
}
