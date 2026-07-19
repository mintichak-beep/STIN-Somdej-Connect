import { AuditLog } from '../types/db';
import { storage } from '../lib/storage';

export const auditService = {
  log: async (userId: string, action: string, targetType: string, targetId: string, description: string = ''): Promise<string> => {
    const list = storage.get<AuditLog[]>('auditLogs') || [];
    const id = crypto.randomUUID();
    const newLog: AuditLog = {
      id,
      userId,
      action,
      targetType,
      targetId,
      description,
      createdAt: new Date().toISOString()
    };
    list.push(newLog);
    storage.set('auditLogs', list);
    return id;
  },
  getAll: async (): Promise<AuditLog[]> => {
    const list = storage.get<AuditLog[]>('auditLogs') || [];
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
};

