
export const reportCenterService = {
  getSummaryData: async () => {
    const students = [];
    const practiceAssignments = [];
    const trainingSites = [];
    const trips = [];
    const rooms = [];
    const roomAssignments = [];
    const utilityRecords = [];
    const documents = [];

    return {
      totalStudents: students.length,
      totalCourses: [...new Set(practiceAssignments.map((pa) => pa.courseId))]
        .length,
      totalHospitals: trainingSites.length,
      totalPracticeGroups: [
        ...new Set(practiceAssignments.map((pa) => pa.practiceGroupId)),
      ].length,
      totalTrainingPeriods: [
        ...new Set(
          practiceAssignments.map((pa) => `${pa.startDate}-${pa.endDate}`),
        ),
      ].length,
    };
  },

  getPracticeReport: async () => {
    const practiceAssignments = [];
    const groups: { [key: string]: any } = {};

    practiceAssignments.forEach((pa) => {
      const key = `${pa.courseId}-${pa.practiceGroupId}-${pa.trainingSiteId}-${pa.startDate}-${pa.endDate}`;
      if (!groups[key]) {
        groups[key] = {
          academicYear: "2026",
          semester: "1",
          course: pa.courseId,
          practiceGroup: pa.practiceGroupId,
          hospital: pa.trainingSiteId,
          studentCount: 0,
          practicePeriod: `${pa.startDate} - ${pa.endDate}`,
        };
      }
      groups[key].studentCount += 1;
    });

    return Object.values(groups);
  },

  getStudentDistributionReport: async () => {
    const practiceAssignments = [];
    const dist = practiceAssignments.reduce((acc: any, pa) => {
      const key = `${pa.courseId}|${pa.trainingSiteId}`;
      if (!acc[key]) {
        acc[key] = {
          course: pa.courseId,
          hospital: pa.trainingSiteId,
          ward: pa.wardDepartment || "General Ward",
          yearLevel: "Year 4", // Mock
          studentCount: 0,
        };
      }
      acc[key].studentCount += 1;
      return acc;
    }, {});

    return Object.values(dist);
  },

  getHospitalUsageReport: async () => {
    const trainingSites = [];
    const practiceAssignments = [];

    return trainingSites.map((site) => {
      const relatedAssignments = practiceAssignments.filter(
        (pa) => pa.trainingSiteId === site.id,
      );
      return {
        hospitalName: site.name,
        coursesCount: [...new Set(relatedAssignments.map((pa) => pa.courseId))]
          .length,
        studentCount: relatedAssignments.length,
        capacity: site.capacity || 50,
        status: site.status,
      };
    });
  },

  getTransportationReport: async () => {
    const trips = [];

    // Group trips by date for a simpler report
    const tripsByDate = trips.reduce((acc: any, trip) => {
      if (!acc[trip.date]) {
        acc[trip.date] = {
          date: trip.date,
          totalTrips: 0,
          totalStudentsTransported: 0,
          vansUsed: new Set(),
        };
      }
      acc[trip.date].totalTrips += 1;
      acc[trip.date].totalStudentsTransported +=
        trip.assignedStudents?.length || 0;
      acc[trip.date].vansUsed.add(trip.vehicleId);
      return acc;
    }, {});

    return Object.values(tripsByDate).map((t: any) => ({
      ...t,
      vanUsage: t.vansUsed.size,
    }));
  },

  getDormitoryReport: async () => {
    const dorms = [];
    const rooms = [];
    const roomAssignments = [];

    return dorms.map((dorm) => {
      const dormRooms = rooms.filter((r) => r.dormitoryId === dorm.id);
      const capacity = dormRooms.reduce((acc, r) => acc + r.capacity, 0);
      const occupiedBeds = roomAssignments
        .filter((ra) => dormRooms.some((dr) => dr.id === ra.roomId))
        .reduce((acc, ra) => acc + 1, 0);

      return {
        dormitory: dorm.name,
        roomsCount: dormRooms.length,
        capacity,
        occupiedBeds,
        availableBeds: capacity - occupiedBeds,
      };
    });
  },

  getUtilityReport: async () => {
    const utilities = [];

    const byMonthDorm = utilities.reduce((acc: any, u) => {
      const key = `${u.month}-${u.year}-${u.dormitoryId}`;
      if (!acc[key]) {
        acc[key] = {
          month: `${u.year}-${u.month.toString().padStart(2, "0")}`,
          dormitoryId: u.dormitoryId,
          totalWaterCost: 0,
          totalElectricityCost: 0,
          paid: 0,
          pending: 0,
        };
      }
      acc[key].totalWaterCost += u.waterAmount;
      acc[key].totalElectricityCost += u.electricityAmount;

      const isPaid = u.status === "paid";
      if (isPaid) {
        acc[key].paid += u.waterAmount + u.electricityAmount;
      } else {
        acc[key].pending += u.waterAmount + u.electricityAmount;
      }
      return acc;
    }, {});

    return Object.values(byMonthDorm);
  },

  getDocumentStatusReport: async () => {
    const docs = [];
    const submissions = [];

    return docs.map((doc) => {
      const relatedSubmissions = submissions.filter(
        (s) => s.documentId === doc.id,
      );
      return {
        requiredDocument: doc.title,
        category: doc.category,
        targetGroup: doc.targetType,
        submitted: relatedSubmissions.filter(
          (s) => s.status === "approved" || s.status === "pending",
        ).length,
        pending: relatedSubmissions.filter((s) => s.status === "pending")
          .length,
        rejected: relatedSubmissions.filter((s) => s.status === "rejected")
          .length,
      };
    });
  },
};
