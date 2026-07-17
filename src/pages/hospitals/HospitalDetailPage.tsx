import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { useHospital } from '../../hooks/useHospital';
import { useRole } from '../../hooks/useRole';
import { HospitalStatusChip } from '../../components/HospitalStatusChip';
import { HospitalContactCard } from '../../components/HospitalContactCard';
import { HospitalAddressCard } from '../../components/HospitalAddressCard';
import { HospitalMapCard } from '../../components/HospitalMapCard';
import { HospitalStatisticsCard } from '../../components/HospitalStatisticsCard';
import { ChevronLeft, Edit2, RefreshCw } from 'lucide-react';

export function HospitalDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useRole();

  const { hospital, loading, error } = useHospital(id);

  const defaultCover = 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?auto=format&fit=crop&q=80&w=1200';
  const defaultLogo = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150';

  return (
    <div className="flex h-screen w-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Breadcrumb Navigation Header */}
        <header className="h-16 shrink-0 border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/hospitals')}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/hospitals')}>Hospitals</span>
                <span>/</span>
                <span className="text-zinc-500 dark:text-zinc-300">Detailed View</span>
              </div>
              <h1 className="text-sm font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                {loading ? '...' : hospital?.shortName || 'Hospital Profile'}
              </h1>
            </div>
          </div>

          {isAdmin && hospital && (
            <button
              onClick={() => navigate(`/hospitals/${hospital.id}/edit`)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : error || !hospital ? (
            <div className="p-6">
              <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl p-4.5 text-xs font-semibold text-rose-700 dark:text-rose-400 text-center">
                {error || 'Hospital profile not found.'}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6 max-w-6xl w-full mx-auto">
              
              {/* Premium Header Banner Cover Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm relative">
                <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-950 relative">
                  <img
                    src={hospital.imageURL || defaultCover}
                    alt={hospital.hospitalNameEN}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"></div>
                </div>

                {/* Info Overlay Box */}
                <div className="p-6 pt-0 -mt-10 relative flex flex-col sm:flex-row gap-5 items-end">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-900 bg-white shadow-lg shrink-0">
                    <img
                      src={hospital.logoURL || defaultLogo}
                      alt={`${hospital.hospitalNameEN} Logo`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left pb-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-600 text-white rounded">
                        {hospital.hospitalCode}
                      </span>
                      <HospitalStatusChip status={hospital.status} />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-2 leading-tight">
                      {hospital.hospitalNameTH}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold leading-tight mt-0.5">
                      {hospital.hospitalNameEN}
                    </p>
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold mr-2 text-[10px] uppercase text-indigo-600 dark:text-indigo-400">
                        {hospital.type}
                      </span>
                      <span className="italic">{hospital.affiliation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Info Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Columns (Span 2): Address and Contacts */}
                <div className="md:col-span-2 space-y-6">
                  {/* Notes Panel */}
                  {hospital.note && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-3">
                        Placement Remarks & Policy
                      </h3>
                      <p className="text-xs leading-relaxed font-semibold text-zinc-600 dark:text-zinc-400">
                        {hospital.note}
                      </p>
                    </div>
                  )}

                  <HospitalAddressCard hospital={hospital} />

                  <HospitalContactCard hospital={hospital} />
                </div>

                {/* Right Column: Statistics, Map, Timeline metadata */}
                <div className="space-y-6">
                  {/* Logistics stats counter */}
                  <HospitalStatisticsCard hospitalId={hospital.id} />

                  {/* Coordinates mapping card */}
                  <HospitalMapCard hospital={hospital} />

                  {/* System properties metadata info */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4.5 shadow-sm text-[10px] text-zinc-400 dark:text-zinc-500 space-y-2">
                    <div className="flex justify-between border-b border-zinc-50 dark:border-zinc-800/40 pb-1.5">
                      <span>System Identity:</span>
                      <span className="font-semibold font-mono">{hospital.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-50 dark:border-zinc-800/40 pb-1.5">
                      <span>Date Registered:</span>
                      <span className="font-semibold">{new Date(hospital.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Modified:</span>
                      <span className="font-semibold">{new Date(hospital.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export default HospitalDetailPage;
