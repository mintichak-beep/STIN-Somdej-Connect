import { Trip } from '../types/db';

export const tripService = {
  getAll: async (): Promise<Trip[]> => [],
  create: async (data: Omit<Trip, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newTrip: Trip = { ...data, id: `t-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newTrip);
    void 0;
    return newTrip.id;
  },
  update: async (id: string, data: Partial<Trip>): Promise<void> => {
    let list = [];
    list = list.map(t => t.id === id ? {...t, ...data} : t);
    void 0;
  },
  delete: async (id: string): Promise<void> => {
    let list = [];
    list = list.filter(item => item.id !== id);
    void 0;
  }
};
