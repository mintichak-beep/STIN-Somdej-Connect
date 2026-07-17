import { mockDB } from './mockData';
import { Vehicle } from '../types/transportation';

export const vehicleService = {
  subscribe: (callback: (data: Vehicle[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_vehicles') {
        callback(mockDB.getVehicles());
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    callback(mockDB.getVehicles());
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (): Promise<Vehicle[]> => mockDB.getVehicles(),

  create: async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const list = mockDB.getVehicles();
    const newVehicle: Vehicle = { 
      ...data, 
      id: `v-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newVehicle);
    mockDB.saveVehicles(list);
    return newVehicle.id;
  },

  update: async (id: string, data: Partial<Vehicle>): Promise<void> => {
    const list = mockDB.getVehicles();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Vehicle not found.');
    list[index] = { ...list[index], ...data, updatedAt: new Date().toISOString() };
    mockDB.saveVehicles(list);
  },

  delete: async (id: string): Promise<void> => {
    let list = mockDB.getVehicles();
    list = list.filter(item => item.id !== id);
    mockDB.saveVehicles(list);
  }
};
