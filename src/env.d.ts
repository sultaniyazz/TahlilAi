/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Vite prefixed
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  // Direct names (from Vercel integration)
  readonly SUPABASE_URL?: string
  readonly SUPABASE_ANON_KEY?: string
  // Next.js prefixed (from Vercel integration)
  readonly NEXT_PUBLIC_SUPABASE_URL?: string
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
