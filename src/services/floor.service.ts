import { Floor, Room } from '../types/db';
import { buildingService } from './building.service';

export interface FloorFilterOptions {
  search?: string;
  buildingId?: string;
  hospitalId?: string;
  status?: 'active' | 'inactive' | 'archived' | 'all';
  sortBy?: 'floorNumber' | 'floorName' | 'totalRooms' | 'totalBeds' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FloorListResponse {
  data: Floor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FloorStats {
  numberOfRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
}

export const floorService = {
  /**
   * Realtime subscriber simulator using localStorage custom events
   */
  subscribe: (callback: () => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        customEvent.detail?.key === 'cpatms_floors' ||
        customEvent.detail?.key === 'cpatms_rooms' ||
        customEvent.detail?.key === 'cpatms_buildings'
      ) {
        callback();
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getAll: async (options: FloorFilterOptions = {}): Promise<FloorListResponse> => {
    const {
      search = '',
      buildingId = 'all',
      hospitalId = 'all',
      status = 'all',
      sortBy = 'floorNumber',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = options;

    await new Promise((resolve) => setTimeout(resolve, 150));

    let list = [];

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

    // Filter by Building
    if (buildingId && buildingId !== 'all') {
      list = list.filter((item) => item.buildingId === buildingId);
    }

    // Filter by Search (Floor Name, Building Name)
    if (search.trim()) {
      const query = search.toLowerCase();
      const buildings = [];

      list = list.filter((item) => {
        const building = buildings.find((b) => b.id === item.buildingId);
        const buildingName = building?.buildingName.toLowerCase() || '';
        return (
          item.floorName.toLowerCase().includes(query) ||
          buildingName.includes(query)
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

  getById: async (id: string): Promise<Floor | null> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const list = [];
    return list.find((item) => item.id === id) || null;
  },

  getStatistics: async (floorId: string): Promise<FloorStats> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const floors = [];
    const floor = floors.find((f) => f.id === floorId);

    if (!floor) {
      return { numberOfRooms: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0 };
    }

    // Standard Room logic - Match by floor number prefix in the same building
    const rooms = [].filter((r) => {
      if (r.buildingId !== floor.buildingId) return false;
      const rNum = r.roomNumber;
      // If roomNumber is e.g. "101" or "102" and floorNumber is 1
      return rNum.startsWith(String(floor.floorNumber)) || rNum.startsWith(`A-${floor.floorNumber}`);
    });

    const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const occupiedBeds = rooms.reduce((sum, r) => sum + (r.occupiedCount || 0), 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);

    return {
      numberOfRooms: rooms.length,
      totalBeds,
      occupiedBeds,
      availableBeds,
    };
  },

  create: async (
    data: Omit<Floor, 'id' | 'createdAt' | 'updatedAt' | 'totalRooms' | 'totalBeds'>,
    userId: string
  ): Promise<Floor> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const list = [];

    // Ensure floorNumber cannot be duplicate within the same Building
    const duplicateFloor = list.find(
      (item) =>
        item.buildingId === data.buildingId &&
        item.floorNumber === Number(data.floorNumber) &&
        item.status !== 'archived'
    );

    if (duplicateFloor) {
      throw new Error(`Floor number ${data.floorNumber} is already registered in this building.`);
    }

    const newFloor: Floor = {
      ...data,
      id: `f-${Date.now()}`,
      floorNumber: Number(data.floorNumber),
      totalRooms: 0,
      totalBeds: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId,
    };

    list.push(newFloor);
    void 0;

    // Sync stats with the parent Building
    await buildingService.syncStats(newFloor.buildingId);

    return newFloor;
  },

  update: async (
    id: string,
    data: Partial<Omit<Floor, 'id' | 'createdAt' | 'updatedAt'>>,
    userId: string
  ): Promise<Floor> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const list = [];
    const index = list.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error('Floor not found.');
    }

    const existing = list[index];

    // Ensure floorNumber cannot be duplicate within the same Building if it's changing
    if (data.floorNumber !== undefined && Number(data.floorNumber) !== existing.floorNumber) {
      const targetBuildingId = data.buildingId || existing.buildingId;
      const duplicateFloor = list.find(
        (item) =>
          item.id !== id &&
          item.buildingId === targetBuildingId &&
          item.floorNumber === Number(data.floorNumber) &&
          item.status !== 'archived'
      );

      if (duplicateFloor) {
        throw new Error(`Floor number ${data.floorNumber} is already registered in this building.`);
      }
    }

    const updatedFloor: Floor = {
      ...existing,
      ...data,
      floorNumber: data.floorNumber !== undefined ? Number(data.floorNumber) : existing.floorNumber,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    list[index] = updatedFloor;
    void 0;

    // Sync stats with the parent Building
    await buildingService.syncStats(updatedFloor.buildingId);
    if (existing.buildingId !== updatedFloor.buildingId) {
      await buildingService.syncStats(existing.buildingId);
    }

    return updatedFloor;
  },

  delete: async (id: string, userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const list = [];
    const index = list.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error('Floor not found.');
    }

    const floor = list[index];
    const filtered = list.filter((item) => item.id !== id);
    void 0;

    // Sync stats with parent Building
    await buildingService.syncStats(floor.buildingId);
  },

  archive: async (id: string, userId: string): Promise<Floor> => {
    return floorService.update(id, { status: 'archived' }, userId);
  },

  restore: async (id: string, userId: string): Promise<Floor> => {
    return floorService.update(id, { status: 'active' }, userId);
  },

  duplicate: async (id: string, userId: string): Promise<Floor> => {
    const original = await floorService.getById(id);
    if (!original) {
      throw new Error('Original floor not found.');
    }

    const list = [];
    let newFloorNumber = original.floorNumber + 1;

    // Resolve unique floorNumber for duplicated item
    while (
      list.some(
        (item) =>
          item.buildingId === original.buildingId &&
          item.floorNumber === newFloorNumber &&
          item.status !== 'archived'
      )
    ) {
      newFloorNumber++;
    }

    const duplicated: Floor = {
      ...original,
      id: `f-${Date.now()}`,
      floorNumber: newFloorNumber,
      floorName: `${original.floorName} (Copy)`,
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId,
    };

    list.push(duplicated);
    void 0;

    // Sync stats with parent Building
    await buildingService.syncStats(original.buildingId);

    return duplicated;
  },

  /**
   * Recalculate rooms and beds count on floor document
   */
  syncStats: async (floorId: string): Promise<void> => {
    const stats = await floorService.getStatistics(floorId);
    await floorService.update(floorId, {
      totalRooms: stats.numberOfRooms,
      totalBeds: stats.totalBeds,
    }, 'system');
  }
};
