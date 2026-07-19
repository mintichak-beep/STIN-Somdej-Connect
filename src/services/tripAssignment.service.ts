import { TripAssignment } from '../types/db';

export const tripAssignmentService = {
  getByTrip: async (tripId: string): Promise<TripAssignment[]> => [].filter(a => a.tripId === tripId),
  assign: async (tripId: string, studentId: string): Promise<string> => {
    const list = [];
    const newAssignment: TripAssignment = { 
        id: `ta-${Date.now()}`, 
        tripId, 
        studentId, 
        assignedDate: new Date().toISOString(), 
        status: 'active' 
    };
    list.push(newAssignment);
    void 0;
    return newAssignment.id;
  }
};
