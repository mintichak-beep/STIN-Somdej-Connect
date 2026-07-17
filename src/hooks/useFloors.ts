import { useState, useEffect, useCallback } from 'react';
import { Floor } from '../types/db';
import { floorService, FloorFilterOptions } from '../services/floor.service';
import { useAuth } from './useAuth';

export function useFloors(filters: FloorFilterOptions = {}) {
  const { user } = useAuth();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFloors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await floorService.getAll(filters);
      setFloors(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch floor list.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchFloors();
    const unsubscribe = floorService.subscribe(() => {
      fetchFloors();
    });
    return unsubscribe;
  }, [fetchFloors]);

  const createFloor = async (
    data: Omit<Floor, 'id' | 'createdAt' | 'updatedAt' | 'totalRooms' | 'totalBeds'>
  ) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can create floors.');
    }
    const created = await floorService.create(data, user.uid);
    await fetchFloors();
    return created;
  };

  const updateFloor = async (id: string, data: Partial<Omit<Floor, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user || (user.role !== 'Administrator' && user.role !== 'Teacher')) {
      throw new Error('Permission Denied: Only staff members can update floors.');
    }
    const updated = await floorService.update(id, data, user.uid);
    await fetchFloors();
    return updated;
  };

  const deleteFloor = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can delete floors.');
    }
    await floorService.delete(id, user.uid);
    await fetchFloors();
  };

  const archiveFloor = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can archive floors.');
    }
    const archived = await floorService.archive(id, user.uid);
    await fetchFloors();
    return archived;
  };

  const restoreFloor = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can restore archived floors.');
    }
    const restored = await floorService.restore(id, user.uid);
    await fetchFloors();
    return restored;
  };

  const duplicateFloor = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can duplicate floors.');
    }
    const duplicated = await floorService.duplicate(id, user.uid);
    await fetchFloors();
    return duplicated;
  };

  return {
    floors,
    total,
    loading,
    error,
    refresh: fetchFloors,
    createFloor,
    updateFloor,
    deleteFloor,
    archiveFloor,
    restoreFloor,
    duplicateFloor,
  };
}
