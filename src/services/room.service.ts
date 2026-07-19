import { mockDB } from './mockData';
import { Room } from '../types/db';

export const roomService = {
  getByDormitory: async (dormitoryId: string): Promise<Room[]> => {
    return mockDB.getRooms().filter(r => r.buildingId === dormitoryId);
  },
  create: async (data: Omit<Room, 'id'>): Promise<string> => {
    const list = mockDB.getRooms();
    const newRoom: Room = { ...data, id: `r-${Date.now()}` } as Room;
    list.push(newRoom);
    mockDB.saveRooms(list);
    return newRoom.id;
  },
  delete: async (id: string): Promise<void> => {
    let list = mockDB.getRooms();
    list = list.filter(item => item.id !== id);
    mockDB.saveRooms(list);
  }
};
