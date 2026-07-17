import React, { useState } from 'react';
import { Map, Copy, Check, ExternalLink, Navigation } from 'lucide-react';
import { Hospital } from '../types/db';

interface HospitalMapCardProps {
  id?: string;
  hospital: Hospital;
}

export function HospitalMapCard({ id, hospital }: HospitalMapCardProps) {
  const [copied, setCopied] = useState(false);

  const coordinates = `${hospital.latitude}, ${hospital.longitude}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(coordinates);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={id || `map-card-${hospital.id}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Geographic Coordinates
        </h3>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>Open Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="space-y-4">
        {/* Latitude and Longitude Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900/50">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Latitude</span>
            <p className="text-sm font-mono font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
              {hospital.latitude || '0.00000'}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900/50">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Longitude</span>
            <p className="text-sm font-mono font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
              {hospital.longitude || '0.00000'}
            </p>
          </div>
        </div>

        {/* Copy Coordinates Button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Coordinates Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-500" />
                <span>Copy Coordinates</span>
              </>
            )}
          </button>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Navigate</span>
          </a>
        </div>

        {/* Interactive Google Map Mockup */}
        <div className="relative w-full h-36 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-zinc-200 dark:border-zinc-800 overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(#c5c5c5_1px,transparent_1px)] dark:bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
          {/* Mock Map Vector graphics */}
          <div className="absolute top-1/2 left-1/3 w-full h-1 bg-zinc-300 dark:bg-zinc-700 transform -rotate-12"></div>
          <div className="absolute top-1/4 left-1/2 w-0.5 h-full bg-zinc-300 dark:bg-zinc-700"></div>
          <div className="absolute top-1/3 left-0 w-full h-1.5 bg-zinc-300 dark:bg-zinc-700 transform rotate-45"></div>

          {/* Interactive Ping Pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </div>
            <span className="mt-1 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap opacity-90">
              {hospital.shortName || hospital.hospitalNameEN}
            </span>
          </div>

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors duration-200"
          >
            <span className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
              <Map className="w-3.5 h-3.5 text-indigo-500" /> View Map
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
