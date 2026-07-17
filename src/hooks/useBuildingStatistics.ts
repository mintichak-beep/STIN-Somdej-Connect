import { useState, useEffect, useCallback } from 'react';
import { buildingService, BuildingStats } from '../services/building.service';

export function useBuildingStatistics(buildingId: string | undefined) {
  const [stats, setStats] = useState<BuildingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!buildingId) {
      setStats(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await buildingService.getStatistics(buildingId);
      setStats(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load building statistics.');
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    fetchStats();
    const unsubscribe = buildingService.subscribe(() => {
      fetchStats();
    });
    return unsubscribe;
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
