import { mockDB } from './mockData';
import { TrainingGroup } from '../types/db';

export const trainingGroupService = {
  subscribe: (callback: (groups: TrainingGroup[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_training_groups') {
        callback(mockDB.getTrainingGroups());
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    // Initial call
    callback(mockDB.getTrainingGroups());
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (): Promise<TrainingGroup[]> => {
    return mockDB.getTrainingGroups();
  },

  create: async (data: Omit<TrainingGroup, 'id'>): Promise<string> => {
    const list = mockDB.getTrainingGroups();
    const newGroup: TrainingGroup = {
      ...data,
      id: `tg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newGroup);
    mockDB.saveTrainingGroups(list);
    return newGroup.id;
  },

  update: async (id: string, data: Partial<TrainingGroup>): Promise<void> => {
    const list = mockDB.getTrainingGroups();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Training Group not found.');
    list[index] = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    mockDB.saveTrainingGroups(list);
  },

  delete: async (id: string): Promise<void> => {
    let list = mockDB.getTrainingGroups();
    list = list.filter(item => item.id !== id);
    mockDB.saveTrainingGroups(list);
  }
};
