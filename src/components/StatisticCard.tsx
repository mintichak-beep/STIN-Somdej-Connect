import { ReactNode } from 'react';

interface StatisticCardProps {
  id?: string;
  title: string;
  value: string | number;
  total?: number;
  color?: string; // CSS color or Tailwind class prefix, e.g. "bg-[#D32F2F]"
  subtitle?: string;
  icon?: ReactNode;
}

export function StatisticCard({
  id,
  title,
  value,
  total,
  color = 'bg-[#D32F2F]',
  subtitle,
  icon
}: StatisticCardProps) {
  const percentage = total && typeof value === 'number' ? Math.round((value / total) * 100) : null;

  return (
    <div id={id} className="rounded-[20px] border border-slate-200/80 border-t-4 border-t-[#D32F2F] bg-white p-5 transition-all hover:shadow-xl shadow-lg shadow-slate-100/70 text-[#212121]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#616161] uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-1 text-2xl font-black text-[#212121] font-sans tracking-tight">
            {value}
            {total && (
              <span className="text-xs font-semibold text-[#616161]">
                {' '}/ {total}
              </span>
            )}
          </p>
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-[#D32F2F]">
            {icon}
          </div>
        )}
      </div>

      {percentage !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] font-extrabold text-[#616161] uppercase tracking-widest">
            <span>Utilization Ratio</span>
            <span className="font-sans text-[#D32F2F] font-black">{percentage}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${color}`} 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && (
        <p className="mt-2 text-[11px] font-semibold text-[#616161]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
