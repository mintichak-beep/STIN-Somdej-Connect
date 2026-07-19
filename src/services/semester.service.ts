import { Semester } from '../types/db';

export interface SemesterFilterOptions {
  search?: string;
  status?: 'active' | 'inactive' | 'archived' | 'all';
  academicYearId?: string;
  sortBy?: 'semesterNumber' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SemesterListResponse {
  data: Semester[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const semesterService = {
  // Realtime subscriber simulator using localStorage custom events
  subscribe: (callback: () => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_semesters') {
        callback();
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (options: SemesterFilterOptions = {}): Promise<SemesterListResponse> => {
    const {
      search = '',
      status = 'all',
      academicYearId = '',
      sortBy = 'semesterNumber',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = options;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    let list = [];

    // Filter by academic year
    if (academicYearId) {
      list = list.filter(item => item.academicYearId === academicYearId);
    }

    // Filter by status
    if (status && status !== 'all') {
      list = list.filter(item => item.status === status);
    }

    // Filter by search query
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(item => 
        item.semesterName.toLowerCase().includes(query) ||
        item.semesterNumber.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    }

    // Sorting
    list.sort((a, b) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB, undefined, { numeric: true })
          : valB.localeCompare(valA, undefined, { numeric: true });
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

  getById: async (id: string): Promise<Semester | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const list = [];
    return list.find(item => item.id === id) || null;
  },

  getByAcademicYear: async (academicYearId: string): Promise<Semester[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const list = [];
    return list.filter(item => item.academicYearId === academicYearId);
  },

  validateDates: (data: Partial<Semester>) => {
    const { startDate, endDate, registrationStart, registrationEnd } = data;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        throw new Error('Semester End Date must be strictly after the Start Date.');
      }
    }

    if (registrationStart && registrationEnd) {
      const regStart = new Date(registrationStart);
      const regEnd = new Date(registrationEnd);
      if (regEnd <= regStart) {
        throw new Error('Registration End Date must be strictly after the Registration Start Date.');
      }
    }

    if (startDate && registrationStart && registrationEnd) {
      const start = new Date(startDate);
      const regStart = new Date(registrationStart);
      const regEnd = new Date(registrationEnd);

      // Registration is usually before or early in the semester, but registration end should definitely not be after semester end date
      if (endDate) {
        const end = new Date(endDate);
        if (regEnd > end) {
          throw new Error('Registration Period cannot extend beyond the Semester End Date.');
        }
      }
    }
  },

  create: async (data: Omit<Semester, 'id' | 'createdAt' | 'updatedAt' | 'isCurrent'>, userId: string): Promise<Semester> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = [];

    // Check unique within Academic Year
    const duplicate = list.find(item => 
      item.academicYearId === data.academicYearId && 
      item.semesterNumber.trim().toLowerCase() === data.semesterNumber.trim().toLowerCase() &&
      item.status !== 'archived'
    );
    if (duplicate) {
      throw new Error(`Semester '${data.semesterNumber}' already exists within the selected Academic Year.`);
    }

    // Validate dates
    semesterService.validateDates(data);

    const newSemester: Semester = {
      ...data,
      id: `sem-${Date.now()}`,
      isCurrent: false, // Default false, must be explicitly toggled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(newSemester);
    void 0;

    void 0;

    return newSemester;
  },

  update: async (id: string, data: Partial<Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Semester> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = [];
    const index = list.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error('Semester not found.');
    }

    const existing = list[index];

    // Check uniqueness if semesterNumber or academicYearId changes
    const checkYearId = data.academicYearId ?? existing.academicYearId;
    const checkNumber = data.semesterNumber ?? existing.semesterNumber;

    if (
      (data.semesterNumber && data.semesterNumber.trim().toLowerCase() !== existing.semesterNumber.trim().toLowerCase()) ||
      (data.academicYearId && data.academicYearId !== existing.academicYearId)
    ) {
      const duplicate = list.find(item => 
        item.id !== id &&
        item.academicYearId === checkYearId &&
        item.semesterNumber.trim().toLowerCase() === checkNumber.trim().toLowerCase() &&
        item.status !== 'archived'
      );
      if (duplicate) {
        throw new Error(`Semester '${checkNumber}' already exists within the Academic Year.`);
      }
    }

    // Validate dates
    const mergedDates = {
      startDate: data.startDate ?? existing.startDate,
      endDate: data.endDate ?? existing.endDate,
      registrationStart: data.registrationStart ?? existing.registrationStart,
      registrationEnd: data.registrationEnd ?? existing.registrationEnd
    };
    semesterService.validateDates(mergedDates);

    const updatedSemester: Semester = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    list[index] = updatedSemester;
    void 0;

    void 0;

    return updatedSemester;
  },

  delete: async (id: string, userId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check reference validation: check if assigned to students or room assignments
    const students = [];
    const hasStudents = students.some(s => s.semester === id || (s.academicYearId && s.semester === '1' && id.endsWith('-1'))); 
    // Wait, let's keep it safe: if students list refers to semester id or number, do a comprehensive check
    if (hasStudents) {
      throw new Error('Cannot delete this Semester because it is currently assigned to one or more student profiles.');
    }

    const list = [];
    const itemToDelete = list.find(item => item.id === id);
    if (!itemToDelete) {
      throw new Error('Semester not found.');
    }

    const filtered = list.filter(item => item.id !== id);
    void 0;

    void 0;
  },

  setStatus: async (id: string, status: 'active' | 'inactive', userId: string): Promise<Semester> => {
    return semesterService.update(id, { status }, userId);
  },

  setCurrent: async (id: string, userId: string): Promise<Semester> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = [];
    const index = list.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error('Semester not found.');
    }

    const selected = list[index];
    const academicYearId = selected.academicYearId;

    // Reset current flag for ALL semesters within that academic year or all together
    // Usually, isCurrent is global or per academic year. Let's make it global or per academic year. Let's make it global so only ONE semester is current across the system!
    const updatedList = list.map(item => ({
      ...item,
      isCurrent: item.id === id,
      updatedAt: new Date().toISOString()
    }));

    void 0;

    void 0;

    return updatedList[index];
  },

  archive: async (id: string, userId: string): Promise<Semester> => {
    return semesterService.update(id, { status: 'archived', isCurrent: false }, userId);
  },

  restore: async (id: string, userId: string): Promise<Semester> => {
    return semesterService.update(id, { status: 'inactive' }, userId);
  }
};
