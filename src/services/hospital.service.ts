import { Hospital } from '../types/db';
import { storage } from '../lib/storage';
import { auditService } from './audit.service';

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
  subscribe: (callback: () => void) => {
    // LocalStorage doesn't support subscribe.
    callback();
    return () => {};
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

    let list = storage.get<Hospital[]>('hospitals') || [];

    // Filter by status
    if (status && status !== 'all') {
      list = list.filter(item => item.status === status);
    } else {
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

    // Filter by search query
    if (search.trim()) {
      const qStr = search.toLowerCase();
      list = list.filter(item => 
        item.hospitalCode.toLowerCase().includes(qStr) ||
        item.hospitalNameTH.toLowerCase().includes(qStr) ||
        item.hospitalNameEN.toLowerCase().includes(qStr) ||
        (item.shortName && item.shortName.toLowerCase().includes(qStr)) ||
        (item.province && item.province.toLowerCase().includes(qStr)) ||
        (item.coordinatorName && item.coordinatorName.toLowerCase().includes(qStr))
      );
    }

    // Sorting
    list.sort((a: any, b: any) => {
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
    const list = storage.get<Hospital[]>('hospitals') || [];
    return list.find(h => h.id === id) || null;
  },

  create: async (data: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Hospital> => {
    const list = storage.get<Hospital[]>('hospitals') || [];

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
      id: crypto.randomUUID(),
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
    storage.set('hospitals', list);

    await auditService.log(userId, "CREATE", "Hospital", newHospital.id!, `Created hospital ${data.hospitalNameEN} (${data.hospitalCode})`);

    return newHospital;
  },

  update: async (id: string, data: Partial<Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Hospital> => {
    const list = storage.get<Hospital[]>('hospitals') || [];
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
      updatedBy: userId
    } as Hospital;

    if (data.hospitalNameEN) updatedHospital.name = data.hospitalNameEN;
    if (data.coordinatorName) updatedHospital.contactName = data.coordinatorName;
    if (data.coordinatorPhone) updatedHospital.contactPhone = data.coordinatorPhone;
    if (data.studentCapacity !== undefined) updatedHospital.capacity = data.studentCapacity;

    list[index] = updatedHospital;
    storage.set('hospitals', list);

    await auditService.log(userId, "UPDATE", "Hospital", id, `Updated hospital profile ${updatedHospital.hospitalNameEN}`);

    return updatedHospital;
  },

  delete: async (id: string, userId: string): Promise<void> => {
    const list = storage.get<Hospital[]>('hospitals') || [];
    const newList = list.filter(h => h.id !== id);
    storage.set('hospitals', newList);
    await auditService.log(userId, "DELETE", "Hospital", id, "Deleted hospital");
  },

  archive: async (id: string, userId: string): Promise<Hospital> => {
    return hospitalService.update(id, { status: 'archived' }, userId);
  },

  restore: async (id: string, userId: string): Promise<Hospital> => {
    return hospitalService.update(id, { status: 'active' }, userId);
  },

  toggleStatus: async (id: string, userId: string): Promise<Hospital> => {
    const hospital = await hospitalService.getById(id);
    if (!hospital) throw new Error('Hospital not found');
    const newStatus = hospital.status === 'active' ? 'inactive' : 'active';
    return hospitalService.update(id, { status: newStatus }, userId);
  },

  duplicate: async (id: string, userId: string): Promise<Hospital> => {
    const original = await hospitalService.getById(id);
    if (!original) {
      throw new Error('Original hospital profile not found.');
    }

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

  getHospitalStats: async (hospitalId: string): Promise<HospitalStats> => {
    const hospital = await hospitalService.getById(hospitalId);
    if (!hospital) {
      throw new Error('Hospital not found.');
    }

    const buildings = (storage.get<any[]>('buildings') || []).filter(b => b.hospitalId === hospitalId);
    const buildingIds = buildings.map(b => b.id);
    const rooms = (storage.get<any[]>('rooms') || []).filter(r => buildingIds.includes(r.buildingId));
    const currentStudents = (storage.get<any[]>('students') || []).filter(s => s.hospitalId === hospitalId && s.status === 'active');
    const studentCount = currentStudents.length;

    const teachers = storage.get<any[]>('teachers') || [];
    const studentCourseIds = Array.from(new Set(currentStudents.map(s => s.courseId).filter(Boolean)));
    const placedTeachers = teachers.filter(t => 
      t.status === 'active' && 
      t.courseIds && 
      t.courseIds.some((cId: any) => studentCourseIds.includes(cId))
    );
    const teacherCount = placedTeachers.length;

    const totalOccupied = rooms.reduce((sum, r) => sum + (r.occupiedCount || 0), 0);

    return {
      numberOfBuildings: buildings.length,
      numberOfRooms: rooms.length,
      studentCapacity: hospital.studentCapacity || 0,
      teacherCapacity: hospital.teacherCapacity || 0,
      currentStudents: studentCount,
      currentTeachers: teacherCount || Math.ceil(studentCount / 6),
      currentOccupancy: totalOccupied || studentCount,
      occupancyRate: hospital.studentCapacity > 0 
        ? Math.round((studentCount / hospital.studentCapacity) * 100) 
        : 0
    };
  },

  getGlobalStats: async () => {
    const listRes = await hospitalService.getAll({ status: 'active', limit: 10000 });
    const list = listRes.data;
    const totalHospitals = list.length;
    
    let totalCapacity = 0;
    let totalStudents = 0;

    const studentsList = storage.get<any[]>('students') || [];

    for (const h of list) {
      totalCapacity += h.studentCapacity || 0;
      const students = studentsList.filter(s => s.hospitalId === h.id && s.status === 'active');
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

