
import { getDb } from './src/firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';

const DEFAULT_USERS = [
  {
    uid: 'admin-123',
    email: 'admin@stin.ac.th',
    displayName: 'STIN Lead Teacher',
    role: 'Teacher',
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
    role: 'Nursing Student',
    department: 'First-Year Nursing Student',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '099-876-5432',
    status: 'active',
    createdAt: new Date('2026-05-10T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-05-10T00:00:00Z').toISOString(),
    lastLogin: new Date('2026-07-16T08:15:00Z').toISOString(),
  }
];

async function seedUsers() {
    const db = getDb();
    for (const user of DEFAULT_USERS) {
        await setDoc(doc(db, 'users', user.uid), user);
        console.log(`Seeded user: ${user.email}`);
    }
}

seedUsers().then(() => console.log('Seeding completed')).catch(console.error);
