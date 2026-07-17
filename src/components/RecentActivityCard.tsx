import { useRecentActivities } from '../hooks/useRecentActivities';
import { 
  LogIn, UserPlus, ShieldAlert, KeyRound, Building, Car, 
  FileSpreadsheet, Clock, AlertTriangle 
} from 'lucide-react';
import { RecentActivity } from '../types/db';

export function RecentActivityCard() {
  const { activities, loading, error } = useRecentActivities();

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4 text-sky-600" />;
      case 'student_add':
        return <UserPlus className="h-4 w-4 text-emerald-600" />;
      case 'teacher_add':
        return <KeyRound className="h-4 w-4 text-amber-600" />;
      case 'room_assign':
        return <Building className="h-4 w-4 text-purple-600" />;
      case 'transport_assign':
        return <Car className="h-4 w-4 text-pink-600" />;
      case 'report_gen':
        return <FileSpreadsheet className="h-4 w-4 text-indigo-600" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'login': return 'bg-sky-50 border-sky-200 dark:bg-sky-950/20 dark:border-sky-900/30';
      case 'student_add': return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30';
      case 'teacher_add': return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30';
      case 'room_assign': return 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/30';
      case 'transport_assign': return 'bg-pink-50 border-pink-200 dark:bg-pink-950/20 dark:border-pink-900/30';
      case 'report_gen': return 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/30';
      default: return 'bg-gray-50 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600/10 via-red-600/20 to-red-600/10" />
      
      <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-3 dark:border-zinc-800/60">
        <div>
          <h4 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
            Realtime Audit Trail
          </h4>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500">Live operational events stream</p>
        </div>
        <div className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
      </div>

      <div className="relative max-h-[350px] overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-zinc-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 bg-gray-100 dark:bg-zinc-800 rounded" />
                  <div className="h-2.5 w-2/3 bg-gray-50 dark:bg-zinc-900 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-rose-500">
            <AlertTriangle className="h-8 w-8 text-rose-500 mb-2" />
            <p className="text-xs font-semibold">Error Loading Events</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-gray-400 dark:text-zinc-500">
            <Clock className="h-8 w-8 mx-auto stroke-1 mb-2" />
            <p className="text-xs font-semibold">No Recent Events</p>
            <p className="text-[10px]">Changes in clinical placements appear here</p>
          </div>
        ) : (
          <div className="relative pl-4 border-l border-gray-100 dark:border-zinc-800 space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Timeline dot */}
                <span className="absolute -left-[24.5px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 group-hover:border-red-500 transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-red-500 transition-colors" />
                </span>

                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${getActivityColor(act.type)}`}>
                    {getActivityIcon(act.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">
                        {act.title}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                        {formatTime(act.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                    <p className="mt-1 text-[9px] font-semibold text-gray-400 dark:text-zinc-500">
                      by {act.userDisplayName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
