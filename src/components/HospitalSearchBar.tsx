import React from 'react';
import { Search, X, Grid, List } from 'lucide-react';

interface HospitalSearchBarProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
}

export function HospitalSearchBar({
  id,
  value,
  onChange,
  placeholder = 'Search hospitals by name, code, province...',
  viewMode,
  onViewModeChange
}: HospitalSearchBarProps) {
  return (
    <div id={id} className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-semibold text-gray-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-500"
          placeholder={placeholder}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-gray-900 dark:hover:text-zinc-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* View Mode Toggle Buttons */}
      <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
        <button
          type="button"
          onClick={() => onViewModeChange('table')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            viewMode === 'table'
              ? 'bg-white dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
          title="Table View"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('cards')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            viewMode === 'cards'
              ? 'bg-white dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
          title="Grid View"
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
