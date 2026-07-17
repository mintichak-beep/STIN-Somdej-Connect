import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardProps {
  id?: string;
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'info';
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function SummaryCard({
  id,
  title,
  value,
  icon,
  color = 'primary',
  description,
  trend
}: SummaryCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
          accent: 'border-l-4 border-emerald-500',
          textAccent: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
          accent: 'border-l-4 border-amber-500',
          textAccent: 'text-amber-600 dark:text-amber-400'
        };
      case 'info':
        return {
          iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
          accent: 'border-l-4 border-sky-500',
          textAccent: 'text-sky-600 dark:text-sky-400'
        };
      case 'primary':
      default:
        return {
          iconBg: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
          accent: 'border-l-4 border-red-500',
          textAccent: 'text-red-600 dark:text-red-400'
        };
    }
  };

  const classes = getColorClasses();

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative flex items-center justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/70 ${classes.accent}`}
    >
      <div className="flex-1">
        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-zinc-500">
          {title}
        </p>
        
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-sans text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-50 md:text-3xl">
            {value}
          </span>
          {trend && (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              trend.isPositive 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
            }`}>
              {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500 truncate" title={description}>
            {description}
          </p>
        )}
      </div>

      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${classes.iconBg}`}>
        {icon}
      </div>
    </motion.div>
  );
}
