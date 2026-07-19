import { FirestoreService } from './firestore.service';
import { User } from '../types/db';
import { orderBy } from 'firebase/firestore';

const userFS = new FirestoreService<User>('users');

export const UserService = {
  getAll: async (): Promise<User[]> => {
    return userFS.getAll([orderBy('createdAt', 'desc')]);
  },
  updateUserProfile: async (uid: string, data: Partial<User>): Promise<User> => {
    await userFS.update(uid, data);
    const updated = await userFS.getById(uid);
    if (!updated) throw new Error('User not found');
    return updated;
  },
  create: async (data: Omit<User, 'uid' | 'createdAt'>): Promise<string> => {
    return userFS.create(data as any);
  }
};

