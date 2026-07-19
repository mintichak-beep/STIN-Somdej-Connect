import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface HospitalFilterProps {
  id?: string;
  statusValue: string;
  onStatusChange: (status: string) => void;
  typeValue: string;
  onTypeChange: (type: string) => void;
  provinceValue: string;
  onProvinceChange: (province: string) => void;
  onClearFilters: () => void;
}

const HOSPITAL_TYPES = [
  { value: 'all', label: 'All Training Site Types' },
  { value: 'University Hospital', label: 'University Site' },
  { value: 'Regional Hospital', label: 'Regional Site' },
  { value: 'General Hospital', label: 'General Site' },
  { value: 'Community Hospital', label: 'Community Site' },
  { value: 'Private Hospital', label: 'Private Site' },
  { value: 'Specialized Hospital', label: 'Specialized Site' }
];

const THAI_PROVINCES = [
  { value: 'all', label: 'All Provinces' },
  { value: 'Bangkok', label: 'Bangkok' },
  { value: 'Nakhon Sawan', label: 'Nakhon Sawan' },
  { value: 'Ratchaburi', label: 'Ratchaburi' },
  { value: 'Nonthaburi', label: 'Nonthaburi' },
  { value: 'Pathum Thani', label: 'Pathum Thani' },
  { value: 'Chiang Mai', label: 'Chiang Mai' },
  { value: 'Khon Kaen', label: 'Khon Kaen' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses (Active & Inactive)' },
  { value: 'active', label: 'Active Only' },
  { value: 'inactive', label: 'Inactive Only' },
  { value: 'archived', label: 'Archived Only' }
];

export function HospitalFilter({
  id,
  statusValue,
  onStatusChange,
  typeValue,
  onTypeChange,
  provinceValue,
  onProvinceChange,
  onClearFilters
}: HospitalFilterProps) {
  const isFiltered = statusValue !== 'all' || typeValue !== 'all' || provinceValue !== 'all';

  return (
    <div id={id} className="flex flex-wrap items-center gap-3 w-full border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
      {/* Type Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Filter className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
        <select
          value={typeValue}
          onChange={(e) => onTypeChange(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        >
          {HOSPITAL_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Province Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={provinceValue}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        >
          {THAI_PROVINCES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={statusValue}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}
