import { mockDB } from './mockData';
import { User } from '../types/db';

export const UserService = {
  getAll: async (): Promise<User[]> => mockDB.getUsers(),
  updateUserProfile: async (uid: string, data: Partial<User>): Promise<User> => {
      // Mock update
      return {} as User;
  },
  create: async (data: Omit<User, 'uid' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getUsers();
    const newUser: User = { ...data, uid: `u-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newUser);
    mockDB.saveUsers(list);
    return newUser.uid;
  }
};
