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

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  targetType: string;
  targetId: string;
  description: string;
  createdAt: string;
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
  courseCode: string;
  courseName: string;
  academicYear: string;
  semester: string;
  status: 'active' | 'inactive';
  createdAt: string;

  // Backward compatibility
  code?: string;
  name?: string;
}

export interface PracticeGroup {
  id: string;
  name: string;
  courseId: string;
  hospitalId: string;
  academicYear: string;
  semester: string;
  capacity: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Section {
  id: string;
  name: string; // e.g., "Sec 1", "Sec 2"
  courseId: string;
  status: 'active' | 'inactive';
}

export interface Hospital {
  id: string;
  name: string;
  province: string;
  department: string;
  contactPerson: string;
  phone: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;

  // Additional fields from previous implementation
  hospitalCode?: string;
  hospitalNameTH?: string;
  hospitalNameEN?: string;
  shortName?: string;
  type?: 'University Hospital' | 'Regional Hospital' | 'General Hospital' | 'Community Hospital' | 'Private Hospital' | 'Specialized Hospital';
  affiliation?: string;
  district?: string;
  subdistrict?: string;
  postalCode?: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
  telephone?: string;
  fax?: string;
  email?: string;
  website?: string;
  directorName?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  logoURL?: string;
  imageURL?: string;
  numberOfBuildings?: number;
  numberOfRooms?: number;
  studentCapacity?: number;
  teacherCapacity?: number;
  note?: string;
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
  dormitoryId?: string; // unified
  gender?: 'Female' | 'Male' | 'Mixed';
  capacity: number;
  occupiedCount: number;
  status: 'active' | 'maintenance' | 'full' | 'available' | 'almost_full';
  createdAt?: string;
}

export interface RoomAssignment {
  id: string;
  roomId: string;
  studentId: string;
  studentIds?: string[]; // compatibility
  academicYearId?: string;
  semester?: string;
  startDate?: string;
  endDate?: string;
  assignedDate?: string;
  status: 'active' | 'completed' | 'cancelled' | 'inactive';
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Van {
  id: string;
  vanCode: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface TransportSchedule {
  id: string;
  vehicleId: string;
  driverId: string;
  route: string; // e.g., "STIN to Siriraj Hospital"
  departureTime: string; // ISO string or e.g., "07:30"
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  pickupLocation?: string;
  dropoffLocation?: string; // Added
}

export interface TransportAssignment {
  id: string;
  scheduleId: string;
  studentId: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'active' | 'completed' | 'cancelled';
  seatNumber?: number;
}

export interface Student {
  id: string;
  uid?: string;
  studentId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  yearLevel?: string;
  classGroup?: string;
  program?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending' | 'graduated' | 'suspended' | 'archived';
  createdAt: string;

  // Backward compatibility fields
  studentNumber?: string;
  studentName?: string;
  section?: string;
  academicYear?: string;
  hospital?: string;
  rotationGroup?: string;
  DRSchedule?: string;
  accommodationPeriod?: string;
  roomId?: string;
  bedId?: string;
  remark?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  name?: string;
  academicYearId?: string;
  semester?: string;
  courseId?: string;
  sectionId?: string;
  hospitalId?: string;
  practiceGroupId?: string;
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

export interface TrainingGroup {
  id: string;
  name: string;
  teacherId: string;
  hospital: string;
  studentIds: string[];
  startDate: string;
  endDate: string;
  dormitoryIds: string[];
  transportationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecentActivity {
  id: string;
  type: 'login' | 'student_add' | 'teacher_add' | 'room_assign' | 'transport_assign' | 'report_gen' | 'edited_bill' | 'deleted_bill' | 'deleted_payment';
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
  prevWaterMeter?: number;
  currWaterMeter?: number;
  waterRate?: number;
  prevElectricMeter?: number;
  currElectricMeter?: number;
  electricRate?: number;
  otherCharges?: number;
  notes?: string;
  adjustmentAmount?: number;
  adjustmentNote?: string;
  rejectionNote?: string;
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


export interface Dormitory {
  id: string;
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  mapLink?: string;
  description?: string;
  createdAt: string;
}

export interface RoomAssignmentHistory {
  id: string;
  studentId: string;
  oldRoomId: string;
  newRoomId: string;
  changedBy: string;
  changedDate: string;
}

export interface UtilityRecord {
  id: string;
  dormitoryId: string;
  roomId: string;
  month: string;
  year: number;
  waterAmount: number;
  electricityAmount: number;
  otherAmount: number;
  totalAmount: number;
  status?: 'pending' | 'billed' | 'paid' | 'unpaid'; // Added unpaid
  createdBy: string;
  createdAt: string;
}

export interface UtilityShare {
  id: string;
  utilityRecordId: string;
  studentId: string;
  roomId: string;
  sharedAmount: number;
  paymentStatus: 'pending' | 'submitted' | 'verified' | 'completed';
  paidAt?: string;
  createdAt: string;
}

export interface PaymentProof {
  id: string;
  utilityShareId: string;
  studentId: string;
  imageBase64: string;
  note: string;
  status: 'pending' | 'submitted' | 'verified' | 'rejected' | 'completed';
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  category: 'Training Letter' | 'Evaluation Form' | 'Report' | 'Internship Document' | 'Other';
  fileType: 'pdf' | 'docx' | 'image' | 'link';
  fileUrl: string;
  targetType: 'all' | 'group' | 'student';
  targetId?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface DocumentSubmission {
  id: string;
  documentId: string;
  studentId: string;
  fileUrl: string;
  fileType: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending'; // Added pending
  teacherComment?: string;
  submittedAt: string;
  checkedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetType: 'all' | 'group' | 'student' | 'course' | 'hospital';
  targetId?: string;
  priority: 'normal' | 'important' | 'urgent';
  createdBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'document' | 'announcement' | 'utility' | 'transportation' | 'dormitory' | 'supervision';
  isRead: boolean;
  createdAt: string;
}

export interface Trip {
  id: string;
  vanId: string;
  vehicleId: string; // Made required for consistency
  plateNumber?: string; // Optional license plate number
  trainingSiteId: string;
  date: string;
  departureTime: string;
  pickupLocation: string;
  destination: string;
  dropoffLocation?: string; // Added
  notes: string;
  status: 'scheduled' | 'departed' | 'completed' | 'cancelled';
  assignedStudents?: string[]; // Added
  createdAt: string;
}

export interface TripAssignment {
  id: string;
  tripId: string;
  studentId: string;
  assignedDate: string;
  status: 'active' | 'inactive';
}

export interface SupervisionSchedule {
  id: string;
  trainingGroupId: string;
  teacherId: string;
  trainingSiteId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface SupervisionRecord {
  id: string;
  scheduleId: string;
  teacherId: string;
  trainingGroupId: string;
  summary: string;
  strengths: string;
  improvements: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'link';
  createdAt: string;
}

export interface EvaluationForm {
  id: string;
  name: string;
  criteria: { name: string, maxScore: number }[];
  createdAt: string;
}export interface Evaluation {
  id: string;
  formId: string;
  studentId: string;
  teacherId: string;
  scores: { criterionName: string, score: number }[];
  totalScore: number;
  percentage: number;
  grade: string;
  comment: string;
  createdAt: string;
}

export interface TrainingSite {
  id: string;
  name: string;
  hospitalType: 'University Hospital' | 'Regional Hospital' | 'General Hospital' | 'Community Hospital' | 'Private Hospital' | 'Specialized Hospital';
  address: string;
  province: string;
  phone: string;
  email: string;
  contactPerson: string;
  contactPosition: string;
  capacity: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface HospitalCourse {
  id: string;
  trainingSiteId: string;
  courseId: string;
  academicYearId: string;
  semesterId: string;
  capacity: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface Placement {
  id: string;
  practiceGroupId: string;
  trainingSiteId: string;
  wardDepartment: string;
  studentIds: string[];
  teacherId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface CommunicationLog {
  id: string;
  trainingSiteId: string;
  senderId: string;
  topic: string;
  message: string;
  communicationDate: string;
  status: 'open' | 'pending' | 'completed';
  createdAt: string;
}

export interface User {
  id?: string; // added for compatibility
  uid: string;
  name: string;
  email: string;
  role: 'teacher' | 'student' | 'Teacher' | 'Nursing Student'; // compatibility
  displayName: string; // Made required
  studentId?: string;
  studentYear?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string; // Added
  lastLogin?: string;
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
  createdAt: string;
}

export interface PracticeSchedule {
  id: string;
  courseId: string;
  academicYear: string;
  semester: string;
  practiceGroupId: string;
  hospitalId: string;
  ward: string;
  startDate: string;
  endDate: string;
  shift: string;
  createdBy: string;
  createdAt: string;
}

export interface PracticeScheduleAssignment {
  id: string;
  studentId: string;
  scheduleId: string;
  courseId: string;
  practiceGroupId: string;
  hospitalId: string;
  status: 'assigned' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PracticeAssignmentHistory {
  id: string;
  studentId: string;
  oldAssignment: string; // JSON string or object description
  newAssignment: string; // JSON string or object description
  changedBy: string;
  reason: string;
  changedAt: string;
}

export interface SystemIssue {
  id: string;
  reportedBy: string;
  role: 'teacher' | 'student';
  module: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  role: 'teacher' | 'student';
  rating: number;
  comment: string;
  module: string;
  createdAt: string;
}


export interface OperationTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'processing' | 'completed';
  assignedTo?: string; // teacherId
  dueDate: string; // ISO date
  createdAt: string; // ISO date
}

export interface OperationIssue {
  id: string;
  studentId?: string;
  category: 'Practice' | 'Transportation' | 'Dormitory' | 'Utility' | 'Document';
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'processing' | 'resolved';
  solutionNote?: string;
  createdAt: string; // ISO date
}
