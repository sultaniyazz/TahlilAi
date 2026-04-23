import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  return <>{children}</>;
}

export const useAuth = () => useAuthStore((state) => state);

