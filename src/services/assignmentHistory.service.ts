import { mockDB } from './mockData';
import { PracticeAssignmentHistory } from '../types/db';

export const assignmentHistoryService = {
  getAll: async (): Promise<PracticeAssignmentHistory[]> => mockDB.getPracticeAssignmentHistory(),
  
  getByStudentId: async (studentId: string): Promise<PracticeAssignmentHistory[]> => {
    return mockDB.getPracticeAssignmentHistory().filter(h => h.studentId === studentId);
  },

  create: async (data: Omit<PracticeAssignmentHistory, 'id' | 'changedAt'>): Promise<string> => {
    const list = mockDB.getPracticeAssignmentHistory();
    const newHistory: PracticeAssignmentHistory = { ...data, id: `pah-${Date.now()}`, changedAt: new Date().toISOString() };
    list.push(newHistory);
    mockDB.savePracticeAssignmentHistory(list);
    return newHistory.id;
  }
};
