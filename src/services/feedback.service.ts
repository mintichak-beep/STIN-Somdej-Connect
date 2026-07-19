import { mockDB } from './mockData';
import { UserFeedback } from '../types/db';

export const feedbackService = {
  getAll: async (): Promise<UserFeedback[]> => mockDB.getUserFeedback(),
  submit: async (data: Omit<UserFeedback, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getUserFeedback();
    const newFeedback: UserFeedback = { ...data, id: `fb-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newFeedback);
    mockDB.saveUserFeedback(list);
    return newFeedback.id;
  }
};
