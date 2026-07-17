import { useState, useEffect } from 'react';
import { reportService } from '../services/report.service';

export function useTransportationReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getTransportationReport().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
