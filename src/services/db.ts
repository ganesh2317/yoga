import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { SessionSummary, UserProfile, UserStreak } from '../types';

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
    value: {
      userId: string;
      dailyGoalMinutes: number;
      audioFeedbackEnabled: boolean;
      updatedAt: string;
    };
  };
}

const DB_NAME = 'yogasense_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<YogaSenseDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<YogaSenseDB>> {
  if (!dbPromise) {
    dbPromise = openDB<YogaSenseDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
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
      },
    });
  }
  return dbPromise;
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

export async function getSessionById(sessionId: string): Promise<SessionSummary | undefined> {
  const db = await getDB();
  return db.get('sessions', sessionId);
}

// Compute Streak and Daily Stats dynamically
export async function getUserStreakAndStats(userId: string, targetDailyGoal: number = 20): Promise<{
  streak: UserStreak;
  todayMinutes: number;
  todayGoalMinutes: number;
}> {
  const sessions = await getUserSessions(userId);
  const todayStr = new Date().toISOString().split('T')[0];

  let todayMinutes = 0;
  const uniqueDates = new Set<string>();

  sessions.forEach(s => {
    const sDate = s.dateString || s.timestamp.split('T')[0];
    uniqueDates.add(sDate);
    if (sDate === todayStr) {
      todayMinutes += Math.round(s.durationSeconds / 60);
    }
  });

  // Calculate streak logic
  let currentStreak = 0;
  const now = new Date();
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    if (uniqueDates.has(dateStr)) {
      currentStreak++;
    } else if (i === 0) {
      // Today not practiced yet, check yesterday to keep streak active
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
