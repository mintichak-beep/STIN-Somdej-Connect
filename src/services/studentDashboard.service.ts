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
    // Sometimes studentId might be just part of email, wait, studentId usually is the uid or studentId string.
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

    // 2. Transportation
    const transportAssignments = mockDB
      .getTransportAssignments()
      .filter((ta) => ta.studentId === studentId);
    const schedules = mockDB.getTransportSchedules();
    const vehicles = mockDB.getVehicles();
    const drivers = mockDB.getDrivers();

    const enrichedTransport = transportAssignments.map((ta) => {
      const schedule = schedules.find((s) => s.id === ta.scheduleId);
      const vehicle = schedule
        ? vehicles.find((v) => v.id === schedule.vehicleId)
        : undefined;
      const driver = schedule
        ? drivers.find((d) => d.id === schedule.driverId)
        : undefined;
      return { ...ta, schedule, vehicle, driver };
    });

    // 3. Dormitory
    const roomAssignments = mockDB
      .getRoomAssignments()
      .filter((ra) => ra.studentId === studentId && ra.status === "active");
    const rooms = mockDB.getRooms();
    const dorms = mockDB.getBuildings(); // Dormitories are usually buildings? Or Dormitory?
    // Wait, let's check what `mockDB.getBuildings()` returns vs `Dormitory`.

    const allRoomAssignments = mockDB.getRoomAssignments();

    const enrichedDormitory = roomAssignments.map((ra) => {
      const room = rooms.find((r) => r.id === ra.roomId);
      // Wait, room has dormitoryId.
      const dormitory = mockDB
        .getBuildings()
        .find((b) => b.id === room?.dormitoryId); // Let's cast as Dormitory later if needed.
      const roommates = allRoomAssignments
        .filter(
          (other) =>
            other.roomId === ra.roomId &&
            other.studentId !== studentId &&
            other.status === "active",
        )
        .map((other) => {
          const user = users.find((u) => u.uid === other.studentId);
          return user ? user.name : other.studentId;
        });
      return { ...ra, room, dormitory: dormitory as any, roommates };
    });

    // 4. Utilities
    const utilityShares = mockDB
      .getUtilityShares()
      .filter((us) => us.studentId === studentId);
    const utilityRecords = mockDB.getUtilityRecords();

    const enrichedUtilities = utilityShares.map((us) => ({
      ...us,
      utilityRecord: utilityRecords.find((ur) => ur.id === us.utilityRecordId),
    }));

    // 5. Announcements
    const announcements = mockDB.getAnnouncements().filter((a) => {
      if (a.targetType === "all") return true;
      if (a.targetType === "student" && a.targetId === studentId) return true;
      if (
        a.targetType === "group" &&
        practiceAssignments.some((pa) => pa.practiceGroupId === a.targetId)
      )
        return true;
      if (
        a.targetType === "course" &&
        practiceAssignments.some((pa) => pa.courseId === a.targetId)
      )
        return true;
      if (
        a.targetType === "hospital" &&
        practiceAssignments.some((pa) => pa.trainingSiteId === a.targetId)
      )
        return true;
      return false;
    });

    // 6. Documents
    const documents = mockDB.getDocuments().filter((d) => {
      if (d.targetType === "all") return true;
      if (d.targetType === "student" && d.targetId === studentId) return true;
      if (
        d.targetType === "group" &&
        practiceAssignments.some((pa) => pa.practiceGroupId === d.targetId)
      )
        return true;
      return false;
    });

    const submissions = mockDB
      .getDocumentSubmissions()
      .filter((s) => s.studentId === studentId);

    // 7. Notifications
    const notifications = mockDB
      .getNotifications()
      .filter((n) => n.userId === studentId);

    return {
      profile: studentProfile,
      practiceAssignments: enrichedPractice,
      transportation: enrichedTransport,
      dormitory: enrichedDormitory,
      utilities: enrichedUtilities,
      announcements: announcements.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      documents: {
        required: documents,
        submissions,
      },
      notifications: notifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    };
  },
};
