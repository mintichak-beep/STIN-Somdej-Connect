import { Student } from '../types/db';
import { FirestoreService } from './firestore.service';
import { auditService } from './audit.service';
import { QueryConstraint, orderBy } from 'firebase/firestore';

const studentFS = new FirestoreService<Student>('students');

function getCurrentUserId(): string {
  return 'system';
}

export const studentService = {
  subscribe: (callback: (students: Student[]) => void) => {
    return studentFS.onSnapshot([orderBy('studentId', 'asc')], callback);
  },

  getAll: async (): Promise<Student[]> => {
    return studentFS.getAll([orderBy('studentId', 'asc')]);
  },

  getStudents: async (): Promise<Student[]> => {
    return studentService.getAll();
  },

  getById: async (id: string): Promise<Student | null> => {
    return studentFS.getById(id);
  },

  update: async (id: string, data: Partial<Student>): Promise<void> => {
    await studentFS.update(id, data);
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
    const id = await studentFS.create(data);
    await auditService.log(getCurrentUserId(), 'CREATE', 'Student', id, `Created student`);
    return id;
  },

  delete: async (id: string): Promise<void> => {
    await studentFS.delete(id);
    await auditService.log(getCurrentUserId(), 'DELETE', 'Student', id, `Deleted student`);
  }
};
