import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';

export function useDashboardAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboardAnalytics().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
