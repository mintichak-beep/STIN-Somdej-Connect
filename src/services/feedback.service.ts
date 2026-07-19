import { UserFeedback } from '../types/db';

export const feedbackService = {
  getAll: async (): Promise<UserFeedback[]> => [],
  submit: async (data: Omit<UserFeedback, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newFeedback: UserFeedback = { ...data, id: `fb-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newFeedback);
    void 0;
    return newFeedback.id;
  }
};
