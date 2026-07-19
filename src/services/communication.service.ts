import { CommunicationLog } from '../types/db';

export const communicationService = {
  getAll: async (): Promise<CommunicationLog[]> => [],
  create: async (data: Omit<CommunicationLog, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newLog: CommunicationLog = { ...data, id: `cl-${Date.now()}`, createdAt: new Date().toISOString() };
    list.push(newLog);
    void 0;
    return newLog.id;
  }
};
