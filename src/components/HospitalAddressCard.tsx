import React from 'react';
import { MapPin, Phone, Mail, Globe, Hash } from 'lucide-react';
import { Hospital } from '../types/db';

interface HospitalAddressCardProps {
  id?: string;
  hospital: Hospital;
}

export function HospitalAddressCard({ id, hospital }: HospitalAddressCardProps) {
  return (
    <div
      id={id || `address-card-${hospital.id}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4"
    >
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
        Location & Communication
      </h3>

      <div className="space-y-3.5">
        {/* Physical Address */}
        <div className="flex gap-3">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">Physical Address</p>
            <p className="mt-0.5 leading-relaxed">{hospital.address}</p>
            <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-zinc-500">
              {hospital.subdistrict && <span>Subdistrict: {hospital.subdistrict}</span>}
              {hospital.district && <span>• District: {hospital.district}</span>}
              {hospital.province && <span>• Province: {hospital.province}</span>}
              {hospital.postalCode && <span>• Postal Code: {hospital.postalCode}</span>}
            </div>
          </div>
        </div>

        <hr className="border-zinc-100 dark:border-zinc-800/50" />

        {/* Telephone & Fax */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Hospital Telephone</span>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <a href={`tel:${hospital.telephone}`} className="hover:underline">{hospital.telephone}</a>
            </p>
          </div>
          {hospital.fax && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Hospital Fax</span>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-zinc-400" />
                <span>{hospital.fax}</span>
              </p>
            </div>
          )}
        </div>

        {/* Email & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
          {hospital.email && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Hospital Email</span>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <a href={`mailto:${hospital.email}`} className="hover:underline truncate">{hospital.email}</a>
              </p>
            </div>
          )}
          {hospital.website && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Official Website</span>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <a
                  href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  {hospital.website}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
