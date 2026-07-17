import { useState, useEffect, useCallback } from 'react';
import { Hospital } from '../types/db';
import { hospitalService, HospitalFilterOptions } from '../services/hospital.service';
import { useAuth } from './useAuth';

export function useHospitals(filters: HospitalFilterOptions = {}) {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hospitalService.getAll(filters);
      setHospitals(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch hospital list.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  // Realtime subscription setup
  useEffect(() => {
    fetchHospitals();
    const unsubscribe = hospitalService.subscribe(() => {
      fetchHospitals();
    });
    return unsubscribe;
  }, [fetchHospitals]);

  const createHospital = async (data: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can create hospitals.');
    }
    const created = await hospitalService.create(data, user.uid);
    await fetchHospitals();
    return created;
  };

  const updateHospital = async (id: string, data: Partial<Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can edit hospital profiles.');
    }
    const updated = await hospitalService.update(id, data, user.uid);
    await fetchHospitals();
    return updated;
  };

  const deleteHospital = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can delete hospital profiles.');
    }
    await hospitalService.delete(id, user.uid);
    await fetchHospitals();
  };

  const archiveHospital = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can archive hospitals.');
    }
    const archived = await hospitalService.archive(id, user.uid);
    await fetchHospitals();
    return archived;
  };

  const restoreHospital = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can restore archived hospitals.');
    }
    const restored = await hospitalService.restore(id, user.uid);
    await fetchHospitals();
    return restored;
  };

  const duplicateHospital = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can duplicate hospitals.');
    }
    const duplicated = await hospitalService.duplicate(id, user.uid);
    await fetchHospitals();
    return duplicated;
  };

  return {
    hospitals,
    total,
    loading,
    error,
    refresh: fetchHospitals,
    createHospital,
    updateHospital,
    deleteHospital,
    archiveHospital,
    restoreHospital,
    duplicateHospital
  };
}
