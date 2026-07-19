import { 
  Vehicle as DBVehicle, 
  Driver as DBDriver, 
  TransportSchedule as DBTransportSchedule, 
  TransportAssignment as DBTransportAssignment 
} from './db';

export interface Vehicle extends DBVehicle {
  vehicleNumber?: string;
  licensePlate?: string;
  vehicleType?: 'Van' | 'Minibus' | 'Bus' | 'Car';
  seatCapacity?: number;
  driverId?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver extends DBDriver {
  driverName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransportSchedule extends DBTransportSchedule {
  hospitalId?: string;
  academicYearId?: string;
  date?: string;
  returnTime?: string;
  pickupLocation?: string;
  destination?: string;
  remark?: string;
}

export interface TransportAssignment extends DBTransportAssignment {
  roomId?: string;
  seatNumber?: number;
}
