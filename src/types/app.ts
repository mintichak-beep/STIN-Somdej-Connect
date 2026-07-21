export interface Student {
  id: string;
  studentId: string;
  title?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  status: 'active' | 'inactive';
  subjectId?: string;
  groupId?: string;
  roomId?: string;
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
  hospitalId?: string;
  teacherId?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Teacher {
  id: string;
  name: string;
  employeeId?: string;
  department: string;
  phone: string;
  photoUrl?: string;
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
  vanId: string; // User requested "Van ID" specifically
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  seatCapacity: number;
  status: 'Available' | 'Maintenance' | 'In Service';
  createdAt: any;
  updatedAt: any;
  // Compatibility aliases for legacy components
  plateNumber?: string;
  capacity?: number;
  vanNumber?: string;
}

export interface DutySchedule {
  id: string;
  dutyDate: string;
  startTime: string;
  endTime: string;
  dutyType: string;
  dutyLocation: string;
  dormitoryId: string;
  assignedStudents: string[];
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  createdAt: any;
  updatedAt: any;
}

export interface Milestone {
  type: 'Orientation' | 'Lecture' | 'Clinical Practice' | 'Midterm' | 'Final Examination' | 'Evaluation';
  date: string;
  label?: string;
}

export interface AcademicSchedule {
  id: string;
  academicYear: string;
  semester: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  department: string;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  status: 'Planned' | 'Ongoing' | 'Completed';
  createdAt: any;
  updatedAt: any;
}

export interface ShuttleRoute {
  id: string;
  routeName: string;
  direction: 'Morning' | 'Evening';
  departureLocation: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  vanId: string;
  createdAt: any;
  updatedAt: any;
}

export interface ShuttleAssignment {
  id: string;
  studentId: string;
  routeId: string;
  vanId: string;
  assignedAt: any;
  status: 'active' | 'cancelled';
  createdAt: any;
  updatedAt: any;
}

export interface Passenger {
  personId: string;
  role: 'Student' | 'Teacher';
}

export interface VanTrip {
  id: string;
  date: string;
  licensePlate: string;
  driverName: string;
  departureTime: string;
  returnTime: string;
  destination: string;
  studentIds: string[];
  instructorIds: string[];
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: any;
  updatedAt?: any;
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
  invoiceNumber: string;
  billingWeek: string; // e.g., "2024-W12"
  startDate: any;
  endDate: any;
  occupantsCount: number;
  waterUsage: number;
  electricityUsage: number;
  roomFee: number;
  waterCharge: number;
  electricityCharge: number;
  otherCharges: number;
  totalAmount: number;
  dueDate: any;
  paymentStatus: 'pending' | 'payment_slip_uploaded' | 'waiting_verification' | 'paid' | 'rejected';
  prevElectricMeter: number;
  currElectricMeter: number;
  electricRate: number;
  practiceSite?: string;
  createdAt: any;
  updatedAt: any;
}

export interface StudentPayment {
  id: string;
  billId: string;
  studentId: string;
  roomId: string;
  invoiceNumber: string;
  billingWeek: string;
  roomFee: number;
  waterCharge: number;
  electricityCharge: number;
  otherCharges: number;
  individualAmount: number;
  paymentStatus: 'pending' | 'payment_slip_uploaded' | 'waiting_verification' | 'paid' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

export interface BankAccountConfig {
  id?: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  promptPayNumber?: string;
  qrCodeUrl: string;
  paymentInstructions?: string;
}

export interface PaymentSlip {
  id: string;
  billId: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  invoiceNumber?: string;
  fileUrl: string;
  uploadedAt: any;
  uploadDate?: string;
  uploadTime?: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
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

export interface ClinicalSite {
  id: string;
  name: string;
  type: string; // e.g. Hospital, Health Center
  address: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

export interface Ward {
  id: string;
  clinicalSiteId: string;
  name: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

export interface ClinicalSchedule {
  id: string;
  academicYear: string;
  semester: string;
  courseId: string;
  studentGroupId?: string;
  studentIds?: string[];
  clinicalSiteId: string;
  wardId: string;
  instructorId?: string;
  secondaryInstructorId?: string;
  startDate: string;
  endDate: string;
  shift?: 'Morning' | 'Afternoon' | 'Night';
  subShift?: string;
  remarks?: string;
  status?: 'Upcoming' | 'Ongoing' | 'Completed';
  minStudents?: number;
  maxStudents?: number;
  courseColor?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface DutyAssignment {
  id: string;
  scheduleId: string;
  studentId: string;
  date: string;
  shift: 'M' | 'A' | 'N' | 'OFF' | 'EVA' | 'CL';
  subShift?: string;
  instructorId: string;
  remarks?: string;
  createdAt: any;
  updatedAt: any;
}

export interface StudentGroup {
  id: string;
  name: string;
  studentIds: string[];
  courseId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  academicYear: string;
  semester: string;
  status: 'active' | 'inactive';
  color?: string;
  createdAt: any;
}

export interface WeeklyRoomAssignment {
  id: string;
  studentId?: string;
  studentIds?: string[];
  instructorIds?: string[];
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

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: any; // Firestore timestamp
  attachmentUrl?: string;
  isPinned: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface AppImage {
  id: string;
  imageName: string;
  imageType: 'login' | 'welcome' | 'dashboard_banner' | 'medical_illustration' | 'empty_state' | 'custom';
  imageUrl: string;
  updatedAt?: any;
  createdAt?: any;
}
