import { ReactNode } from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-6 md:p-8">
      {/* Top Welcome banner skeleton */}
      <div className="rounded-2xl bg-gray-100 p-6 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800">
        <div className="h-6 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-2/3 bg-gray-150 dark:bg-zinc-900 rounded mt-2" />
      </div>

      {/* KPI Numbers Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 bg-gray-150 dark:bg-zinc-800 rounded" />
                <div className="h-7 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded" />
              </div>
              <div className="h-10 w-10 bg-gray-100 dark:bg-zinc-900 rounded-xl" />
            </div>
            <div className="h-3.5 w-2/3 bg-gray-50 dark:bg-zinc-900 rounded mt-3" />
          </div>
        ))}
      </div>

      {/* Primary Panels Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column large chart card */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950/70 h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-12 bg-gray-100 dark:bg-zinc-800 rounded" />
          </div>
          <div className="flex items-end gap-3 h-48 px-4">
            {[20, 45, 12, 60, 30, 80, 50, 40].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gray-100 dark:bg-zinc-900 rounded-t" 
                style={{ height: `${h}%` }} 
              />
            ))}
          </div>
          <div className="h-3 w-1/2 bg-gray-100 dark:bg-zinc-800 rounded self-center" />
        </div>

        {/* Right column quick actions card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950/70 h-80 flex flex-col justify-between">
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-16 bg-gray-100 dark:bg-zinc-900 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default DashboardSkeleton;
