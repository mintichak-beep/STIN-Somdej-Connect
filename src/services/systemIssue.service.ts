import { SystemIssue } from '../types/db';

export const systemIssueService = {
  getAll: async (): Promise<SystemIssue[]> => [],
  create: async (data: Omit<SystemIssue, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newIssue: SystemIssue = { ...data, id: `si-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newIssue);
    void 0;
    return newIssue.id;
  }
};
