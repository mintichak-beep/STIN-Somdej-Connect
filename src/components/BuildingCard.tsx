import React from 'react';
import { Building } from '../types/db';
import { BuildingStatusChip } from './BuildingStatusChip';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { MapPin, Layers, DoorOpen, Bed, UserCheck, Eye } from 'lucide-react';

interface BuildingCardProps {
  key?: string | number;
  id?: string;
  building: Building;
  isAdmin: boolean;
  onView: (id: string) => void | Promise<void>;
  onEdit: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onArchive: (id: string) => void | Promise<void>;
  onRestore: (id: string) => void | Promise<void>;
  onDuplicate: (id: string) => void | Promise<void>;
}

export function BuildingCard({
  id,
  building,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
}: BuildingCardProps) {
  // Find associated hospital
  const hospital = [].find((h) => h.id === building.hospitalId);
  const hospitalName = hospital ? hospital.hospitalNameEN : 'Unknown Hospital';

  // Action menu options
  const actions: ActionMenuItem[] = [
    { label: 'View Details', onClick: () => onView(building.id), icon: 'view' },
  ];

  if (isAdmin) {
    actions.push({ label: 'Edit Building', onClick: () => onEdit(building.id), icon: 'edit' });
    actions.push({ label: 'Duplicate', onClick: () => onDuplicate(building.id), icon: 'duplicate' });

    if (building.status === 'archived') {
      actions.push({ label: 'Restore Building', onClick: () => onRestore(building.id), icon: 'activate' });
    } else {
      actions.push({ label: 'Archive Building', onClick: () => onArchive(building.id), icon: 'archive' });
    }

    actions.push({ label: 'Delete Permanently', onClick: () => onDelete(building.id), icon: 'delete', danger: true });
  }

  const defaultCover = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600';

  return (
    <div
      id={id || `building-card-${building.id}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-md dark:hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col group relative"
    >
      {/* Cover Image */}
      <div className="h-32 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 relative shrink-0">
        <img
          src={building.imageURL || defaultCover}
          alt={building.buildingName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <BuildingStatusChip status={building.status} />
        </div>
        {actions.length > 0 && (
          <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-zinc-900/90 rounded-lg shadow">
            <ActionMenu actions={actions} />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Header Metadata */}
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
            <span>{building.buildingType}</span>
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              {building.buildingCode}
            </span>
          </div>

          {/* Building Name */}
          <div className="cursor-pointer" onClick={() => onView(building.id)}>
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {building.buildingName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold line-clamp-1">
              {hospitalName}
            </p>
          </div>

          {/* Key details */}
          <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{building.numberOfFloors} Floors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DoorOpen className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{building.totalRooms} Rooms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{building.totalBeds} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{building.gender} Users</span>
            </div>
          </div>

          {/* Short description */}
          {building.description && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium line-clamp-2 pt-1 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 mt-2">
              {building.description}
            </p>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
            <span className="line-clamp-1 max-w-[120px]">{building.address || 'No Address'}</span>
          </div>

          <button
            onClick={() => onView(building.id)}
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
