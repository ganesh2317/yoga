import { describe, it, expect } from 'vitest';
import { AccuracyTracker } from '../lib/accuracyTracker';

describe('AccuracyTracker', () => {
  it('tracks accuracy percentage based on time in band', () => {
    const tracker = new AccuracyTracker(75);
    const start = 1000;

    // 1 second of score 90 (in band >= 75)
    tracker.processFrame(90, start);
    tracker.processFrame(90, start + 1000);

    // 1 second of score 50 (out of band < 75)
    tracker.processFrame(50, start + 2000);

    expect(tracker.getAccuracyPercent()).toBeCloseTo(50, 0);
  });

  it('tracks longest and current continuous hold times', () => {
    const tracker = new AccuracyTracker(70);
    const start = 0;

    // 2s in band (sent at 1s intervals)
    tracker.processFrame(80, start);
    tracker.processFrame(80, start + 1000);
    tracker.processFrame(80, start + 2000);
    expect(tracker.getCurrentHoldSeconds()).toBe(2);

    // Drop out of band at 2.5s
    tracker.processFrame(40, start + 2500);
    expect(tracker.getCurrentHoldSeconds()).toBe(0);
    expect(tracker.getLongestHoldSeconds()).toBe(2);

    // Reset and 4s continuous in band
    tracker.reset();
    tracker.processFrame(85, 10000);
    tracker.processFrame(85, 11000);
    tracker.processFrame(85, 12000);
    tracker.processFrame(85, 13000);
    tracker.processFrame(85, 14000);
    expect(tracker.getLongestHoldSeconds()).toBe(4);
    expect(tracker.getCurrentHoldSeconds()).toBe(4);
  });

  it('ignores frames with delta > 1000ms to handle tab switching/throttling', () => {
    const tracker = new AccuracyTracker(70);
    tracker.processFrame(80, 0);
    // User switches tabs for 10 seconds
    tracker.processFrame(80, 10000);

    // Delta of 10s should be discarded, not counted as 10s of hold
    expect(tracker.getCurrentHoldSeconds()).toBe(0);
  });
});
