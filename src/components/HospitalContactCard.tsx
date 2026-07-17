import React from 'react';
import { User, Phone, Mail, Shield } from 'lucide-react';
import { Hospital } from '../types/db';

interface HospitalContactCardProps {
  id?: string;
  hospital: Hospital;
}

export function HospitalContactCard({ id, hospital }: HospitalContactCardProps) {
  return (
    <div
      id={id || `contact-card-${hospital.id}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4"
    >
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
        Contact & Leadership
      </h3>

      {/* Director Information */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Hospital Director</span>
        </div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 pl-6">
          {hospital.directorName || 'Not Specified'}
        </p>
      </div>

      <hr className="border-zinc-100 dark:border-zinc-800/50" />

      {/* Coordinator Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <User className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Clinical Placement Coordinator</span>
        </div>
        
        <div className="pl-6 space-y-2">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {hospital.coordinatorName || 'Not Specified'}
          </p>

          {hospital.coordinatorPhone && (
            <a
              href={`tel:${hospital.coordinatorPhone}`}
              className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{hospital.coordinatorPhone}</span>
            </a>
          )}

          {hospital.coordinatorEmail && (
            <a
              href={`mailto:${hospital.coordinatorEmail}`}
              className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="break-all">{hospital.coordinatorEmail}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
