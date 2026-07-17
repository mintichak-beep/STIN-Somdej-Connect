import { UserProfile } from '../types/auth';

// Sample pre-populated accounts
const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'admin-123',
    email: 'admin@stin.ac.th',
    displayName: 'STIN Administrator',
    role: 'Administrator',
    department: 'Information Technology',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '02-234-5678',
    status: 'active',
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    lastLogin: new Date('2026-07-16T10:00:00Z').toISOString(),
  },
  {
    uid: 'teacher-456',
    email: 'teacher@stin.ac.th',
    displayName: 'Ajarn Somsri',
    role: 'Teacher',
    department: 'Nursing Science',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    phone: '081-234-5678',
    status: 'active',
    createdAt: new Date('2026-02-15T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-02-15T00:00:00Z').toISOString(),
    lastLogin: new Date('2026-07-16T09:30:00Z').toISOString(),
  },
  {
    uid: 'student-789',
    email: 'student@stin.ac.th',
    displayName: 'Nong Somchai',
    role: 'Student',
    department: 'First-Year Nursing Student',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '099-876-5432',
    status: 'active',
    createdAt: new Date('2026-05-10T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-05-10T00:00:00Z').toISOString(),
    lastLogin: new Date('2026-07-16T08:15:00Z').toISOString(),
  }
];

export function initializeDB() {
  if (!localStorage.getItem('cpatms_users')) {
    localStorage.setItem('cpatms_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('cpatms_user_passwords')) {
    const passwords = {
      'admin@stin.ac.th': 'AdminPassword123!',
      'teacher@stin.ac.th': 'TeacherPassword123!',
      'student@stin.ac.th': 'StudentPassword123!'
    };
    localStorage.setItem('cpatms_user_passwords', JSON.stringify(passwords));
  }
}

initializeDB();

export const firebaseSim = {
  getUsers: (): UserProfile[] => {
    initializeDB();
    const data = localStorage.getItem('cpatms_users');
    return data ? JSON.parse(data) : DEFAULT_USERS;
  },
  saveUsers: (users: UserProfile[]) => {
    localStorage.setItem('cpatms_users', JSON.stringify(users));
  },
  getPasswords: (): Record<string, string> => {
    initializeDB();
    const data = localStorage.getItem('cpatms_user_passwords');
    return data ? JSON.parse(data) : {};
  },
  savePasswords: (passwords: Record<string, string>) => {
    localStorage.setItem('cpatms_user_passwords', JSON.stringify(passwords));
  }
};
