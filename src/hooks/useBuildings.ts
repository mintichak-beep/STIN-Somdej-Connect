import { useState, useEffect, useCallback } from 'react';
import { Building } from '../types/db';
import { buildingService, BuildingFilterOptions } from '../services/building.service';
import { useAuth } from './useAuth';

export function useBuildings(filters: BuildingFilterOptions = {}) {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await buildingService.getAll(filters);
      setBuildings(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch building list.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  // Realtime subscription setup
  useEffect(() => {
    fetchBuildings();
    const unsubscribe = buildingService.subscribe(() => {
      fetchBuildings();
    });
    return unsubscribe;
  }, [fetchBuildings]);

  const createBuilding = async (
    data: Omit<Building, 'id' | 'createdAt' | 'updatedAt' | 'totalRooms' | 'totalBeds' | 'numberOfFloors'>
  ) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can create buildings.');
    }
    const created = await buildingService.create(data, user.uid);
    await fetchBuildings();
    return created;
  };

  const updateBuilding = async (id: string, data: Partial<Omit<Building, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user || (user.role !== 'Administrator' && user.role !== 'Teacher')) {
      throw new Error('Permission Denied: Only staff members can update buildings.');
    }
    const updated = await buildingService.update(id, data, user.uid);
    await fetchBuildings();
    return updated;
  };

  const deleteBuilding = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can delete buildings.');
    }
    await buildingService.delete(id, user.uid);
    await fetchBuildings();
  };

  const archiveBuilding = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can archive buildings.');
    }
    const archived = await buildingService.archive(id, user.uid);
    await fetchBuildings();
    return archived;
  };

  const restoreBuilding = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can restore archived buildings.');
    }
    const restored = await buildingService.restore(id, user.uid);
    await fetchBuildings();
    return restored;
  };

  const duplicateBuilding = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can duplicate buildings.');
    }
    const duplicated = await buildingService.duplicate(id, user.uid);
    await fetchBuildings();
    return duplicated;
  };

  return {
    buildings,
    total,
    loading,
    error,
    refresh: fetchBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    archiveBuilding,
    restoreBuilding,
    duplicateBuilding,
  };
}
