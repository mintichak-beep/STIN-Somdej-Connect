import { useAuth } from './useAuth';
import { UserRole } from '../types/auth';

export function useRole() {
  const { user } = useAuth();

  const role: UserRole | null = user?.role || null;

  const isAdmin = role === 'Administrator';
  const isTeacher = role === 'Teacher';
  const isStudent = role === 'Student';

  // Role Permission mapping for features
  const canAccess = (feature: string): boolean => {
    if (!role) return false;
    if (isAdmin) return true; // Administrator can access everything

    const teacherFeatures = [
      'dashboard',
      'students',
      'teachers',
      'vehicles',
      'drivers',
      'transportation',
      'rooms',
      'reports',
      'profile',
      'academicYear',
      'semester',
      'course',
      'section',
      'hospital',
      'building'
    ];

    const studentFeatures = [
      'dashboard',
      'my-room',
      'my-transportation',
      'profile'
    ];

    if (isTeacher) {
      return teacherFeatures.includes(feature);
    }

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
