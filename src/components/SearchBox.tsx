import { Search, X } from 'lucide-react';

interface SearchBoxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBox({ id, value, onChange, placeholder = 'Search...' }: SearchBoxProps) {
  return (
    <div id={id} className="relative w-full max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-semibold text-gray-900 placeholder-slate-400 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-500"
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
  );
}
