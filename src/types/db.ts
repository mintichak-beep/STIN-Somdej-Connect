export interface AcademicYear {
  id: string;
  year: string; // e.g., "2569", "2570" (for backward compatibility)
  name: string; // e.g., "2568", "2569", "2570"
  startYear: string | number;
  endYear: string | number;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Semester {
  id: string;
  academicYearId: string;
  semesterNumber: string; // e.g., "1", "2", "Summer"
  semesterName: string; // e.g., "Semester 1", "Semester 2", "Summer"
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  status: 'active' | 'inactive' | 'archived';
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  code: string; // e.g., "NS101"
  name: string; // e.g., "Fundamental Nursing Practice"
  status: 'active' | 'inactive';
}

export interface Section {
  id: string;
  name: string; // e.g., "Sec 1", "Sec 2"
  courseId: string;
  status: 'active' | 'inactive';
}

export interface Hospital {
  id: string;
  hospitalCode: string;
  hospitalNameTH: string;
  hospitalNameEN: string;
  shortName: string;
  type: 'University Hospital' | 'Regional Hospital' | 'General Hospital' | 'Community Hospital' | 'Private Hospital' | 'Specialized Hospital';
  affiliation: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  telephone: string;
  fax?: string;
  email?: string;
  website?: string;
  directorName?: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail?: string;
  logoURL?: string;
  imageURL?: string;
  numberOfBuildings: number;
  numberOfRooms: number;
  studentCapacity: number;
  teacherCapacity: number;
  status: 'active' | 'inactive' | 'archived';
  note?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;

  // Backward compatibility fields:
  name?: string;
  contactName?: string;
  contactPhone?: string;
  capacity?: number;
}

export interface Building {
  id: string;
  hospitalId: string;
  buildingCode: string;
  buildingName: string;
  buildingType: 'Dormitory' | 'Apartment' | 'Residence' | 'Hotel' | 'Guest House' | 'Hospital Dormitory';
  numberOfFloors: number;
  totalRooms: number;
  totalBeds: number;
  gender: 'Male' | 'Female' | 'Mixed';
  address?: string;
  description?: string;
  imageURL?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;

  // Backward compatibility fields:
  name?: string;
  capacity?: number;
}

export interface Floor {
  id: string;
  hospitalId: string;
  buildingId: string;
  floorNumber: number;
  floorName: string;
  totalRooms: number;
  totalBeds: number;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  buildingId: string;
  floorId?: string;
  gender?: 'Female' | 'Male' | 'Mixed';
  capacity: number;
  occupiedCount: number;
  status: 'active' | 'maintenance' | 'full';
}

export interface RoomAssignment {
  id: string;
  roomId: string;
  studentId: string;
  academicYearId: string;
  semester: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'inactive';
}

export interface TransportSchedule {
  id: string;
  vehicleId: string;
  driverId: string;
  route: string; // e.g., "STIN to Siriraj Hospital"
  departureTime: string; // ISO string or e.g., "07:30"
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface TransportAssignment {
  id: string;
  scheduleId: string;
  studentId: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Student {
  id: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  section: string;
  academicYear: string;
  hospital: string;
  rotationGroup: string;
  DRSchedule: string;
  accommodationPeriod?: string;
  roomId?: string;
  bedId?: string;
  remark?: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  // Old fields required by other modules
  name?: string;
  email?: string;
  phone?: string;
  academicYearId?: string;
  semester?: string;
  courseId?: string;
  sectionId?: string;
  hospitalId?: string;
}

export interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  courseIds: string[]; // List of courses they teach
  status: 'active' | 'inactive';
}

export interface RecentActivity {
  id: string;
  type: 'login' | 'student_add' | 'teacher_add' | 'room_assign' | 'transport_assign' | 'report_gen';
  title: string;
  description: string;
  userId: string;
  userDisplayName: string;
  timestamp: string;
}

export interface ClinicalWardSchedule {
  id: string;
  academicYear: string;
  semester: string; // "1" (ภาคการศึกษาต้น) or "2" (ภาคการศึกษาปลาย)
  courseName: string;
  dateRange: string;
  days: string;
  wards: string[];
}

export interface Bill {
  billId: string;
  roomId: string;
  tenantId: string; // studentId
  month: string; // e.g. "สิงหาคม"
  year: string;  // e.g. "2569"
  waterUnit: number;
  electricUnit: number;
  waterAmount: number;
  electricAmount: number;
  totalAmount: number;
  dueDate: string;
  status: 'Unpaid' | 'Pending' | 'Paid' | 'Rejected'; // 'ยังไม่ชำระ' | 'รอตรวจสอบ' | 'ชำระแล้ว' | 'ปฏิเสธ'
}

export interface Payment {
  paymentId: string;
  billId: string;
  roomId: string;
  tenantId: string;
  amount: number;
  slipUrl: string; // Base64 data URL
  uploadTime: string;
  transferDate: string;
  status: 'Pending' | 'Approved' | 'Rejected'; // 'รอตรวจสอบ' | 'อนุมัติ' | 'ปฏิเสธ'
  approvedBy?: string;
  approvedAt?: string;
  remark?: string;
}

