import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  return <>{children}</>;
}

export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  session: state.session,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
  signIn: state.signIn,
  signUp: state.signUp,
  signOut: state.signOut,
  resetPassword: state.resetPassword,
  updateProfile: state.updateProfile,
  updateBrandKit: state.updateBrandKit,
}));
