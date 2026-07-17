import { useState, useEffect } from 'react';
import { transportService } from '../services/transportation.service';
import { TransportSchedule } from '../types/transportation';

export function useSchedules() {
  const [schedules, setSchedules] = useState<TransportSchedule[]>([]);
  useEffect(() => {
    return transportService.subscribe(setSchedules);
  }, []);
  return { schedules };
}
