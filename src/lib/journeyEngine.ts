import { JOURNEY_LEVELS, type JourneyLevel } from '../data/journey';

export interface PoseStatRecord {
  sessionsCount: number;
  bestScore: number;
  bestAccuracy: number;
  bestHoldSeconds: number;
  lastPracticedDate: string;
}

export interface PoseProgressDetail {
  poseId: string;
  accuracyProgress: number; // 0 to 1
  holdProgress: number;     // 0 to 1
  sessionsProgress: number; // 0 to 1
  combinedProgress: number; // 0 to 1
  isComplete: boolean;
  currentAccuracy: number;
  targetAccuracy: number;
  currentHold: number;
  targetHold: number;
  currentSessions: number;
  targetSessions: number;
}

export interface LevelProgressDetail {
  levelNumber: number;
  level: JourneyLevel;
  poseDetails: PoseProgressDetail[];
  levelProgress: number; // 0 to 1
  isComplete: boolean;
}

export function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

/**
 * Calculates progress for a single pose in a given level (0.0 to 1.0).
 * Formula: 40% accuracy, 40% hold duration, 20% practice count.
 */
export function calculatePoseProgress(
  poseId: string,
  level: JourneyLevel,
  stats?: PoseStatRecord
): PoseProgressDetail {
  const currentAccuracy = stats?.bestAccuracy ?? 0;
  const currentHold = stats?.bestHoldSeconds ?? 0;
  const currentSessions = stats?.sessionsCount ?? 0;

  const targetAccuracy = level.requiredAccuracy;
  const targetHold = level.requiredHoldSeconds;
  const targetSessions = level.requiredSessionsPerPose;

  const accuracyProgress = clamp01(currentAccuracy / targetAccuracy);
  const holdProgress = clamp01(currentHold / targetHold);
  const sessionsProgress = clamp01(currentSessions / targetSessions);

  const combinedProgress = clamp01(
    accuracyProgress * 0.4 + holdProgress * 0.4 + sessionsProgress * 0.2
  );

  const isComplete =
    currentAccuracy >= targetAccuracy &&
    currentHold >= targetHold &&
    currentSessions >= targetSessions;

  return {
    poseId,
    accuracyProgress,
    holdProgress,
    sessionsProgress,
    combinedProgress,
    isComplete,
    currentAccuracy,
    targetAccuracy,
    currentHold,
    targetHold,
    currentSessions,
    targetSessions,
  };
}

/**
 * Calculates progress for a level across all its required target poses.
 */
export function calculateLevelProgress(
  level: JourneyLevel,
  poseStats: Record<string, PoseStatRecord>
): LevelProgressDetail {
  const poseDetails = level.targetPoseIds.map((poseId) =>
    calculatePoseProgress(poseId, level, poseStats[poseId])
  );

  const totalProgress = poseDetails.reduce((sum, p) => sum + p.combinedProgress, 0);
  const levelProgress = poseDetails.length > 0 ? clamp01(totalProgress / poseDetails.length) : 0;
  const isComplete = poseDetails.every((p) => p.isComplete);

  return {
    levelNumber: level.level,
    level,
    poseDetails,
    levelProgress,
    isComplete,
  };
}

/**
 * Calculates total overall journey completion percentage (0 to 100).
 */
export function calculateJourneyPercent(
  currentLevel: number,
  currentLevelProgress: number
): number {
  const totalLevels = JOURNEY_LEVELS.length;
  if (totalLevels === 0) return 0;

  const completedLevelCount = Math.max(0, currentLevel - 1);
  const rawPercent = ((completedLevelCount + currentLevelProgress) / totalLevels) * 100;
  return Math.min(100, Math.round(rawPercent * 10) / 10);
}

/**
 * Checks whether a given pose is unlocked for the user's current level.
 * Any pose belonging to level <= currentLevel is unlocked.
 */
export function isPoseUnlocked(poseId: string, currentLevel: number): boolean {
  for (const lvl of JOURNEY_LEVELS) {
    if (lvl.targetPoseIds.includes(poseId)) {
      return lvl.level <= currentLevel;
    }
  }
  // Poses not listed in journey are unlocked by default
  return true;
}

/**
 * Generates an actionable helper string for what the user needs next.
 */
export function getNextRequirementText(
  level: JourneyLevel,
  poseStats: Record<string, PoseStatRecord>
): string {
  for (const poseId of level.targetPoseIds) {
    const detail = calculatePoseProgress(poseId, level, poseStats[poseId]);
    if (!detail.isComplete) {
      if (detail.currentAccuracy < detail.targetAccuracy) {
        return `Achieve ${detail.targetAccuracy}% accuracy in ${poseId} (best: ${Math.round(detail.currentAccuracy)}%)`;
      }
      if (detail.currentHold < detail.targetHold) {
        return `Hold ${poseId} for ${detail.targetHold}s (best: ${Math.round(detail.currentHold)}s)`;
      }
      if (detail.currentSessions < detail.targetSessions) {
        return `Practise ${poseId} ${detail.targetSessions - detail.currentSessions} more time(s)`;
      }
    }
  }
  return 'Level completed! Ready to advance.';
}
