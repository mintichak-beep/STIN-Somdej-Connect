import { useState, useEffect, useCallback } from 'react';
import { Semester } from '../types/db';
import { semesterService, SemesterFilterOptions } from '../services/semester.service';
import { useAuth } from './useAuth';

export function useSemesters(filters: SemesterFilterOptions = {}) {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSemesters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await semesterService.getAll(filters);
      setSemesters(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch semesters.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  // Realtime subscription
  useEffect(() => {
    fetchSemesters();
    const unsubscribe = semesterService.subscribe(() => {
      fetchSemesters();
    });
    return unsubscribe;
  }, [fetchSemesters]);

  const createSemester = async (data: Omit<Semester, 'id' | 'createdAt' | 'updatedAt' | 'isCurrent'>) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can create semesters.');
    }
    const created = await semesterService.create(data, user.uid);
    await fetchSemesters();
    return created;
  };

  const updateSemester = async (id: string, data: Partial<Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can edit semesters.');
    }
    const updated = await semesterService.update(id, data, user.uid);
    await fetchSemesters();
    return updated;
  };

  const deleteSemester = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can delete semesters.');
    }
    await semesterService.delete(id, user.uid);
    await fetchSemesters();
  };

  const setCurrentSemester = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can set current semester.');
    }
    const setCurr = await semesterService.setCurrent(id, user.uid);
    await fetchSemesters();
    return setCurr;
  };

  const archiveSemester = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can archive semesters.');
    }
    const archived = await semesterService.archive(id, user.uid);
    await fetchSemesters();
    return archived;
  };

  const restoreSemester = async (id: string) => {
    if (!user || user.role !== 'Administrator') {
      throw new Error('Permission Denied: Only Administrators can restore semesters.');
    }
    const restored = await semesterService.restore(id, user.uid);
    await fetchSemesters();
    return restored;
  };

  return {
    semesters,
    total,
    loading,
    error,
    refresh: fetchSemesters,
    createSemester,
    updateSemester,
    deleteSemester,
    setCurrentSemester,
    archiveSemester,
    restoreSemester
  };
}
