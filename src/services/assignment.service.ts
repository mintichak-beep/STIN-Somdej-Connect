import { RoomAssignment } from '../types/db';

export const assignmentService = {
  getByRoom: async (roomId: string): Promise<RoomAssignment[]> => {
    return [].filter(a => a.roomId === roomId && a.status === 'active');
  },
  assign: async (roomId: string, studentId: string): Promise<string> => {
    const list = [];
    const newAssignment: RoomAssignment = { 
        id: `a-${Date.now()}`, 
        roomId, 
        studentId, 
        assignedDate: new Date().toISOString(), 
        status: 'active' 
    };
    list.push(newAssignment);
    void 0;
    return newAssignment.id;
  },
  subscribe: (callback: (data: any[]) => void) => {
    const interval = setInterval(async () => {
      const data = [];
      callback(data);
    }, 1000);
    return () => clearInterval(interval);
  }
};
