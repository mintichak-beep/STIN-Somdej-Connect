import { mockDB } from './mockData';
import { Student } from '../types/db';

export const studentService = {
  subscribe: (callback: (students: Student[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_students') {
        callback(mockDB.getStudents());
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    // Initial call
    callback(mockDB.getStudents());
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (): Promise<Student[]> => {
    return mockDB.getStudents();
  },

  create: async (data: Omit<Student, 'id'>): Promise<string> => {
    const list = mockDB.getStudents();
    const newStudent: Student = { ...data, id: `s-${Date.now()}` } as Student;
    list.push(newStudent);
    mockDB.saveStudents(list);
    return newStudent.id;
  },

  update: async (id: string, data: Partial<Student>): Promise<void> => {
    const list = mockDB.getStudents();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Student not found.');
    list[index] = { ...list[index], ...data };
    mockDB.saveStudents(list);
  },

  delete: async (id: string): Promise<void> => {
    let list = mockDB.getStudents();
    list = list.filter(item => item.id !== id);
    mockDB.saveStudents(list);
  },

  bulkImport: async (students: Omit<Student, 'id' | 'createdAt' | 'status'>[]): Promise<{ successful: number, failed: number, errors: any[] }> => {
    const list = mockDB.getStudents();
    let successful = 0;
    let failed = 0;
    const errors: any[] = [];
    
    students.forEach(s => {
      // Validate
      const studentIdNum = parseInt(s.studentId, 10);
      if (isNaN(studentIdNum) || s.studentId.length !== 7 || studentIdNum < 6610001 || studentIdNum > 6710230) {
        failed++;
        errors.push({ studentId: s.studentId, problem: 'Invalid length or out of range' });
        return;
      }
      if (list.some(existing => existing.studentId === s.studentId)) {
        failed++;
        errors.push({ studentId: s.studentId, problem: 'Duplicate student ID' });
        return;
      }
      
      const newStudent: Student = {
        ...s,
        id: `s-${Date.now()}-${Math.random()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        email: s.email || `${s.studentId}@stin.ac.th`,
        fullName: s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
      };
      
      list.push(newStudent);
      successful++;
    });
    
    if (successful > 0) {
        mockDB.saveStudents(list);
    }
    
    return { successful, failed, errors };
  }
};
