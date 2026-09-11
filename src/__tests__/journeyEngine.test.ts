import { describe, it, expect } from 'vitest';
import {
  calculatePoseProgress,
  calculateLevelProgress,
  calculateJourneyPercent,
  isPoseUnlocked,
  clamp01,
} from '../lib/journeyEngine';
import { JOURNEY_LEVELS } from '../data/journey';

describe('journeyEngine', () => {
  const level1 = JOURNEY_LEVELS[0];

  it('clamp01 bounds values properly', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(0.75)).toBe(0.75);
  });

  it('calculatePoseProgress calculates correct 40-40-20 weighted score', () => {
    // requiredAccuracy = 70, requiredHold = 10, requiredSessions = 1
    const stats = {
      bestAccuracy: 70, // 100% * 0.4 = 0.4
      bestHoldSeconds: 5, // 50% * 0.4 = 0.2
      sessionsCount: 1, // 100% * 0.2 = 0.2
      bestScore: 80,
      lastPracticedDate: '2026-09-11',
    };

    const progress = calculatePoseProgress('tadasana', level1, stats);
    expect(progress.combinedProgress).toBeCloseTo(0.8);
    expect(progress.isComplete).toBe(false); // hold is not complete
  });

  it('calculatePoseProgress marks complete when all targets met', () => {
    const stats = {
      bestAccuracy: 75,
      bestHoldSeconds: 12,
      sessionsCount: 2,
      bestScore: 85,
      lastPracticedDate: '2026-09-11',
    };

    const progress = calculatePoseProgress('tadasana', level1, stats);
    expect(progress.combinedProgress).toBe(1.0);
    expect(progress.isComplete).toBe(true);
  });

  it('calculateLevelProgress averages all target poses in level', () => {
    const poseStats = {
      tadasana: { bestAccuracy: 70, bestHoldSeconds: 10, sessionsCount: 1, bestScore: 70, lastPracticedDate: '' },
      balasana: { bestAccuracy: 70, bestHoldSeconds: 10, sessionsCount: 1, bestScore: 70, lastPracticedDate: '' },
      marjaryasana_bitilasana: { bestAccuracy: 70, bestHoldSeconds: 10, sessionsCount: 1, bestScore: 70, lastPracticedDate: '' },
    };

    const result = calculateLevelProgress(level1, poseStats);
    expect(result.levelProgress).toBe(1.0);
    expect(result.isComplete).toBe(true);
  });

  it('calculateJourneyPercent correctly aggregates completed levels and active progress', () => {
    // Level 1 at 50% = (0 + 0.5) / 10 * 100 = 5%
    expect(calculateJourneyPercent(1, 0.5)).toBe(5);
    // Level 3 at 0% = (2 + 0) / 10 * 100 = 20%
    expect(calculateJourneyPercent(3, 0)).toBe(20);
    // Level 10 at 100% = (9 + 1) / 10 * 100 = 100%
    expect(calculateJourneyPercent(10, 1.0)).toBe(100);
  });

  it('isPoseUnlocked verifies level prerequisites', () => {
    // Tadasana is Level 1 -> always unlocked
    expect(isPoseUnlocked('tadasana', 1)).toBe(true);
    // Virabhadrasana II is Level 2 -> locked at Level 1, unlocked at Level 2
    expect(isPoseUnlocked('virabhadrasana2', 1)).toBe(false);
    expect(isPoseUnlocked('virabhadrasana2', 2)).toBe(true);
  });
});
