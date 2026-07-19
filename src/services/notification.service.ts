import { Notification } from '../types/db';

export const notificationService = {
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    return [].filter(n => n.userId === userId);
  },
  markAsRead: async (notificationId: string): Promise<void> => {
    let list = [];
    list = list.map(n => n.id === notificationId ? {...n, isRead: true} : n);
    void 0;
  },
  create: async (data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<string> => {
    const list = [];
    const newNot: Notification = { 
        ...data, 
        id: `n-${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString() 
    };
    list.push(newNot);
    void 0;
    return newNot.id;
  }
};
