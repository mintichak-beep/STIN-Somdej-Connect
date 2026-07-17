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
  }
};
