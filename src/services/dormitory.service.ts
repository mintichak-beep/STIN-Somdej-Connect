import { Dormitory } from '../types/db';
import { FirestoreService } from './firestore.service';
import { orderBy } from 'firebase/firestore';

const dormitoryFS = new FirestoreService<Dormitory>('dormitories');

export const dormitoryService = {
  getAll: async (): Promise<Dormitory[]> => {
    return dormitoryFS.getAll([orderBy('name', 'asc')]);
  },
  getById: async (id: string): Promise<Dormitory | null> => {
    return dormitoryFS.getById(id);
  },
  create: async (data: Omit<Dormitory, 'id' | 'createdAt'>): Promise<string> => {
    return dormitoryFS.create(data as any);
  },
  update: async (id: string, data: Partial<Dormitory>): Promise<void> => {
    return dormitoryFS.update(id, data);
  },
  delete: async (id: string): Promise<void> => {
    return dormitoryFS.delete(id);
  }
};
