import { Announcement } from '../types/db';
import { storage } from '../lib/storage';

export const announcementService = {
  getAll: async (): Promise<Announcement[]> => {
    return storage.get<Announcement[]>('announcements') || [];
  },
  create: async (data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> => {
    const list = storage.get<Announcement[]>('announcements') || [];
    const id = `a-${Date.now()}`;
    const newAnn: Announcement = { 
        ...data, 
        id, 
        createdAt: new Date().toISOString() 
    };
    list.push(newAnn);
    storage.set('announcements', list);
    return id;
  }
};
