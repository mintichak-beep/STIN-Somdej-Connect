import { useAuth } from './useAuth';

export function useCurrentUser() {
  const { user, loading } = useAuth();
  return { user, loading, isAuthenticated: !!user };
}
