import { mockDB } from './mockData';
import { Student, Teacher, RoomAssignment, TransportAssignment, RecentActivity } from '../types/db';

export const dashboardService = {
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>, actorName: string, actorId: string): Student => {
    const students = mockDB.getStudents();
    const newStudent: Student = {
      ...student,
      id: `st-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    students.push(newStudent);
    mockDB.saveStudents(students);

    // If a room is assigned during creation, handle its counter
    if (student.roomId) {
      const rooms = mockDB.getRooms();
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
      mockDB.saveRooms(updatedRooms);

      // Create a Room Assignment record
      const assignments = mockDB.getRoomAssignments();
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
      mockDB.saveRoomAssignments(assignments);
    }

    mockDB.addActivity({
      type: 'student_add',
      title: 'New Student Registered',
      description: `Student ${newStudent.name} (${newStudent.studentId}) was added successfully.`,
      userId: actorId,
      userDisplayName: actorName
    });

    return newStudent;
  },

  addTeacher: (teacher: Omit<Teacher, 'id'>, actorName: string, actorId: string): Teacher => {
    const teachers = mockDB.getTeachers();
    const newTeacher: Teacher = {
      ...teacher,
      id: `t-${Date.now()}`
    };
    teachers.push(newTeacher);
    mockDB.saveTeachers(teachers);

    mockDB.addActivity({
      type: 'teacher_add',
      title: 'New Teacher Added',
      description: `Teacher ${newTeacher.name} was registered under ${newTeacher.department} Department.`,
      userId: actorId,
      userDisplayName: actorName
    });

    return newTeacher;
  },

  assignRoom: (roomId: string, studentId: string, academicYearId: string, semester: string, actorName: string, actorId: string) => {
    const rooms = mockDB.getRooms();
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) throw new Error('Room not found');
    if (targetRoom.status === 'full' || targetRoom.occupiedCount >= targetRoom.capacity) {
      throw new Error('Room is already fully occupied');
    }

    // Update Student Room ID
    const students = mockDB.getStudents();
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) throw new Error('Student not found');
    
    const prevRoomId = students[studentIndex].roomId;
    students[studentIndex].roomId = roomId;
    mockDB.saveStudents(students);

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
    mockDB.saveRooms(updatedRooms);

    // Create Assignment
    const assignments = mockDB.getRoomAssignments();
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
    mockDB.saveRoomAssignments(updatedAssignments);

    const studentName = students[studentIndex].name;
    mockDB.addActivity({
      type: 'room_assign',
      title: 'Dormitory Room Assigned',
      description: `Assigned room ${targetRoom.roomNumber} to student ${studentName}`,
      userId: actorId,
      userDisplayName: actorName
    });
  },

  assignTransportation: (scheduleId: string, studentId: string, pickup: string, dropoff: string, actorName: string, actorId: string) => {
    const schedules = mockDB.getTransportSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) throw new Error('Transportation route schedule not found');

    const assignments = mockDB.getTransportAssignments();
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
    mockDB.saveTransportAssignments(assignments);

    const students = mockDB.getStudents();
    const studentName = students.find(s => s.id === studentId)?.name || 'Student';

    mockDB.addActivity({
      type: 'transport_assign',
      title: 'Transportation Trip Assigned',
      description: `Assigned ${studentName} to route: ${schedule.route}`,
      userId: actorId,
      userDisplayName: actorName
    });
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

    const defaultAY = mockDB.getAcademicYears().find(a => a.status === 'active')?.id || 'ay-2569';
    const defaultCourse = mockDB.getCourses()[0]?.id || 'c-maternal1';
    const defaultSection = mockDB.getSections().find(s => s.courseId === defaultCourse)?.id || 's-sec1';
    const defaultHospital = mockDB.getHospitals()[0]?.id || 'h-siriraj';

    const currentStudents = mockDB.getStudents();
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
      mockDB.saveStudents(currentStudents);
      mockDB.addActivity({
        type: 'report_gen',
        title: 'Excel Data Imported',
        description: `Successfully imported ${importedCount} students from spreadsheet.`,
        userId: actorId,
        userDisplayName: actorName
      });
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
