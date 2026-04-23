import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// Supports: VITE_ prefix (Vite), NEXT_PUBLIC_ prefix (Vercel/Next), or direct names
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please check environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types - these map to the Supabase table schemas
export interface DbProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'team';
  exports_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface DbBrandKit {
  id: string;
  user_id: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  content: string;
  layout: 'timeline' | 'comparison' | 'list' | 'stats' | 'process' | 'hierarchy';
  elements: unknown[];
  canvas_settings: {
    width: number;
    height: number;
    backgroundColor: string;
    aspectRatio: string;
  };
  thumbnail_url: string | null;
  is_public: boolean;
  public_slug: string | null;
  history: unknown[];
  created_at: string;
  updated_at: string;
}
