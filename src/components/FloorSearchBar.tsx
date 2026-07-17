import React from 'react';
import { Search, Grid, List } from 'lucide-react';

interface FloorSearchBarProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
}

export function FloorSearchBar({
  id,
  value,
  onChange,
  viewMode,
  onViewModeChange,
}: FloorSearchBarProps) {
  return (
    <div
      id={id || 'floor-search-bar'}
      className="flex flex-col md:flex-row gap-4 items-center justify-between"
    >
      {/* Search Input Box */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search floor levels by name (e.g. 1st Floor, Basement)..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      {/* Grid vs Table View Mode Toggles */}
      <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl shrink-0 border border-slate-200/55 dark:border-zinc-700/60">
        <button
          onClick={() => onViewModeChange('cards')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-extrabold transition cursor-pointer ${
            viewMode === 'cards'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
          }`}
        >
          <Grid className="h-3.5 w-3.5" />
          <span>Cards</span>
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-extrabold transition cursor-pointer ${
            viewMode === 'table'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
          }`}
        >
          <List className="h-3.5 w-3.5" />
          <span>Table</span>
        </button>
      </div>
    </div>
  );
}
