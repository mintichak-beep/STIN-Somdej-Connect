import { mockDB } from './mockData';
import { Student, Teacher, Room, Hospital } from '../types/db';

export interface DashboardFilters {
  academicYearId?: string;
  semester?: string;
  courseId?: string;
  sectionId?: string;
  hospitalId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalHospitals: number;
  totalBuildings: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalVehicles: number;
  totalDrivers: number;
  transportationTrips: number;
  academicYearsCount: number;
  coursesCount: number;
  sectionsCount: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DashboardChartData {
  studentByHospital: ChartDataPoint[];
  roomOccupancy: { occupied: number; available: number; maintenance: number };
  transportUsage: ChartDataPoint[];
  teacherDistribution: ChartDataPoint[];
  studentsByCourse: ChartDataPoint[];
  studentsBySection: ChartDataPoint[];
  monthlyPlacementSummary: ChartDataPoint[];
}

export const statisticsService = {
  getFilteredStudents: (filters: DashboardFilters): Student[] => {
    let students = mockDB.getStudents();

    if (filters.academicYearId) {
      students = students.filter(s => s.academicYearId === filters.academicYearId);
    }
    if (filters.semester) {
      students = students.filter(s => s.semester === filters.semester);
    }
    if (filters.courseId) {
      students = students.filter(s => s.courseId === filters.courseId);
    }
    if (filters.sectionId) {
      students = students.filter(s => s.sectionId === filters.sectionId);
    }
    if (filters.hospitalId) {
      students = students.filter(s => s.hospitalId === filters.hospitalId);
    }
    if (filters.startDate) {
      students = students.filter(s => new Date(s.createdAt) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      students = students.filter(s => new Date(s.createdAt) <= new Date(filters.endDate!));
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      students = students.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    return students;
  },

  getStats: (filters: DashboardFilters): DashboardStats => {
    const students = statisticsService.getFilteredStudents(filters);
    const allTeachers = mockDB.getTeachers();
    const allHospitals = mockDB.getHospitals();
    const allBuildings = mockDB.getBuildings();
    const allRooms = mockDB.getRooms();
    const allVehicles = mockDB.getVehicles();
    const allDrivers = mockDB.getDrivers();
    const allSchedules = mockDB.getTransportSchedules();
    const academicYears = mockDB.getAcademicYears();
    const courses = mockDB.getCourses();
    const sections = mockDB.getSections();

    // Filter teachers based on course filters if selected
    let teachers = allTeachers;
    if (filters.courseId) {
      teachers = allTeachers.filter(t => t.courseIds.includes(filters.courseId!));
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      teachers = teachers.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.teacherId.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    }

    // Filter buildings and rooms based on hospital filter
    let buildings = allBuildings;
    let rooms = allRooms;
    let hospitals = allHospitals;

    if (filters.hospitalId) {
      buildings = allBuildings.filter(b => b.hospitalId === filters.hospitalId);
      const bIds = buildings.map(b => b.id);
      rooms = allRooms.filter(r => bIds.includes(r.buildingId));
      hospitals = allHospitals.filter(h => h.id === filters.hospitalId);
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      hospitals = hospitals.filter(h => h.name.toLowerCase().includes(q));
    }

    // Occupied vs Available rooms based on room counts
    let occupiedRooms = 0;
    let availableRooms = 0;
    rooms.forEach(r => {
      if (r.status === 'full') {
        occupiedRooms++;
      } else if (r.occupiedCount > 0) {
        occupiedRooms++; // has students in it
        if (r.status === 'active') {
          availableRooms++; // still has space
        }
      } else {
        if (r.status === 'active') {
          availableRooms++;
        }
      }
    });

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalHospitals: hospitals.length,
      totalBuildings: buildings.length,
      totalRooms: rooms.length,
      occupiedRooms,
      availableRooms,
      totalVehicles: allVehicles.filter(v => v.status === 'active').length,
      totalDrivers: allDrivers.filter(d => d.status === 'active').length,
      transportationTrips: allSchedules.length,
      academicYearsCount: academicYears.length,
      coursesCount: courses.length,
      sectionsCount: sections.length
    };
  },

  getChartData: (filters: DashboardFilters): DashboardChartData => {
    const students = statisticsService.getFilteredStudents(filters);
    const teachers = mockDB.getTeachers();
    const rooms = mockDB.getRooms();
    const hospitals = mockDB.getHospitals();
    const courses = mockDB.getCourses();
    const sections = mockDB.getSections();
    const schedules = mockDB.getTransportSchedules();
    const assignments = mockDB.getTransportAssignments();

    // 1. Student Distribution by Hospital
    const hospMap: Record<string, number> = {};
    hospitals.forEach(h => { hospMap[h.id] = 0; });
    students.forEach(s => {
      if (hospMap[s.hospitalId] !== undefined) {
        hospMap[s.hospitalId]++;
      }
    });
    const studentByHospital = hospitals.map(h => ({
      label: h.name,
      value: hospMap[h.id] || 0
    }));

    // 2. Room Occupancy status distribution
    let occupied = 0;
    let available = 0;
    let maintenance = 0;
    rooms.forEach(r => {
      if (r.status === 'maintenance') {
        maintenance++;
      } else if (r.occupiedCount >= r.capacity) {
        occupied++;
      } else {
        available++;
      }
    });

    // 3. Transportation Usage (Trips occupancy)
    const tripUsageMap: Record<string, number> = {};
    schedules.forEach(sc => { tripUsageMap[sc.id] = 0; });
    assignments.forEach(asg => {
      if (tripUsageMap[asg.scheduleId] !== undefined) {
        tripUsageMap[asg.scheduleId]++;
      }
    });
    const transportUsage = schedules.map(sc => ({
      label: sc.route.replace('STIN Campus ⇄ ', ''),
      value: tripUsageMap[sc.id] || 0
    }));

    // 4. Teacher Distribution by Department
    const deptMap: Record<string, number> = {};
    teachers.forEach(t => {
      deptMap[t.department] = (deptMap[t.department] || 0) + 1;
    });
    const teacherDistribution = Object.keys(deptMap).map(dept => ({
      label: dept,
      value: deptMap[dept]
    }));

    // 5. Students by Course
    const courseMap: Record<string, number> = {};
    courses.forEach(c => { courseMap[c.id] = 0; });
    students.forEach(s => {
      if (courseMap[s.courseId] !== undefined) {
        courseMap[s.courseId]++;
      }
    });
    const studentsByCourse = courses.map(c => ({
      label: `${c.code} - ${c.name.split(' ')[0]}`,
      value: courseMap[c.id] || 0
    }));

    // 6. Students by Section
    const sectionMap: Record<string, number> = {};
    sections.forEach(sec => { sectionMap[sec.id] = 0; });
    students.forEach(s => {
      if (sectionMap[s.sectionId] !== undefined) {
        sectionMap[s.sectionId]++;
      }
    });
    const studentsBySection = sections.map(sec => {
      const course = courses.find(c => c.id === sec.courseId);
      return {
        label: `${course ? course.code : ''} ${sec.name}`,
        value: sectionMap[sec.id] || 0
      };
    });

    // 7. Monthly Placement Summary (Historical trend over past months)
    const monthlyMap: Record<string, number> = {
      'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 12, 'Jun': 24, 'Jul': students.length
    };
    // Let's populate dynamically from student creation months
    students.forEach(s => {
      const date = new Date(s.createdAt);
      const monthStr = date.toLocaleString('default', { month: 'short' });
      if (monthlyMap[monthStr] !== undefined) {
        monthlyMap[monthStr]++;
      } else {
        monthlyMap[monthStr] = 1;
      }
    });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const monthlyPlacementSummary = months.map(m => ({
      label: m,
      value: monthlyMap[m] || 0
    }));

    return {
      studentByHospital,
      roomOccupancy: { occupied, available, maintenance },
      transportUsage,
      teacherDistribution,
      studentsByCourse,
      studentsBySection,
      monthlyPlacementSummary
    };
  }
};
