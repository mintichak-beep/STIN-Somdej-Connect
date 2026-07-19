import { mockDB } from './mockData';
import { Course } from '../types/db';
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
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_courses') {
        callback();
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (search: string = '', status: string = 'all'): Promise<Course[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let list = mockDB.getCourses();

    if (status !== 'all') {
      list = list.filter(item => item.status === status);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(item => 
        item.courseCode.toLowerCase().includes(query) ||
        item.courseName.toLowerCase().includes(query)
      );
    }

    return list;
  },

  getById: async (id: string): Promise<Course | null> => {
    const list = mockDB.getCourses();
    return list.find(item => item.id === id) || null;
  },

  create: async (data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = mockDB.getCourses();
    
    const newCourse: Course = {
      ...data,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString(),
      // Backward compatibility
      code: data.courseCode,
      name: data.courseName
    };

    list.push(newCourse);
    mockDB.saveCourses(list);
    await auditService.log(getCurrentUserId(), "CREATE", "Course", newCourse.id, "Created course");
    return newCourse;
  },

  update: async (id: string, data: Partial<Omit<Course, 'id' | 'createdAt'>>): Promise<Course> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = mockDB.getCourses();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Course not found');

    const updated: Course = {
      ...list[index],
      ...data,
      // Backward compatibility updates
      code: data.courseCode || list[index].courseCode,
      name: data.courseName || list[index].courseName
    };

    list[index] = updated;
    mockDB.saveCourses(list);
    await auditService.log(getCurrentUserId(), "UPDATE", "Course", id, "Updated course");
    return updated;
  },

  toggleStatus: async (id: string): Promise<Course> => {
    const course = await courseService.getById(id);
    if (!course) throw new Error('Course not found');
    const newStatus = course.status === 'active' ? 'inactive' : 'active';
    return courseService.update(id, { status: newStatus });
  }
};
