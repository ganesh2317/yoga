import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { SessionSummary, UserProfile, UserStreak } from '../types';
import { localDateKey } from '../lib/localDate';
import { JOURNEY_LEVELS } from '../data/journey';
import { calculateLevelProgress, type PoseStatRecord } from '../lib/journeyEngine';

export interface JourneyRecord {
  userId: string;
  currentLevel: number;
  completedLevelNumbers: number[];
  poseStats: Record<string, PoseStatRecord>;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  dailyGoalMinutes: number;
  audioFeedbackEnabled: boolean;
  theme?: 'dark' | 'light' | 'system';
  hidePosePrimer?: boolean;
  updatedAt: string;
}

interface YogaSenseDB extends DBSchema {
  users: {
    key: string;
    value: UserProfile & { passwordHash: string };
    indexes: { 'by-email': string };
  };
  sessions: {
    key: string;
    value: SessionSummary;
    indexes: { 'by-user': string; 'by-date': string };
  };
  user_settings: {
    key: string;
    value: UserSettings;
  };
  journey: {
    key: string;
    value: JourneyRecord;
  };
}

export interface DBState {
  isBlocked: boolean;
  isVersionChange: boolean;
  message: string | null;
}

type DBStateListener = (state: DBState) => void;
const dbListeners = new Set<DBStateListener>();
let currentDBState: DBState = {
  isBlocked: false,
  isVersionChange: false,
  message: null,
};

export function subscribeDBState(listener: DBStateListener): () => void {
  dbListeners.add(listener);
  listener(currentDBState);
  return () => dbListeners.delete(listener);
}

export function getLatestDBState(): DBState {
  return currentDBState;
}

function updateDBState(partial: Partial<DBState>) {
  currentDBState = { ...currentDBState, ...partial };
  dbListeners.forEach((l) => {
    try {
      l(currentDBState);
    } catch (e) {
      console.error('Error in DB state listener:', e);
    }
  });
}

const DB_NAME = 'yogasense_db';
const DB_VERSION = 2;
const DB_OPEN_TIMEOUT_MS = 8000;
const DB_CHANNEL_NAME = 'yogasense_db_sync';

// Multi-Tab Coordination via BroadcastChannel
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    syncChannel = new BroadcastChannel(DB_CHANNEL_NAME);
    syncChannel.onmessage = (event) => {
      const data = event.data;
      if (data?.type === 'REQUEST_CLOSE_FOR_UPGRADE') {
        console.log(`[DB Sync] Received close request from another tab upgrading to v${data.targetVersion}`);
        closeDB();
      } else if (data?.type === 'UPGRADE_COMPLETE') {
        console.log(`[DB Sync] Database upgrade to v${data.version} completed in another tab`);
        closeDB();
      }
    };
  } catch (err) {
    console.warn('[DB Sync] BroadcastChannel initialization warning:', err);
  }
}

function broadcastUpgradeRequest(targetVersion: number) {
  try {
    syncChannel?.postMessage({ type: 'REQUEST_CLOSE_FOR_UPGRADE', targetVersion });
  } catch (_) {}
}

function broadcastUpgradeComplete(version: number) {
  try {
    syncChannel?.postMessage({ type: 'UPGRADE_COMPLETE', version });
  } catch (_) {}
}

let cachedDB: IDBPDatabase<YogaSenseDB> | null = null;
let inFlightOpenPromise: Promise<IDBPDatabase<YogaSenseDB>> | null = null;

export function closeDB(): void {
  if (cachedDB) {
    try {
      cachedDB.close();
    } catch (_) {}
    cachedDB = null;
  }
  inFlightOpenPromise = null;
}

