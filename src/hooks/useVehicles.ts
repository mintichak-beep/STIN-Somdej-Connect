import { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicle.service';
import { Vehicle } from '../types/transportation';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  useEffect(() => {
    return vehicleService.subscribe(setVehicles);
  }, []);
  return { vehicles };
}
