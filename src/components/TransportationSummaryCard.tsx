import { useMemo } from 'react';
import { TransportSchedule, Vehicle, Driver } from '../types/db';
import { Car, UserCheck, Clock, MapPin, CheckCircle } from 'lucide-react';
import { mockDB } from '../services/mockData';

interface TransportationSummaryCardProps {
  schedules: TransportSchedule[];
  vehicles: Vehicle[];
  drivers: Driver[];
}

export function TransportationSummaryCard({ schedules, vehicles, drivers }: TransportationSummaryCardProps) {
  const assignments = useMemo(() => mockDB.getTransportAssignments(), []);

  const detailedSchedules = useMemo(() => {
    return schedules.map(sc => {
      const v = vehicles.find(veh => veh.id === sc.vehicleId);
      const d = drivers.find(drv => drv.id === sc.driverId);
      const assignedCount = assignments.filter(a => a.scheduleId === sc.id && a.status === 'active').length;
      return {
        ...sc,
        vehicleModel: v ? v.model : 'Commuter Van',
        plateNumber: v ? v.plateNumber : '',
        vehicleCapacity: v ? v.capacity : 14,
        driverName: d ? d.name : 'Unassigned Driver',
        assignedCount
      };
    });
  }, [schedules, vehicles, drivers, assignments]);

  const getStatusBadge = (status: TransportSchedule['status']) => {
    switch (status) {
      case 'completed':
        return <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">Completed</span>;
      case 'in-progress':
        return <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 animate-pulse">Running</span>;
      case 'cancelled':
        return <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">Cancelled</span>;
      default:
        return <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">Scheduled</span>;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600/10 via-red-600/20 to-red-600/10" />
      
      <div className="mb-4 border-b border-gray-50 pb-3 dark:border-zinc-800/60">
        <h4 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
          Transportation Route Dispatch
        </h4>
        <p className="text-[10px] text-gray-400 dark:text-zinc-500">Clinical shuttle dispatch & riders ratio</p>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {detailedSchedules.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">No Commutes Dispatched</p>
        ) : (
          detailedSchedules.map(sc => (
            <div key={sc.id} className="group rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 transition-all hover:bg-slate-50 dark:border-zinc-900 dark:bg-zinc-900/30">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                    <span className="truncate">{sc.route}</span>
                  </h5>
                  <div className="mt-1 flex flex-col gap-1 text-[10px] text-gray-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Car className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{sc.vehicleModel} ({sc.plateNumber})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">Driver: {sc.driverName}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="h-3 w-3 text-sky-500" />
                    <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                      {sc.departureTime}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-end">
                    {getStatusBadge(sc.status)}
                  </div>
                </div>
              </div>

              {/* Rider utilization */}
              <div className="mt-3 flex items-center justify-between text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase border-t border-gray-100/50 pt-2 dark:border-zinc-800/40">
                <span>Riders assigned</span>
                <span className="font-sans text-gray-700 dark:text-zinc-300">{sc.assignedCount} / {sc.vehicleCapacity} Seats</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
