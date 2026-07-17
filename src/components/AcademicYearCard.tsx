import { AcademicYear } from '../types/db';
import { StatusChip } from './StatusChip';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { Calendar, Layers } from 'lucide-react';

interface AcademicYearCardProps {
  key?: string | number;
  id?: string;
  item: AcademicYear;
  isAdmin: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDuplicate: (item: AcademicYear) => void;
}

export function AcademicYearCard({
  id,
  item,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onActivate,
  onDeactivate,
  onDuplicate
}: AcademicYearCardProps) {
  // Build actions list
  const contextActions: ActionMenuItem[] = [
    { label: 'View Detail', onClick: () => onView(item.id), icon: 'view' }
  ];

  if (isAdmin) {
    contextActions.push(
      { label: 'Edit Term', onClick: () => onEdit(item.id), icon: 'edit' },
      { label: 'Duplicate', onClick: () => onDuplicate(item), icon: 'duplicate' }
    );

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
      {/* Decorative colored glow on hover */}
      <div className="absolute top-0 left-0 h-1.5 w-full bg-red-600 transition-transform group-hover:scale-x-105" />

      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100">
                Academic Year {item.name}
              </h4>
              <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                Term Period: {item.startYear} - {item.endYear}
              </p>
            </div>
          </div>
          <ActionMenu actions={contextActions} />
        </div>

        <p className="mt-4 text-xs font-semibold text-gray-500 line-clamp-2 leading-relaxed dark:text-zinc-400">
          {item.description || 'No detailed description specified for this academic year record.'}
        </p>
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
