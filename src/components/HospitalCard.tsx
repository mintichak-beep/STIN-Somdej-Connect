import React from 'react';
import { Hospital } from '../types/db';
import { HospitalStatusChip } from './HospitalStatusChip';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { MapPin, Users, Phone, Building, GraduationCap, School } from 'lucide-react';
import { AssetImage } from './AssetImage';

interface HospitalCardProps {
  key?: string | number;
  id?: string;
  hospital: Hospital;
  isAdmin: boolean;
  onView: (id: string) => void | Promise<void>;
  onEdit: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onArchive: (id: string) => void | Promise<void>;
  onRestore: (id: string) => void | Promise<void>;
  onDuplicate: (id: string) => void | Promise<void>;
}

export function HospitalCard({
  id,
  hospital,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate
}: HospitalCardProps) {
  // Build actions list based on admin status and hospital status
  const actions: ActionMenuItem[] = [
    { label: 'View Details', onClick: () => onView(hospital.id), icon: 'view' }
  ];

  if (isAdmin) {
    actions.push({ label: 'Edit Profile', onClick: () => onEdit(hospital.id), icon: 'edit' });
    actions.push({ label: 'Duplicate', onClick: () => onDuplicate(hospital.id), icon: 'duplicate' });
    
    if (hospital.status === 'archived') {
      actions.push({ label: 'Restore Profile', onClick: () => onRestore(hospital.id), icon: 'activate' });
    } else {
      actions.push({ label: 'Archive Profile', onClick: () => onArchive(hospital.id), icon: 'archive' });
    }

    actions.push({ label: 'Delete Permanently', onClick: () => onDelete(hospital.id), icon: 'delete', danger: true });
  }

  // Fallback images if not specified
  const defaultCover = 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?auto=format&fit=crop&q=80&w=400';
  const defaultLogo = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150';

  return (
    <div
      id={id || `hospital-card-${hospital.id}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-md dark:hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col group relative"
    >
      {/* Cover Image */}
      <div className="h-28 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 relative shrink-0">
        <AssetImage
          src={hospital.imageURL || defaultCover}
          alt={hospital.hospitalNameEN}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          fallbackType="hospital"
        />
        <div className="absolute top-3 left-3">
          <HospitalStatusChip status={hospital.status} />
        </div>
        {actions.length > 0 && (
          <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-zinc-900/90 rounded-lg shadow">
            <ActionMenu actions={actions} />
          </div>
        )}
      </div>

      {/* Hospital Logo Avatar overlapping the Cover Image */}
      <div className="px-5 -mt-8 relative flex items-end justify-between shrink-0">
        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white dark:border-zinc-900 bg-white shadow-md">
          <AssetImage
            src={hospital.logoURL || defaultLogo}
            alt={`${hospital.hospitalNameEN} Logo`}
            className="w-full h-full object-cover"
            fallbackType="hospital"
          />
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
          {hospital.hospitalCode}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 pt-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Hospital Names */}
          <div className="cursor-pointer" onClick={() => onView(hospital.id)}>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {hospital.hospitalNameTH}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold line-clamp-1">
              {hospital.hospitalNameEN}
            </p>
          </div>

          {/* Type and Affiliation */}
          <div className="flex flex-col gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded w-max">
              {hospital.type}
            </span>
            <p className="line-clamp-1 font-medium italic opacity-90">{hospital.affiliation}</p>
          </div>
        </div>

        {/* Logistic Summary Metrics */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-3 mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Capacity: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{hospital.studentCapacity}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate" title={hospital.province}>{hospital.province}</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <School className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Buildings: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{hospital.numberOfBuildings || 0}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{hospital.telephone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
