import { Student } from '../types/db';
import { storage } from '../lib/storage';
import { auditService } from './audit.service';

function getCurrentUserId(): string {
  return 'system';
}

export const studentService = {
  subscribe: (callback: (students: Student[]) => void) => {
    // LocalStorage doesn't support snapshot. Returning current data once.
    const students = storage.get<Student[]>('students') || [];
    callback(students);
    return () => {}; // No-op unsubscribe
  },

  getAll: async (): Promise<Student[]> => {
    return storage.get<Student[]>('students') || [];
  },

  getStudents: async (): Promise<Student[]> => {
    return studentService.getAll();
  },

  getById: async (id: string): Promise<Student | null> => {
    const list = storage.get<Student[]>('students') || [];
    return list.find(s => s.id === id) || null;
  },

  update: async (id: string, data: Partial<Student>): Promise<void> => {
    const list = storage.get<Student[]>('students') || [];
    const index = list.findIndex(s => s.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      storage.set('students', list);
    }
    await auditService.log(getCurrentUserId(), 'UPDATE', 'Student', id, `Updated student`);
  },

  updateStudent: async (id: string, data: Partial<Student>): Promise<void> => {
    return studentService.update(id, data);
  },

  assignPracticeGroup: async (studentId: string, groupId: string): Promise<void> => {
    await studentService.update(studentId, { practiceGroupId: groupId });
  },

  assignHospital: async (studentId: string, hospitalId: string): Promise<void> => {
    await studentService.update(studentId, { hospitalId: hospitalId });
  },

  bulkImport: async (students: any[]): Promise<{ successful: number; failed: number; errors: string[] }> => {
    let successful = 0;
    const errors: string[] = [];
    for (const student of students) {
      try {
        await studentService.create({
          studentId: student.studentId || '',
          email: student.email || '',
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          yearLevel: student.yearLevel || '',
          classGroup: student.classGroup || '',
          phone: student.phone || '',
          status: 'active',
          createdAt: new Date().toISOString()
        } as any);
        successful++;
      } catch (err: any) {
        errors.push(`Error importing ${student.studentId || 'unknown'}: ${err.message}`);
      }
    }
    return { successful, failed: errors.length, errors };
  },

  create: async (data: Omit<Student, 'id'>): Promise<string> => {
    const list = storage.get<Student[]>('students') || [];
    const id = crypto.randomUUID();
    const newStudent = { ...data, id };
    list.push(newStudent);
    storage.set('students', list);
    await auditService.log(getCurrentUserId(), 'CREATE', 'Student', id, `Created student`);
    return id;
  },

  delete: async (id: string): Promise<void> => {
    const list = storage.get<Student[]>('students') || [];
    const newList = list.filter(s => s.id !== id);
    storage.set('students', newList);
    await auditService.log(getCurrentUserId(), 'DELETE', 'Student', id, `Deleted student`);
  }
};
