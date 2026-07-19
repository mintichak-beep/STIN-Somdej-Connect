import { SystemIssue } from '../types/db';
import { FirestoreService } from './firestore.service';
import { orderBy } from 'firebase/firestore';

const issueFS = new FirestoreService<SystemIssue>('systemIssues');

export const systemIssueService = {
  getAll: async (): Promise<SystemIssue[]> => {
    return issueFS.getAll([orderBy('createdAt', 'desc')]);
  },
  create: async (data: Omit<SystemIssue, 'id' | 'createdAt'>): Promise<string> => {
    return issueFS.create(data as any);
  }
};
