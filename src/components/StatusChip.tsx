import { CheckCircle2, AlertCircle, Archive } from 'lucide-react';

interface StatusChipProps {
  id?: string;
  status: 'active' | 'inactive' | 'archived' | string;
}

export function StatusChip({ id, status }: StatusChipProps) {
  const normalized = status.toLowerCase();

  if (normalized === 'active') {
    return (
      <span 
        id={id} 
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        Active
      </span>
    );
  }

  if (normalized === 'inactive') {
    return (
      <span 
        id={id} 
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300"
      >
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        Inactive
      </span>
    );
  }

  if (normalized === 'archived') {
    return (
      <span 
        id={id} 
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 dark:bg-zinc-800/60 dark:border-zinc-700/60 dark:text-zinc-300"
      >
        <Archive className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
        Archived
      </span>
    );
  }

  // Fallback
  return (
    <span 
      id={id} 
      className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 border border-gray-100 dark:bg-zinc-800/30 dark:border-zinc-700/40 dark:text-zinc-400"
    >
      {status}
    </span>
  );
}
