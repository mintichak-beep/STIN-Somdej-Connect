import { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 'bento';
  className?: string;
}

export function DashboardGrid({ children, cols = 'bento', className = '' }: DashboardGridProps) {
  const getGridCols = () => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 'bento':
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  return (
    <div className={`grid gap-6 ${getGridCols()} ${className}`}>
      {children}
    </div>
  );
}