async function openWithAutoRetry(retriesRemaining = 3, delayMs = 200): Promise<IDBPDatabase<YogaSenseDB>> {
  let timer: any = null;

  const openPromise = openDB<YogaSenseDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      console.log(`[IndexedDB] Upgrading schema from v${oldVersion} to v${DB_VERSION}`);
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email', { unique: true });
      }

      // Sessions store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('by-user', 'userId');
        sessionStore.createIndex('by-date', 'dateString');
      }

      // User settings store
      if (!db.objectStoreNames.contains('user_settings')) {
        db.createObjectStore('user_settings', { keyPath: 'userId' });
      }

      // v2 Migration: Journey store
      if (oldVersion < 2 || !db.objectStoreNames.contains('journey')) {
        if (!db.objectStoreNames.contains('journey')) {
          db.createObjectStore('journey', { keyPath: 'userId' });
        }
      }
    },
    blocked(currentVersion, blockedVersion, _event) {
      console.warn(
        `[IndexedDB] Upgrade to v${blockedVersion ?? DB_VERSION} blocked by open connection at v${currentVersion}. Requesting other tabs to close.`
      );
      broadcastUpgradeRequest(blockedVersion ?? DB_VERSION);
      if (retriesRemaining <= 1) {
        updateDBState({
          isBlocked: true,
          isVersionChange: false,
          message: 'Database upgrade is blocked by another open tab. Please close other YogaSense AI tabs and refresh.',
        });
      }
    },
    blocking(currentVersion, blockedVersion, _event) {
      console.warn(
        `[IndexedDB] This connection (v${currentVersion}) is blocking a newer version (v${blockedVersion}). Closing proactively.`
      );
      closeDB();
      updateDBState({
        isBlocked: false,
        isVersionChange: true,
        message: 'A newer version of YogaSense AI is active in another tab.',
      });
    },
    terminated() {
      console.warn('[IndexedDB] Connection terminated unexpectedly by the browser.');
      closeDB();
    },
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('DB open timeout'));
    }, DB_OPEN_TIMEOUT_MS);
  });

  try {
    const db = await Promise.race([openPromise, timeoutPromise]);
    clearTimeout(timer);
    cachedDB = db;
    updateDBState({ isBlocked: false, message: null });
    broadcastUpgradeComplete(DB_VERSION);

    db.onversionchange = () => {
      console.warn('[IndexedDB] db.onversionchange triggered: closing connection proactively.');
      closeDB();
      updateDBState({
        isBlocked: false,
        isVersionChange: true,
        message: 'YogaSense AI database was updated in another tab.',
      });
    };

    return db;
  } catch (err: any) {
    clearTimeout(timer);
    closeDB();

    // If blocked or timed out and retries remain, request tabs to close, wait and retry automatically
    if (retriesRemaining > 0) {
      console.log(`[IndexedDB] Retrying connection attempt (${retriesRemaining} retries left)...`);
      broadcastUpgradeRequest(DB_VERSION);
      await new Promise((res) => setTimeout(res, delayMs));
      return openWithAutoRetry(retriesRemaining - 1, delayMs * 1.5);
    }

    const state = getLatestDBState();
    const msg = state.isBlocked
      ? 'Database upgrade blocked: another tab is keeping an older database connection open. Please close other YogaSense AI tabs and reload.'
      : 'Database connection timed out (8s). Please close any other open YogaSense AI tabs and retry.';
    throw new Error(msg);
  }
}

export function getDB(): Promise<IDBPDatabase<YogaSenseDB>> {
  // 1. If we already have a valid open connection, reuse it immediately
  if (cachedDB) {
    return Promise.resolve(cachedDB);
  }

  // 2. If an open operation is already in flight, reuse the promise
  if (inFlightOpenPromise) {
    return inFlightOpenPromise;
  }

  // 3. Initiate single open operation
  inFlightOpenPromise = openWithAutoRetry()
    .then((db) => {
      inFlightOpenPromise = null;
      return db;
    })
    .catch((err) => {
      inFlightOpenPromise = null;
      throw err;
    });

  return inFlightOpenPromise;
}

// User DB operations
export async function saveUser(user: UserProfile & { passwordHash: string }) {
  const db = await getDB();
  await db.put('users', user);
}

export async function getUserByEmail(email: string) {
  const db = await getDB();
  return db.getFromIndex('users', 'by-email', email);
}

export async function getUserById(id: string) {
  const db = await getDB();
  return db.get('users', id);
}

// User settings DB operations
export async function getUserSettings(userId: string): Promise<UserSettings | undefined> {
  const db = await getDB();
  return db.get('user_settings', userId);
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('user_settings', settings);
}

// Session DB operations
export async function saveSession(session: SessionSummary) {
  const db = await getDB();
  await db.put('sessions', session);
}

