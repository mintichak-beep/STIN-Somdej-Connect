import { useState, useEffect, useCallback } from 'react';
import { AcademicYear } from '../types/db';
import { academicYearService, AcademicYearFilterOptions } from '../services/academicYear.service';
import { useAuth } from './useAuth';

export function useAcademicYears(filters: AcademicYearFilterOptions = {}) {
  const { user } = useAuth();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchYears = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await academicYearService.getAll(filters);
      setAcademicYears(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch academic years.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  // Realtime subscription
  useEffect(() => {
    fetchYears();
    const unsubscribe = academicYearService.subscribe(() => {
      fetchYears();
    });
    return unsubscribe;
  }, [fetchYears]);

  const createAcademicYear = async (data: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can create academic years.');
    }
    const created = await academicYearService.create(data, user.uid);
    await fetchYears();
    return created;
  };

  const updateAcademicYear = async (id: string, data: Partial<Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can edit academic years.');
    }
    const updated = await academicYearService.update(id, data, user.uid);
    await fetchYears();
    return updated;
  };

  const deleteAcademicYear = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can delete academic years.');
    }
    await academicYearService.delete(id, user.uid);
    await fetchYears();
  };

  const archiveAcademicYear = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can archive academic years.');
    }
    const archived = await academicYearService.archive(id, user.uid);
    await fetchYears();
    return archived;
  };

  const restoreAcademicYear = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can restore academic years.');
    }
    const restored = await academicYearService.restore(id, user.uid);
    await fetchYears();
    return restored;
  };

  return {
    academicYears,
    total,
    loading,
    error,
    refresh: fetchYears,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    archiveAcademicYear,
    restoreAcademicYear
  };
}
