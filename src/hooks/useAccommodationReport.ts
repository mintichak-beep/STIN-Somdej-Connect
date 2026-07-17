import { useState, useEffect } from 'react';
import { reportService } from '../services/report.service';

export function useAccommodationReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getAccommodationReport().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
