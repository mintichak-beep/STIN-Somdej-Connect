import { mockDB } from './mockData';
import { AcademicYear } from '../types/db';

export interface AcademicYearFilterOptions {
  search?: string;
  status?: 'active' | 'inactive' | 'archived' | 'all';
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AcademicYearListResponse {
  data: AcademicYear[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const academicYearService = {
  // Realtime subscriber simulator using localStorage custom events
  subscribe: (callback: () => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_academic_years') {
        callback();
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (options: AcademicYearFilterOptions = {}): Promise<AcademicYearListResponse> => {
    const {
      search = '',
      status = 'all',
      sortBy = 'name',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = options;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    let list = mockDB.getAcademicYears();

    // Filter by status
    if (status && status !== 'all') {
      list = list.filter(item => item.status === status);
    } else {
      // By default in 'all' view, don't show archived unless specifically filtered (standard practice) or show all
      // Let's keep it clean: if status is 'all', show all except archived unless requested
      // Wait, let's include active/inactive by default, and if they specifically want archived, they choose archived.
      // Or show all. Let's show active and inactive by default when status is 'all', and archived only when status is 'archived'
      // Wait, let's allow showing archived as well if we filter, or show everything if status is 'all'.
      // Let's show everything except archived by default in standard lists, or everything. Let's show all of them.
    }

    // Filter by search query (Academic Year Name, Description, Status)
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.status.toLowerCase().includes(query)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB, undefined, { numeric: true })
          : valB.localeCompare(valA, undefined, { numeric: true });
      }
      
      // Numeric fallback
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      return 0;
    });

    // Pagination
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginatedList = list.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedList,
      total,
      page,
      limit,
      totalPages
    };
  },

  getById: async (id: string): Promise<AcademicYear | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const list = mockDB.getAcademicYears();
    return list.find(item => item.id === id) || null;
  },

  create: async (data: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>, userId: string): Promise<AcademicYear> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = mockDB.getAcademicYears();

    // Check uniqueness constraint
    const duplicate = list.find(item => item.name.trim() === data.name.trim() && item.status !== 'archived');
    if (duplicate) {
      throw new Error(`Academic Year '${data.name}' already exists.`);
    }

    const startYearNum = Number(data.startYear);
    const endYearNum = Number(data.endYear);
    if (isNaN(startYearNum) || isNaN(endYearNum)) {
      throw new Error('Start Year and End Year must be valid numbers.');
    }
    if (endYearNum <= startYearNum) {
      throw new Error('End Year must be strictly greater than Start Year.');
    }

    const newYear: AcademicYear = {
      ...data,
      id: `ay-${Date.now()}`,
      year: data.name, // compatibility
      isActive: data.status === 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId
    };

    list.push(newYear);
    mockDB.saveAcademicYears(list);

    // Add activity
    mockDB.addActivity({
      type: 'student_add', // or custom
      title: 'Academic Year Created',
      description: `Academic Year ${newYear.name} was successfully created by Admin.`,
      userId,
      userDisplayName: 'Administrator'
    });

    return newYear;
  },

  update: async (id: string, data: Partial<Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>, userId: string): Promise<AcademicYear> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = mockDB.getAcademicYears();
    const index = list.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error('Academic Year not found.');
    }

    const existing = list[index];

    // Check uniqueness if name is changed
    if (data.name && data.name.trim() !== existing.name.trim()) {
      const duplicate = list.find(item => item.id !== id && item.name.trim() === data.name!.trim() && item.status !== 'archived');
      if (duplicate) {
        throw new Error(`Academic Year '${data.name}' already exists.`);
      }
    }

    const startYearNum = Number(data.startYear ?? existing.startYear);
    const endYearNum = Number(data.endYear ?? existing.endYear);
    if (endYearNum <= startYearNum) {
      throw new Error('End Year must be strictly greater than Start Year.');
    }

    const updatedYear: AcademicYear = {
      ...existing,
      ...data,
      year: data.name ?? existing.year, // compatibility
      isActive: data.status !== undefined ? (data.status === 'active') : existing.isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    list[index] = updatedYear;
    mockDB.saveAcademicYears(list);

    mockDB.addActivity({
      type: 'student_add',
      title: 'Academic Year Updated',
      description: `Academic Year ${updatedYear.name} was updated.`,
      userId,
      userDisplayName: 'Administrator'
    });

    return updatedYear;
  },

  delete: async (id: string, userId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check references before deleting
    const students = mockDB.getStudents();
    const hasStudents = students.some(s => s.academicYearId === id);
    if (hasStudents) {
      throw new Error('Cannot delete this Academic Year because it is currently assigned to one or more students.');
    }

    const semesters = mockDB.getSemesters();
    const hasSemesters = semesters.some(s => s.academicYearId === id);
    if (hasSemesters) {
      throw new Error('Cannot delete this Academic Year because it contains active semesters. Delete the semesters first.');
    }

    const list = mockDB.getAcademicYears();
    const itemToDelete = list.find(item => item.id === id);
    if (!itemToDelete) {
      throw new Error('Academic Year not found.');
    }

    const filtered = list.filter(item => item.id !== id);
    mockDB.saveAcademicYears(filtered);

    mockDB.addActivity({
      type: 'student_add',
      title: 'Academic Year Deleted',
      description: `Academic Year ${itemToDelete.name} was deleted.`,
      userId,
      userDisplayName: 'Administrator'
    });
  },

  setStatus: async (id: string, status: 'active' | 'inactive', userId: string): Promise<AcademicYear> => {
    return academicYearService.update(id, { status, isActive: status === 'active' }, userId);
  },

  archive: async (id: string, userId: string): Promise<AcademicYear> => {
    return academicYearService.update(id, { status: 'archived', isActive: false }, userId);
  },

  restore: async (id: string, userId: string): Promise<AcademicYear> => {
    return academicYearService.update(id, { status: 'inactive', isActive: false }, userId);
  }
};
