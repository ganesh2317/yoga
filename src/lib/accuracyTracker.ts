/**
 * AccuracyTracker — extended with longest hold, current hold, time-in-band,
 * and pause/resume capability (§3.10).
 *
 * Accuracy% = T_correct / T_valid × 100
 * T_correct = time with score >= ACCURACY_CORRECT_THRESHOLD
 * T_valid = time with valid tracking only
 */

import { ACCURACY_CORRECT_THRESHOLD } from './scoreEngine';

export class AccuracyTracker {
  private totalTrackedMs = 0;
  private inPositionMs = 0;
  private lastTimestamp: number | null = null;
  private correctThreshold: number;

  // Longest continuous correct hold
  private currentCorrectStreak = 0;
  private longestCorrectStreak = 0;

  // Pause state
  private paused = false;

  constructor(threshold: number = ACCURACY_CORRECT_THRESHOLD) {
    this.correctThreshold = threshold;
  }

  public reset(): void {
    this.totalTrackedMs = 0;
    this.inPositionMs = 0;
    this.lastTimestamp = null;
    this.currentCorrectStreak = 0;
    this.longestCorrectStreak = 0;
    this.paused = false;
  }

  public pause(): void {
    this.paused = true;
    this.lastTimestamp = null; // Break the delta chain
  }

  public resume(): void {
    this.paused = false;
    this.lastTimestamp = null; // Next update starts fresh
  }

  /**
   * Process a single frame with alignment score, optional timestamp, and tracking validity.
   */
  public processFrame(
    alignmentScore: number | null,
    timestamp?: number,
    isTrackingValid: boolean = true
  ): void {
    this.update(alignmentScore, isTrackingValid, timestamp);
  }

  /**
   * Update with the current frame's alignment score and tracking validity.
   * score can be null (insufficient coverage) — treated as invalid tracking.
   */
  public update(
    alignmentScore: number | null,
    isTrackingValid: boolean = true,
    timestamp?: number
  ): void {
    if (this.paused) return;

    const now = timestamp !== undefined ? timestamp : performance.now();
    if (this.lastTimestamp === null) {
      this.lastTimestamp = now;
      return;
    }

    const deltaMs = now - this.lastTimestamp;
    this.lastTimestamp = now;

    // Ignore large time jumps (tab switching, pause)
    if (deltaMs <= 0 || deltaMs > 1000) {
      return;
    }

    // Invalid tracking or null score: exclude from both T_valid and T_correct
    if (!isTrackingValid || alignmentScore === null) {
      // Break the correct streak
      if (this.currentCorrectStreak > this.longestCorrectStreak) {
        this.longestCorrectStreak = this.currentCorrectStreak;
      }
      this.currentCorrectStreak = 0;
      return;
    }

    this.totalTrackedMs += deltaMs;

    if (alignmentScore >= this.correctThreshold) {
      this.inPositionMs += deltaMs;
      this.currentCorrectStreak += deltaMs;
      if (this.currentCorrectStreak > this.longestCorrectStreak) {
        this.longestCorrectStreak = this.currentCorrectStreak;
      }
    } else {
      // Break the correct streak
      if (this.currentCorrectStreak > this.longestCorrectStreak) {
        this.longestCorrectStreak = this.currentCorrectStreak;
      }
      this.currentCorrectStreak = 0;
    }
  }

  public getAccuracyPercent(): number {
    if (this.totalTrackedMs === 0) return 0;
    const ratio = (this.inPositionMs / this.totalTrackedMs) * 100;
    return Math.min(100, Math.max(0, Math.round(ratio)));
  }

  /** Longest continuous period with score >= threshold, in seconds. */
  public getLongestHoldSeconds(): number {
    const best = Math.max(this.longestCorrectStreak, this.currentCorrectStreak);
    return Math.round(best / 1000);
  }

  /** Current continuous correct hold, in seconds. */
  public getCurrentHoldSeconds(): number {
    return Math.round(this.currentCorrectStreak / 1000);
  }

  /** Time spent in each status band, in seconds. */
  public getTimeInBand(): { correct: number; incorrect: number; total: number } {
    return {
      correct: Math.round(this.inPositionMs / 1000),
      incorrect: Math.round((this.totalTrackedMs - this.inPositionMs) / 1000),
      total: Math.round(this.totalTrackedMs / 1000),
    };
  }

  public getStats(): {
    accuracyPercent: number;
    totalTrackedSeconds: number;
    inPositionSeconds: number;
    longestHoldSeconds: number;
  } {
    return {
      accuracyPercent: this.getAccuracyPercent(),
      totalTrackedSeconds: Math.round(this.totalTrackedMs / 1000),
      inPositionSeconds: Math.round(this.inPositionMs / 1000),
      longestHoldSeconds: this.getLongestHoldSeconds(),
    };
  }
}
