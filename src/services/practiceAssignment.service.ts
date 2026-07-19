import { mockDB } from './mockData';
import { PracticeAssignment } from '../types/db';

export const practiceAssignmentService = {
  getAll: async (): Promise<PracticeAssignment[]> => mockDB.getPracticeAssignments(),
  
  getByStudentId: async (studentId: string): Promise<PracticeAssignment[]> => {
    return mockDB.getPracticeAssignments().filter(p => p.studentId === studentId);
  },

  create: async (data: Omit<PracticeAssignment, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getPracticeAssignments();
    
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

    const newAssignment: PracticeAssignment = { ...data, id: `pa-${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString() };
    list.push(newAssignment);
    mockDB.savePracticeAssignments(list);
    return newAssignment.id;
  },

  update: async (id: string, data: Partial<PracticeAssignment>): Promise<void> => {
    const list = mockDB.getPracticeAssignments();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Assignment not found');
    list[index] = { ...list[index], ...data };
    mockDB.savePracticeAssignments(list);
  },

  delete: async (id: string): Promise<void> => {
    let list = mockDB.getPracticeAssignments();
    list = list.filter(item => item.id !== id);
    mockDB.savePracticeAssignments(list);
  }
};
