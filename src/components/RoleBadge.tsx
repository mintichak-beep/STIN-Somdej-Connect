import { UserRole } from '../types/auth';

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  let bgClass = '';
  let textClass = '';
  let borderClass = '';

  switch (role) {
    case 'Administrator':
      bgClass = 'bg-red-50 dark:bg-red-950/20';
      textClass = 'text-red-700 dark:text-red-400';
      borderClass = 'border-red-200 dark:border-red-900/50';
      break;
    case 'Teacher':
      bgClass = 'bg-blue-50 dark:bg-blue-950/20';
      textClass = 'text-blue-700 dark:text-blue-400';
      borderClass = 'border-blue-200 dark:border-blue-900/50';
      break;
    case 'Student':
      bgClass = 'bg-emerald-50 dark:bg-emerald-950/20';
      textClass = 'text-emerald-700 dark:text-emerald-400';
      borderClass = 'border-emerald-200 dark:border-emerald-900/50';
      break;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide shadow-sm transition-colors duration-200 ${bgClass} ${textClass} ${borderClass}`}
    >
      {role}
    </span>
  );
}
