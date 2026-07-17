import { mockDB } from './mockData';
import { Driver } from '../types/transportation';

export const driverService = {
  subscribe: (callback: (data: Driver[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_drivers') {
        callback(mockDB.getDrivers());
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    callback(mockDB.getDrivers());
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (): Promise<Driver[]> => mockDB.getDrivers(),

  create: async (data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const list = mockDB.getDrivers();
    const newDriver: Driver = { 
      ...data, 
      id: `d-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newDriver);
    mockDB.saveDrivers(list);
    return newDriver.id;
  },

  update: async (id: string, data: Partial<Driver>): Promise<void> => {
    const list = mockDB.getDrivers();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Driver not found.');
    list[index] = { ...list[index], ...data, updatedAt: new Date().toISOString() };
    mockDB.saveDrivers(list);
  },

  delete: async (id: string): Promise<void> => {
    let list = mockDB.getDrivers();
    list = list.filter(item => item.id !== id);
    mockDB.saveDrivers(list);
  }
};
