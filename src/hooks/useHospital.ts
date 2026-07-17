import { useState, useEffect, useCallback } from 'react';
import { Hospital } from '../types/db';
import { hospitalService } from '../services/hospital.service';
import { useAuth } from './useAuth';

export function useHospital(id: string | undefined) {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHospital = useCallback(async () => {
    if (!id) {
      setHospital(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await hospitalService.getById(id);
      setHospital(res);
      if (!res) {
        setError('Hospital profile not found.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch hospital detail.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHospital();
    // Subscribe to updates for real-time reactivity
    const unsubscribe = hospitalService.subscribe(() => {
      fetchHospital();
    });
    return unsubscribe;
  }, [fetchHospital]);

  const updateProfile = async (data: Partial<Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!id) throw new Error('Cannot update non-existent hospital.');
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can edit hospital profiles.');
    }
    const updated = await hospitalService.update(id, data, user.uid);
    setHospital(updated);
    return updated;
  };

  return {
    hospital,
    loading,
    error,
    refresh: fetchHospital,
    updateProfile
  };
}
