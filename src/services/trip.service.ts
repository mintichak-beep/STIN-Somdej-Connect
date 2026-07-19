import { mockDB } from './mockData';
import { Trip } from '../types/db';

export const tripService = {
  getAll: async (): Promise<Trip[]> => mockDB.getTrips(),
  create: async (data: Omit<Trip, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getTrips();
    const newTrip: Trip = { ...data, id: `t-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newTrip);
    mockDB.saveTrips(list);
    return newTrip.id;
  },
  update: async (id: string, data: Partial<Trip>): Promise<void> => {
    let list = mockDB.getTrips();
    list = list.map(t => t.id === id ? {...t, ...data} : t);
    mockDB.saveTrips(list);
  },
  delete: async (id: string): Promise<void> => {
    let list = mockDB.getTrips();
    list = list.filter(item => item.id !== id);
    mockDB.saveTrips(list);
  }
};
