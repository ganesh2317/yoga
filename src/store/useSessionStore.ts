import { create } from 'zustand';
import type { SessionSummary, UserStreak } from '../types';
import { getUserSessions, getUserStreakAndStats, saveSession } from '../services/db';

interface SessionStoreState {
  sessions: SessionSummary[];
  todayMinutes: number;
  streak: UserStreak;
  isLoading: boolean;
  
  fetchUserSessions: (userId: string, dailyGoalMinutes?: number) => Promise<void>;
  addCompletedSession: (session: SessionSummary, dailyGoalMinutes?: number) => Promise<void>;
  getLastSession: () => SessionSummary | null;
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  sessions: [],
  todayMinutes: 0,
  streak: {
    currentStreak: 0,
    lastActiveDate: '',
    totalMinutes: 0,
    totalSessions: 0,
  },
  isLoading: false,

  fetchUserSessions: async (userId: string, dailyGoalMinutes = 20) => {
    set({ isLoading: true });
    try {
      const userSessions = await getUserSessions(userId);
      const { streak, todayMinutes } = await getUserStreakAndStats(userId, dailyGoalMinutes);
      set({
        sessions: userSessions,
        streak,
        todayMinutes,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load user sessions:', err);
      set({ isLoading: false });
    }
  },

  addCompletedSession: async (session: SessionSummary, dailyGoalMinutes = 20) => {
    await saveSession(session);
    await get().fetchUserSessions(session.userId, dailyGoalMinutes);
  },

  getLastSession: () => {
    const { sessions } = get();
    return sessions.length > 0 ? sessions[0] : null;
  },
}));
