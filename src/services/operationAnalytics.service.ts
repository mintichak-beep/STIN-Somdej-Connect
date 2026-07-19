import { studentService } from './student.service';
import { courseService } from './course.service';
import { hospitalService } from './hospital.service';
import { practiceGroupService } from './practiceGroup.service';

export const operationAnalyticsService = {
  getStats: async () => {
    const [students, courses, hospitals, groups] = await Promise.all([
      studentService.getStudents(),
      courseService.getAll(),
      hospitalService.getAll({ limit: 1000 }),
      practiceGroupService.getAll()
    ]);

    return {
      totalStudents: students.length,
      totalCourses: courses.length,
      totalHospitals: hospitals.data.length,
      totalGroups: groups.length,
      
      studentsByCourse: courses.map(c => ({
        name: c.courseCode,
        count: students.filter(s => s.courseId === c.id).length
      })).filter(c => c.count > 0),

      studentsByHospital: hospitals.data.map(h => ({
        name: h.shortName || h.hospitalNameEN,
        count: students.filter(s => s.hospitalId === h.id).length
      })).filter(h => h.count > 0),

      studentsByGroup: groups.map(g => ({
        name: g.name,
        count: students.filter(s => s.practiceGroupId === g.id).length
      })).filter(g => g.count > 0),

      recentStudents: [...students]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),

      recentUpdates: [...students]
        .filter(s => s.updatedAt)
        .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
        .slice(0, 5)
    };
  }
};
