import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { useFloor } from '../../hooks/useFloor';
import { useRole } from '../../hooks/useRole';
import { FloorStatusChip } from '../../components/FloorStatusChip';
import { mockDB } from '../../services/mockData';
import {
  ArrowLeft,
  Edit,
  Building2,
  Layers,
  DoorOpen,
  Bed,
  CheckCircle,
  HelpCircle,
  Users,
} from 'lucide-react';

export function FloorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  const { floor, loading, error } = useFloor(id);

  // Associated Rooms list state
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      const allRooms = mockDB.getRooms().filter((r) => r.floorId === id);
      setRooms(allRooms);
    }
  }, [id, floor]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-bold text-slate-500">Loading floor level specs...</p>
        </div>
      </div>
    );
  }

  if (error || !floor) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 text-center max-w-sm space-y-3 shadow-xs">
          <h3 className="text-sm font-black text-rose-600">Error Loading Specs</h3>
          <p className="text-xs text-slate-500 font-semibold">{error || 'Floor level profile not found.'}</p>
          <button
            onClick={() => navigate('/floors')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 cursor-pointer"
          >
            Back to Floors
          </button>
        </div>
      </div>
    );
  }

  // Find parent building
  const building = mockDB.getBuildings().find((b) => b.id === floor.buildingId);
  // Find parent hospital
  const hospital = mockDB.getHospitals().find((h) => h.id === floor.hospitalId);

  // Calculate capacities
  const totalBeds = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupiedCount || 0), 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50 dark:bg-zinc-950">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Detail Page Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 dark:border-zinc-800/60 dark:bg-zinc-950">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/floors')}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg text-slate-500 hover:text-gray-900 dark:hover:text-zinc-100 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-black text-gray-900 dark:text-zinc-50 uppercase tracking-wider">
                {floor.floorName}
              </h1>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Level {floor.floorNumber} inside {building?.buildingName || 'Unknown Building'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate(`/floors/${floor.id}/edit`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition duration-150 cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Specs</span>
            </button>
          )}
        </header>

        {/* Content Panel */}
        <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          {/* Main layout card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
            {/* Upper banner section */}
            <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-lg">
                    Level {floor.floorNumber}
                  </span>
                  <FloorStatusChip status={floor.status} />
                </div>
                <h2 className="text-base font-black text-gray-900 dark:text-zinc-50">{floor.floorName}</h2>
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Building: {building?.buildingName || 'Unknown'} • Hospital: {hospital?.hospitalNameEN || 'Unknown'}
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 px-4 py-2.5 rounded-2xl shrink-0 flex items-center gap-3">
                <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold text-zinc-400 uppercase">Parent Structure</span>
                  <span className="text-xs font-black text-zinc-800 dark:text-zinc-100">{building?.buildingCode || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Middle statistics metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 text-center">
              <div className="p-5 space-y-1">
                <span className="block text-[10px] font-extrabold text-zinc-400 uppercase">Allocated Rooms</span>
                <p className="text-xl font-black text-zinc-950 dark:text-zinc-50">{rooms.length}</p>
              </div>
              <div className="p-5 space-y-1">
                <span className="block text-[10px] font-extrabold text-zinc-400 uppercase">Bed Capacity</span>
                <p className="text-xl font-black text-zinc-950 dark:text-zinc-50">{totalBeds}</p>
              </div>
              <div className="p-5 space-y-1">
                <span className="block text-[10px] font-extrabold text-zinc-400 uppercase">Active Occupancy</span>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{occupiedBeds}</p>
              </div>
              <div className="p-5 space-y-1">
                <span className="block text-[10px] font-extrabold text-zinc-400 uppercase">Occupancy Rate</span>
                <p className="text-xl font-black text-amber-500">{occupancyRate}%</p>
              </div>
            </div>

            {/* Description Area */}
            {floor.description && (
              <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/25 dark:bg-zinc-950/10">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Floor Layout Specifications
                </h4>
                <p className="text-xs font-semibold text-gray-600 dark:text-zinc-400 leading-relaxed">
                  {floor.description}
                </p>
              </div>
            )}
          </div>

          {/* Physical rooms allocated on this floor levels */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                Rooms Inventory ({rooms.length})
              </h3>
            </div>

            {rooms.length === 0 ? (
              <div className="p-12 border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl text-center">
                <p className="text-xs font-semibold text-zinc-500">
                  No rooms have been set up or mapped on this floor level yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((r) => {
                  const percent = r.capacity > 0 ? Math.round((r.occupiedCount / r.capacity) * 100) : 0;
                  return (
                    <div
                      key={r.id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center justify-between"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50">
                            Room {r.roomNumber}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md ${
                            r.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <span className="block text-[10px] text-zinc-400 font-bold uppercase">
                          Gender restriction: {r.gender || 'Mixed'}
                        </span>

                        <div className="w-4/5 bg-slate-100 dark:bg-zinc-800 rounded-full h-1 mt-2.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400">
                          <Bed className="h-4 w-4 shrink-0" />
                          <span>{r.occupiedCount} / {r.capacity} Beds</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold">
                          ({percent}% occupied)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
