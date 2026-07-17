import { useMemo } from 'react';
import { Hospital, Student } from '../types/db';
import { MapPin, Phone, User } from 'lucide-react';

interface HospitalSummaryCardProps {
  hospitals: Hospital[];
  students: Student[];
}

export function HospitalSummaryCard({ hospitals, students }: HospitalSummaryCardProps) {
  const hospitalStats = useMemo(() => {
    return hospitals.map(h => {
      const hospitalStudents = students.filter(s => s.hospitalId === h.id);
      const currentCount = hospitalStudents.length;
      const ratio = h.capacity > 0 ? Math.round((currentCount / h.capacity) * 100) : 0;
      return {
        ...h,
        currentCount,
        ratio
      };
    });
  }, [hospitals, students]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600/10 via-red-600/20 to-red-600/10" />
      
      <div className="mb-4 border-b border-gray-50 pb-3 dark:border-zinc-800/60">
        <h4 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
          Hospital Wards Capacity
        </h4>
        <p className="text-[10px] text-gray-400 dark:text-zinc-500">Clinical placements capacity status</p>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {hospitalStats.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">No Hospitals Registered</p>
        ) : (
          hospitalStats.map(h => (
            <div key={h.id} className="group rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 transition-all hover:bg-slate-50 dark:border-zinc-900 dark:bg-zinc-900/30">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate group-hover:text-red-600 transition-colors">
                    {h.name}
                  </h5>
                  <div className="mt-1 flex flex-col gap-1 text-[10px] text-gray-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                      <span className="truncate">{h.address}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-gray-400 shrink-0" />
                      <span className="truncate">{h.contactName} ({h.contactPhone})</span>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-sans text-xs font-black text-gray-900 dark:text-zinc-100">
                    {h.currentCount}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                    {' '}/ {h.capacity}
                  </span>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">Students</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                  <span>Quota Utilized</span>
                  <span>{h.ratio}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      h.ratio >= 90 ? 'bg-red-600' : h.ratio >= 60 ? 'bg-amber-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${h.ratio}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
