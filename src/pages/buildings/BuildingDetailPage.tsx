import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { useBuilding } from '../../hooks/useBuilding';
import { useBuildingStatistics } from '../../hooks/useBuildingStatistics';
import { useRole } from '../../hooks/useRole';
import { BuildingStatisticsCard } from '../../components/BuildingStatisticsCard';
import { BuildingStatusChip } from '../../components/BuildingStatusChip';
import { FloorTable } from '../../components/FloorTable';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { mockDB } from '../../services/mockData';
import { floorService } from '../../services/floor.service';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Layers,
  DoorOpen,
  Plus,
  Compass,
  Bed,
  CheckCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';

export function BuildingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  const { building, loading: buildingLoading, error: buildingError } = useBuilding(id);
  const { stats, loading: statsLoading } = useBuildingStatistics(id);

  // Associated Floors list state
  const [floors, setFloors] = useState<any[]>([]);
  const [floorsLoading, setFloorsLoading] = useState(true);

  // Associated Rooms list state
  const [rooms, setRooms] = useState<any[]>([]);

  // Delete Floor confirmation state
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [isDeleteFloorOpen, setIsDeleteFloorOpen] = useState(false);
  const [deleteFloorName, setDeleteFloorName] = useState('');
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const fetchAssociatedData = async () => {
    if (!id) return;
    try {
      setFloorsLoading(true);
      const res = await floorService.getAll({ buildingId: id, limit: 100 });
      setFloors(res.data);

      const allRooms = mockDB.getRooms().filter((r) => r.buildingId === id);
      setRooms(allRooms);
    } catch (e) {
      console.error('Failed to load floors', e);
    } finally {
      setFloorsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociatedData();
    const unsubscribeFloors = floorService.subscribe(() => {
      fetchAssociatedData();
    });
    return unsubscribeFloors;
  }, [id]);

  const handleFloorDeleteTrigger = (fId: string) => {
    const target = floors.find((f) => f.id === fId);
    if (target) {
      setSelectedFloorId(fId);
      setDeleteFloorName(target.floorName);
      setIsDeleteFloorOpen(true);
    }
  };

  const handleFloorDeleteConfirm = async () => {
    if (!selectedFloorId) return;
    try {
      setSubmittingDelete(true);
      await floorService.delete(selectedFloorId, 'admin');
      setIsDeleteFloorOpen(false);
      setSelectedFloorId(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete floor level.');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const handleFloorDuplicate = async (fId: string) => {
    try {
      await floorService.duplicate(fId, 'admin');
    } catch (err: any) {
      alert(err?.message || 'Failed to duplicate floor level.');
    }
  };

  const handleFloorArchive = async (fId: string) => {
    try {
      await floorService.archive(fId, 'admin');
    } catch (err: any) {
      alert(err?.message || 'Failed to archive floor level.');
    }
  };

  const handleFloorRestore = async (fId: string) => {
    try {
      await floorService.restore(fId, 'admin');
    } catch (err: any) {
      alert(err?.message || 'Failed to restore floor level.');
    }
  };

  if (buildingLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-bold text-slate-500">Loading building specifications...</p>
        </div>
      </div>
    );
  }

  if (buildingError || !building) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 text-center max-w-sm space-y-3 shadow-xs">
          <h3 className="text-sm font-black text-rose-600">Error Loading Details</h3>
          <p className="text-xs text-slate-500 font-semibold">{buildingError || 'Building profile not found.'}</p>
          <button
            onClick={() => navigate('/buildings')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 cursor-pointer"
          >
            Back to Buildings
          </button>
        </div>
      </div>
    );
  }

  const hospital = mockDB.getHospitals().find((h) => h.id === building.hospitalId);
  const defaultCover = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50 dark:bg-zinc-950">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Detail Page Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 dark:border-zinc-800/60 dark:bg-zinc-950">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/buildings')}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg text-slate-500 hover:text-gray-900 dark:hover:text-zinc-100 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-black text-gray-900 dark:text-zinc-50 uppercase tracking-wider">
                {building.buildingName}
              </h1>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Registered under: {hospital?.hospitalNameEN || 'Unknown Hospital'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate(`/buildings/${building.id}/edit`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition duration-150 cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </header>

        {/* Content Frame */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Cover Hero Banner */}
          <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-xs shrink-0 bg-zinc-100 dark:bg-zinc-900">
            <img
              src={building.imageURL || defaultCover}
              alt={building.buildingName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1 text-white">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-white/20 backdrop-blur-md rounded border border-white/10">
                    {building.buildingCode}
                  </span>
                  <BuildingStatusChip status={building.status} />
                </div>
                <h2 className="text-xl font-black">{building.buildingName}</h2>
                <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  {building.address}
                </p>
              </div>

              <div className="flex gap-2 text-white text-[10px] font-extrabold uppercase">
                <span className="px-3 py-1.5 bg-zinc-900/40 backdrop-blur-md border border-zinc-700/50 rounded-xl">
                  {building.buildingType}
                </span>
                <span className="px-3 py-1.5 bg-zinc-900/40 backdrop-blur-md border border-zinc-700/50 rounded-xl">
                  {building.gender} ORIENTED
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Indicators */}
          <BuildingStatisticsCard stats={stats} loading={statsLoading} />

          {/* Master layout splits: left detailed descriptions, right level records */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Description Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-zinc-100 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  Description & Specifications
                </h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 leading-relaxed">
                  {building.description || 'No description notes provided for this building profile.'}
                </p>
                <div className="space-y-2 text-[11px] font-semibold text-gray-600 dark:text-zinc-400 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Created At:</span>
                    <span>{new Date(building.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Updated At:</span>
                    <span>{new Date(building.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Authorized By:</span>
                    <span>Admin ({building.createdBy})</span>
                  </div>
                </div>
              </div>

              {/* Room Occupants Status */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-zinc-100 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span>Room Allocation Status</span>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-[9px] rounded-lg">
                    {rooms.length} Active Rooms
                  </span>
                </h3>

                {rooms.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 font-semibold text-center py-4">
                    No physical rooms set up in this building.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {rooms.map((r) => {
                      const occupancyPercent = r.capacity > 0 ? Math.round((r.occupiedCount / r.capacity) * 100) : 0;
                      return (
                        <div key={r.id} className="flex items-center justify-between text-xs p-2 border border-slate-100 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/20">
                          <div>
                            <span className="font-extrabold text-zinc-900 dark:text-zinc-100">Room {r.roomNumber}</span>
                            <span className="block text-[10px] text-zinc-400 font-bold uppercase">
                              Capacity: {r.capacity} Beds
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-indigo-600 dark:text-indigo-400 block">{r.occupiedCount} Occupied</span>
                            <span className="text-[9px] text-zinc-400 font-semibold">({occupancyPercent}% Filled)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Floor Levels Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                      Floor Levels Registry
                    </h3>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => navigate('/floors/create')}
                      className="inline-flex items-center gap-1 bg-red-600 text-white font-black text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-xl hover:bg-red-700 transition cursor-pointer shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Configure Floor</span>
                    </button>
                  )}
                </div>

                {floorsLoading ? (
                  <div className="p-12 text-center text-xs font-bold text-slate-400">
                    Loading associated floors...
                  </div>
                ) : floors.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl text-center">
                    <p className="text-xs font-semibold text-zinc-500">
                      No floor levels configured for this building profile.
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => navigate('/floors/create')}
                        className="mt-3 inline-flex items-center gap-1 rounded-xl bg-indigo-600 text-white font-extrabold text-[11px] px-3 py-1.5 hover:bg-indigo-700 transition cursor-pointer shadow-sm"
                      >
                        Create Floor 1
                      </button>
                    )}
                  </div>
                ) : (
                  <FloorTable
                    data={floors}
                    isAdmin={isAdmin}
                    onView={(fId) => navigate(`/floors/${fId}`)}
                    onEdit={(fId) => navigate(`/floors/${fId}/edit`)}
                    onDuplicate={handleFloorDuplicate}
                    onArchive={handleFloorArchive}
                    onRestore={handleFloorRestore}
                    onDelete={handleFloorDeleteTrigger}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Floor Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteFloorOpen}
        onClose={() => setIsDeleteFloorOpen(false)}
        onConfirm={handleFloorDeleteConfirm}
        title="Confirm Floor Level Deletion"
        description={`Are you absolutely sure you want to delete the floor level "${deleteFloorName}"? This action is permanent and cannot be undone.`}
        confirmLabel="Delete Level"
        cancelLabel="Cancel"
        variant="danger"
        isSubmitting={submittingDelete}
      />
    </div>
  );
}
