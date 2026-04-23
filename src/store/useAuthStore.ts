import { create } from 'zustand';
import type { User, BrandKit } from '@/types';
import { authService } from '@/features/auth/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateBrandKit: (updates: Partial<BrandKit>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    const storedUser = authService.findUserByEmail(email);

    if (!storedUser || storedUser.password !== password) {
      const error = new Error('Invalid login credentials');
      set({ isLoading: false, error: error.message });
      return { error };
    }

    const user = authService.buildAppUser(storedUser);
    authService.setSessionUserId(storedUser.id);

    set({ user, isAuthenticated: true, isLoading: false });
    return { error: null };
  },

  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null });
    const existingUser = authService.findUserByEmail(email);

    if (existingUser) {
      const error = new Error('Email already registered');
      set({ isLoading: false, error: error.message });
      return { error };
    }

    const localUser = authService.createLocalUser(
      email,
      password,
      name || email.split('@')[0],
      {
        logo: undefined,
        primaryColor: '#6B46C1',
        secondaryColor: '#EC4899',
        accentColor: '#06B6D4',
        fontHeading: 'Space Grotesk',
        fontBody: 'Inter',
      }
    );

    const users = authService.getStoredUsers();
    authService.saveStoredUsers([...users, localUser]);
    const user = authService.buildAppUser(localUser);
    authService.setSessionUserId(localUser.id);

    set({ user, isAuthenticated: true, isLoading: false });
    return { error: null };
  },

  signOut: async () => {
    set({ isLoading: true });
    authService.setSessionUserId(null);
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  resetPassword: async (email) => {
    const storedUser = authService.findUserByEmail(email);
    if (!storedUser) {
      const error = new Error('No account found with that email');
      set({ error: error.message });
      return { error };
    }

    return { error: null };
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    const storedUser = authService.findUserByEmail(user.email);
    if (!storedUser) return;

    const updatedUser = {
      ...storedUser,
      name: updates.name ?? storedUser.name,
      avatar: updates.avatar ?? storedUser.avatar,
      plan: updates.plan ?? storedUser.plan,
      exportsThisMonth: updates.exportsThisMonth ?? storedUser.exportsThisMonth,
    };

    authService.saveStoredUsers(
      authService.getStoredUsers().map((item) =>
        item.id === updatedUser.id ? updatedUser : item
      )
    );

    set({ user: authService.buildAppUser(updatedUser) });
  },

  updateBrandKit: async (updates) => {
    const { user } = get();
    if (!user) return;
    const storedUser = authService.findUserByEmail(user.email);
    if (!storedUser) return;

    const updatedBrandKit = {
      ...storedUser.brandKit,
      ...updates,
    };

    const updatedUser = {
      ...storedUser,
      brandKit: updatedBrandKit,
    };

    authService.saveStoredUsers(
      authService.getStoredUsers().map((item) =>
        item.id === updatedUser.id ? updatedUser : item
      )
    );

    set({ user: { ...user, brandKit: updatedBrandKit } });
  },

  refreshUser: async () => {
    set({ isLoading: true, error: null });
    const userId = authService.getSessionUserId();

    if (!userId) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    const storedUser = authService.getStoredUsers().find((item) => item.id === userId);
    if (!storedUser) {
      authService.setSessionUserId(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ user: authService.buildAppUser(storedUser), isAuthenticated: true, isLoading: false });
  },
}));
