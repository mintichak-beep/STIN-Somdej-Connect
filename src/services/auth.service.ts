import { UserProfile } from '../types/auth';

const DEFAULT_USER: UserProfile = {
  uid: 'dev-user',
  email: 'dev@stin.ac.th',
  displayName: 'Developer',
  photoURL: '',
  role: 'teacher',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

export const authService = {
  signInWithGoogle: async (): Promise<UserProfile> => {
    return DEFAULT_USER;
  },
  signInWithEmail: async (email: string, password: string): Promise<UserProfile> => {
    return DEFAULT_USER;
  },
  resetPassword: async (email: string): Promise<void> => {
    // No-op
  },
  signOut: () => {
    // No-op
  },
  getCurrentUser: async (): Promise<UserProfile | null> => {
    return DEFAULT_USER;
  },
};
