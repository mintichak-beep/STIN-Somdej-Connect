import { mockDB } from './mockData';
import { AuditLog } from '../types/db';

export const auditService = {
  log: async (userId: string, action: string, collectionName: string, documentId: string): Promise<string> => {
    const list = mockDB.getAuditLogs();
    const newLog: AuditLog = {
      id: `al-${Date.now()}`,
      userId,
      action,
      collectionName,
      documentId,
      timestamp: new Date().toISOString()
    };
    list.push(newLog);
    mockDB.saveAuditLogs(list);
    return newLog.id;
  },
  getAll: async (): Promise<AuditLog[]> => mockDB.getAuditLogs()
};
