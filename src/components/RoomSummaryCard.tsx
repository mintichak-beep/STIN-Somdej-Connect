import { useMemo } from 'react';
import { Room, Building } from '../types/db';
import { Building as DormIcon, Key, Bed, ShieldAlert, CheckCircle } from 'lucide-react';

interface RoomSummaryCardProps {
  rooms: Room[];
  buildings: Building[];
}

export function RoomSummaryCard({ rooms, buildings }: RoomSummaryCardProps) {
  const enhancedRooms = useMemo(() => {
    return rooms.map(r => {
      const b = buildings.find(building => building.id === r.buildingId);
      return {
        ...r,
        buildingName: b ? b.name : 'Unknown Dorm'
      };
    });
  }, [rooms, buildings]);

  const getStatusBadge = (status: Room['status']) => {
    switch (status) {
      case 'maintenance':
        return <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">Maintenance</span>;
      case 'full':
        return <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">Full</span>;
      default:
        return <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">Vacancies</span>;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600/10 via-red-600/20 to-red-600/10" />
      
      <div className="mb-4 border-b border-gray-50 pb-3 dark:border-zinc-800/60">
        <h4 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
          Dormitory Accommodation Status
        </h4>
        <p className="text-[10px] text-gray-400 dark:text-zinc-500">Live dormitory beds utilization roster</p>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {enhancedRooms.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">No Dormitory Rooms Loaded</p>
        ) : (
          enhancedRooms.map(r => (
            <div key={r.id} className="group rounded-xl border border-slate-100 bg-slate-50/40 p-3 transition-all hover:bg-slate-50 dark:border-zinc-900 dark:bg-zinc-900/30">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 shrink-0">
                    <DormIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">
                      Room {r.roomNumber}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate">
                      {r.buildingName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Bed className="h-3 w-3 text-gray-400" />
                    <span className="font-sans text-xs font-black text-gray-900 dark:text-zinc-100">
                      {r.occupiedCount}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                      / {r.capacity}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-end">
                    {getStatusBadge(r.status)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
