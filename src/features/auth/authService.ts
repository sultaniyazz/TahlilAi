import type { BrandKit, User } from '@/types';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'team';
  brandKit?: BrandKit;
  exportCount: number;
  exportsThisMonth: number;
  createdAt: string;
}

const LOCAL_USERS_KEY = 'local-auth-users';
const LOCAL_SESSION_KEY = 'local-auth-session';

export const authService = {
  getStoredUsers(): StoredUser[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]') as StoredUser[];
    } catch {
      return [];
    }
  },

  saveStoredUsers(users: StoredUser[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  },

  getSessionUserId() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LOCAL_SESSION_KEY);
  },

  setSessionUserId(id: string | null) {
    if (typeof window === 'undefined') return;
    if (id) {
      localStorage.setItem(LOCAL_SESSION_KEY, id);
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  },

  buildAppUser(storedUser: StoredUser): User {
    return {
      id: storedUser.id,
      email: storedUser.email,
      name: storedUser.name,
      avatar: storedUser.avatar,
      plan: storedUser.plan,
      createdAt: new Date(storedUser.createdAt),
      exportsThisMonth: storedUser.exportsThisMonth,
      brandKit: storedUser.brandKit,
    };
  },

  findUserByEmail(email: string) {
    return this.getStoredUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
  },

  generateId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
  },

  createLocalUser(email: string, password: string, name: string, brandKit?: BrandKit): StoredUser {
    return {
      id: this.generateId(),
      email,
      password,
      name,
      avatar: undefined,
      plan: 'free',
      brandKit,
      exportCount: 0,
      exportsThisMonth: 0,
      createdAt: new Date().toISOString(),
    };
  },
};
