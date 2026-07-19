import { mockDB } from './mockData';
import { SupervisionSchedule, SupervisionRecord } from '../types/db';

export const supervisionService = {
  getSchedules: async (): Promise<SupervisionSchedule[]> => mockDB.getSupervisionSchedules(),
  createSchedule: async (data: Omit<SupervisionSchedule, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getSupervisionSchedules();
    const newSch: SupervisionSchedule = { ...data, id: `s-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newSch);
    mockDB.saveSupervisionSchedules(list);
    return newSch.id;
  },
  getRecords: async (scheduleId?: string): Promise<SupervisionRecord[]> => {
    const list = mockDB.getSupervisionRecords();
    return scheduleId ? list.filter(r => r.scheduleId === scheduleId) : list;
  },
  createRecord: async (data: Omit<SupervisionRecord, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getSupervisionRecords();
    const newRec: SupervisionRecord = { ...data, id: `sr-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newRec);
    mockDB.saveSupervisionRecords(list);
    return newRec.id;
  }
};
