import { Driver } from '../types/transportation';

export const driverService = {
  subscribe: (callback: (data: Driver[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_drivers') {
        callback([]);
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    callback([]);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (): Promise<Driver[]> => [],

  create: async (data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const list = [];
    const newDriver: Driver = { 
      ...data, 
      id: `d-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newDriver);
    void 0;
    return newDriver.id;
  },

  update: async (id: string, data: Partial<Driver>): Promise<void> => {
    const list = [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Driver not found.');
    list[index] = { ...list[index], ...data, updatedAt: new Date().toISOString() };
    void 0;
  },

  delete: async (id: string): Promise<void> => {
    let list = [];
    list = list.filter(item => item.id !== id);
    void 0;
  }
};
