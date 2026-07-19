import { useAuth } from './useAuth';
import { UserRole } from '../types/auth';

export function useRole() {
  const { user } = useAuth();

  const role: UserRole | null = user?.role || null;

  const isTeacher = role === 'Teacher';
  const isStudent = role === 'Nursing Student';
  const isAdmin = role === 'Teacher'; // Map isAdmin check to isTeacher for backward compatibility

  // Role Permission mapping for features
  const canAccess = (feature: string): boolean => {
    if (!role) return false;
    if (isTeacher) return true; // Teacher has access to everything

    const studentFeatures = [
      'dashboard',
      'my-room',
      'my-transportation',
      'profile'
    ];

    if (isStudent) {
      return studentFeatures.includes(feature);
    }

    return false;
  };

  return {
    role,
    isAdmin,
    isTeacher,
    isStudent,
    canAccess,
  };
}
