import { Filter, RotateCcw } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  id?: string;
  statusValue?: string;
  onStatusChange?: (status: string) => void;
  statusOptions?: FilterOption[];
  academicYearValue?: string;
  onAcademicYearChange?: (ayId: string) => void;
  academicYearOptions?: FilterOption[];
  onClearFilters?: () => void;
  showAcademicYearFilter?: boolean;
}

export function FilterBar({
  id,
  statusValue,
  onStatusChange,
  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
    { value: 'archived', label: 'Archived Only' }
  ],
  academicYearValue,
  onAcademicYearChange,
  academicYearOptions = [],
  onClearFilters,
  showAcademicYearFilter = false
}: FilterBarProps) {
  return (
    <div id={id} className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      {onStatusChange && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <select
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Academic Year Filter */}
      {showAcademicYearFilter && onAcademicYearChange && (
        <select
          value={academicYearValue}
          onChange={(e) => onAcademicYearChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        >
          <option value="">All Academic Years</option>
          {academicYearOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Reset/Clear button */}
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}
