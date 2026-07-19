import { mockDB } from './mockData';
import { Announcement } from '../types/db';

export const announcementService = {
  getAll: async (): Promise<Announcement[]> => mockDB.getAnnouncements(),
  create: async (data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getAnnouncements();
    const newAnn: Announcement = { 
        ...data, 
        id: `a-${Date.now()}`, 
        createdAt: new Date().toISOString() 
    };
    list.push(newAnn);
    mockDB.saveAnnouncements(list);
    return newAnn.id;
  }
};
