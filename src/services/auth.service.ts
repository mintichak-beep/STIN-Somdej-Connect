import { UserProfile } from '../types/auth';
import { firebaseSim } from '../firebase/firebase';

const DELAY_MS = 800; // Simulated network delay for polished loaders

export const AuthService = {
  login: async (email: string, password: string, rememberMe: boolean): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple network error simulator for test
        if (email.toLowerCase().includes('network-error')) {
          return reject(new Error('Network connection error. Please try again.'));
        }

        const users = firebaseSim.getUsers();
        const passwords = firebaseSim.getPasswords();

        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (!user) {
          return reject(new Error('User not found. Check your email address.'));
        }

        if (user.status === 'inactive') {
          return reject(new Error('Your account has been deactivated. Contact administration.'));
        }

        const storedPassword = passwords[normalizedEmail];
        if (!storedPassword || storedPassword !== password) {
          return reject(new Error('Invalid password. Please try again.'));
        }

        // Update last login
        const updatedUsers = users.map(u => {
          if (u.uid === user.uid) {
            return {
              ...u,
              lastLogin: new Date().toISOString()
            };
          }
          return u;
        });
        firebaseSim.saveUsers(updatedUsers);

        const authenticatedUser = updatedUsers.find(u => u.uid === user.uid)!;

        // Store session in localStorage or sessionStorage depending on rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('cpatms_current_user_uid', authenticatedUser.uid);

        resolve(authenticatedUser);
      }, DELAY_MS);
    });
  },

  googleLogin: async (): Promise<UserProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate logging in with admin via Google
        const users = firebaseSim.getUsers();
        const adminUser = users.find(u => u.role === 'Teacher') || users[0];
        
        // Update last login
        const updatedUsers = users.map(u => {
          if (u.uid === adminUser.uid) {
            return {
              ...u,
              lastLogin: new Date().toISOString()
            };
          }
          return u;
        });
        firebaseSim.saveUsers(updatedUsers);
        
        const authenticatedUser = updatedUsers.find(u => u.uid === adminUser.uid)!;
        
        localStorage.setItem('cpatms_current_user_uid', authenticatedUser.uid);
        resolve(authenticatedUser);
      }, DELAY_MS);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('cpatms_current_user_uid');
        sessionStorage.removeItem('cpatms_current_user_uid');
        resolve();
      }, DELAY_MS / 2);
    });
  },

  forgotPassword: async (email: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = firebaseSim.getUsers();
        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (!user) {
          return reject(new Error('Email address not registered in STIN-Somdej Connect.'));
        }

        resolve(`Reset link successfully simulated and sent to ${email}`);
      }, DELAY_MS);
    });
  },

  resetPassword: async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase().trim();
        const passwords = firebaseSim.getPasswords();

        if (!passwords[normalizedEmail]) {
          return reject(new Error('User not found.'));
        }

        passwords[normalizedEmail] = password;
        firebaseSim.savePasswords(passwords);
        resolve();
      }, DELAY_MS);
    });
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    return new Promise((resolve) => {
      // Fast resolve for initial mount session restored
      const storedUid = localStorage.getItem('cpatms_current_user_uid') || sessionStorage.getItem('cpatms_current_user_uid');
      if (!storedUid) {
        return resolve(null);
      }

      const users = firebaseSim.getUsers();
      const user = users.find(u => u.uid === storedUid) || null;
      resolve(user);
    });
  }
};
