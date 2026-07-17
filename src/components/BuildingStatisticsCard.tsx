import React from 'react';
import { Layers, DoorOpen, Bed, UserCheck, CheckCircle } from 'lucide-react';
import { BuildingStats } from '../services/building.service';

interface BuildingStatisticsCardProps {
  id?: string;
  stats: BuildingStats | null;
  loading: boolean;
}

export function BuildingStatisticsCard({ id, stats, loading }: BuildingStatisticsCardProps) {
  if (loading) {
    return (
      <div id={id} className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const occupancyRate = stats.totalBeds > 0 ? Math.round((stats.currentOccupancy / stats.totalBeds) * 100) : 0;

  const metrics = [
    {
      label: 'Floors Count',
      value: stats.numberOfFloors,
      icon: <Layers className="h-4 w-4 text-sky-500" />,
      color: 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400',
    },
    {
      label: 'Rooms Allocated',
      value: stats.numberOfRooms,
      icon: <DoorOpen className="h-4 w-4 text-indigo-500" />,
      color: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400',
    },
    {
      label: 'Total Capacity',
      value: `${stats.totalBeds} Beds`,
      icon: <Bed className="h-4 w-4 text-emerald-500" />,
      color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
    {
      label: 'Occupied Beds',
      value: `${stats.currentOccupancy} Users`,
      icon: <UserCheck className="h-4 w-4 text-amber-500" />,
      color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
      progress: occupancyRate,
    },
    {
      label: 'Available Beds',
      value: `${stats.availableBeds} Free`,
      icon: <CheckCircle className="h-4 w-4 text-teal-500" />,
      color: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400',
    },
  ];

  return (
    <div id={id || 'building-statistics'} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((m, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-start justify-between"
          >
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                {m.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
                  {m.value}
                </span>
                {m.progress !== undefined && (
                  <span className="text-[10px] font-bold text-zinc-400">
                    ({m.progress}%)
                  </span>
                )}
              </div>
              {m.progress !== undefined && (
                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1 mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              )}
            </div>
            <div className={`p-2 rounded-xl shrink-0 ${m.color}`}>{m.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
