import { Announcement } from '../types/db';
import { FirestoreService } from './firestore.service';
import { orderBy } from 'firebase/firestore';

const announcementFS = new FirestoreService<Announcement>('announcements');

export const announcementService = {
  getAll: async (): Promise<Announcement[]> => {
    return announcementFS.getAll([orderBy('createdAt', 'desc')]);
  },
  getById: async (id: string): Promise<Announcement | null> => {
    return announcementFS.getById(id);
  },
  create: async (data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> => {
    return announcementFS.create(data as any);
  },
  update: async (id: string, data: Partial<Announcement>): Promise<void> => {
    return announcementFS.update(id, data);
  },
  delete: async (id: string): Promise<void> => {
    return announcementFS.delete(id);
  }
};
