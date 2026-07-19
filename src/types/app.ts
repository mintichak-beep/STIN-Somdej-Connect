export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  yearLevel: string;
  classGroup: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

export interface Teacher {
  id: string;
  name: string;
  department: string;
  phone: string;
  createdAt: any;
  updatedAt: any;
}

export interface Hospital {
  id: string;
  name: string;
  quota: number;
  address: string;
  createdAt: any;
  updatedAt: any;
}

export interface Dormitory {
  id: string;
  dormitoryName: string;
  createdAt: any;
  updatedAt: any;
}

export interface Room {
  id: string;
  dormitoryId: string;
  building: string;
  floor: string;
  roomNumber: string;
  capacity: number;
  currentOccupancy: number;
  studentId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Van {
  id: string;
  plateNumber: string;
  seats: number;
  createdAt: any;
  updatedAt: any;
}

export interface Allocation {
  id: string;
  studentId: string;
  hospitalId: string;
  teacherId: string;
  roomId: string;
  vanId: string;
  startDate: any;
  endDate: any;
  createdAt: any;
  updatedAt: any;
}

export interface WeeklyBill {
  id: string;
  roomId: string;
  studentId: string;
  billingWeek: string;
  startDate: any;
  endDate: any;
  waterUsage: number;
  electricityUsage: number;
  waterCharge: number;
  electricityCharge: number;
  otherCharges?: number;
  totalAmount: number;
  dueDate: any;
  paymentStatus: 'pending' | 'waiting_verification' | 'paid' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

export interface PaymentSlip {
  id: string;
  billId: string;
  fileUrl: string;
  uploadedAt: any;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedAt?: any;
  adminRemark?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'bill' | 'payment' | 'approval' | 'rejection';
  isRead: boolean;
  createdAt: any;
}

export interface AllocationDetails extends Allocation {
  student?: Student;
  hospital?: Hospital;
  teacher?: Teacher;
  room?: Room;
  van?: Van;
}
