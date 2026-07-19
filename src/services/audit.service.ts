import { mockDB } from './mockData';
import { AuditLog } from '../types/db';

export const auditService = {
  log: async (userId: string, action: string, targetType: string, targetId: string, description: string = ''): Promise<string> => {
    const list = mockDB.getAuditLogs();
    const newLog: AuditLog = {
      id: `al-${Date.now()}`,
      userId,
      action,
      targetType,
      targetId,
      description,
      createdAt: new Date().toISOString()
    };
    list.push(newLog);
    mockDB.saveAuditLogs(list);
    return newLog.id;
  },
  getAll: async (): Promise<AuditLog[]> => mockDB.getAuditLogs()
};
