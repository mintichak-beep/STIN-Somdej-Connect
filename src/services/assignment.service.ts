import { mockDB } from './mockData';
import { RoomAssignment } from '../types/db';

export const assignmentService = {
  getByRoom: async (roomId: string): Promise<RoomAssignment[]> => {
    return mockDB.getRoomAssignments().filter(a => a.roomId === roomId && a.status === 'active');
  },
  assign: async (roomId: string, studentId: string): Promise<string> => {
    const list = mockDB.getRoomAssignments();
    const newAssignment: RoomAssignment = { 
        id: `a-${Date.now()}`, 
        roomId, 
        studentId, 
        assignedDate: new Date().toISOString(), 
        status: 'active' 
    };
    list.push(newAssignment);
    mockDB.saveRoomAssignments(list);
    return newAssignment.id;
  },
  subscribe: (callback: (data: any[]) => void) => {
    const interval = setInterval(async () => {
      const data = mockDB.getRoomAssignments();
      callback(data);
    }, 1000);
    return () => clearInterval(interval);
  }
};
