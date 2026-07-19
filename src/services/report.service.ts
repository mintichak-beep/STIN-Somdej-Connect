import { Student, Room, TransportSchedule, TransportAssignment, Hospital } from '../types/db';

export const reportService = {
  getAccommodationReport: async () => {
    const students = [];
    const rooms = [];
    const buildings = [];

    // 1. Student List by Room
    const studentsByRoom = students.filter(s => s.roomId).map(s => {
      const room = rooms.find(r => r.id === s.roomId);
      const building = room ? buildings.find(b => b.id === room.buildingId) : null;
      return {
        studentId: s.id,
        studentNumber: s.studentNumber,
        studentName: s.studentName,
        hospital: s.hospital,
        accommodationPeriod: s.accommodationPeriod || s.DRSchedule || 'N/A',
        roomNumber: room ? room.roomNumber : 'Unassigned',
        buildingName: building ? building.buildingName : 'Unassigned',
        bedNumber: s.bedId || 'N/A'
      };
    });

    // 2. Waiting List
    const waitingList = students.filter(s => (s.accommodationPeriod === 'DRส' || s.accommodationPeriod === 'ANCส') && !s.roomId);

    // 3. Room Occupancy Summary
    const roomSummary = rooms.map(r => {
      const building = buildings.find(b => b.id === r.buildingId);
      const assignedStudents = students.filter(s => s.roomId === r.id);
      return {
        id: r.id,
        roomNumber: r.roomNumber,
        buildingName: building ? building.buildingName : 'Unknown',
        capacity: r.capacity,
        occupied: assignedStudents.length,
        available: Math.max(0, r.capacity - assignedStudents.length),
        status: r.status,
        gender: r.gender,
        students: assignedStudents.map(s => s.studentName).join(', ')
      };
    });

    return {
      students,
      rooms,
      studentsByRoom,
      waitingList,
      roomSummary
    };
  },

  getTransportationReport: async () => {
    const schedules = [];
    const vehicles = [];
    const drivers = [];
    const students = [];
    const assignments = [];

    // Generate detailed transportation list
    const scheduleSummary = schedules.map(s => {
      const vehicle = vehicles.find(v => v.id === s.vehicleId);
      const driver = drivers.find(d => d.id === s.driverId);
      const tripAssignments = assignments.filter(a => a.scheduleId === s.id && a.status === 'active');
      const tripStudents = tripAssignments.map(a => {
        const student = students.find(st => st.id === a.studentId);
        return {
          studentId: a.studentId,
          studentName: student ? student.studentName : 'Unknown',
          studentNumber: student ? student.studentNumber : 'N/A',
          hospital: student ? student.hospital : 'N/A',
          roomId: student ? student.roomId : '',
          pickup: a.pickupLocation,
          dropoff: a.dropoffLocation
        };
      });

      return {
        id: s.id,
        route: s.route,
        departureTime: s.departureTime,
        status: s.status,
        vehiclePlate: vehicle ? vehicle.plateNumber : 'N/A',
        vehicleModel: vehicle ? vehicle.model : 'N/A',
        driverName: driver ? driver.name : 'N/A',
        driverPhone: driver ? driver.phone : 'N/A',
        capacity: vehicle ? vehicle.capacity : 14,
        occupied: tripStudents.length,
        available: Math.max(0, (vehicle ? vehicle.capacity : 14) - tripStudents.length),
        students: tripStudents
      };
    });

    return {
      schedules,
      scheduleSummary
    };
  },

  getHospitalReport: async () => {
    const students = [];
    const hospitals = [];
    const rooms = [];
    const buildings = [];

    const hospitalStats = hospitals.map(h => {
      const hospStudents = students.filter(s => s.hospital === h.hospitalNameEN || s.hospital === h.shortName);
      const hospBuildings = buildings.filter(b => b.hospitalId === h.id);
      
      let hospTotalBeds = 0;
      let hospOccupiedBeds = 0;
      hospBuildings.forEach(b => {
        const hospRooms = rooms.filter(r => r.buildingId === b.id);
        hospRooms.forEach(r => {
          hospTotalBeds += r.capacity;
          hospOccupiedBeds += r.occupiedCount;
        });
      });

      return {
        id: h.id,
        hospitalName: h.hospitalNameEN,
        shortName: h.shortName,
        studentCount: hospStudents.length,
        totalBeds: hospTotalBeds,
        occupiedBeds: hospOccupiedBeds,
        availableBeds: Math.max(0, hospTotalBeds - hospOccupiedBeds),
        occupancyRate: hospTotalBeds > 0 ? Math.round((hospOccupiedBeds / hospTotalBeds) * 100) : 0
      };
    });

    return {
      hospitalStats
    };
  },

  getStudentReport: async () => {
    const students = [];
    const rooms = [];

    const studentSummary = students.map(s => {
      const room = rooms.find(r => r.id === s.roomId);
      return {
        id: s.id,
        studentNumber: s.studentNumber,
        studentName: s.studentName,
        section: s.section,
        academicYear: s.academicYear,
        hospital: s.hospital,
        rotationGroup: s.rotationGroup,
        accommodationPeriod: s.accommodationPeriod || s.DRSchedule || 'N/A',
        roomNumber: room ? room.roomNumber : 'Unassigned',
        status: s.status
      };
    });

    return {
      studentSummary
    };
  }
};

