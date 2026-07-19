import { Room } from '../types/db';
import { FirestoreService } from './firestore.service';
import { orderBy } from 'firebase/firestore';

const roomFS = new FirestoreService<Room>('rooms');

export const roomService = {
  getById: async (id: string): Promise<Room | null> => {
    return roomFS.getById(id);
  },
  getByDormitory: async (dormitoryId: string): Promise<Room[]> => {
    return roomFS.getAll([orderBy('roomNumber', 'asc')]).then(rooms => 
      rooms.filter(r => r.dormitoryId === dormitoryId || r.buildingId === dormitoryId)
    );
  },
  getAll: async (): Promise<Room[]> => {
    return roomFS.getAll([orderBy('roomNumber', 'asc')]);
  },
  create: async (data: Omit<Room, 'id'>): Promise<string> => {
    return roomFS.create(data);
  },
  update: async (id: string, data: Partial<Room>): Promise<void> => {
    return roomFS.update(id, data);
  },
  delete: async (id: string): Promise<void> => {
    return roomFS.delete(id);
  }
};
