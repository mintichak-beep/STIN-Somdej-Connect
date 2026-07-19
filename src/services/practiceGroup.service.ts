import { PracticeGroup, Student } from '../types/db';
import { storage } from '../lib/storage';
import { auditService } from './audit.service';

function getCurrentUserId(): string {
  try {
    const user = localStorage.getItem('cpatms_user');
    return user ? JSON.parse(user).uid : 'system';
  } catch {
    return 'system';
  }
}

export const practiceGroupService = {
  subscribe: (callback: () => void) => {
    callback();
    return () => {};
  },

  getAll: async (search: string = ''): Promise<PracticeGroup[]> => {
    let list = storage.get<PracticeGroup[]>('practiceGroups') || [];

    if (search.trim()) {
      const qStr = search.toLowerCase();
      list = list.filter(item => 
        item.name.toLowerCase().includes(qStr)
      );
    }

    return list;
  },

  getById: async (id: string): Promise<PracticeGroup | null> => {
    const list = storage.get<PracticeGroup[]>('practiceGroups') || [];
    return list.find(g => g.id === id) || null;
  },

  create: async (data: Omit<PracticeGroup, 'id' | 'createdAt'>): Promise<PracticeGroup> => {
    const list = storage.get<PracticeGroup[]>('practiceGroups') || [];
    const newGroup: PracticeGroup = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    list.push(newGroup);
    storage.set('practiceGroups', list);
    await auditService.log(getCurrentUserId(), "CREATE", "PracticeGroup", newGroup.id!, "Created practice group");
    return newGroup;
  },

  update: async (id: string, data: Partial<Omit<PracticeGroup, 'id' | 'createdAt'>>): Promise<PracticeGroup> => {
    const list = storage.get<PracticeGroup[]>('practiceGroups') || [];
    const index = list.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Practice group not found');

    const updatedGroup: PracticeGroup = {
      ...list[index],
      ...data
    } as PracticeGroup;

    list[index] = updatedGroup;
    storage.set('practiceGroups', list);
    await auditService.log(getCurrentUserId(), "UPDATE", "PracticeGroup", id, "Updated practice group");
    return updatedGroup;
  },

  getStudentsInGroup: async (groupId: string): Promise<Student[]> => {
    const assignments = storage.get<any[]>('practiceAssignments') || [];
    const studentIdsFromAssignments = assignments
      .filter(a => a.practiceGroupId === groupId)
      .map(a => a.studentId);

    const scheduleAssignments = storage.get<any[]>('practiceScheduleAssignments') || [];
    const studentIdsFromSchedules = scheduleAssignments
      .filter(a => a.practiceGroupId === groupId)
      .map(a => a.studentId);

    const allIds = Array.from(new Set([...studentIdsFromAssignments, ...studentIdsFromSchedules]));

    const students = storage.get<Student[]>('students') || [];

    return students.filter(s => allIds.includes(s.id!) || s.practiceGroupId === groupId);
  }
};

