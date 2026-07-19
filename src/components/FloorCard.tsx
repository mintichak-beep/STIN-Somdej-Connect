import React from 'react';
import { Floor } from '../types/db';
import { FloorStatusChip } from './FloorStatusChip';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { Layers, DoorOpen, Bed, UserCheck, Eye } from 'lucide-react';

interface FloorCardProps {
  key?: string | number;
  id?: string;
  floor: Floor;
  isAdmin: boolean;
  onView: (id: string) => void | Promise<void>;
  onEdit: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onArchive: (id: string) => void | Promise<void>;
  onRestore: (id: string) => void | Promise<void>;
  onDuplicate: (id: string) => void | Promise<void>;
}

export function FloorCard({
  id,
  floor,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
}: FloorCardProps) {
  // Find associated building
  const building = [].find((b) => b.id === floor.buildingId);
  const buildingName = building ? building.buildingName : 'Unknown Building';

  // Find associated hospital
  const hospital = [].find((h) => h.id === floor.hospitalId);
  const hospitalName = hospital ? hospital.hospitalNameEN : 'Unknown Training Site';

  // Action Menu List
  const actions: ActionMenuItem[] = [
    { label: 'View Floor Details', onClick: () => onView(floor.id), icon: 'view' },
  ];

  if (isAdmin) {
    actions.push({ label: 'Edit Floor', onClick: () => onEdit(floor.id), icon: 'edit' });
    actions.push({ label: 'Duplicate Floor', onClick: () => onDuplicate(floor.id), icon: 'duplicate' });

    if (floor.status === 'archived') {
      actions.push({ label: 'Restore Floor', onClick: () => onRestore(floor.id), icon: 'activate' });
    } else {
      actions.push({ label: 'Archive Floor', onClick: () => onArchive(floor.id), icon: 'archive' });
    }

    actions.push({ label: 'Delete Permanently', onClick: () => onDelete(floor.id), icon: 'delete', danger: true });
  }

  return (
    <div
      id={id || `floor-card-${floor.id}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-md dark:hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col group relative"
    >
      {/* Decorative colored top header bar */}
      <div className="h-2 w-full bg-indigo-600 dark:bg-indigo-500 shrink-0" />

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Header Metadata */}
          <div className="flex items-center justify-between">
            <FloorStatusChip status={floor.status} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Level {floor.floorNumber}
            </span>
          </div>

          {/* Floor Name and building */}
          <div className="cursor-pointer space-y-0.5" onClick={() => onView(floor.id)}>
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {floor.floorName}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold line-clamp-1">
              {buildingName}
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold line-clamp-1">
              {hospitalName}
            </p>
          </div>

          {/* Capacities */}
          <div className="pt-2 grid grid-cols-2 gap-3 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-1.5">
              <DoorOpen className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{floor.totalRooms} Rooms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{floor.totalBeds} Beds</span>
            </div>
          </div>

          {/* Description */}
          {floor.description && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium line-clamp-2 pt-1 leading-relaxed">
              {floor.description}
            </p>
          )}
        </div>

        {/* Action button bar */}
        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <button
            onClick={() => onView(floor.id)}
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Floor Specs</span>
          </button>

          {actions.length > 0 && (
            <div className="relative z-10">
              <ActionMenu actions={actions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
