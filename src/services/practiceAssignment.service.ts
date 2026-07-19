import { PracticeAssignment } from '../types/db';
import { storage } from '../lib/storage';

export const practiceAssignmentService = {
  getAll: async (): Promise<PracticeAssignment[]> => {
    return storage.get<PracticeAssignment[]>('practiceAssignments') || [];
  },
  
  getByStudentId: async (studentId: string): Promise<PracticeAssignment[]> => {
    const list = storage.get<PracticeAssignment[]>('practiceAssignments') || [];
    return list.filter(p => p.studentId === studentId);
  },

  create: async (data: Omit<PracticeAssignment, 'id' | 'createdAt'>): Promise<string> => {
    const list = storage.get<PracticeAssignment[]>('practiceAssignments') || [];
    
    // Validation: duplicate assignment
    if (list.some(p => p.studentId === data.studentId && p.courseId === data.courseId)) {
        throw new Error('Duplicate assignment for this course.');
    }
    
    // Validation: Overlapping schedules
    const start = new Date(data.startDate).getTime();
    const end = new Date(data.endDate).getTime();
    const isOverlapping = list.some(p => {
        if (p.studentId !== data.studentId) return false;
        const pStart = new Date(p.startDate).getTime();
        const pEnd = new Date(p.endDate).getTime();
        return (start <= pEnd && end >= pStart);
    });

    if (isOverlapping) {
        throw new Error('นักศึกษามีตารางฝึกซ้ำกับช่วงเวลานี้');
    }

    const id = crypto.randomUUID();
    const newAssignment: PracticeAssignment = { 
      ...data, 
      id,
      createdAt: new Date().toISOString() 
    };
    list.push(newAssignment);
    storage.set('practiceAssignments', list);
    return id;
  },

  update: async (id: string, data: Partial<PracticeAssignment>): Promise<void> => {
    const list = storage.get<PracticeAssignment[]>('practiceAssignments') || [];
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      storage.set('practiceAssignments', list);
    }
  },

  delete: async (id: string): Promise<void> => {
    const list = storage.get<PracticeAssignment[]>('practiceAssignments') || [];
    const newList = list.filter(p => p.id !== id);
    storage.set('practiceAssignments', newList);
  }
};
