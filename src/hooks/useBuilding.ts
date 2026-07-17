import { useState, useEffect, useCallback } from 'react';
import { Building } from '../types/db';
import { buildingService } from '../services/building.service';
import { useAuth } from './useAuth';

export function useBuilding(id: string | undefined) {
  const { user } = useAuth();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuilding = useCallback(async () => {
    if (!id) {
      setBuilding(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await buildingService.getById(id);
      setBuilding(res);
      if (!res) {
        setError('Building profile not found.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch building details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBuilding();
    const unsubscribe = buildingService.subscribe(() => {
      fetchBuilding();
    });
    return unsubscribe;
  }, [fetchBuilding]);

  const updateProfile = async (data: Partial<Omit<Building, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!id) throw new Error('Cannot update non-existent building.');
    if (!user || (user.role !== 'Administrator' && user.role !== 'Teacher')) {
      throw new Error('Permission Denied: Only staff members can edit buildings.');
    }
    const updated = await buildingService.update(id, data, user.uid);
    setBuilding(updated);
    return updated;
  };

  return {
    building,
    loading,
    error,
    refresh: fetchBuilding,
    updateProfile,
  };
}
