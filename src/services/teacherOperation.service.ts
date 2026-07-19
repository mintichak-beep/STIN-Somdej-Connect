import { studentService } from "./student.service";
import { hospitalService } from "./hospital.service";
import { courseService } from "./course.service";

export const teacherOperationService = {
  getSummaryData: async () => {
    try {
      const students = await studentService.getStudents();
      const hospitals = await hospitalService.getAll();
      const courses = await courseService.getAll();
      
      const activeCourses = courses.filter(c => c.status === 'active').length;
      
      const activeHospitals = hospitals.data.filter(
        (s) => s.status === "active",
      ).length;

      return {
        activeCourses,
        totalStudents: students.length,
        assignedStudents: 0,
        activeHospitals,
        todayTrips: 0,
        studentsTraveling: 0,
        totalRooms: 0,
        occupiedBeds: 0,
        pendingPayments: 0,
        pendingDocs: 0,
        announcementsCount: 0,
        practiceAssignments: [],
        trainingSites: hospitals.data,
        students,
        trips: [],
      };
    } catch (error) {
      console.error("Error fetching summary data:", error);
      return {
        activeCourses: 0,
        totalStudents: 0,
        assignedStudents: 0,
        activeHospitals: 0,
        todayTrips: 0,
        studentsTraveling: 0,
        totalRooms: 0,
        occupiedBeds: 0,
        pendingPayments: 0,
        pendingDocs: 0,
        announcementsCount: 0,
        practiceAssignments: [],
        trainingSites: [],
        students: [],
        trips: [],
      };
    }
  },
};
