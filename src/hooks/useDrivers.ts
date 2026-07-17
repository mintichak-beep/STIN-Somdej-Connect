import { useState, useEffect } from 'react';
import { driverService } from '../services/driver.service';
import { Driver } from '../types/transportation';

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  useEffect(() => {
    return driverService.subscribe(setDrivers);
  }, []);
  return { drivers };
}
