import { mockDB } from './mockData';
import { TransportAssignment } from '../types/transportation';

export const assignmentService = {
  subscribe: (callback: (data: TransportAssignment[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_transport_assignments') {
        callback(mockDB.getTransportAssignments());
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    callback(mockDB.getTransportAssignments());
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (): Promise<TransportAssignment[]> => mockDB.getTransportAssignments(),

  create: async (data: Omit<TransportAssignment, 'id'>): Promise<string> => {
    const list = mockDB.getTransportAssignments();
    const newAssignment: TransportAssignment = { ...data, id: `ta-${Date.now()}` };
    list.push(newAssignment);
    mockDB.saveTransportAssignments(list);
    return newAssignment.id;
  },

  delete: async (id: string): Promise<void> => {
    let list = mockDB.getTransportAssignments();
    list = list.filter(item => item.id !== id);
    mockDB.saveTransportAssignments(list);
  }
};
