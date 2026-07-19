import { storage } from '../lib/storage';
import { User } from '../types/db';

export const UserService = {
  getAll: async (): Promise<User[]> => {
    return storage.get<User[]>('users') || [];
  },
  updateUserProfile: async (uid: string, data: Partial<User>): Promise<User> => {
    const list = storage.get<User[]>('users') || [];
    const index = list.findIndex(u => u.uid === uid);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      storage.set('users', list);
      return list[index];
    }
    throw new Error('User not found');
  },
  create: async (data: Omit<User, 'uid' | 'createdAt'>): Promise<string> => {
    const list = storage.get<User[]>('users') || [];
    const uid = `u-${Date.now()}`;
    const newUser: User = { 
      ...data, 
      uid, 
      createdAt: new Date().toISOString() 
    };
    list.push(newUser);
    storage.set('users', list);
    return uid;
  }
};

