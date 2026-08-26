import { create } from 'zustand';
import type { UserProfile } from '../types';
import { authService } from '../services/authService';
import { getUserById, saveUser } from '../services/db';
import { useSessionStore } from './useSessionStore';

interface AuthStoreState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateDailyGoal: (minutes: number) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    if (get().user && get().isAuthenticated) {
      set({ isLoading: false });
      return;
    }
    try {
      set({ isLoading: true, error: null });
      const session = await authService.getCurrentSession();
      if (session) {
        set({ user: session.user, token: session.token, isAuthenticated: true });
      } else {
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to restore session', isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, pass) => {
    try {
      set({ isLoading: true, error: null });
      const { user, token } = await authService.login(email, pass);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  register: async (name, email, pass) => {
    try {
      set({ isLoading: true, error: null });
      await authService.register(name, email, pass);
      const session = await authService.login(email, pass);
      set({ user: session.user, token: session.token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  updateDailyGoal: async (minutes: number) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, dailyGoalMinutes: minutes };
      set({ user: updatedUser });

      const fullUser = await authService.getCurrentSession();
      if (fullUser) {
        const dbUser = await getUserById(currentUser.id);
        if (dbUser) {
          await saveUser({ ...dbUser, dailyGoalMinutes: minutes });
        }
      }

      useSessionStore.getState().fetchUserSessions(currentUser.id, minutes);
    }
  },

  clearError: () => set({ error: null }),
}));
