import { mockDB } from './mockData';
import { TransportSchedule } from '../types/transportation';

export const transportService = {
  subscribe: (callback: (data: TransportSchedule[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_transport_schedules') {
        callback(mockDB.getTransportSchedules());
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    callback(mockDB.getTransportSchedules());
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (): Promise<TransportSchedule[]> => mockDB.getTransportSchedules(),

  create: async (data: Omit<TransportSchedule, 'id'>): Promise<string> => {
    const list = mockDB.getTransportSchedules();
    const newSchedule: TransportSchedule = { ...data, id: `ts-${Date.now()}` };
    list.push(newSchedule);
    mockDB.saveTransportSchedules(list);
    return newSchedule.id;
  },

  update: async (id: string, data: Partial<TransportSchedule>): Promise<void> => {
    const list = mockDB.getTransportSchedules();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Schedule not found.');
    list[index] = { ...list[index], ...data };
    mockDB.saveTransportSchedules(list);
  },

  delete: async (id: string): Promise<void> => {
    let list = mockDB.getTransportSchedules();
    list = list.filter(item => item.id !== id);
    mockDB.saveTransportSchedules(list);
  }
};
