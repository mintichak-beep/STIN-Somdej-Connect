import { FirestoreService } from './firestore.service';
import { orderBy, where, QueryConstraint } from 'firebase/firestore';

// -------------------------------------------------------------------------
// TypeScript Types
// -------------------------------------------------------------------------

export interface Student {
  id?: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  yearLevel: string;
  classGroup: string;
  phone: string;
  roomNumber: string;
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}

export interface Room {
  id?: string;
  roomNumber: string;
  building: string;
  floor: string;
  gender: 'male' | 'female' | 'any';
  capacity: number;
  studentIds: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Payment {
  id?: string;
  studentId: string;
  fullName: string;
  roomNumber: string;
  month: string;
  expenseType: 'water' | 'electricity' | 'rent' | 'other';
  amount: number;
  slipUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt?: any;
  verifiedAt?: any;
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  category: 'general' | 'urgent' | 'maintenance' | 'event';
  createdAt?: any;
  updatedAt?: any;
}

export interface Issue {
  id?: string;
  studentId: string;
  fullName: string;
  roomNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved';
  createdAt?: any;
  updatedAt?: any;
}

export interface Setting {
  id?: string;
  adminPin: string;
  updatedAt?: any;
}

// -------------------------------------------------------------------------
// Firestore Services
// -------------------------------------------------------------------------

const studentFS = new FirestoreService<Student>('students');
const roomFS = new FirestoreService<Room>('rooms');
const paymentFS = new FirestoreService<Payment>('payments');
const announcementFS = new FirestoreService<Announcement>('announcements');
const issueFS = new FirestoreService<Issue>('issues');
const configFS = new FirestoreService<Setting>('system_config');

export const dbService = {
  // --- Admin PIN Settings ---
  getAdminPin: async (): Promise<string> => {
    const config = await configFS.getById('admin_pin');
    if (config) {
      return config.adminPin;
    }
    // Initialize default PIN
    await configFS.createWithId('admin_pin', { adminPin: '123456' });
    return '123456';
  },

  updateAdminPin: async (newPin: string): Promise<void> => {
    await configFS.update('admin_pin', { adminPin: newPin });
  },

  // --- Students ---
  getStudents: async (): Promise<Student[]> => {
    return studentFS.getAll([orderBy('studentId', 'asc')]);
  },

  createStudent: async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const fullName = `${student.firstName} ${student.lastName}`.trim();
    return studentFS.create({ ...student, fullName } as any);
  },

  updateStudent: async (id: string, data: Partial<Student>): Promise<void> => {
    if (data.firstName || data.lastName) {
      const existing = await studentFS.getById(id);
      if (existing) {
        const firstName = data.firstName || existing.firstName;
        const lastName = data.lastName || existing.lastName;
        data.fullName = `${firstName} ${lastName}`.trim();
      }
    }
    await studentFS.update(id, data);
  },

  deleteStudent: async (id: string): Promise<void> => {
    await studentFS.delete(id);
  },

  bulkImportStudents: async (students: Omit<Student, 'id' | 'createdAt'>[]): Promise<{ successful: number; errors: string[] }> => {
    let successful = 0;
    const errors: string[] = [];
    for (const item of students) {
      try {
        await dbService.createStudent({
          ...item,
          status: 'active'
        });
        successful++;
      } catch (err: any) {
        errors.push(`เกิดข้อผิดพลาดในการนำเข้า รหัสนักศึกษา ${item.studentId}: ${err.message}`);
      }
    }
    return { successful, errors };
  },

  // --- Rooms ---
  getRooms: async (): Promise<Room[]> => {
    return roomFS.getAll([orderBy('roomNumber', 'asc')]);
  },

  createRoom: async (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return roomFS.create(room as any);
  },

  updateRoom: async (id: string, data: Partial<Room>): Promise<void> => {
    await roomFS.update(id, data);
  },

  deleteRoom: async (id: string): Promise<void> => {
    await roomFS.delete(id);
  },

  // --- Payments / Slips ---
  getPayments: async (): Promise<Payment[]> => {
    return paymentFS.getAll([orderBy('createdAt', 'desc')]);
  },

  createPayment: async (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return paymentFS.create({ ...payment, status: 'pending' } as any);
  },

  updatePaymentStatus: async (id: string, status: 'approved' | 'rejected', notes?: string): Promise<void> => {
    await paymentFS.update(id, { status, notes, verifiedAt: new Date() } as any);
  },

  deletePayment: async (id: string): Promise<void> => {
    await paymentFS.delete(id);
  },

  // --- Announcements ---
  getAnnouncements: async (): Promise<Announcement[]> => {
    return announcementFS.getAll([orderBy('createdAt', 'desc')]);
  },

  createAnnouncement: async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return announcementFS.create(announcement as any);
  },

  updateAnnouncement: async (id: string, data: Partial<Announcement>): Promise<void> => {
    await announcementFS.update(id, data);
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    await announcementFS.delete(id);
  },

  // --- Issues / Reports ---
  getIssues: async (): Promise<Issue[]> => {
    return issueFS.getAll([orderBy('createdAt', 'desc')]);
  },

  createIssue: async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return issueFS.create({ ...issue, status: 'pending' } as any);
  },

  updateIssueStatus: async (id: string, status: 'pending' | 'investigating' | 'resolved'): Promise<void> => {
    await issueFS.update(id, { status });
  },

  deleteIssue: async (id: string): Promise<void> => {
    await issueFS.delete(id);
  },

  // --- Auto-seeding Initial Data ---
  autoSeed: async (): Promise<void> => {
    // Removed localStorage seeding logic as we use Firestore now.
    // Real seeding can be done via seed.service.ts
    console.log('Use seed.service.ts for Firestore seeding.');
  }
};
