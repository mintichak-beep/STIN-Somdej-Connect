import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';

interface ProtectedRouteProps {
  children: ReactNode;
  feature?: string;
}

export function ProtectedRoute({ children, feature }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { canAccess } = useRole();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
          <p className="font-sans text-sm font-medium text-gray-600 dark:text-zinc-400">Loading STIN-Somdej Connect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, preserving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (feature && !canAccess(feature)) {
    // User is logged in but lacks required permission
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
