import type { UserProfile } from '../types';
import { getUserByEmail, getUserById, saveUser } from './db';

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface IAuthService {
  register(name: string, email: string, password: string): Promise<UserProfile>;
  login(email: string, password: string): Promise<{ user: UserProfile; token: string }>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<{ user: UserProfile; token: string } | null>;
}

// Simple WebCrypto SHA-256 password hash helper
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class LocalAuthService implements IAuthService {
  private readonly TOKEN_KEY = 'yogasense_session_token';
  private readonly USER_ID_KEY = 'yogasense_user_id';

  async register(name: string, email: string, password: string): Promise<UserProfile> {
    const existing = await getUserByEmail(email.toLowerCase().trim());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(password);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newUser: UserProfile & { passwordHash: string } = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      dailyGoalMinutes: 20,
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    await saveUser(newUser);

    const { passwordHash: _, ...userProfile } = newUser;
    return userProfile;
  }

  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const userWithHash = await getUserByEmail(email.toLowerCase().trim());
    if (!userWithHash) {
      throw new Error('Invalid email or password.');
    }

    const inputHash = await hashPassword(password);
    if (inputHash !== userWithHash.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const token = 'tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_ID_KEY, userWithHash.id);

    const { passwordHash: _, ...user } = userWithHash;
    return { user, token };
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
  }

  async getCurrentSession(): Promise<{ user: UserProfile; token: string } | null> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userId = localStorage.getItem(this.USER_ID_KEY);

    if (!token || !userId) {
      return null;
    }

    const userWithHash = await getUserById(userId);
    if (!userWithHash) {
      this.logout();
      return null;
    }

    const { passwordHash: _, ...user } = userWithHash;
    return { user, token };
  }
}

export const authService: IAuthService = new LocalAuthService();
