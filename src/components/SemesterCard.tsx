import { useMemo } from 'react';
import { Semester, AcademicYear } from '../types/db';
import { StatusChip } from './StatusChip';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { CalendarRange, Star } from 'lucide-react';

interface SemesterCardProps {
  key?: string | number;
  id?: string;
  item: Semester;
  academicYears: AcademicYear[];
  isAdmin: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onSetCurrent: (id: string) => void;
}

export function SemesterCard({
  id,
  item,
  academicYears,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onActivate,
  onDeactivate,
  onSetCurrent
}: SemesterCardProps) {
  const parentName = useMemo(() => {
    const parent = academicYears.find(ay => ay.id === item.academicYearId);
    return parent ? parent.name : 'Unknown Year';
  }, [academicYears, item.academicYearId]);

  const contextActions: ActionMenuItem[] = [
    { label: 'View Detail', onClick: () => onView(item.id), icon: 'view' }
  ];

  if (isAdmin) {
    contextActions.push(
      { label: 'Edit Term', onClick: () => onEdit(item.id), icon: 'edit' }
    );

    if (!item.isCurrent) {
      contextActions.push({ label: 'Set Current Active Term', onClick: () => onSetCurrent(item.id), icon: 'current' });
    }

    if (item.status === 'active') {
      contextActions.push({ label: 'Deactivate', onClick: () => onDeactivate(item.id), icon: 'deactivate' });
    } else if (item.status === 'inactive') {
      contextActions.push({ label: 'Activate', onClick: () => onActivate(item.id), icon: 'activate' });
    }

    if (item.status !== 'archived') {
      contextActions.push({ label: 'Archive Record', onClick: () => onArchive(item.id), icon: 'archive', danger: true });
    } else {
      contextActions.push({ label: 'Restore Record', onClick: () => onActivate(item.id), icon: 'activate' });
    }

    contextActions.push({ label: 'Delete Permanently', onClick: () => onDelete(item.id), icon: 'delete', danger: true });
  }

  return (
    <div id={id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:bg-slate-50/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/10">
      <div className="absolute top-0 left-0 h-1.5 w-full bg-red-600 transition-transform group-hover:scale-x-105" />

      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
              <CalendarRange className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100">
                  {item.semesterName}
                </h4>
                {item.isCurrent && (
                  <span className="rounded-md bg-red-50 p-1 text-[8px] font-black uppercase tracking-wider text-red-700 dark:bg-red-950/40 dark:text-red-400">
                    Active Term
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                Academic Year: {parentName}
              </p>
            </div>
          </div>
          <ActionMenu actions={contextActions} />
        </div>

        <div className="mt-4 space-y-1 text-xs font-semibold text-gray-500 dark:text-zinc-400">
          <div className="flex justify-between border-b border-slate-50 py-1 dark:border-zinc-900/40">
            <span>Semester Period:</span>
            <span className="font-bold text-gray-700 dark:text-zinc-300">{item.startDate} ⇄ {item.endDate}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Enrollment Open:</span>
            <span className="font-bold text-gray-700 dark:text-zinc-300">{item.registrationStart} ⇄ {item.registrationEnd}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4 dark:border-zinc-900/60">
        <StatusChip status={item.status} />
        <button
          onClick={() => onView(item.id)}
          className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 cursor-pointer"
        >
          <span>View Details</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
