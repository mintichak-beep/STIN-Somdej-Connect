import { mockDB } from './mockData';
import { Dormitory } from '../types/db';

export const dormitoryService = {
  getAll: async (): Promise<Dormitory[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const buildings = mockDB.getBuildings();
    return buildings.filter(b => b.buildingType === 'Dormitory').map(b => ({
      ...b,
      name: b.name,
      contactPerson: 'Staff',
      phone: '02-xxx-xxxx',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin',
      mapLink: '#'
    }));
  },
  create: async (data: Omit<Dormitory, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getBuildings();
    const newDorm: any = { ...data, id: `b-${Date.now()}`, buildingType: 'Dormitory', createdAt: new Date().toISOString() };
    list.push(newDorm);
    mockDB.saveBuildings(list);
    return newDorm.id;
  },
  delete: async (id: string): Promise<void> => {
    let list = mockDB.getBuildings();
    list = list.filter(item => item.id !== id);
    mockDB.saveBuildings(list);
  }
};
