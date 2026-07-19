import { studentService } from "./student.service";
import { practiceAssignmentService } from "./practiceAssignment.service";
import { courseService } from "./course.service";
import { hospitalService } from "./hospital.service";
import { practiceGroupService } from "./practiceGroup.service";
import { UserService } from "./user.service";
import {
  PracticeAssignment,
  TransportAssignment,
  TransportSchedule,
  RoomAssignment,
  Room,
  Dormitory,
  UtilityShare,
  UtilityRecord,
  Document,
  DocumentSubmission,
  Announcement,
  Notification,
  Course,
  TrainingSite,
  TrainingGroup,
  User,
  Vehicle,
  Driver,
  Student,
} from "../types/db";

export interface StudentDashboardData {
  profile?: Student;
  practiceAssignments: (PracticeAssignment & {
    course?: Course;
    trainingSite?: TrainingSite;
    trainingGroup?: TrainingGroup;
    teacher?: User;
  })[];
  transportation: (TransportAssignment & {
    schedule?: TransportSchedule;
    vehicle?: Vehicle;
    driver?: Driver;
  })[];
  dormitory: (RoomAssignment & {
    room?: Room;
    dormitory?: Dormitory;
    roommates?: string[];
  })[];
  utilities: (UtilityShare & { utilityRecord?: UtilityRecord })[];
  announcements: Announcement[];
  documents: {
    required: Document[];
    submissions: DocumentSubmission[];
  };
  notifications: Notification[];
}

export const studentDashboardService = {
  getDashboardData: async (
    studentId: string,
  ): Promise<StudentDashboardData> => {
    try {
      const students = await studentService.getStudents();
      const studentProfile = students.find(s => s.id === studentId || s.studentId === studentId || s.email === studentId);

      // 1. Practice Assignments
      const practiceAssignments = await practiceAssignmentService.getByStudentId(studentId);

      const courses = await courseService.getAll();
      const sites = await hospitalService.getAll();
      const groups = await practiceGroupService.getAll();
      const users = await UserService.getAll();

      const enrichedPractice = practiceAssignments.map((pa) => ({
        ...pa,
        course: courses.find((c) => c.id === pa.courseId),
        trainingSite: sites.data.find((s) => s.id === pa.trainingSiteId) as any,
        trainingGroup: groups.find((g) => g.id === pa.practiceGroupId) as any,
        teacher: users.find((u) => u.uid === pa.teacherId) as any,
      }));

      return {
        profile: studentProfile,
        practiceAssignments: enrichedPractice as any,
        transportation: [],
        dormitory: [],
        utilities: [],
        announcements: [],
        documents: {
          required: [],
          submissions: [],
        },
        notifications: [],
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return {
        practiceAssignments: [],
        transportation: [],
        dormitory: [],
        utilities: [],
        announcements: [],
        documents: { required: [], submissions: [] },
        notifications: [],
      };
    }
  },
};
