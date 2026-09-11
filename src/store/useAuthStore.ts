import { create } from 'zustand';
import type { UserProfile } from '../types';
import { authService } from '../services/authService';
import { getUserById, saveUser, subscribeDBState, closeDB } from '../services/db';
import { useSessionStore } from './useSessionStore';

interface AuthStoreState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isBlocked: boolean;
  blockedMessage: string | null;
  isVersionChange: boolean;

  initialize: () => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateDailyGoal: (minutes: number) => void;
  clearError: () => void;
  retry: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set, get) => {
  // Subscribe to DB lifecycle events (blocked, version change)
  subscribeDBState((dbState) => {
    if (dbState.isBlocked) {
      set({
        isBlocked: true,
        blockedMessage: dbState.message,
        isLoading: false,
        error: dbState.message,
      });
    } else if (dbState.isVersionChange) {
      set({
        isVersionChange: true,
        blockedMessage: dbState.message,
      });
    }
  });

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isBlocked: false,
    blockedMessage: null,
    isVersionChange: false,

    initialize: async () => {
      if (get().user && get().isAuthenticated) {
        set({ isLoading: false, isBlocked: false, error: null });
        return;
      }

      set({ isLoading: true, error: null, isBlocked: false, blockedMessage: null });

      const SESSION_RESTORE_TIMEOUT_MS = 8000;
      let timer: any = null;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(
            new Error(
              'Session restoration timed out. If you have multiple YogaSense tabs open, please close them and reload.'
            )
          );
        }, SESSION_RESTORE_TIMEOUT_MS);
      });

      try {
        const session = await Promise.race([
          authService.getCurrentSession(),
          timeoutPromise,
        ]);

        clearTimeout(timer);

        if (session) {
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            error: null,
            isBlocked: false,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            isBlocked: false,
            isLoading: false,
          });
        }
      } catch (err: any) {
        clearTimeout(timer);
        console.error('Session restoration failed:', err);
        const isBlockedMsg =
          err?.message?.toLowerCase().includes('blocked') ||
          err?.message?.toLowerCase().includes('other tab') ||
          err?.message?.toLowerCase().includes('timed out');

        set({
          error: err.message || 'Failed to restore session',
          isAuthenticated: false,
          isBlocked: Boolean(isBlockedMsg),
          blockedMessage: err.message || null,
          isLoading: false,
        });
      }
    },

    retry: async () => {
      closeDB();
      set({ isLoading: true, error: null, isBlocked: false, blockedMessage: null });
      await get().initialize();
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
  };
});
