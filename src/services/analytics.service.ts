
export const analyticsService = {
  getDashboardAnalytics: async () => {
    const students = [];
    const rooms = [];
    const schedules = [];
    const hospitals = [];
    const vehicles = [];
    const assignments = [];

    // Students requiring accommodation: rotation DRส or ANCส
    const reqAccommodation = students.filter(s => s.accommodationPeriod === 'DRส' || s.accommodationPeriod === 'ANCส');
    const allocatedStudentsCount = students.filter(s => s.roomId).length;
    const waitingStudentsCount = reqAccommodation.filter(s => !s.roomId).length;

    // Bed computations
    let totalBeds = 0;
    let occupiedBeds = 0;
    rooms.forEach(r => {
      totalBeds += r.capacity || 0;
      occupiedBeds += r.occupiedCount || 0;
    });

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Hospital statistics
    const hospitalStudentMap: Record<string, number> = {};
    students.forEach(s => {
      if (s.hospital) {
        hospitalStudentMap[s.hospital] = (hospitalStudentMap[s.hospital] || 0) + 1;
      }
    });
    const hospitalDistribution = Object.entries(hospitalStudentMap).map(([name, count]) => ({
      hospital: name,
      count
    }));

    // Period distribution (for timeline)
    const periodStudentMap: Record<string, number> = {};
    students.forEach(s => {
      const period = s.accommodationPeriod || s.DRSchedule || 'No Period';
      periodStudentMap[period] = (periodStudentMap[period] || 0) + 1;
    });
    const periodDistribution = Object.entries(periodStudentMap).map(([period, count]) => ({
      period,
      count
    }));

    // Room occupancies
    const roomOccupancies = rooms.map(r => ({
      roomNumber: r.roomNumber,
      capacity: r.capacity,
      occupied: r.occupiedCount,
      rate: r.capacity > 0 ? Math.round((r.occupiedCount / r.capacity) * 100) : 0,
      status: r.status
    }));

    // Transportation usage
    const tripUsage = schedules.map(s => {
      const vehicle = vehicles.find(v => v.id === s.vehicleId);
      const tripAssignments = assignments.filter(a => a.scheduleId === s.id && a.status === 'active');
      return {
        tripId: s.id,
        route: s.route,
        vehicle: vehicle ? `${vehicle.model} (${vehicle.plateNumber})` : 'Unknown Vehicle',
        capacity: vehicle ? vehicle.capacity : 14,
        assignedCount: tripAssignments.length,
        usageRate: vehicle && vehicle.capacity > 0 ? Math.round((tripAssignments.length / vehicle.capacity) * 100) : 0
      };
    });

    return {
      stats: {
        totalStudents: students.length,
        allocatedStudents: allocatedStudentsCount,
        waitingStudents: waitingStudentsCount,
        totalRooms: rooms.length,
        occupiedRooms: rooms.filter(r => r.occupiedCount > 0).length,
        availableRooms: rooms.filter(r => r.occupiedCount < r.capacity && r.status !== 'maintenance').length,
        occupancyRate,
        totalHospitals: hospitals.length,
        totalVehicles: vehicles.length,
        totalTrips: schedules.length,
        totalBeds,
        occupiedBeds
      },
      hospitalDistribution,
      periodDistribution,
      roomOccupancies,
      tripUsage
    };
  }
};

