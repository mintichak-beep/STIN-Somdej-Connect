import { Course } from '../types/db';
import { FirestoreService } from './firestore.service';
import { auditService } from './audit.service';
import { orderBy, QueryConstraint, where } from 'firebase/firestore';

const courseFS = new FirestoreService<Course>('courses');

function getCurrentUserId(): string {
  try {
    const user = localStorage.getItem('cpatms_user');
    return user ? JSON.parse(user).uid : 'system';
  } catch {
    return 'system';
  }
}

export const courseService = {
  subscribe: (callback: (courses: Course[]) => void) => {
    return courseFS.onSnapshot([orderBy('courseCode', 'asc')], callback);
  },

  getAll: async (search: string = '', status: string = 'all'): Promise<Course[]> => {
    const constraints: QueryConstraint[] = [];
    if (status !== 'all') {
      constraints.push(where('status', '==', status));
    }
    
    let list = await courseFS.getAll(constraints);

    if (search.trim()) {
      const queryStr = search.toLowerCase();
      list = list.filter(item => 
        item.courseCode.toLowerCase().includes(queryStr) ||
        item.courseName.toLowerCase().includes(queryStr)
      );
    }

    return list.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
  },

  getById: async (id: string): Promise<Course | null> => {
    return courseFS.getById(id);
  },

  create: async (data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
    const id = await courseFS.create({
      ...data,
      code: data.courseCode,
      name: data.courseName
    } as any);
    
    const newCourse = await courseFS.getById(id);
    if (!newCourse) throw new Error('Failed to create course');

    await auditService.log(getCurrentUserId(), "CREATE", "Course", id, "Created course");
    return newCourse;
  },

  update: async (id: string, data: Partial<Omit<Course, 'id' | 'createdAt'>>): Promise<Course> => {
    const existing = await courseFS.getById(id);
    if (!existing) throw new Error('Course not found');

    const updatedData: any = { ...data };
    if (data.courseCode) updatedData.code = data.courseCode;
    if (data.courseName) updatedData.name = data.courseName;

    await courseFS.update(id, updatedData);
    const updatedCourse = await courseFS.getById(id);
    if (!updatedCourse) throw new Error('Failed to update course');

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

