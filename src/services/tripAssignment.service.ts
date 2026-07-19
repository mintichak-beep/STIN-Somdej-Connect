import { mockDB } from './mockData';
import { TripAssignment } from '../types/db';

export const tripAssignmentService = {
  getByTrip: async (tripId: string): Promise<TripAssignment[]> => mockDB.getTripAssignments().filter(a => a.tripId === tripId),
  assign: async (tripId: string, studentId: string): Promise<string> => {
    const list = mockDB.getTripAssignments();
    const newAssignment: TripAssignment = { 
        id: `ta-${Date.now()}`, 
        tripId, 
        studentId, 
        assignedDate: new Date().toISOString(), 
        status: 'active' 
    };
    list.push(newAssignment);
    mockDB.saveTripAssignments(list);
    return newAssignment.id;
  }
};
