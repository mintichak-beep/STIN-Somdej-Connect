import React from 'react';
import { Building, DoorOpen, Users, GraduationCap, Percent, CheckCircle2 } from 'lucide-react';
import { useHospitalStatistics } from '../hooks/useHospitalStatistics';

interface HospitalStatisticsCardProps {
  id?: string;
  hospitalId: string;
}

export function HospitalStatisticsCard({ id, hospitalId }: HospitalStatisticsCardProps) {
  const { stats, loading, error } = useHospitalStatistics(hospitalId);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg"></div>
          <div className="h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg"></div>
        </div>
        <div className="h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm text-center">
        <p className="text-sm text-zinc-500">Failed to load statistics for this hospital.</p>
      </div>
    );
  }

  return (
    <div
      id={id || `stats-card-${hospitalId}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4"
    >
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
        Hospital Logistics Summary
      </h3>

      {/* Buildings and Rooms counters */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900/50 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg shrink-0">
            <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block leading-tight">Buildings</span>
            <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{stats.numberOfBuildings}</span>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900/50 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg shrink-0">
            <DoorOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block leading-tight">Dorm Rooms</span>
            <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{stats.numberOfRooms}</span>
          </div>
        </div>
      </div>

      {/* Student placement capacity and status */}
      <div className="space-y-3 pt-1">
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Student Placements</span>
            </div>
            <span>{stats.currentStudents} / {stats.studentCapacity} Seats ({stats.occupancyRate}%)</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.occupancyRate >= 90
                  ? 'bg-rose-500'
                  : stats.occupancyRate >= 75
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Teachers details */}
        <div className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-950 px-3 py-2.5 rounded-lg border border-zinc-100 dark:border-zinc-900/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Assigned Faculty / Supervisors</span>
          </div>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {stats.currentTeachers} / {stats.teacherCapacity} Max
          </span>
        </div>

        {/* Accommodation Occupancy detail */}
        <div className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-950 px-3 py-2.5 rounded-lg border border-zinc-100 dark:border-zinc-900/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Housing Occupancy Status</span>
          </div>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {stats.currentOccupancy} Dorm Occupants
          </span>
        </div>
      </div>
    </div>
  );
}
