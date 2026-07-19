import { mockDB } from './mockData';
import { Placement } from '../types/db';

export const placementService = {
  getAll: async (): Promise<Placement[]> => mockDB.getPlacements(),
  create: async (data: Omit<Placement, 'id'>): Promise<string> => {
    const list = mockDB.getPlacements();
    const newPlacement: Placement = { ...data, id: `pl-${Date.now()}` };
    list.push(newPlacement);
    mockDB.savePlacements(list);
    return newPlacement.id;
  }
};
