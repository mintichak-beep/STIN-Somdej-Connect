import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, updateDoc, deleteDoc, doc, Timestamp, where } from 'firebase/firestore';
import { PracticeSite } from '../types/practiceSite';

const COLLECTION_NAME = 'practiceSites';

export const practiceSiteService = {
  async createPracticeSite(site: Omit<PracticeSite, 'id' | 'createdAt' | 'updatedAt'>) {
    // Unique check
    const q = query(collection(db, COLLECTION_NAME), where('code', '==', site.code));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) throw new Error('Practice Site Code already exists');

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...site,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getPracticeSites() {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as PracticeSite[];
  },

  async updatePracticeSite(id: string, site: Partial<Omit<PracticeSite, 'id' | 'createdAt' | 'updatedAt'>>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...site,
      updatedAt: Timestamp.now(),
    });
  },

  async deletePracticeSite(id: string) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },
};
