import { useState, useEffect } from 'react';
import { RecentActivity } from '../types/db';

export function useRecentActivities() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = () => {
      try {
        const list = [];
        setActivities(list);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch recent activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    const handleDbUpdate = () => {
      fetchActivities();
    };

    window.addEventListener('cpatms_db_update', handleDbUpdate);

    return () => {
      window.removeEventListener('cpatms_db_update', handleDbUpdate);
    };
  }, []);

  return {
    activities,
    loading,
    error
  };
}
