import { ReactNode } from 'react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon?: ReactNode;
  title: string;
  description: string;
  actionButton?: ReactNode;
}

export function EmptyState({
  id,
  icon = <Database className="h-12 w-12 text-slate-300 dark:text-zinc-600" />,
  title,
  description,
  actionButton
}: EmptyStateProps) {
  return (
    <div id={id} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/20 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/10">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-900">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-extrabold text-gray-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-xs font-semibold text-gray-500 leading-relaxed dark:text-zinc-400">
        {description}
      </p>
      {actionButton && (
        <div className="mt-6">
          {actionButton}
        </div>
      )}
    </div>
  );
}
