import { mockDB } from './mockData';
import { Building, Floor, Room } from '../types/db';

export interface BuildingFilterOptions {
  search?: string;
  hospitalId?: string;
  buildingType?: string;
  gender?: string;
  status?: 'active' | 'inactive' | 'archived' | 'all';
  sortBy?: 'buildingCode' | 'buildingName' | 'numberOfFloors' | 'totalRooms' | 'totalBeds' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BuildingListResponse {
  data: Building[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BuildingStats {
  numberOfFloors: number;
  numberOfRooms: number;
  totalBeds: number;
  currentOccupancy: number;
  availableBeds: number;
}

export const buildingService = {
  /**
   * Realtime subscriber simulator using localStorage custom events
   */
  subscribe: (callback: () => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        customEvent.detail?.key === 'cpatms_buildings' ||
        customEvent.detail?.key === 'cpatms_floors' ||
        customEvent.detail?.key === 'cpatms_rooms'
      ) {
        callback();
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (options: BuildingFilterOptions = {}): Promise<BuildingListResponse> => {
    const {
      search = '',
      hospitalId = 'all',
      buildingType = 'all',
      gender = 'all',
      status = 'all',
      sortBy = 'buildingName',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = options;

    await new Promise((resolve) => setTimeout(resolve, 150));

    let list = mockDB.getBuildings();

    // Filter by status
    if (status && status !== 'all') {
      list = list.filter((item) => item.status === status);
    } else {
      list = list.filter((item) => item.status !== 'archived');
    }

    // Filter by Hospital
    if (hospitalId && hospitalId !== 'all') {
      list = list.filter((item) => item.hospitalId === hospitalId);
    }

    // Filter by Building Type
    if (buildingType && buildingType !== 'all') {
      list = list.filter((item) => item.buildingType?.toLowerCase() === buildingType.toLowerCase());
    }

    // Filter by Gender
    if (gender && gender !== 'all') {
      list = list.filter((item) => item.gender?.toLowerCase() === gender.toLowerCase());
    }

    // Filter by Search (Building Name, Building Code, Hospital name)
    if (search.trim()) {
      const query = search.toLowerCase();
      const hospitals = mockDB.getHospitals();

      list = list.filter((item) => {
        const hospital = hospitals.find((h) => h.id === item.hospitalId);
        const hospitalNameTH = hospital?.hospitalNameTH.toLowerCase() || '';
        const hospitalNameEN = hospital?.hospitalNameEN.toLowerCase() || '';

        return (
          item.buildingName.toLowerCase().includes(query) ||
          item.buildingCode.toLowerCase().includes(query) ||
          hospitalNameTH.includes(query) ||
          hospitalNameEN.includes(query)
        );
      });
    }

    // Sorting
    list.sort((a, b) => {
      let valA: any = a[sortBy] ?? '';
      let valB: any = b[sortBy] ?? '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });

    // Pagination
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedData = list.slice(offset, offset + limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  },

  getById: async (id: string): Promise<Building | null> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const list = mockDB.getBuildings();
    return list.find((item) => item.id === id) || null;
  },

  getStatistics: async (buildingId: string): Promise<BuildingStats> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Calculate statistics based on current floor, room and assignments
    const floors = mockDB.getFloors().filter((f) => f.buildingId === buildingId && f.status !== 'archived');
    const rooms = mockDB.getRooms().filter((r) => r.buildingId === buildingId);
    
    const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const currentOccupancy = rooms.reduce((sum, r) => sum + (r.occupiedCount || 0), 0);
    const availableBeds = Math.max(0, totalBeds - currentOccupancy);

    return {
      numberOfFloors: floors.length,
      numberOfRooms: rooms.length,
      totalBeds,
      currentOccupancy,
      availableBeds,
    };
  },

  getGlobalStatistics: async (): Promise<{ totalBuildings: number; totalFloors: number; totalRooms: number; totalBeds: number; occupiedBeds: number; availableBeds: number }> => {
    const buildings = mockDB.getBuildings().filter((b) => b.status === 'active');
    const floors = mockDB.getFloors().filter((f) => f.status === 'active');
    const rooms = mockDB.getRooms().filter((r) => r.status !== 'maintenance');
    
    const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const occupiedBeds = rooms.reduce((sum, r) => sum + (r.occupiedCount || 0), 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);

    return {
      totalBuildings: buildings.length,
      totalFloors: floors.length,
      totalRooms: rooms.length,
      totalBeds,
      occupiedBeds,
      availableBeds
    };
  },

  create: async (
    data: Omit<Building, 'id' | 'createdAt' | 'updatedAt' | 'totalRooms' | 'totalBeds' | 'numberOfFloors'>,
    userId: string
  ): Promise<Building> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const list = mockDB.getBuildings();

    // Check uniqueness of buildingCode within the same hospital
    const duplicateCode = list.find(
      (item) =>
        item.hospitalId === data.hospitalId &&
        item.buildingCode.trim().toLowerCase() === data.buildingCode.trim().toLowerCase() &&
        item.status !== 'archived'
    );

    if (duplicateCode) {
      throw new Error(`Building Code '${data.buildingCode}' is already registered in this hospital.`);
    }

    const newBuilding: Building = {
      ...data,
      id: `b-${Date.now()}`,
      numberOfFloors: 0,
      totalRooms: 0,
      totalBeds: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId,
      // Backward compatibility fields
      name: data.buildingName,
      capacity: 0,
    };

    list.push(newBuilding);
    mockDB.saveBuildings(list);

    // Track activity
    mockDB.addActivity({
      type: 'student_add', // or custom building type if supported
      title: 'Building Created',
      description: `Building ${newBuilding.buildingName} (${newBuilding.buildingCode}) was successfully registered.`,
      userId,
      userDisplayName: 'Administrator',
    });

    return newBuilding;
  },

  update: async (
    id: string,
    data: Partial<Omit<Building, 'id' | 'createdAt' | 'updatedAt'>>,
    userId: string
  ): Promise<Building> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const list = mockDB.getBuildings();
    const index = list.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error('Building not found.');
    }

    const existing = list[index];

    // Check uniqueness of buildingCode within the same hospital if code changes
    if (data.buildingCode && data.buildingCode.trim().toLowerCase() !== existing.buildingCode.trim().toLowerCase()) {
      const targetHospital = data.hospitalId || existing.hospitalId;
      const duplicateCode = list.find(
        (item) =>
          item.id !== id &&
          item.hospitalId === targetHospital &&
          item.buildingCode.trim().toLowerCase() === data.buildingCode!.trim().toLowerCase() &&
          item.status !== 'archived'
      );

      if (duplicateCode) {
        throw new Error(`Building Code '${data.buildingCode}' is already registered in this hospital.`);
      }
    }

    const updatedBuilding: Building = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      // Backward compatibility fields
      name: data.buildingName || existing.buildingName,
      capacity: data.totalBeds || existing.totalBeds,
    };

    list[index] = updatedBuilding;
    mockDB.saveBuildings(list);

    return updatedBuilding;
  },

  delete: async (id: string, userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const list = mockDB.getBuildings();
    const filtered = list.filter((item) => item.id !== id);

    if (filtered.length === list.length) {
      throw new Error('Building not found.');
    }

    // Cascade delete floors and rooms associated with this building
    const floors = mockDB.getFloors().filter((f) => f.buildingId !== id);
    mockDB.saveFloors(floors);

    const rooms = mockDB.getRooms().filter((r) => r.buildingId !== id);
    mockDB.saveRooms(rooms);

    mockDB.saveBuildings(filtered);
  },

  archive: async (id: string, userId: string): Promise<Building> => {
    return buildingService.update(id, { status: 'archived' }, userId);
  },

  restore: async (id: string, userId: string): Promise<Building> => {
    return buildingService.update(id, { status: 'active' }, userId);
  },

  duplicate: async (id: string, userId: string): Promise<Building> => {
    const original = await buildingService.getById(id);
    if (!original) {
      throw new Error('Original building not found.');
    }

    const list = mockDB.getBuildings();
    const suffix = ' (Copy)';
    let newCode = `${original.buildingCode}-COPY`;
    let codeIndex = 1;

    // Resolve unique buildingCode for duplicated item
    while (
      list.some(
        (item) =>
          item.hospitalId === original.hospitalId &&
          item.buildingCode.toLowerCase() === newCode.toLowerCase() &&
          item.status !== 'archived'
      )
    ) {
      newCode = `${original.buildingCode}-COPY${codeIndex++}`;
    }

    const duplicated: Building = {
      ...original,
      id: `b-${Date.now()}`,
      buildingCode: newCode,
      buildingName: `${original.buildingName}${suffix}`,
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId,
      name: `${original.buildingName}${suffix}`,
    };

    list.push(duplicated);
    mockDB.saveBuildings(list);

    // Duplicate floors
    const originalFloors = mockDB.getFloors().filter((f) => f.buildingId === id);
    const floorsList = mockDB.getFloors();
    originalFloors.forEach((floor, idx) => {
      floorsList.push({
        ...floor,
        id: `f-${Date.now()}-${idx}`,
        buildingId: duplicated.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId,
      });
    });
    mockDB.saveFloors(floorsList);

    return duplicated;
  },

  /**
   * Recalculate floors, rooms, and beds count on building document
   */
  syncStats: async (buildingId: string): Promise<void> => {
    const stats = await buildingService.getStatistics(buildingId);
    await buildingService.update(buildingId, {
      numberOfFloors: stats.numberOfFloors,
      totalRooms: stats.numberOfRooms,
      totalBeds: stats.totalBeds,
    }, 'system');
  }
};