export async function getUserSessions(userId: string): Promise<SessionSummary[]> {
  const db = await getDB();
  const sessions = await db.getAllFromIndex('sessions', 'by-user', userId);
  return sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getAllSessions(): Promise<SessionSummary[]> {
  const db = await getDB();
  const sessions = await db.getAll('sessions');
  return sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getSessionById(sessionId: string): Promise<SessionSummary | undefined> {
  const db = await getDB();
  return db.get('sessions', sessionId);
}

// Journey DB operations
export async function getJourneyRecord(userId: string): Promise<JourneyRecord> {
  const db = await getDB();
  let record = await db.get('journey', userId);

  if (!record) {
    // Backfill or create initial record from existing user sessions
    try {
      const sessions = await getUserSessions(userId);
      const poseStats: Record<string, PoseStatRecord> = {};

      for (const s of sessions) {
        if (!s || !s.poseId) continue;
        const existing = poseStats[s.poseId] || {
          sessionsCount: 0,
          bestScore: 0,
          bestAccuracy: 0,
          bestHoldSeconds: 0,
          lastPracticedDate: s.dateString || localDateKey(new Date(s.timestamp || Date.now())),
        };

        existing.sessionsCount += 1;
        existing.bestScore = Math.max(existing.bestScore, s.averageScore || 0);
        existing.bestAccuracy = Math.max(existing.bestAccuracy, s.accuracyPercent ?? s.averageScore ?? 0);
        existing.bestHoldSeconds = Math.max(
          existing.bestHoldSeconds,
          s.longestHoldSeconds ?? s.inPositionSeconds ?? s.durationSeconds ?? 0
        );
        existing.lastPracticedDate = s.dateString || localDateKey(new Date(s.timestamp || Date.now()));
        poseStats[s.poseId] = existing;
      }

      // Evaluate progression sequentially
      let currentLevel = 1;
      const completedLevelNumbers: number[] = [];

      for (const lvl of JOURNEY_LEVELS) {
        if (lvl.level === currentLevel) {
          const progress = calculateLevelProgress(lvl, poseStats);
          if (progress.isComplete && currentLevel < JOURNEY_LEVELS.length) {
            completedLevelNumbers.push(currentLevel);
            currentLevel += 1;
          }
        }
      }

      record = {
        userId,
        currentLevel,
        completedLevelNumbers,
        poseStats,
        updatedAt: new Date().toISOString(),
      };

      await db.put('journey', record);
    } catch (e) {
      console.error('Failed to backfill journey stats, initializing fresh:', e);
      record = {
        userId,
        currentLevel: 1,
        completedLevelNumbers: [],
        poseStats: {},
        updatedAt: new Date().toISOString(),
      };
      try {
        await db.put('journey', record);
      } catch (_) {}
    }
  }

  return record;
}

export async function saveJourneyRecord(record: JourneyRecord): Promise<void> {
  const db = await getDB();
  await db.put('journey', record);
}

// Compute Streak and Daily Stats dynamically (Fixed bug #9: local date handling)
export async function getUserStreakAndStats(
  userId: string,
  targetDailyGoal: number = 20
): Promise<{
  streak: UserStreak;
  todayMinutes: number;
  todayGoalMinutes: number;
}> {
  const sessions = await getUserSessions(userId);
  const todayStr = localDateKey();

  let todayMinutes = 0;
  const uniqueDates = new Set<string>();

  sessions.forEach((s) => {
    const sDate = s.dateString || localDateKey(new Date(s.timestamp));
    uniqueDates.add(sDate);
    if (sDate === todayStr) {
      todayMinutes += Math.round(s.durationSeconds / 60);
    }
  });

  let currentStreak = 0;
  const now = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = localDateKey(d);

    if (uniqueDates.has(dateStr)) {
      currentStreak++;
    } else if (i === 0) {
      // Today not practiced yet, continue to check yesterday to keep streak active
      continue;
    } else {
      break;
    }
  }

  const totalMinutes = sessions.reduce((acc, s) => acc + Math.round(s.durationSeconds / 60), 0);

  return {
    streak: {
      currentStreak,
      lastActiveDate: todayStr,
      totalMinutes,
      totalSessions: sessions.length,
    },
    todayMinutes,
    todayGoalMinutes: targetDailyGoal,
  };
}
