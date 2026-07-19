import { TransportSchedule } from '../types/transportation';

export const transportService = {
  subscribe: (callback: (data: TransportSchedule[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_transport_schedules') {
        callback([]);
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    callback([]);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (): Promise<TransportSchedule[]> => [],

  create: async (data: Omit<TransportSchedule, 'id'>): Promise<string> => {
    const list = [];
    const newSchedule: TransportSchedule = { ...data, id: `ts-${Date.now()}` };
    list.push(newSchedule);
    void 0;
    return newSchedule.id;
  },

  update: async (id: string, data: Partial<TransportSchedule>): Promise<void> => {
    const list = [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Schedule not found.');
    list[index] = { ...list[index], ...data };
    void 0;
  },

  delete: async (id: string): Promise<void> => {
    let list = [];
    list = list.filter(item => item.id !== id);
    void 0;
  }
};
