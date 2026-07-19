import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  id?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  value?: string | number;
  children?: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  headerActions?: ReactNode;
}

export function DashboardCard({
  id,
  title,
  subtitle,
  icon: Icon,
  value,
  children,
  className = '',
  hoverEffect = true,
  headerActions
}: DashboardCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/70 ${
        hoverEffect ? 'hover:shadow-md hover:border-gray-200/60 dark:hover:border-zinc-700/50' : ''
      } ${className}`}
    >
      {/* Top Border Accent Decorator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600/10 via-red-600/40 to-red-600/10" />

      {(title || headerActions || Icon) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="mt-1 rounded-lg bg-red-50 p-2 dark:bg-red-950/20">
                <Icon className="h-4 w-4 text-red-600 dark:text-red-500" />
              </div>
            )}
            {title && (
              <div>
                <h3 className="font-sans text-sm font-bold tracking-tight text-gray-900 dark:text-zinc-100 md:text-base">
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-zinc-500">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {value !== undefined && (
        <div className="mt-2 mb-1">
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">{value}</span>
        </div>
      )}

      {children && <div className="relative text-gray-700 dark:text-zinc-300">{children}</div>}
    </motion.div>
  );
}
