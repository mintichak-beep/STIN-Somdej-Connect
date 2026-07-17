import { useState, useEffect, useCallback } from 'react';
import { Floor } from '../types/db';
import { floorService } from '../services/floor.service';
import { useAuth } from './useAuth';

export function useFloor(id: string | undefined) {
  const { user } = useAuth();
  const [floor, setFloor] = useState<Floor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFloor = useCallback(async () => {
    if (!id) {
      setFloor(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await floorService.getById(id);
      setFloor(res);
      if (!res) {
        setError('Floor profile not found.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch floor details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFloor();
    const unsubscribe = floorService.subscribe(() => {
      fetchFloor();
    });
    return unsubscribe;
  }, [fetchFloor]);

  const updateProfile = async (data: Partial<Omit<Floor, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!id) throw new Error('Cannot update non-existent floor.');
    if (!user || (user.role !== 'Administrator' && user.role !== 'Teacher')) {
      throw new Error('Permission Denied: Only staff members can edit floors.');
    }
    const updated = await floorService.update(id, data, user.uid);
    setFloor(updated);
    return updated;
  };

  return {
    floor,
    loading,
    error,
    refresh: fetchFloor,
    updateProfile,
  };
}
