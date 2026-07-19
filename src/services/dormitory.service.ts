import { mockDB } from './mockData';
import { Dormitory } from '../types/db';

export const dormitoryService = {
  getAll: async (): Promise<Dormitory[]> => {
    return mockDB.getBuildings().filter(b => b.buildingType === 'Dormitory');
  },
  create: async (data: Omit<Dormitory, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getBuildings();
    const newDorm: any = { ...data, id: `b-${Date.now()}`, buildingType: 'Dormitory', createdAt: new Date().toISOString() };
    list.push(newDorm);
    mockDB.saveBuildings(list);
    return newDorm.id;
  },
  delete: async (id: string): Promise<void> => {
    let list = mockDB.getBuildings();
    list = list.filter(item => item.id !== id);
    mockDB.saveBuildings(list);
  }
};
