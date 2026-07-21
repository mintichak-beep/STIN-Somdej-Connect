import React from 'react';
import { Hospital } from '../types/db';
import { HospitalStatusChip } from './HospitalStatusChip';
import { HospitalContactCard } from './HospitalContactCard';
import { HospitalAddressCard } from './HospitalAddressCard';
import { HospitalMapCard } from './HospitalMapCard';
import { HospitalStatisticsCard } from './HospitalStatisticsCard';
import { X, ExternalLink, Calendar, PlusCircle } from 'lucide-react';
import { AssetImage } from './AssetImage';

interface HospitalDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital | null;
}

export function HospitalDialog({ id, isOpen, onClose, hospital }: HospitalDialogProps) {
  if (!isOpen || !hospital) return null;

  const defaultCover = 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?auto=format&fit=crop&q=80&w=800';
  const defaultLogo = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150';

  return (
    <div
      id={id || 'hospital-preview-dialog'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col relative">
        
        {/* Header Cover Banner */}
        <div className="h-44 w-full bg-zinc-200 dark:bg-zinc-900 overflow-hidden relative shrink-0">
          <AssetImage
            src={hospital.imageURL || defaultCover}
            alt={hospital.hospitalNameEN}
            className="w-full h-full object-cover"
            fallbackType="hospital"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/55 hover:bg-black/75 text-white rounded-full transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Overlapping Info */}
          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white dark:border-zinc-900 bg-white shadow shrink-0">
              <AssetImage
                src={hospital.logoURL || defaultLogo}
                alt={`${hospital.hospitalNameEN} Logo`}
                className="w-full h-full object-cover"
                fallbackType="hospital"
              />
            </div>
            <div className="text-white pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-600 rounded">
                  {hospital.hospitalCode}
                </span>
                <HospitalStatusChip status={hospital.status} />
              </div>
              <h2 className="text-lg font-bold mt-1.5 leading-tight">{hospital.hospitalNameTH}</h2>
              <p className="text-xs text-zinc-300 font-semibold leading-tight">{hospital.hospitalNameEN}</p>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left Column: Primary Logistics & Contact Details */}
          <div className="md:col-span-2 space-y-5">
            {/* Note Panel */}
            {hospital.note && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Internal Notes</p>
                <p className="leading-relaxed">{hospital.note}</p>
              </div>
            )}

            {/* Address Info */}
            <HospitalAddressCard hospital={hospital} />

            {/* Contacts Info */}
            <HospitalContactCard hospital={hospital} />
          </div>

          {/* Right Column: Numbers, Capacity & Maps */}
          <div className="space-y-5">
            {/* Realtime stats calculations */}
            <HospitalStatisticsCard hospitalId={hospital.id} />

            {/* Geographic Coordinates map */}
            <HospitalMapCard hospital={hospital} />

            {/* System Info Panel */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm text-[10px] text-zinc-400 dark:text-zinc-500 space-y-1.5">
              <div className="flex justify-between">
                <span>Created At:</span>
                <span className="font-semibold">{new Date(hospital.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-semibold">{new Date(hospital.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-zinc-100 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
