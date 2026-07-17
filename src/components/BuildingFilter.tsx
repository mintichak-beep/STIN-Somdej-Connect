import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { mockDB } from '../services/mockData';

interface BuildingFilterProps {
  id?: string;
  hospitalValue: string;
  onHospitalChange: (val: string) => void;
  typeValue: string;
  onTypeChange: (val: string) => void;
  genderValue: string;
  onGenderChange: (val: string) => void;
  statusValue: string;
  onStatusChange: (val: string) => void;
  onClearFilters: () => void;
}

const BUILDING_TYPES = [
  { value: 'all', label: 'All Building Types' },
  { value: 'Dormitory', label: 'Dormitory' },
  { value: 'Residence', label: 'Residence' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Guest House', label: 'Guest House' },
];

const GENDER_OPTIONS = [
  { value: 'all', label: 'All Genders (Male/Female/Mixed)' },
  { value: 'Female', label: 'Female Only' },
  { value: 'Male', label: 'Male Only' },
  { value: 'Mixed', label: 'Mixed Only' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses (Active & Inactive)' },
  { value: 'active', label: 'Active Only' },
  { value: 'inactive', label: 'Inactive Only' },
  { value: 'archived', label: 'Archived Only' },
];

export function BuildingFilter({
  id,
  hospitalValue,
  onHospitalChange,
  typeValue,
  onTypeChange,
  genderValue,
  onGenderChange,
  statusValue,
  onStatusChange,
  onClearFilters,
}: BuildingFilterProps) {
  const hospitals = mockDB.getHospitals();
  const isFiltered =
    hospitalValue !== 'all' ||
    typeValue !== 'all' ||
    genderValue !== 'all' ||
    statusValue !== 'all';

  return (
    <div
      id={id || 'building-filter'}
      className="flex flex-wrap items-center gap-3 w-full border-t border-zinc-100 dark:border-zinc-800/60 pt-3"
    >
      {/* Hospital Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Filter className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
        <select
          value={hospitalValue}
          onChange={(e) => onHospitalChange(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        >
          <option value="all">All Hospitals</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {h.hospitalNameEN}
            </option>
          ))}
        </select>
      </div>

      {/* Building Type Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={typeValue}
          onChange={(e) => onTypeChange(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        >
          {BUILDING_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gender Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={genderValue}
          onChange={(e) => onGenderChange(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        >
          {GENDER_OPTIONS.map((opt) => (
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
