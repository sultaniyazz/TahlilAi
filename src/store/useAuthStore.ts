import { create } from 'zustand';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { User, BrandKit } from '@/types';
import { authService, profileToUser } from '@/features/auth/authService';

interface AuthState {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initialize: () => () => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateBrandKit: (updates: Partial<BrandKit>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

async function loadUserFromSession(session: Session | null): Promise<User | null> {
  if (!session?.user) return null;
  const profile = await authService.getProfile(session.user.id);
  if (profile) return profileToUser(profile);
  // Profile may not be ready yet right after signup; fall back to minimal
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.user_metadata?.display_name ?? session.user.email?.split('@')[0] ?? 'User',
    plan: 'free',
    createdAt: new Date(session.user.created_at),
    exportsThisMonth: 0,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  supabaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: () => {
    // CRITICAL: set up listener BEFORE getSession (per Supabase docs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        supabaseUser: session?.user ?? null,
        isAuthenticated: !!session,
      });

      // Defer profile fetching to avoid deadlocks inside the auth callback
      if (session?.user) {
        setTimeout(() => {
          loadUserFromSession(session).then((user) => {
            set({ user, isLoading: false });
          });
        }, 0);
      } else {
        set({ user: null, isLoading: false });
      }
    });

    // Now load existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        supabaseUser: session?.user ?? null,
        isAuthenticated: !!session,
      });
      if (session?.user) {
        loadUserFromSession(session).then((user) => {
          set({ user, isLoading: false });
        });
      } else {
        set({ isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { error } = await authService.signIn(email, password);
    if (error) {
      set({ error: error.message });
      return { error };
    }
    return { error: null };
  },

  signUp: async (email, password, name) => {
    set({ error: null });
    const { error } = await authService.signUp(email, password, name);
    if (error) {
      set({ error: error.message });
      return { error };
    }
    return { error: null };
  },

  signOut: async () => {
    await authService.signOut();
    set({ session: null, supabaseUser: null, user: null, isAuthenticated: false });
  },

  resetPassword: async (email) => {
    const { error } = await authService.resetPassword(email);
    if (error) {
      set({ error: error.message });
      return { error };
    }
    return { error: null };
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    const { data } = await authService.updateProfile(user.id, {
      display_name: updates.name,
      avatar_url: updates.avatar,
    });
    if (data) set({ user: profileToUser(data) });
  },

  updateBrandKit: async (updates) => {
    const { user } = get();
    if (!user) return;
    const { data } = await authService.updateBrandKit(user.id, updates);
    if (data) set({ user: profileToUser(data) });
  },

  refreshUser: async () => {
    const { session } = get();
    const user = await loadUserFromSession(session);
    set({ user });
  },
}));
