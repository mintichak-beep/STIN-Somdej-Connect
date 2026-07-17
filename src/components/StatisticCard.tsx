import { ReactNode } from 'react';

interface StatisticCardProps {
  id?: string;
  title: string;
  value: string | number;
  total?: number;
  color?: string; // CSS color or Tailwind class prefix, e.g. "bg-red-600"
  subtitle?: string;
  icon?: ReactNode;
}

export function StatisticCard({
  id,
  title,
  value,
  total,
  color = 'bg-red-600',
  subtitle,
  icon
}: StatisticCardProps) {
  const percentage = total && typeof value === 'number' ? Math.round((value / total) * 100) : null;

  return (
    <div id={id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 dark:border-zinc-800/60 dark:bg-zinc-900/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-1 text-xl font-extrabold text-gray-900 dark:text-zinc-100 font-sans">
            {value}
            {total && (
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                {' '}/ {total}
              </span>
            )}
          </p>
        </div>
        {icon && (
          <div className="text-slate-400 dark:text-zinc-500">
            {icon}
          </div>
        )}
      </div>

      {percentage !== null && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
            <span>Utilization Ratio</span>
            <span className="font-sans">{percentage}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${color}`} 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && (
        <p className="mt-1.5 text-[10px] font-medium text-gray-400 dark:text-zinc-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
