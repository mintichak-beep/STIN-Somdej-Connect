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
      className={`relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-100/70 transition-all duration-300 text-[#212121] ${
        hoverEffect ? 'hover:border-[#D32F2F]/50 hover:shadow-xl' : ''
      } ${className}`}
    >
      {/* Top Border Red Gradient Accent Decorator */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D32F2F] via-[#C62828] to-[#B71C1C]" />

      {(title || headerActions || Icon) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="mt-0.5 rounded-xl bg-red-50 p-2.5 border border-red-100 text-[#D32F2F]">
                <Icon className="h-4 w-4" />
              </div>
            )}
            {title && (
              <div>
                <h3 className="font-sans text-base font-black tracking-tight text-[#212121]">
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-0.5 text-xs font-semibold text-[#616161]">
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
          <span className="text-3xl font-black tracking-tight text-[#212121]">{value}</span>
        </div>
      )}

      {children && <div className="relative text-[#212121]">{children}</div>}
    </motion.div>
  );
}
