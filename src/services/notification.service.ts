import { mockDB } from './mockData';
import { Notification } from '../types/db';

export const notificationService = {
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    return mockDB.getNotifications().filter(n => n.userId === userId);
  },
  markAsRead: async (notificationId: string): Promise<void> => {
    let list = mockDB.getNotifications();
    list = list.map(n => n.id === notificationId ? {...n, isRead: true} : n);
    mockDB.saveNotifications(list);
  },
  create: async (data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<string> => {
    const list = mockDB.getNotifications();
    const newNot: Notification = { 
        ...data, 
        id: `n-${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString() 
    };
    list.push(newNot);
    mockDB.saveNotifications(list);
    return newNot.id;
  }
};
