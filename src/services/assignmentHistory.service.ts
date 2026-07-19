import { PracticeAssignmentHistory } from '../types/db';
import { storage } from '../lib/storage';

export const assignmentHistoryService = {
  getAll: async (): Promise<PracticeAssignmentHistory[]> => {
    return storage.get<PracticeAssignmentHistory[]>('assignmentHistory') || [];
  },
  
  getByStudentId: async (studentId: string): Promise<PracticeAssignmentHistory[]> => {
    const list = storage.get<PracticeAssignmentHistory[]>('assignmentHistory') || [];
    return list.filter(h => h.studentId === studentId);
  },

  create: async (data: Omit<PracticeAssignmentHistory, 'id' | 'changedAt'>): Promise<string> => {
    const list = storage.get<PracticeAssignmentHistory[]>('assignmentHistory') || [];
    const id = crypto.randomUUID();
    const newHistory: PracticeAssignmentHistory = { 
      ...data, 
      id,
      changedAt: new Date().toISOString() 
    };
    list.push(newHistory);
    storage.set('assignmentHistory', list);
    return id;
  }
};
