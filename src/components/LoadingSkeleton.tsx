interface LoadingSkeletonProps {
  id?: string;
  type?: 'table' | 'cards' | 'detail';
  rows?: number;
}

export function LoadingSkeleton({ id, type = 'table', rows = 5 }: LoadingSkeletonProps) {
  if (type === 'cards') {
    return (
      <div id={id} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            <div className="h-4 w-1/3 rounded-md bg-slate-200 dark:bg-zinc-800" />
            <div className="mt-4 h-6 w-3/4 rounded-md bg-slate-200 dark:bg-zinc-800" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded-md bg-slate-100 dark:bg-zinc-900" />
              <div className="h-3 w-5/6 rounded-md bg-slate-100 dark:bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div id={id} className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-md bg-slate-200 dark:bg-zinc-800" />
            <div className="h-4 w-72 rounded-md bg-slate-100 dark:bg-zinc-900" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-zinc-800" />
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-zinc-900" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-slate-100 dark:bg-zinc-900" />
      </div>
    );
  }

  // Table Skeleton
  return (
    <div id={id} className="w-full space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 rounded-xl bg-slate-100 dark:bg-zinc-900" />
        <div className="h-8 w-32 rounded-xl bg-slate-100 dark:bg-zinc-900" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800">
        <div className="h-12 bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800" />
        <div className="divide-y divide-slate-100 dark:divide-zinc-850 p-4 space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 flex-1 rounded-md bg-slate-100 dark:bg-zinc-900" />
              <div className="h-4 flex-1 rounded-md bg-slate-100 dark:bg-zinc-900" />
              <div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-zinc-900" />
              <div className="h-4 w-12 rounded-md bg-slate-100 dark:bg-zinc-900" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
