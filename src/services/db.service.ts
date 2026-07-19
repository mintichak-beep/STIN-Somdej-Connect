import { storage } from '../lib/storage';

// -------------------------------------------------------------------------
// TypeScript Types
// -------------------------------------------------------------------------
// (Types remain the same)

export interface Student {
  id?: string;
  studentId: string; // e.g. "63123456"
  firstName: string;
  lastName: string;
  fullName: string;
  yearLevel: string;
  classGroup: string;
  phone: string;
  roomNumber: string; // Dorm room
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Room {
  id?: string;
  roomNumber: string; // e.g. "101"
  building: string;   // e.g. "ตึก A"
  floor: string;      // e.g. "1"
  gender: 'male' | 'female' | 'any';
  capacity: number;
  studentIds: string[]; // List of student.studentId or student.id in this room
  createdAt: string;
}

export interface Payment {
  id?: string;
  studentId: string;
  fullName: string;
  roomNumber: string;
  month: string; // e.g. "2026-07"
  expenseType: 'water' | 'electricity' | 'rent' | 'other';
  amount: number;
  slipUrl: string; // Base64 dataURL for perfect offline/preview durability
  status: 'pending' | 'approved' | 'rejected';
  notes?: string; // Rejection reason
  createdAt: string;
  verifiedAt?: string;
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  category: 'general' | 'urgent' | 'maintenance' | 'event';
  createdAt: string;
}

export interface Issue {
  id?: string;
  studentId: string;
  fullName: string;
  roomNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved';
  createdAt: string;
}

export interface Setting {
  adminPin: string;
  updatedAt: string;
}

// -------------------------------------------------------------------------
// DB Services
// -------------------------------------------------------------------------

export const dbService = {
  // --- Admin PIN Settings ---
  getAdminPin: async (): Promise<string> => {
    const settings = storage.get<Setting>('system_config');
    if (settings) {
      return settings.adminPin || '123456';
    }
    // Initialize default PIN
    const defaultSetting: Setting = {
      adminPin: '123456',
      updatedAt: new Date().toISOString()
    };
    storage.set('system_config', defaultSetting);
    return '123456';
  },

  updateAdminPin: async (newPin: string): Promise<void> => {
    storage.set('system_config', {
      adminPin: newPin,
      updatedAt: new Date().toISOString()
    });
  },

  // --- Students ---
  getStudents: async (): Promise<Student[]> => {
    const list = storage.get<Student[]>('students') || [];
    // Sort by studentId
    return list.sort((a, b) => a.studentId.localeCompare(b.studentId));
  },

  createStudent: async (student: Omit<Student, 'id'>): Promise<string> => {
    const list = storage.get<Student[]>('students') || [];
    const newStudent: Student = {
      ...student,
      id: crypto.randomUUID(),
      fullName: `${student.firstName} ${student.lastName}`.trim(),
      createdAt: student.createdAt || new Date().toISOString()
    };
    list.push(newStudent);
    storage.set('students', list);
    return newStudent.id!;
  },

  updateStudent: async (id: string, data: Partial<Student>): Promise<void> => {
    const list = storage.get<Student[]>('students') || [];
    const index = list.findIndex(s => s.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      if (data.firstName || data.lastName) {
        list[index].fullName = `${list[index].firstName} ${list[index].lastName}`.trim();
      }
      storage.set('students', list);
    }
  },

  deleteStudent: async (id: string): Promise<void> => {
    const list = storage.get<Student[]>('students') || [];
    const newList = list.filter(s => s.id !== id);
    storage.set('students', newList);
  },

  bulkImportStudents: async (students: Omit<Student, 'id' | 'createdAt'>[]): Promise<{ successful: number; errors: string[] }> => {
    let successful = 0;
    const errors: string[] = [];
    for (const item of students) {
      try {
        await dbService.createStudent({
          ...item,
          status: 'active',
          createdAt: new Date().toISOString()
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
    const list = storage.get<Room[]>('rooms') || [];
    return list.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  },

  createRoom: async (room: Omit<Room, 'id'>): Promise<string> => {
    const list = storage.get<Room[]>('rooms') || [];
    const newRoom: Room = {
      ...room,
      id: crypto.randomUUID(),
      createdAt: room.createdAt || new Date().toISOString()
    };
    list.push(newRoom);
    storage.set('rooms', list);
    return newRoom.id!;
  },

  updateRoom: async (id: string, data: Partial<Room>): Promise<void> => {
    const list = storage.get<Room[]>('rooms') || [];
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      storage.set('rooms', list);
    }
  },

  deleteRoom: async (id: string): Promise<void> => {
    const list = storage.get<Room[]>('rooms') || [];
    const newList = list.filter(r => r.id !== id);
    storage.set('rooms', newList);
  },

  // --- Payments / Slips ---
  getPayments: async (): Promise<Payment[]> => {
    const list = storage.get<Payment[]>('payments') || [];
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  createPayment: async (payment: Omit<Payment, 'id'>): Promise<string> => {
    const list = storage.get<Payment[]>('payments') || [];
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      createdAt: payment.createdAt || new Date().toISOString()
    };
    list.push(newPayment);
    storage.set('payments', list);
    return newPayment.id!;
  },

  updatePaymentStatus: async (id: string, status: 'approved' | 'rejected', notes?: string): Promise<void> => {
    const list = storage.get<Payment[]>('payments') || [];
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        status,
        notes: notes || '',
        verifiedAt: new Date().toISOString()
      };
      storage.set('payments', list);
    }
  },

  deletePayment: async (id: string): Promise<void> => {
    const list = storage.get<Payment[]>('payments') || [];
    const newList = list.filter(p => p.id !== id);
    storage.set('payments', newList);
  },

  // --- Announcements ---
  getAnnouncements: async (): Promise<Announcement[]> => {
    const list = storage.get<Announcement[]>('announcements') || [];
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  createAnnouncement: async (announcement: Omit<Announcement, 'id'>): Promise<string> => {
    const list = storage.get<Announcement[]>('announcements') || [];
    const newAnnouncement: Announcement = {
      ...announcement,
      id: crypto.randomUUID(),
      createdAt: announcement.createdAt || new Date().toISOString()
    };
    list.push(newAnnouncement);
    storage.set('announcements', list);
    return newAnnouncement.id!;
  },

  updateAnnouncement: async (id: string, data: Partial<Announcement>): Promise<void> => {
    const list = storage.get<Announcement[]>('announcements') || [];
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      storage.set('announcements', list);
    }
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    const list = storage.get<Announcement[]>('announcements') || [];
    const newList = list.filter(a => a.id !== id);
    storage.set('announcements', newList);
  },

  // --- Issues / Reports ---
  getIssues: async (): Promise<Issue[]> => {
    const list = storage.get<Issue[]>('issues') || [];
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  createIssue: async (issue: Omit<Issue, 'id'>): Promise<string> => {
    const list = storage.get<Issue[]>('issues') || [];
    const newIssue: Issue = {
      ...issue,
      id: crypto.randomUUID(),
      createdAt: issue.createdAt || new Date().toISOString()
    };
    list.push(newIssue);
    storage.set('issues', list);
    return newIssue.id!;
  },

  updateIssueStatus: async (id: string, status: 'pending' | 'investigating' | 'resolved'): Promise<void> => {
    const list = storage.get<Issue[]>('issues') || [];
    const index = list.findIndex(i => i.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], status };
      storage.set('issues', list);
    }
  },

  deleteIssue: async (id: string): Promise<void> => {
    const list = storage.get<Issue[]>('issues') || [];
    const newList = list.filter(i => i.id !== id);
    storage.set('issues', newList);
  },

  // --- Auto-seeding Initial Data ---
  autoSeed: async (): Promise<void> => {
    // 1. Check & Seed Settings / PIN
    const settings = storage.get<Setting>('system_config');
    if (!settings) {
      storage.set('system_config', {
        adminPin: '123456',
        updatedAt: new Date().toISOString()
      });
      console.log('Seeded Admin PIN setting.');
    }

    // 2. Check Announcements
    const announcements = storage.get<Announcement[]>('announcements');
    if (!announcements || announcements.length === 0) {
      const mockAnnouncements: Announcement[] = [
        {
          id: crypto.randomUUID(),
          title: 'แจ้งกำหนดการชำระค่าน้ำ-ค่าไฟ หอพักนักศึกษาหญิง ประจำเดือนกรกฎาคม 2569',
          content: 'ขอให้นักศึกษาทุกห้องพักทำการตรวจสอบหน่วยการใช้งานมิเตอร์ และทำการชำระเงินพร้อมอัปโหลดหลักฐานการชำระเงิน (Slip) ผ่านช่องทางระบบออนไลน์ของวิทยาลัยภายในวันที่ 5 สิงหาคม 2569 เพื่อหลีกเลี่ยงการเสียค่าปรับล่าช้า ขอขอบคุณในความร่วมมือค่ะ',
          category: 'urgent',
          createdAt: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          title: 'แจ้งปิดปรับปรุงระบบประปาเพื่อซ่อมบำรุงปั๊มน้ำชั้น 4',
          content: 'ในวันศุกร์ที่ 24 กรกฎาคม 2569 เวลา 09:00 - 12:00 น. ทางเจ้าหน้าที่อาคารจะดำเนินการปิดน้ำประปาชั่วคราวเพื่อทำความสะอาดและซ่อมบำรุงปั๊มน้ำหอพัก ขอให้นักศึกษาสำรองน้ำประปาไว้ใช้ล่วงหน้า ขออภัยในความไม่สะดวกมา ณ ที่นี้',
          category: 'maintenance',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: crypto.randomUUID(),
          title: 'ประชาสัมพันธ์กิจกรรมบำเพ็ญประโยชน์จิตอาสาพัฒนาสิ่งแวดล้อมหอพัก',
          content: 'เชิญชวนตัวแทนนักศึกษาหอพักหญิงชั้นละ 5 คน เข้าร่วมกิจกรรมบิ๊กคลีนนิ่งเดย์ พัฒนาสวนหย่อมรอบตึกพักอาศัย ในวันเสาร์นี้ เวลา 16:30 น. เป็นต้นไป มีชั่วโมงกิจกรรมให้ผู้เข้าร่วม 2 ชั่วโมง',
          category: 'general',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ];
      storage.set('announcements', mockAnnouncements);
      console.log('Seeded initial announcements.');
    }

    // 3. Check Rooms
    const rooms = storage.get<Room[]>('rooms');
    if (!rooms || rooms.length === 0) {
      const mockRooms: Room[] = [
        {
          id: crypto.randomUUID(),
          roomNumber: '101',
          building: 'อาคารหอพักหญิง 1 (เรือนรักกัลยา)',
          floor: '1',
          gender: 'female',
          capacity: 4,
          studentIds: ['6612001', '6612002'],
          createdAt: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          roomNumber: '102',
          building: 'อาคารหอพักหญิง 1 (เรือนรักกัลยา)',
          floor: '1',
          gender: 'female',
          capacity: 4,
          studentIds: ['6612003', '6612004'],
          createdAt: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          roomNumber: '201',
          building: 'อาคารหอพักหญิง 1 (เรือนรักกัลยา)',
          floor: '2',
          gender: 'female',
          capacity: 4,
          studentIds: [],
          createdAt: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          roomNumber: '202',
          building: 'อาคารหอพักหญิง 1 (เรือนรักกัลยา)',
          floor: '2',
          gender: 'female',
          capacity: 4,
          studentIds: [],
          createdAt: new Date().toISOString()
        }
      ];
      storage.set('rooms', mockRooms);
      console.log('Seeded initial rooms.');
    }

    // 4. Check Students
    const students = storage.get<Student[]>('students');
    if (!students || students.length === 0) {
      const mockStudents: Student[] = [
        {
          id: crypto.randomUUID(),
          studentId: '6612001',
          firstName: 'มินทรา',
          lastName: 'รักษ์ดี',
          fullName: 'มินทรา รักษ์ดี',
          yearLevel: 'ชั้นปีที่ 2',
          classGroup: 'กลุ่ม A',
          phone: '081-234-5678',
          roomNumber: '101',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          studentId: '6612002',
          firstName: 'ณิชา',
          lastName: 'แก้วมณี',
          fullName: 'ณิชา แก้วมณี',
          yearLevel: 'ชั้นปีที่ 2',
          classGroup: 'กลุ่ม A',
          phone: '082-345-6789',
          roomNumber: '101',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          studentId: '6612003',
          firstName: 'สิริมา',
          lastName: 'ใจใส',
          fullName: 'สิริมา ใจใส',
          yearLevel: 'ชั้นปีที่ 2',
          classGroup: 'กลุ่ม B',
          phone: '083-456-7890',
          roomNumber: '102',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          studentId: '6612004',
          firstName: 'พรลภัส',
          lastName: 'ดีเลิศ',
          fullName: 'พรลภัส ดีเลิศ',
          yearLevel: 'ชั้นปีที่ 2',
          classGroup: 'กลุ่ม B',
          phone: '084-567-8901',
          roomNumber: '102',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      storage.set('students', mockStudents);
      console.log('Seeded initial students.');
    }
  }
};
