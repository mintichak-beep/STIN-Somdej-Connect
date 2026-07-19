import { UtilityRecord, UtilityShare } from '../types/db';

export const utilityService = {
  getAll: async (): Promise<UtilityRecord[]> => [],
  create: async (data: Omit<UtilityRecord, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newRecord: UtilityRecord = { 
        ...data, 
        id: `u-${Date.now()}`, 
        createdAt: new Date().toISOString() 
    };
    list.push(newRecord);
    void 0;
    
    // Auto-create shares for students (simplified logic)
    // In real app, look up students in that room
    return newRecord.id;
  }
};
