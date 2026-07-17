export interface AllocationState {
  studentId: string;
  roomId: string;
  bedId: string;
  drSchedule: string;
}

export interface RoomAvailability {
  roomId: string;
  roomNumber: string;
  building: string;
  capacity: number;
  availableBeds: string[]; // bedIds
}
