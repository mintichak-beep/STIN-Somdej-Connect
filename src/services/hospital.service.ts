import { Hospital } from '../types/db';
import { FirestoreService } from './firestore.service';
import { auditService } from './audit.service';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';

const hospitalFS = new FirestoreService<Hospital>('hospitals');

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
  subscribe: (callback: (hospitals: Hospital[]) => void) => {
    return hospitalFS.onSnapshot([orderBy('hospitalNameTH', 'asc')], callback);
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

    const constraints: QueryConstraint[] = [];
    
    // Status filter
    if (status && status !== 'all') {
      constraints.push(where('status', '==', status));
    } else {
      // In firestore, we might need a composite index for != 'archived' and other filters
      // For simplicity, we'll fetch all non-archived or all and filter in memory if needed
      // But let's try to be efficient.
    }

    let list = await hospitalFS.getAll(constraints);

    // Filter by archived if status was 'all'
    if (status === 'all') {
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
    return hospitalFS.getById(id);
  },

  create: async (data: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Hospital> => {
    const list = await hospitalFS.getAll();

    // Check unique hospitalCode
    const duplicateCode = list.find(item => item.hospitalCode.trim().toLowerCase() === data.hospitalCode.trim().toLowerCase() && item.status !== 'archived');
    if (duplicateCode) {
      throw new Error(`Hospital Code '${data.hospitalCode}' is already registered.`);
    }

    const id = await hospitalFS.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
      // Compatibility fallbacks
      name: data.hospitalNameEN,
      contactName: data.coordinatorName,
      contactPhone: data.coordinatorPhone,
      capacity: data.studentCapacity
    } as any);

    const newHospital = await hospitalFS.getById(id);
    if (!newHospital) throw new Error('Failed to create hospital');

    await auditService.log(userId, "CREATE", "Hospital", id, `Created hospital ${data.hospitalNameEN} (${data.hospitalCode})`);

    return newHospital;
  },

  update: async (id: string, data: Partial<Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Hospital> => {
    const existing = await hospitalFS.getById(id);
    if (!existing) {
      throw new Error('Hospital profile not found.');
    }

    const updatedData: any = {
      ...data,
      updatedBy: userId
    };

    if (data.hospitalNameEN) updatedData.name = data.hospitalNameEN;
    if (data.coordinatorName) updatedData.contactName = data.coordinatorName;
    if (data.coordinatorPhone) updatedData.contactPhone = data.coordinatorPhone;
    if (data.studentCapacity !== undefined) updatedData.capacity = data.studentCapacity;

    await hospitalFS.update(id, updatedData);
    const updatedHospital = await hospitalFS.getById(id);
    if (!updatedHospital) throw new Error('Failed to update hospital');

    await auditService.log(userId, "UPDATE", "Hospital", id, `Updated hospital profile ${updatedHospital.hospitalNameEN}`);

    return updatedHospital;
  },

  delete: async (id: string, userId: string): Promise<void> => {
    await hospitalFS.delete(id);
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

    // This would ideally use Firestore aggregations or specialized collections
    // For now, fetching related data
    const buildings = []; // Need to fetch from building service
    const rooms = []; // Need to fetch from room service
    const currentStudents = []; // Need to fetch from student service
    
    return {
      numberOfBuildings: 0,
      numberOfRooms: 0,
      studentCapacity: hospital.studentCapacity || 0,
      teacherCapacity: hospital.teacherCapacity || 0,
      currentStudents: 0,
      currentTeachers: 0,
      currentOccupancy: 0,
      occupancyRate: 0
    };
  },

  getGlobalStats: async () => {
    const listRes = await hospitalService.getAll({ status: 'active', limit: 10000 });
    const list = listRes.data;
    const totalHospitals = list.length;
    
    let totalCapacity = 0;
    let totalStudents = 0;

    for (const h of list) {
      totalCapacity += h.studentCapacity || 0;
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

