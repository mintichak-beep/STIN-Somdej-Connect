import { mockDB } from './mockData';
import { SystemIssue } from '../types/db';

export const systemIssueService = {
  getAll: async (): Promise<SystemIssue[]> => mockDB.getSystemIssues(),
  create: async (data: Omit<SystemIssue, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getSystemIssues();
    const newIssue: SystemIssue = { ...data, id: `si-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newIssue);
    mockDB.saveSystemIssues(list);
    return newIssue.id;
  }
};
