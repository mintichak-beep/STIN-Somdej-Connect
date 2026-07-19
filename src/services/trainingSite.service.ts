import { TrainingSite } from '../types/db';

export const trainingSiteService = {
  getAll: async (): Promise<TrainingSite[]> => [],
  create: async (data: Omit<TrainingSite, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newSite: TrainingSite = { ...data, id: `ts-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newSite);
    void 0;
    return newSite.id;
  }
};
