export type UserRole = 'Teacher' | 'Nursing Student' | 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  photoURL?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
