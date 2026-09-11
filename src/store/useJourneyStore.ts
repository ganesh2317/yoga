import { create } from 'zustand';
import type { SessionSummary } from '../types';
import { JOURNEY_LEVELS } from '../data/journey';
import {
  calculateLevelProgress,
  calculateJourneyPercent,
  isPoseUnlocked as checkPoseUnlocked,
  type LevelProgressDetail,
  type PoseStatRecord,
} from '../lib/journeyEngine';
import {
  getJourneyRecord,
  saveJourneyRecord,
  type JourneyRecord,
} from '../services/db';
import { localDateKey } from '../lib/localDate';

interface JourneyState {
  userId: string | null;
  currentLevel: number;
  completedLevelNumbers: number[];
  poseStats: Record<string, PoseStatRecord>;
  isLoading: boolean;
  activeLevelDetail: LevelProgressDetail | null;
  journeyPercent: number;

  loadJourney: (userId: string) => Promise<void>;
  recordSession: (summary: SessionSummary) => Promise<{ levelUp: boolean; newLevel?: number }>;
  isPoseUnlocked: (poseId: string) => boolean;
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  userId: null,
  currentLevel: 1,
  completedLevelNumbers: [],
  poseStats: {},
  isLoading: false,
  activeLevelDetail: null,
  journeyPercent: 0,

  loadJourney: async (userId: string) => {
    set({ isLoading: true, userId });
    try {
      const record = await getJourneyRecord(userId);
      const currentLvlConfig =
        JOURNEY_LEVELS.find((l) => l.level === record.currentLevel) || JOURNEY_LEVELS[0];

      const activeDetail = calculateLevelProgress(currentLvlConfig, record.poseStats);
      const percent = calculateJourneyPercent(record.currentLevel, activeDetail.levelProgress);

      set({
        currentLevel: record.currentLevel,
        completedLevelNumbers: record.completedLevelNumbers,
        poseStats: record.poseStats,
        activeLevelDetail: activeDetail,
        journeyPercent: percent,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load journey:', err);
      set({ isLoading: false });
    }
  },

  recordSession: async (summary: SessionSummary) => {
    const { userId, currentLevel, completedLevelNumbers, poseStats } = get();
    if (!userId) return { levelUp: false };

    const poseId = summary.poseId;
    const existing = poseStats[poseId] || {
      sessionsCount: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestHoldSeconds: 0,
      lastPracticedDate: '',
    };

    const updatedStat: PoseStatRecord = {
      sessionsCount: existing.sessionsCount + 1,
      bestScore: Math.max(existing.bestScore, summary.averageScore || 0),
      bestAccuracy: Math.max(
        existing.bestAccuracy,
        summary.accuracyPercent ?? summary.averageScore ?? 0
      ),
      bestHoldSeconds: Math.max(
        existing.bestHoldSeconds,
        summary.longestHoldSeconds ?? summary.inPositionSeconds ?? summary.durationSeconds ?? 0
      ),
      lastPracticedDate: summary.dateString || localDateKey(new Date(summary.timestamp)),
    };

    const newPoseStats = {
      ...poseStats,
      [poseId]: updatedStat,
    };

    let newCurrentLevel = currentLevel;
    const newCompleted = [...completedLevelNumbers];
    let levelUp = false;

    // Check if current level is newly completed
    const currentLvlConfig =
      JOURNEY_LEVELS.find((l) => l.level === newCurrentLevel) || JOURNEY_LEVELS[0];
    const updatedLevelDetail = calculateLevelProgress(currentLvlConfig, newPoseStats);

    if (updatedLevelDetail.isComplete && newCurrentLevel < JOURNEY_LEVELS.length) {
      if (!newCompleted.includes(newCurrentLevel)) {
        newCompleted.push(newCurrentLevel);
      }
      newCurrentLevel += 1;
      levelUp = true;
    }

    const nextLvlConfig =
      JOURNEY_LEVELS.find((l) => l.level === newCurrentLevel) || JOURNEY_LEVELS[0];
    const finalDetail = calculateLevelProgress(nextLvlConfig, newPoseStats);
    const finalPercent = calculateJourneyPercent(newCurrentLevel, finalDetail.levelProgress);

    const record: JourneyRecord = {
      userId,
      currentLevel: newCurrentLevel,
      completedLevelNumbers: newCompleted,
      poseStats: newPoseStats,
      updatedAt: new Date().toISOString(),
    };

    await saveJourneyRecord(record);

    set({
      currentLevel: newCurrentLevel,
      completedLevelNumbers: newCompleted,
      poseStats: newPoseStats,
      activeLevelDetail: finalDetail,
      journeyPercent: finalPercent,
    });

    return { levelUp, newLevel: levelUp ? newCurrentLevel : undefined };
  },

  isPoseUnlocked: (poseId: string) => {
    return checkPoseUnlocked(poseId, get().currentLevel);
  },
}));
