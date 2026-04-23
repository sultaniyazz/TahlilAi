import { supabase } from '@/integrations/supabase/client';
import type { User, BrandKit } from '@/types';

export interface DbProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'team';
  exports_this_month: number;
  brand_primary_color: string | null;
  brand_secondary_color: string | null;
  brand_accent_color: string | null;
  brand_font_heading: string | null;
  brand_font_body: string | null;
  brand_logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export function profileToUser(profile: DbProfile): User {
  return {
    id: profile.id,
    email: profile.email ?? '',
    name: profile.display_name ?? profile.email?.split('@')[0] ?? 'User',
    avatar: profile.avatar_url ?? undefined,
    plan: profile.plan,
    createdAt: new Date(profile.created_at),
    exportsThisMonth: profile.exports_this_month ?? 0,
    brandKit: {
      primaryColor: profile.brand_primary_color ?? '#6B46C1',
      secondaryColor: profile.brand_secondary_color ?? '#EC4899',
      accentColor: profile.brand_accent_color ?? '#06B6D4',
      fontHeading: profile.brand_font_heading ?? 'Space Grotesk',
      fontBody: profile.brand_font_body ?? 'Inter',
      logo: profile.brand_logo_url ?? undefined,
    },
  };
}

export const authService = {
  async signUp(email: string, password: string, displayName?: string) {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: displayName },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  },

  async getProfile(userId: string): Promise<DbProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('getProfile error', error);
      return null;
    }
    return data as DbProfile | null;
  },

  async updateProfile(userId: string, updates: Partial<DbProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data: data as DbProfile | null, error };
  },

  async updateBrandKit(userId: string, brandKit: Partial<BrandKit>) {
    const updates: Partial<DbProfile> = {
      brand_primary_color: brandKit.primaryColor,
      brand_secondary_color: brandKit.secondaryColor,
      brand_accent_color: brandKit.accentColor,
      brand_font_heading: brandKit.fontHeading,
      brand_font_body: brandKit.fontBody,
      brand_logo_url: brandKit.logo,
    };
    return this.updateProfile(userId, updates);
  },
};
