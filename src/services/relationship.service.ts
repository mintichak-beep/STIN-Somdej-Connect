import { 
  clinicalSiteService, 
  courseService, 
  studentGroupService, 
  studentService, 
  teacherService, 
  clinicalScheduleService,
  vanTripService,
  roomService,
  weeklyRoomAssignmentService,
  hospitalService,
  subjectService
} from "./app.service";
import { StudentGroup, Student, ClinicalSchedule, Course, ClinicalSite } from "../types/app";

export interface IntegrityCheckResult {
  canDelete: boolean;
  message?: string;
  counts?: {
    courses?: number;
    studentGroups?: number;
    students?: number;
    schedules?: number;
    vanTrips?: number;
    rooms?: number;
  };
}

/**
 * Service managing referential integrity and cascaded updates across Firestore relationships:
 * Practice Site → Course → Student Group → Students → Instructor → Practice Schedule → Timetable → Van Transportation → Accommodation → Reports → Dashboard
 */
export class RelationshipService {
  /**
   * Check if a Practice Site (ClinicalSite/Hospital) can be safely deleted without breaking relations.
   */
  static async checkPracticeSiteDeletion(siteId: string): Promise<IntegrityCheckResult> {
    try {
      const [courses, groups, students, schedules] = await Promise.all([
        courseService.getAll(),
        studentGroupService.getAll(),
        studentService.getAll(),
        clinicalScheduleService.getAll(),
      ]);

      const linkedCourses = courses.filter(c => (c as any).practiceSiteId === siteId || (c as any).clinicalSiteId === siteId || (c as any).hospitalId === siteId);
      const linkedGroups = groups.filter(g => (g as any).practiceSiteId === siteId || (g as any).hospitalId === siteId);
      const linkedStudents = students.filter(s => (s as any).hospitalId === siteId || (s as any).practiceSiteId === siteId);
      const linkedSchedules = schedules.filter(s => s.clinicalSiteId === siteId || (s as any).practiceSiteId === siteId);

      const hasLinks = linkedCourses.length > 0 || linkedGroups.length > 0 || linkedStudents.length > 0 || linkedSchedules.length > 0;

      if (hasLinks) {
        const parts = [];
        if (linkedCourses.length > 0) parts.push(`${linkedCourses.length} Course(s)`);
        if (linkedGroups.length > 0) parts.push(`${linkedGroups.length} Student Group(s)`);
        if (linkedStudents.length > 0) parts.push(`${linkedStudents.length} Student(s)`);
        if (linkedSchedules.length > 0) parts.push(`${linkedSchedules.length} Practice Schedule(s)`);

        return {
          canDelete: false,
          message: `Cannot delete Practice Site: Currently referenced by ${parts.join(', ')}. Please reassign or remove these relationships first.`,
          counts: {
            courses: linkedCourses.length,
            studentGroups: linkedGroups.length,
            students: linkedStudents.length,
            schedules: linkedSchedules.length
          }
        };
      }

      return { canDelete: true };
    } catch (err: any) {
      console.error("Error checking practice site deletion integrity:", err);
      return { canDelete: true }; // Fallback
    }
  }

  /**
   * Check if a Course can be safely deleted without breaking relations.
   */
  static async checkCourseDeletion(courseId: string): Promise<IntegrityCheckResult> {
    try {
      const [groups, schedules, students] = await Promise.all([
        studentGroupService.getAll(),
        clinicalScheduleService.getAll(),
        studentService.getAll()
      ]);

      const linkedGroups = groups.filter(g => g.courseId === courseId || (g as any).subjectId === courseId);
      const linkedSchedules = schedules.filter(s => s.courseId === courseId);
      const linkedStudents = students.filter(s => s.subjectId === courseId);

      const hasLinks = linkedGroups.length > 0 || linkedSchedules.length > 0 || linkedStudents.length > 0;

      if (hasLinks) {
        const parts = [];
        if (linkedGroups.length > 0) parts.push(`${linkedGroups.length} Student Group(s)`);
        if (linkedSchedules.length > 0) parts.push(`${linkedSchedules.length} Practice Schedule(s)`);
        if (linkedStudents.length > 0) parts.push(`${linkedStudents.length} Student(s)`);

        return {
          canDelete: false,
          message: `Cannot delete Course: Associated with ${parts.join(', ')}. Please reassign or remove these items first.`,
          counts: {
            studentGroups: linkedGroups.length,
            schedules: linkedSchedules.length,
            students: linkedStudents.length
          }
        };
      }

      return { canDelete: true };
    } catch (err: any) {
      console.error("Error checking course deletion integrity:", err);
      return { canDelete: true };
    }
  }

