export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  yearLevel: string;
  classGroup: string;
  faculty?: string;
  major?: string;
  phone: string;
  status: 'active' | 'inactive';
  subjectId?: string;
  groupId?: string;
  roomId?: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  academicYear: string;
  semester: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

export interface SubjectGroup {
  id: string;
  groupName: string;
  subjectId: string;
  createdAt?: any;
  updatedAt?: any;
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
  monthlyRent: number;
  waterRate: number;
  electricityRate: number;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

export interface Van {
  id: string;
  vanNumber: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Passenger {
  personId: string;
  role: 'Student' | 'Teacher';
}

export interface VanTrip {
  id: string;
  tripDate: string;
  departureTime: string;
  returnTime: string;
  destination: string;
  subject: string;
  vanId: string;
  passengers: Passenger[];
  pickupLocation?: string;
  dropoffLocation?: string;
  departureLocation?: string;
  returnPickupLocation?: string;
  returnDestination?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
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
  billingWeek: string; // e.g., "2024-W12"
  startDate: any;
  endDate: any;
  occupantsCount: number;
  waterUsage: number; // usually same as occupantsCount for this logic
  electricityUsage: number;
  waterCharge: number;
  electricityCharge: number;
  otherCharges: number;
  totalAmount: number;
  dueDate: any;
  paymentStatus: 'pending' | 'waiting_verification' | 'paid' | 'rejected';
  prevElectricMeter: number;
  currElectricMeter: number;
  electricRate: number;
  createdAt: any;
  updatedAt: any;
}

export interface StudentPayment {
  id: string;
  billId: string;
  studentId: string;
  roomId: string;
  billingWeek: string;
  individualAmount: number;
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

export interface TrainingSite {
  id: string;
  name: string;
  hospitalType: string;
  address: string;
  province: string;
  phone: string;
  email: string;
  contactPerson: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: any;
}

export interface TrainingGroup {
  id: string;
  name: string;
  teacherId: string;
  hospital: string;
  studentIds: string[];
  startDate: string;
  endDate: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PracticeAssignment {
  id: string;
  studentId: string;
  courseId: string;
  practiceGroupId: string;
  trainingSiteId: string;
  wardDepartment: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  status: 'assigned' | 'active' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  academicYear: string;
  semester: string;
  status: 'active' | 'inactive';
  createdAt: any;
}

export interface WeeklyRoomAssignment {
  id: string;
  studentId: string;
  roomId: string;
  startDate: any;
  endDate: any;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

export interface AllocationDetails extends Allocation {
  student?: Student;
  hospital?: Hospital;
  teacher?: Teacher;
  room?: Room;
  van?: Van;
}
