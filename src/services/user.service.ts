import { UserProfile } from '../types/auth';
import { firebaseSim } from '../firebase/firebase';

const DELAY_MS = 600;

export const UserService = {
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = firebaseSim.getUsers();
        const user = users.find(u => u.uid === uid) || null;
        resolve(user);
      }, DELAY_MS);
    });
  },

  updateUserProfile: async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'email' | 'role' | 'createdAt'>>): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = firebaseSim.getUsers();
        const userIndex = users.findIndex(u => u.uid === uid);

        if (userIndex === -1) {
          return reject(new Error('User not found.'));
        }

        const updatedUser: UserProfile = {
          ...users[userIndex],
          ...data,
          updatedAt: new Date().toISOString()
        };

        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        
        firebaseSim.saveUsers(updatedUsers);
        resolve(updatedUser);
      }, DELAY_MS);
    });
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(firebaseSim.getUsers());
      }, DELAY_MS);
    });
  }
};
