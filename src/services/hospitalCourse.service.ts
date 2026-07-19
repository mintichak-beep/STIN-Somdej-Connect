import { HospitalCourse } from '../types/db';

export const hospitalCourseService = {
  getAll: async (): Promise<HospitalCourse[]> => [],
  create: async (data: Omit<HospitalCourse, 'id' | 'startDate' | 'endDate'>): Promise<string> => {
    const list = [];
    const newCourse: HospitalCourse = { ...data, id: `hc-${Date.now()}`, startDate: new Date().toISOString(), endDate: new Date().toISOString(), status: 'active' };
    list.push(newCourse);
    void 0;
    return newCourse.id;
  }
};
