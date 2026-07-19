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
    // TODO: Implement Firestore data fetching
    return {
      profile: undefined,
      practiceAssignments: [],
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
