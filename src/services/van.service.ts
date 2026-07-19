import { Van } from '../types/db';

export const vanService = {
  getAll: async (): Promise<Van[]> => [],
  create: async (data: Omit<Van, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newVan: Van = { ...data, id: `v-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newVan);
    void 0;
    return newVan.id;
  },
  update: async (id: string, data: Partial<Van>): Promise<void> => {
    let list = [];
    list = list.map(v => v.id === id ? {...v, ...data} : v);
    void 0;
  },
  delete: async (id: string): Promise<void> => {
    let list = [];
    list = list.filter(item => item.id !== id);
    void 0;
  }
};
