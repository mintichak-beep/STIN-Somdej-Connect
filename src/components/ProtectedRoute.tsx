import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  feature?: string;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}
