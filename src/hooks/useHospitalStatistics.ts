import { useState, useEffect, useCallback } from 'react';
import { hospitalService, HospitalStats } from '../services/hospital.service';

export function useHospitalStatistics(hospitalId: string | undefined) {
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!hospitalId) {
      setStats(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await hospitalService.getHospitalStats(hospitalId);
      setStats(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load hospital statistics.');
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    fetchStats();
    // Subscribe to changes in hospital state so stats recalculate in real-time
    const unsubscribe = hospitalService.subscribe(() => {
      fetchStats();
    });
    return unsubscribe;
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
}
