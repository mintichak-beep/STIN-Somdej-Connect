import { Course } from '../types/db';
import { storage } from '../lib/storage';
import { auditService } from './audit.service';

function getCurrentUserId(): string {
  try {
    const user = localStorage.getItem('cpatms_user');
    return user ? JSON.parse(user).uid : 'system';
  } catch {
    return 'system';
  }
}

export const courseService = {
  subscribe: (callback: () => void) => {
    callback();
    return () => {};
  },

  getAll: async (search: string = '', status: string = 'all'): Promise<Course[]> => {
    let list = storage.get<Course[]>('courses') || [];

    if (status !== 'all') {
      list = list.filter(item => item.status === status);
    }

    if (search.trim()) {
      const queryStr = search.toLowerCase();
      list = list.filter(item => 
        item.courseCode.toLowerCase().includes(queryStr) ||
        item.courseName.toLowerCase().includes(queryStr)
      );
    }

    return list;
  },

  getById: async (id: string): Promise<Course | null> => {
    const list = storage.get<Course[]>('courses') || [];
    return list.find(c => c.id === id) || null;
  },

  create: async (data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
    const list = storage.get<Course[]>('courses') || [];
    const newCourse: Course = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      code: data.courseCode,
      name: data.courseName
    };
    list.push(newCourse);
    storage.set('courses', list);
    await auditService.log(getCurrentUserId(), "CREATE", "Course", newCourse.id!, "Created course");
    return newCourse;
  },

  update: async (id: string, data: Partial<Omit<Course, 'id' | 'createdAt'>>): Promise<Course> => {
    const list = storage.get<Course[]>('courses') || [];
    const index = list.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Course not found');

    const updatedCourse: Course = {
      ...list[index],
      ...data,
      code: data.courseCode || list[index].courseCode,
      name: data.courseName || list[index].courseName
    } as Course;

    list[index] = updatedCourse;
    storage.set('courses', list);
    await auditService.log(getCurrentUserId(), "UPDATE", "Course", id, "Updated course");
    return updatedCourse;
  },

  toggleStatus: async (id: string): Promise<Course> => {
    const course = await courseService.getById(id);
    if (!course) throw new Error('Course not found');
    const newStatus = course.status === 'active' ? 'inactive' : 'active';
    return courseService.update(id, { status: newStatus });
  }
};

