import { createContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthState } from '../types/auth';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe: boolean) => Promise<UserProfile>;
  googleLogin: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (email: string, password: string) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Load user session on mount (Auto Login)
  useEffect(() => {
    async function initAuth() {
      try {
        const user = await AuthService.getCurrentUser();
        setState({
          user,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setState({
          user: null,
          loading: false,
          error: err.message || 'Failed to restore session.',
        });
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<UserProfile> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await AuthService.login(email, password, rememberMe);
      setState({
        user,
        loading: false,
        error: null,
      });
      return user;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Login failed.',
      }));
      throw err;
    }
  };

  const googleLogin = async (): Promise<UserProfile> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await AuthService.googleLogin();
      setState({
        user,
        loading: false,
        error: null,
      });
      return user;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Google login failed.',
      }));
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await AuthService.logout();
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Logout failed.',
      }));
      throw err;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    if (!state.user) throw new Error('Not authenticated.');
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const updatedUser = await UserService.updateUserProfile(state.user.uid, data);
      setState({
        user: updatedUser,
        loading: false,
        error: null,
      });
      return updatedUser;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Profile update failed.',
      }));
      throw err;
    }
  };

  const forgotPassword = async (email: string): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await AuthService.forgotPassword(email);
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Forgot password request failed.',
      }));
      throw err;
    }
  };

  const resetPassword = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await AuthService.resetPassword(email, password);
      setState(prev => ({ ...prev, loading: false }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Reset password request failed.',
      }));
      throw err;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        googleLogin,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
