import { mockDB } from './mockData';
import { Van } from '../types/db';

export const vanService = {
  getAll: async (): Promise<Van[]> => mockDB.getVans(),
  create: async (data: Omit<Van, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getVans();
    const newVan: Van = { ...data, id: `v-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newVan);
    mockDB.saveVans(list);
    return newVan.id;
  },
  update: async (id: string, data: Partial<Van>): Promise<void> => {
    let list = mockDB.getVans();
    list = list.map(v => v.id === id ? {...v, ...data} : v);
    mockDB.saveVans(list);
  },
  delete: async (id: string): Promise<void> => {
    let list = mockDB.getVans();
    list = list.filter(item => item.id !== id);
    mockDB.saveVans(list);
  }
};