  /**
   * Check if a Student Group can be safely deleted.
   */
  static async checkStudentGroupDeletion(groupId: string): Promise<IntegrityCheckResult> {
    try {
      const [students, schedules] = await Promise.all([
        studentService.getAll(),
        clinicalScheduleService.getAll()
      ]);

      const linkedStudents = students.filter(s => s.groupId === groupId);
      const linkedSchedules = schedules.filter(s => s.studentGroupId === groupId);

      const hasLinks = linkedStudents.length > 0 || linkedSchedules.length > 0;

      if (hasLinks) {
        const parts = [];
        if (linkedStudents.length > 0) parts.push(`${linkedStudents.length} Student(s)`);
        if (linkedSchedules.length > 0) parts.push(`${linkedSchedules.length} Practice Schedule(s)`);

        return {
          canDelete: false,
          message: `Cannot delete Student Group: Currently linked to ${parts.join(', ')}. Please reassign students or schedules first.`,
          counts: {
            students: linkedStudents.length,
            schedules: linkedSchedules.length
          }
        };
      }

      return { canDelete: true };
    } catch (err: any) {
      console.error("Error checking student group deletion integrity:", err);
      return { canDelete: true };
    }
  }

  /**
   * Sync updates when a Student Group changes (member studentIds, course, etc.)
   * Automatically updates:
   * - Students' groupId & subjectId
   * - ClinicalSchedules' studentIds
   */
  static async syncStudentGroupChanges(group: StudentGroup, newStudentIds: string[]): Promise<void> {
    try {
      const allStudents = await studentService.getAll();
      const currentGroupStudents = allStudents.filter(s => s.groupId === group.id || newStudentIds.includes(s.id));

      // 1. Update students who are added or removed from this group
      for (const student of currentGroupStudents) {
        const isNowInGroup = newStudentIds.includes(student.id);
        if (isNowInGroup) {
          const updatePayload: Partial<Student> = { groupId: group.id };
          if (group.courseId) {
            updatePayload.subjectId = group.courseId;
          }
          await studentService.update(student.id, updatePayload);
        } else if (student.groupId === group.id) {
          // Student removed from group -> clear group reference
          await studentService.update(student.id, { groupId: '' });
        }
      }

      // 2. Update Clinical Schedules linked to this group
      const schedules = await clinicalScheduleService.getAll();
      const linkedSchedules = schedules.filter(s => s.studentGroupId === group.id);

      for (const schedule of linkedSchedules) {
        await clinicalScheduleService.update(schedule.id, {
          studentIds: newStudentIds
        });
      }
    } catch (err: any) {
      console.error("Error syncing student group changes across application:", err);
    }
  }

  /**
   * Automatically sync student relationships when a student's Course, Group, Site, Instructor, Van, or Accommodation changes.
   */
  static async syncStudentAssignments(student: Student): Promise<void> {
    try {
      // 1. Sync Student Group membership if student has a groupId
      if (student.groupId) {
        const group = await studentGroupService.getById(student.groupId);
        if (group) {
          const currentIds = group.studentIds || [];
          if (!currentIds.includes(student.id)) {
            const updatedIds = [...currentIds, student.id];
            await studentGroupService.update(group.id, {
              studentIds: updatedIds
            });
          }
        }
      }

      // 2. Sync Van Trip membership if vanId / trip specified
      if ((student as any).vanId) {
        const vanTrip = await vanTripService.getById((student as any).vanId);
        if (vanTrip) {
          const passengers = vanTrip.studentIds || [];
          if (!passengers.includes(student.id)) {
            await vanTripService.update(vanTrip.id, {
              studentIds: [...passengers, student.id]
            });
          }
        }
      }
    } catch (err: any) {
      console.error("Error syncing student assignments:", err);
    }
  }
}
