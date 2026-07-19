import { mockDB } from './mockData';
import { PracticeGroup, Student } from '../types/db';
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
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_practice_groups') {
        callback();
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (search: string = ''): Promise<PracticeGroup[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let list = mockDB.getPracticeGroups();

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(item => 
        item.name.toLowerCase().includes(query)
      );
    }

    return list;
  },

  getById: async (id: string): Promise<PracticeGroup | null> => {
    const list = mockDB.getPracticeGroups();
    return list.find(item => item.id === id) || null;
  },

  create: async (data: Omit<PracticeGroup, 'id' | 'createdAt'>): Promise<PracticeGroup> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = mockDB.getPracticeGroups();
    
    const newGroup: PracticeGroup = {
      ...data,
      id: `pg-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    list.push(newGroup);
    mockDB.savePracticeGroups(list);
    await auditService.log(getCurrentUserId(), "CREATE", "PracticeGroup", newGroup.id, "Created practice group");
    return newGroup;
  },

  update: async (id: string, data: Partial<Omit<PracticeGroup, 'id' | 'createdAt'>>): Promise<PracticeGroup> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = mockDB.getPracticeGroups();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Practice group not found');

    const updated: PracticeGroup = {
      ...list[index],
      ...data
    };

    list[index] = updated;
    mockDB.savePracticeGroups(list);
    await auditService.log(getCurrentUserId(), "UPDATE", "PracticeGroup", id, "Updated practice group");
    return updated;
  },

  getStudentsInGroup: async (groupId: string): Promise<Student[]> => {
    const assignments = mockDB.getPracticeAssignments();
    const students = mockDB.getStudents();
    
    const studentIds = assignments
      .filter(a => a.practiceGroupId === groupId)
      .map(a => a.studentId);
      
    // Also check practiceScheduleAssignments
    const scheduleAssignments = mockDB.getPracticeScheduleAssignments();
    const additionalIds = scheduleAssignments
      .filter(a => a.practiceGroupId === groupId)
      .map(a => a.studentId);
      
    const allIds = Array.from(new Set([...studentIds, ...additionalIds]));
    
    return students.filter(s => allIds.includes(s.id));
  }
};
