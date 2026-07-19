import { mockDB } from "./mockData";

export const teacherOperationService = {
  getSummaryData: async () => {
    const practiceAssignments = mockDB.getPracticeAssignments();
    const trainingSites = mockDB.getTrainingSites();
    const trips = mockDB.getTrips();
    const roomAssignments = mockDB.getRoomAssignments();
    const rooms = mockDB.getRooms();
    const utilityRecords = mockDB.getUtilityRecords();
    const documents = mockDB.getDocuments();
    const students = mockDB.getStudents();
    const announcements = mockDB.getAnnouncements();

    const activeCourses = [
      ...new Set(practiceAssignments.map((p) => p.courseId)),
    ].length;

    // Students currently training
    const today = new Date().toISOString().split("T")[0];
    const trainingStudents = practiceAssignments.filter(
      (p) => p.startDate <= today && p.endDate >= today,
    ).length;

    // Active hospitals
    const activeHospitals = trainingSites.filter(
      (s) => s.status === "active",
    ).length;

    // Today's trips
    const todayTrips = trips.filter((t) => t.date === today);
    const studentsTraveling = todayTrips.reduce(
      (acc, t) => acc + (t.assignedStudents?.length || 0),
      0,
    );

    // Dormitory
    const totalRooms = rooms.length;
    const occupiedBeds = roomAssignments.reduce(
      (acc, r) => acc + (r.studentIds?.length || 0),
      0,
    );

    // Utilities
    const pendingPayments = utilityRecords.filter(
      (u) => u.status === "unpaid" || u.status === "pending",
    ).length;

    // Documents
    // Pending submissions: submissions that are pending review
    const pendingDocs = 0; // The mockData structure for documents might vary.

    return {
      activeCourses,
      totalStudents: students.length,
      assignedStudents: trainingStudents,
      activeHospitals,
      todayTrips: todayTrips.length,
      studentsTraveling,
      totalRooms,
      occupiedBeds,
      pendingPayments,
      pendingDocs,
      announcementsCount: announcements.length,
      practiceAssignments,
      trainingSites,
      students,
      trips: todayTrips,
    };
  },
};
