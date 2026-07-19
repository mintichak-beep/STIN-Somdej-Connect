import { Vehicle } from '../types/transportation';

export const vehicleService = {
  subscribe: (callback: (data: Vehicle[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_vehicles') {
        callback([]);
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    callback([]);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (): Promise<Vehicle[]> => [],

  create: async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const list = [];
    const newVehicle: Vehicle = { 
      ...data, 
      id: `v-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newVehicle);
    void 0;
    return newVehicle.id;
  },

  update: async (id: string, data: Partial<Vehicle>): Promise<void> => {
    const list = [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Vehicle not found.');
    list[index] = { ...list[index], ...data, updatedAt: new Date().toISOString() };
    void 0;
  },

  delete: async (id: string): Promise<void> => {
    let list = [];
    list = list.filter(item => item.id !== id);
    void 0;
  }
};
