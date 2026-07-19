import { mockDB } from './mockData';
import { TrainingSite } from '../types/db';

export const trainingSiteService = {
  getAll: async (): Promise<TrainingSite[]> => mockDB.getTrainingSites(),
  create: async (data: Omit<TrainingSite, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getTrainingSites();
    const newSite: TrainingSite = { ...data, id: `ts-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newSite);
    mockDB.saveTrainingSites(list);
    return newSite.id;
  }
};
