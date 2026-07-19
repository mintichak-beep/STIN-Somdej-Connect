import { Student, Teacher, RoomAssignment, TransportAssignment, RecentActivity } from '../types/db';

export const dashboardService = {
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>, actorName: string, actorId: string): Student => {
    const students = [];
    const newStudent: Student = {
      ...student,
      id: `st-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    students.push(newStudent);
    void 0;

    // If a room is assigned during creation, handle its counter
    if (student.roomId) {
      const rooms = [];
      const updatedRooms = rooms.map(r => {
        if (r.id === student.roomId) {
          const count = r.occupiedCount + 1;
          return {
            ...r,
            occupiedCount: count,
            status: count >= r.capacity ? 'full' as const : 'active' as const
          };
        }
        return r;
      });
      void 0;

      // Create a Room Assignment record
      const assignments = [];
      assignments.push({
        id: `ra-${Date.now()}`,
        roomId: student.roomId,
        studentId: newStudent.id,
        academicYearId: student.academicYearId,
        semester: student.semester,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().split('T')[0], // 4 months
        status: 'active'
      });
      void 0;
    }

    void 0;

    return newStudent;
  },

  addTeacher: (teacher: Omit<Teacher, 'id'>, actorName: string, actorId: string): Teacher => {
    const teachers = [];
    const newTeacher: Teacher = {
      ...teacher,
      id: `t-${Date.now()}`
    };
    teachers.push(newTeacher);
    void 0;

    void 0;

    return newTeacher;
  },

  assignRoom: (roomId: string, studentId: string, academicYearId: string, semester: string, actorName: string, actorId: string) => {
    const rooms = [];
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) throw new Error('Room not found');
    if (targetRoom.status === 'full' || targetRoom.occupiedCount >= targetRoom.capacity) {
      throw new Error('Room is already fully occupied');
    }

    // Update Student Room ID
    const students = [];
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) throw new Error('Student not found');
    
    const prevRoomId = students[studentIndex].roomId;
    students[studentIndex].roomId = roomId;
    void 0;

    // Adjust counts of previous room and new room
    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        const count = r.occupiedCount + 1;
        return { ...r, occupiedCount: count, status: count >= r.capacity ? 'full' as const : 'active' as const };
      }
      if (prevRoomId && r.id === prevRoomId) {
        const count = Math.max(0, r.occupiedCount - 1);
        return { ...r, occupiedCount: count, status: 'active' as const };
      }
      return r;
    });
    void 0;

    // Create Assignment
    const assignments = [];
    // Complete previous assignments of this student
    const updatedAssignments = assignments.map(a => {
      if (a.studentId === studentId && a.status === 'active') {
        return { ...a, status: 'completed' as const, endDate: new Date().toISOString().split('T')[0] };
      }
      return a;
    });

    updatedAssignments.push({
      id: `ra-${Date.now()}`,
      roomId,
      studentId,
      academicYearId,
      semester,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().split('T')[0],
      status: 'active'
    });
    void 0;

    const studentName = students[studentIndex].name;
    void 0;
  },

  assignTransportation: (scheduleId: string, studentId: string, pickup: string, dropoff: string, actorName: string, actorId: string) => {
    const schedules = [];
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) throw new Error('Transportation route schedule not found');

    const assignments = [];
    // Check if student is already active on this schedule
    const exists = assignments.some(a => a.studentId === studentId && a.scheduleId === scheduleId && a.status === 'active');
    if (exists) throw new Error('Student is already assigned to this vehicle schedule');

    const newAssignment: TransportAssignment = {
      id: `ta-${Date.now()}`,
      scheduleId,
      studentId,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      status: 'active'
    };
    assignments.push(newAssignment);
    void 0;

    const students = [];
    const studentName = students.find(s => s.id === studentId)?.name || 'Student';

    void 0;
  },

  importExcel: (rawText: string, actorName: string, actorId: string): { importedCount: number; errors: string[] } => {
    // Simulates an excel import from a text CSV
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) {
      return { importedCount: 0, errors: ['No data found or empty spreadsheet'] };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const studentIdIndex = headers.indexOf('studentid');
    const nameIndex = headers.indexOf('name');
    const emailIndex = headers.indexOf('email');
    const phoneIndex = headers.indexOf('phone');

    if (studentIdIndex === -1 || nameIndex === -1) {
      return { importedCount: 0, errors: ['Missing required columns: StudentID and Name'] };
    }

    const defaultAY = 'ay-2569';
    const defaultCourse = 'c-maternal1';
    const defaultSection = 's-sec1';
    const defaultHospital = 'h-siriraj';

    const currentStudents = [];
    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      const sId = parts[studentIdIndex];
      const name = parts[nameIndex];
      const email = emailIndex !== -1 ? parts[emailIndex] : `${sId.toLowerCase()}@stin.ac.th`;
      const phone = phoneIndex !== -1 ? parts[phoneIndex] : '081-000-0000';

      if (!sId || !name) {
        errors.push(`Row ${i + 1}: Student ID or Name is blank.`);
        continue;
      }

      if (currentStudents.some(s => s.studentId === sId)) {
        errors.push(`Row ${i + 1}: Student ID ${sId} already exists in database.`);
        continue;
      }

      const newStudent: Student = {
        id: `st-${Date.now()}-${i}`,
        studentId: sId,
        studentNumber: sId,
        studentName: name,
        section: defaultSection,
        academicYear: defaultAY,
        hospital: defaultHospital,
        rotationGroup: 'Group A',
        DRSchedule: 'ANCส',
        name,
        email,
        phone,
        academicYearId: defaultAY,
        semester: '1',
        courseId: defaultCourse,
        sectionId: defaultSection,
        hospitalId: defaultHospital,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
        status: 'active'
      };
      currentStudents.push(newStudent);
      importedCount++;
    }

    if (importedCount > 0) {
      void 0;
      void 0;
    }

    return { importedCount, errors };
  },

  generateMockExcelTemplate: (): string => {
    return `StudentID,Name,Email,Phone
S6601051,Somrudee Jaidee,somrudee@stin.ac.th,081-222-3333
S6601052,Wanchai Raktham,wanchai@stin.ac.th,082-333-4444
S6601053,Nattapol Srisook,nattapol@stin.ac.th,083-444-5555`;
  }
};
