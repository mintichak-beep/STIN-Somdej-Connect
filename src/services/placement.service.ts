import { Placement } from '../types/db';

export const placementService = {
  getAll: async (): Promise<Placement[]> => [],
  create: async (data: Omit<Placement, 'id'>): Promise<string> => {
    const list = [];
    const newPlacement: Placement = { ...data, id: `pl-${Date.now()}` };
    list.push(newPlacement);
    void 0;
    return newPlacement.id;
  }
};
