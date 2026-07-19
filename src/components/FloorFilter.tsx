import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FloorFilterProps {
  id?: string;
  buildingValue: string;
  onBuildingChange: (val: string) => void;
  statusValue: string;
  onStatusChange: (val: string) => void;
  onClearFilters: () => void;
}

export function FloorFilter({
  id,
  buildingValue,
  onBuildingChange,
  statusValue,
  onStatusChange,
  onClearFilters,
}: FloorFilterProps) {
  const buildings = [];

  return (
    <div
      id={id || 'floor-filter-box'}
      className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 dark:text-zinc-300 pt-3 border-t border-slate-50 dark:border-zinc-800/50"
    >
      <div className="flex items-center gap-1.5 text-slate-400">
        <Filter className="h-3.5 w-3.5" />
        <span className="font-extrabold uppercase tracking-wider text-[10px]">Filter By:</span>
      </div>

      {/* Building Filter Selection */}
      <div className="flex flex-col gap-1 min-w-[150px]">
        <select
          value={buildingValue}
          onChange={(e) => onBuildingChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="all">-- All Buildings --</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.buildingName} ({b.buildingCode})
            </option>
          ))}
        </select>
      </div>

      {/* Status Selection */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <select
          value={statusValue}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="all">-- All Statuses --</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
          <option value="archived">Archived Only</option>
        </select>
      </div>

      {/* Clear Filters reset option */}
      <button
        type="button"
        onClick={onClearFilters}
        className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition ml-auto cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Clear Filters</span>
      </button>
    </div>
  );
}
