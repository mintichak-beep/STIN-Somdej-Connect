import { createContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthState, UserRole } from '../types/auth';
import { UserService } from '../services/user.service';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe: boolean) => Promise<UserProfile>;
  googleLogin: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  switchRole: (role: UserRole) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_TEACHER: UserProfile = {
  uid: 'dev-teacher-id',
  email: 'coordinator.admin@stin.ac.th',
  displayName: 'อาจารย์ ผู้ประสานงาน (Teacher Admin)',
  role: 'Teacher',
  status: 'active',
  photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  createdAt: new Date().toISOString()
};

const DEFAULT_STUDENT: UserProfile = {
  uid: 'dev-student-id',
  email: 'student.sample@stin.ac.th',
  displayName: 'นักศึกษาพยาบาล ทดสอบ (Student Test)',
  role: 'Nursing Student',
  status: 'active',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  createdAt: new Date().toISOString()
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('stin_simulated_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_TEACHER;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('stin_simulated_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('stin_simulated_user');
    }
  }, [user]);

  const switchRole = (role: UserRole) => {
    if (role === 'Teacher' || role === 'teacher') {
      setUser(DEFAULT_TEACHER);
    } else {
      setUser(DEFAULT_STUDENT);
    }
  };

  const login = async (email: string, _password: string, _rememberMe: boolean): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    try {
      const selectedUser = email.includes('student') ? DEFAULT_STUDENT : DEFAULT_TEACHER;
      setUser(selectedUser);
      setLoading(false);
      return selectedUser;
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setLoading(false);
      throw err;
    }
  };

  const googleLogin = async (): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    try {
      setUser(DEFAULT_TEACHER);
      setLoading(false);
      return DEFAULT_TEACHER;
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
      setLoading(false);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // For bypass mode, logout can just reset to teacher or clear
      setUser(null);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Logout failed.');
      setLoading(false);
      throw err;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('Not authenticated.');
    setLoading(true);
    setError(null);
    try {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      setLoading(false);
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Profile update failed.');
      setLoading(false);
      throw err;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    // No-op for password reset in bypass mode
    console.log('Forgot password request for:', email);
  };

  const resetPassword = async (email: string): Promise<void> => {
    // No-op
    console.log('Reset password request for:', email);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        googleLogin,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        clearError,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

