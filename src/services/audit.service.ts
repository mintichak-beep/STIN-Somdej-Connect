import { AuditLog } from '../types/db';
import { FirestoreService } from './firestore.service';
import { orderBy } from 'firebase/firestore';

const auditFS = new FirestoreService<AuditLog>('auditLogs');

export const auditService = {
  log: async (userId: string, action: string, targetType: string, targetId: string, description: string = ''): Promise<string> => {
    return auditFS.create({
      userId,
      action,
      targetType,
      targetId,
      description
    } as any);
  },
  getAll: async (): Promise<AuditLog[]> => {
    return auditFS.getAll([orderBy('createdAt', 'desc')]);
  }
};

