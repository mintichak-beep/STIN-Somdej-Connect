import { mockDB } from './mockData';
import { CommunicationLog } from '../types/db';

export const communicationService = {
  getAll: async (): Promise<CommunicationLog[]> => mockDB.getCommunicationLogs(),
  create: async (data: Omit<CommunicationLog, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getCommunicationLogs();
    const newLog: CommunicationLog = { ...data, id: `cl-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newLog);
    mockDB.saveCommunicationLogs(list);
    return newLog.id;
  }
};
