export interface WeeklySchedule {
  day: string;
  timeSlot: string;
  activity: string;
}

export interface Timetable {
  id: string;
  academicYear: string;
  semester: string;
  subjectId: string;
  practiceSiteId: string;
  studentGroupId: string;
  startDate: Date;
  endDate: Date;
  weeklySchedule: WeeklySchedule[];
  numberOfStudents: number;
  assignedTeacherId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
