import { mockDB } from './mockData';
import { UtilityRecord, UtilityShare } from '../types/db';

export const utilityService = {
  getAll: async (): Promise<UtilityRecord[]> => mockDB.getUtilityRecords(),
  create: async (data: Omit<UtilityRecord, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getUtilityRecords();
    const newRecord: UtilityRecord = { 
        ...data, 
        id: `u-${Date.now()}`, 
        createdAt: new Date().toISOString() 
    };
    list.push(newRecord);
    mockDB.saveUtilityRecords(list);
    
    // Auto-create shares for students (simplified logic)
    // In real app, look up students in that room
    return newRecord.id;
  }
};
