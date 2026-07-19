import { SupervisionSchedule, SupervisionRecord } from '../types/db';

export const supervisionService = {
  getSchedules: async (): Promise<SupervisionSchedule[]> => [],
  createSchedule: async (data: Omit<SupervisionSchedule, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newSch: SupervisionSchedule = { ...data, id: `s-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newSch);
    void 0;
    return newSch.id;
  },
  getRecords: async (scheduleId?: string): Promise<SupervisionRecord[]> => {
    const list = [];
    return scheduleId ? list.filter(r => r.scheduleId === scheduleId) : list;
  },
  createRecord: async (data: Omit<SupervisionRecord, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newRec: SupervisionRecord = { ...data, id: `sr-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newRec);
    void 0;
    return newRec.id;
  }
};
