import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, Timestamp } from 'firebase/firestore';
import { Timetable } from '../types/timetable';

const COLLECTION_NAME = 'timetables';

export const timetableService = {
  async createTimetable(timetable: Omit<Timetable, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...timetable,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getTimetables() {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Timetable[];
  },
};
