export interface Student {
  id: string;
  studentId: string; // The primary key/code
  studentNumber: string;
  studentName: string;
  section: string;
  academicYear: string;
  hospital: string;
  rotationGroup: string;
  DRSchedule: string;
  roomId?: string;
  bedId?: string;
  remark?: string;
  status: 'active' | 'inactive';
}
