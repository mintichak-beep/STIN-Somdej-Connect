export interface Vehicle {
  id: string;
  vehicleNumber: string;
  licensePlate: string;
  vehicleType: 'Van' | 'Minibus' | 'Bus' | 'Car';
  seatCapacity: number;
  driverId: string;
  status: 'active' | 'inactive' | 'maintenance';
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  driverName: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TransportSchedule {
  id: string;
  hospitalId: string;
  academicYearId: string;
  date: string;
  departureTime: string;
  returnTime?: string;
  pickupLocation: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  remark?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface TransportAssignment {
  id: string;
  scheduleId: string;
  studentId: string;
  roomId: string;
  seatNumber: number;
  status: 'active' | 'cancelled';
}
