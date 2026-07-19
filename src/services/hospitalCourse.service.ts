import { mockDB } from './mockData';
import { HospitalCourse } from '../types/db';

export const hospitalCourseService = {
  getAll: async (): Promise<HospitalCourse[]> => mockDB.getHospitalCourses(),
  create: async (data: Omit<HospitalCourse, 'id' | 'startDate' | 'endDate'>): Promise<string> => {
    const list = mockDB.getHospitalCourses();
    const newCourse: HospitalCourse = { ...data, id: `hc-${Date.now()}`, startDate: new Date().toISOString(), endDate: new Date().toISOString(), status: 'active' };
    list.push(newCourse);
    mockDB.saveHospitalCourses(list);
    return newCourse.id;
  }
};
