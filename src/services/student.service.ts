import { Student } from '../types/db';
import { getDb } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, onSnapshot, query } from 'firebase/firestore';
import { auditService } from './audit.service';

function getCurrentUserId(): string {
  // We'll need a better way to get the current user ID, 
  // but for now keeping it simple as requested
  return 'system';
}

export const studentService = {
  subscribe: (callback: (students: Student[]) => void) => {
    const q = query(collection(getDb(), 'students'));
    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      callback(students);
    });
  },

  getAll: async (): Promise<Student[]> => {
    const snapshot = await getDocs(collection(getDb(), 'students'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
  },

  getStudents: async (): Promise<Student[]> => {
    return studentService.getAll();
  },

  update: async (id: string, data: Partial<Student>): Promise<void> => {
    await updateDoc(doc(getDb(), 'students', id), data);
    await auditService.log(getCurrentUserId(), 'UPDATE', 'Student', id, `Updated student`);
  },

  create: async (data: Omit<Student, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(getDb(), 'students'), data);
    await auditService.log(getCurrentUserId(), 'CREATE', 'Student', docRef.id, `Created student`);
    return docRef.id;
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(getDb(), 'students', id));
    await auditService.log(getCurrentUserId(), 'DELETE', 'Student', id, `Deleted student`);
  }
};
