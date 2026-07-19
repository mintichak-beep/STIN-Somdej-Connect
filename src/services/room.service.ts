import { Room } from '../types/db';
import { storage } from '../lib/storage';

export const roomService = {
  getById: async (id: string): Promise<Room | null> => {
    const list = storage.get<Room[]>('rooms') || [];
    return list.find(r => r.id === id) || null;
  },
  getByDormitory: async (dormitoryId: string): Promise<Room[]> => {
    const list = storage.get<Room[]>('rooms') || [];
    return list.filter(r => r.buildingId === dormitoryId);
  },
  create: async (data: Omit<Room, 'id'>): Promise<string> => {
    const list = storage.get<Room[]>('rooms') || [];
    const id = `r-${Date.now()}`;
    const newRoom: Room = { ...data, id } as Room;
    list.push(newRoom);
    storage.set('rooms', list);
    return newRoom.id;
  },
  delete: async (id: string): Promise<void> => {
    let list = storage.get<Room[]>('rooms') || [];
    list = list.filter(item => item.id !== id);
    storage.set('rooms', list);
  }
};
