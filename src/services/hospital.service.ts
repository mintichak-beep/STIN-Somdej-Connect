import { mockDB } from './mockData';
import { Hospital } from '../types/db';

export interface HospitalFilterOptions {
  search?: string;
  province?: string;
  type?: string;
  status?: 'active' | 'inactive' | 'archived' | 'all';
  sortBy?: 'hospitalCode' | 'hospitalNameTH' | 'hospitalNameEN' | 'studentCapacity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface HospitalListResponse {
  data: Hospital[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HospitalStats {
  numberOfBuildings: number;
  numberOfRooms: number;
  studentCapacity: number;
  teacherCapacity: number;
  currentStudents: number;
  currentTeachers: number;
  currentOccupancy: number;
  occupancyRate: number;
}

export const hospitalService = {
  // Realtime subscriber simulator using localStorage custom events
  subscribe: (callback: () => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_hospitals') {
        callback();
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (options: HospitalFilterOptions = {}): Promise<HospitalListResponse> => {
    const {
      search = '',
      province = 'all',
      type = 'all',
      status = 'all',
      sortBy = 'hospitalNameTH',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = options;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    let list = mockDB.getHospitals();

    // Filter by status
    if (status && status !== 'all') {
      list = list.filter(item => item.status === status);
    } else {
      // In 'all' view, don't show archived unless specifically requested
      list = list.filter(item => item.status !== 'archived');
    }

    // Filter by Province
    if (province && province !== 'all') {
      list = list.filter(item => item.province?.toLowerCase() === province.toLowerCase());
    }

    // Filter by Hospital Type
    if (type && type !== 'all') {
      list = list.filter(item => item.type?.toLowerCase() === type.toLowerCase());
    }

    // Filter by search query (Hospital Name, Code, Province, Coordinator)
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(item => 
        item.hospitalCode.toLowerCase().includes(query) ||
        item.hospitalNameTH.toLowerCase().includes(query) ||
        item.hospitalNameEN.toLowerCase().includes(query) ||
        (item.shortName && item.shortName.toLowerCase().includes(query)) ||
        (item.province && item.province.toLowerCase().includes(query)) ||
        (item.coordinatorName && item.coordinatorName.toLowerCase().includes(query))
      );
    }

    // Sorting
    list.sort((a, b) => {
      let valA: any = a[sortBy] || '';
      let valB: any = b[sortBy] || '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB, 'th', { sensitivity: 'base' })
          : valB.localeCompare(valA, 'th', { sensitivity: 'base' });
      }
      
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

  getById: async (id: string): Promise<Hospital | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const list = mockDB.getHospitals();
    return list.find(item => item.id === id) || null;
  },

  create: async (data: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Hospital> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = mockDB.getHospitals();

    // Check unique hospitalCode
    const duplicateCode = list.find(item => item.hospitalCode.trim().toLowerCase() === data.hospitalCode.trim().toLowerCase() && item.status !== 'archived');
    if (duplicateCode) {
      throw new Error(`Hospital Code '${data.hospitalCode}' is already registered.`);
    }

    // Check unique Name TH
    const duplicateNameTH = list.find(item => item.hospitalNameTH.trim().toLowerCase() === data.hospitalNameTH.trim().toLowerCase() && item.status !== 'archived');
    if (duplicateNameTH) {
      throw new Error(`Thai Hospital Name '${data.hospitalNameTH}' is already registered.`);
    }

    // Check unique Name EN
    const duplicateNameEN = list.find(item => item.hospitalNameEN.trim().toLowerCase() === data.hospitalNameEN.trim().toLowerCase() && item.status !== 'archived');
    if (duplicateNameEN) {
      throw new Error(`English Hospital Name '${data.hospitalNameEN}' is already registered.`);
    }

    const newHospital: Hospital = {
      ...data,
      id: `h-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId,
      // Compatibility fallbacks
      name: data.hospitalNameEN,
      contactName: data.coordinatorName,
      contactPhone: data.coordinatorPhone,
      capacity: data.studentCapacity
    };

    list.push(newHospital);
    mockDB.saveHospitals(list);

    // Track activity
    mockDB.addActivity({
      type: 'student_add', // or generic custom category
      title: 'Hospital Profile Registered',
      description: `${data.hospitalNameEN} (${data.hospitalCode}) has been successfully added.`,
      userId,
      userDisplayName: 'Administrator'
    });

    return newHospital;
  },

  update: async (id: string, data: Partial<Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Hospital> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = mockDB.getHospitals();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Hospital profile not found.');
    }

    const existing = list[index];

    // Check uniqueness if updating hospitalCode
    if (data.hospitalCode && data.hospitalCode.trim().toLowerCase() !== existing.hospitalCode.trim().toLowerCase()) {
      const duplicateCode = list.find(item => item.id !== id && item.hospitalCode.trim().toLowerCase() === data.hospitalCode!.trim().toLowerCase() && item.status !== 'archived');
      if (duplicateCode) {
        throw new Error(`Hospital Code '${data.hospitalCode}' is already registered to another hospital.`);
      }
    }

    // Check uniqueness if updating Name TH
    if (data.hospitalNameTH && data.hospitalNameTH.trim().toLowerCase() !== existing.hospitalNameTH.trim().toLowerCase()) {
      const duplicateTH = list.find(item => item.id !== id && item.hospitalNameTH.trim().toLowerCase() === data.hospitalNameTH!.trim().toLowerCase() && item.status !== 'archived');
      if (duplicateTH) {
        throw new Error(`Thai Hospital Name '${data.hospitalNameTH}' is already registered.`);
      }
    }

    // Check uniqueness if updating Name EN
    if (data.hospitalNameEN && data.hospitalNameEN.trim().toLowerCase() !== existing.hospitalNameEN.trim().toLowerCase()) {
      const duplicateEN = list.find(item => item.id !== id && item.hospitalNameEN.trim().toLowerCase() === data.hospitalNameEN!.trim().toLowerCase() && item.status !== 'archived');
      if (duplicateEN) {
        throw new Error(`English Hospital Name '${data.hospitalNameEN}' is already registered.`);
      }
    }

    const updatedHospital: Hospital = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      // Compatibility updates
      name: data.hospitalNameEN || existing.name || existing.hospitalNameEN,
      contactName: data.coordinatorName || existing.contactName || existing.coordinatorName,
      contactPhone: data.coordinatorPhone || existing.contactPhone || existing.coordinatorPhone,
      capacity: data.studentCapacity || existing.capacity || existing.studentCapacity
    };

    list[index] = updatedHospital;
    mockDB.saveHospitals(list);

    return updatedHospital;
  },

  delete: async (id: string, userId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = mockDB.getHospitals();
    const filtered = list.filter(item => item.id !== id);
    if (filtered.length === list.length) {
      throw new Error('Hospital not found.');
    }
    mockDB.saveHospitals(filtered);
  },

  archive: async (id: string, userId: string): Promise<Hospital> => {
    return hospitalService.update(id, { status: 'archived' }, userId);
  },

  restore: async (id: string, userId: string): Promise<Hospital> => {
    return hospitalService.update(id, { status: 'active' }, userId);
  },

  duplicate: async (id: string, userId: string): Promise<Hospital> => {
    const original = await hospitalService.getById(id);
    if (!original) {
      throw new Error('Original hospital profile not found.');
    }

    const list = mockDB.getHospitals();
    const codeSuffix = `_COPY_${Math.floor(Math.random() * 1000)}`;
    const duplicateCode = `${original.hospitalCode}${codeSuffix}`.substring(0, 10);
    
    const duplicateData: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'> = {
      ...original,
      hospitalCode: duplicateCode,
      hospitalNameTH: `${original.hospitalNameTH} (คัดลอก)`,
      hospitalNameEN: `${original.hospitalNameEN} (Copy)`,
      shortName: `${original.shortName} (C)`,
      status: 'inactive',
      createdBy: userId,
      updatedBy: userId
    };

    return hospitalService.create(duplicateData, userId);
  },

  // Calculate statistics for a single hospital
  getHospitalStats: async (hospitalId: string): Promise<HospitalStats> => {
    const hospital = await hospitalService.getById(hospitalId);
    if (!hospital) {
      throw new Error('Hospital not found.');
    }

    const buildings = mockDB.getBuildings().filter(b => b.hospitalId === hospitalId);
    const buildingIds = buildings.map(b => b.id);
    const rooms = mockDB.getRooms().filter(r => buildingIds.includes(r.buildingId));
    
    const currentStudents = mockDB.getStudents().filter(s => s.hospitalId === hospitalId && s.status === 'active');
    const studentCount = currentStudents.length;

    // Relate teachers via courses studied by active students placed at this hospital
    const studentCourseIds = Array.from(new Set(currentStudents.map(s => s.courseId).filter(Boolean)));
    const allTeachers = mockDB.getTeachers();
    const placedTeachers = allTeachers.filter(t => 
      t.status === 'active' && 
      t.courseIds && 
      t.courseIds.some(cId => studentCourseIds.includes(cId))
    );
    const teacherCount = placedTeachers.length;

    // Calculate room occupancy sum
    const totalOccupied = rooms.reduce((sum, r) => sum + (r.occupiedCount || 0), 0);

    return {
      numberOfBuildings: buildings.length,
      numberOfRooms: rooms.length,
      studentCapacity: hospital.studentCapacity || 0,
      teacherCapacity: hospital.teacherCapacity || 0,
      currentStudents: studentCount,
      currentTeachers: teacherCount || Math.ceil(studentCount / 6), // realistic fallback ratio
      currentOccupancy: totalOccupied || studentCount, // usually assigned students occupy dorms
      occupancyRate: hospital.studentCapacity > 0 
        ? Math.round((studentCount / hospital.studentCapacity) * 100) 
        : 0
    };
  },

  // Calculate summary statistics across all active hospitals
  getGlobalStats: async () => {
    const list = mockDB.getHospitals().filter(h => h.status === 'active');
    const totalHospitals = list.length;
    
    let totalCapacity = 0;
    let totalStudents = 0;

    for (const h of list) {
      totalCapacity += h.studentCapacity || 0;
      const students = mockDB.getStudents().filter(s => s.hospitalId === h.id && s.status === 'active');
      totalStudents += students.length;
    }

    const occupancyRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

    return {
      totalHospitals,
      totalCapacity,
      totalStudents,
      occupancyRate
    };
  }
};
