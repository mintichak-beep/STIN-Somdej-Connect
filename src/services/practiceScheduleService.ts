import * as XLSX from 'xlsx';
import { mockDB } from './mockData';
import { PracticeSchedule, PracticeScheduleAssignment } from '../types/db';

export const practiceScheduleService = {
  parseScheduleFile: async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];
          resolve(rawJson);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  },

  validateScheduleData: async (records: any[]): Promise<{ valid: any[], invalid: any[] }> => {
    const students = mockDB.getStudents();
    const courses = mockDB.getCourses();
    const hospitals = mockDB.getHospitals();

    const valid: any[] = [];
    const invalid: any[] = [];

    records.forEach((record, index) => {
      let isValid = true;
      let errors = [];

      // Check student
      if (!students.find(s => s.studentId === String(record.studentId))) {
        isValid = false;
        errors.push('INVALID STUDENT');
      }

      // Check course
      if (!courses.find(c => c.name === record.course)) {
        isValid = false;
        errors.push('INVALID COURSE');
      }

      // Check hospital
      if (!hospitals.find(h => h.hospitalNameTH === record.hospital)) {
        isValid = false;
        errors.push('INVALID HOSPITAL');
      }

      // Date validation
      if (new Date(record.startDate) >= new Date(record.endDate)) {
        isValid = false;
        errors.push('INVALID DATE RANGE');
      }

      if (isValid) {
        valid.push(record);
      } else {
        invalid.push({ ...record, errors });
      }
    });

    return { valid, invalid };
  },

  importSchedules: async (records: any[], teacherId: string) => {
    const schedules = mockDB.getPracticeSchedules();
    const assignments = mockDB.getPracticeScheduleAssignments();
    const courses = mockDB.getCourses();
    const hospitals = mockDB.getHospitals();

    records.forEach(record => {
      const course = courses.find(c => c.name === record.course);
      const hospital = hospitals.find(h => h.hospitalNameTH === record.hospital);
      const student = mockDB.getStudents().find(s => s.studentId === String(record.studentId));

      if (course && hospital && student) {
        const scheduleId = `sched-${Date.now()}-${Math.random()}`;
        const newSchedule: PracticeSchedule = {
          id: scheduleId,
          courseId: course.id,
          academicYear: '2569',
          semester: '1',
          practiceGroupId: record.practiceGroup,
          hospitalId: hospital.id,
          ward: record.ward,
          startDate: record.startDate,
          endDate: record.endDate,
          shift: record.shift,
          createdBy: teacherId,
          createdAt: new Date().toISOString()
        };
        schedules.push(newSchedule);

        const newAssignment: PracticeScheduleAssignment = {
          id: `assign-${Date.now()}-${Math.random()}`,
          studentId: student.id,
          scheduleId: scheduleId,
          courseId: course.id,
          practiceGroupId: record.practiceGroup,
          hospitalId: hospital.id,
          status: 'assigned',
          createdAt: new Date().toISOString()
        };
        assignments.push(newAssignment);
      }
    });

    mockDB.savePracticeSchedules(schedules);
    mockDB.savePracticeScheduleAssignments(assignments);
  },

  getSchedules: () => {
    return mockDB.getPracticeSchedules();
  }
};
