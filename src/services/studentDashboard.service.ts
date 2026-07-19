import { mockDB } from "./mockData";
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
    const students = mockDB.getStudents();
    const studentProfile = students.find(s => s.id === studentId || s.studentId === studentId || s.email === studentId);

    // 1. Practice Assignments
    const allPa = mockDB.getPracticeAssignments();
    const practiceAssignments = allPa.filter(
      (pa) => pa.studentId === studentId,
    );

    const courses = mockDB.getCourses();
    const sites = mockDB.getTrainingSites();
    const groups = mockDB.getTrainingGroups();
    const users = mockDB.getUsers();

    const enrichedPractice = practiceAssignments.map((pa) => ({
      ...pa,
      course: courses.find((c) => c.id === pa.courseId),
      trainingSite: sites.find((s) => s.id === pa.trainingSiteId),
      trainingGroup: groups.find((g) => g.id === pa.practiceGroupId),
      teacher: users.find((u) => u.uid === pa.teacherId),
    }));

    return {
      profile: studentProfile,
      practiceAssignments: enrichedPractice,
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
  },
};
