import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { FloorSearchBar } from '../../components/FloorSearchBar';
import { FloorFilter } from '../../components/FloorFilter';
import { FloorTable } from '../../components/FloorTable';
import { FloorCard } from '../../components/FloorCard';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useFloors } from '../../hooks/useFloors';
import { useRole } from '../../hooks/useRole';
import { floorService } from '../../services/floor.service';
import { Plus, Layers, DoorOpen, Bed, ToggleLeft, Percent } from 'lucide-react';

export function FloorListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete & Archive confirmations
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteName, setDeleteName] = useState('');
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Global statistics for floors
  const [stats, setStats] = useState({
    totalFloors: 0,
    totalRooms: 0,
    totalBeds: 0,
    activeCount: 0,
    archivedCount: 0,
  });

  // Load floors with reactive filters
  const {
    floors,
    loading,
    error,
    archiveFloor,
    restoreFloor,
    deleteFloor,
    duplicateFloor,
  } = useFloors({
    search: searchQuery,
    buildingId: buildingFilter,
    status: statusFilter as any,
    limit: 100, // retrieve all for interactive search filtering
  });

  const fetchGlobalStats = async () => {
    try {
      const data = await floorService.getAll({ limit: 1000 });
      const list = data.data;

      const activeList = list.filter((f) => f.status === 'active');
      const archivedList = list.filter((f) => f.status === 'archived');
      const roomsSum = list.reduce((acc, f) => acc + (f.totalRooms || 0), 0);
      const bedsSum = list.reduce((acc, f) => acc + (f.totalBeds || 0), 0);

      setStats({
        totalFloors: list.length,
        totalRooms: roomsSum,
        totalBeds: bedsSum,
        activeCount: activeList.length,
        archivedCount: archivedList.length,
      });
    } catch (e) {
      console.error('Failed to load global floor statistics', e);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
    const unsubscribe = floorService.subscribe(() => {
      fetchGlobalStats();
    });
    return unsubscribe;
  }, []);

  const handleClearFilters = () => {
    setBuildingFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const handleView = (id: string) => {
    navigate(`/floors/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/floors/${id}/edit`);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateFloor(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to duplicate floor level.');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveFloor(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to archive floor level.');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreFloor(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to restore floor level.');
    }
  };

  const handleDeleteTrigger = (id: string) => {
    const target = floors.find((f) => f.id === id);
    if (target) {
      setSelectedFloorId(id);
      setDeleteName(target.floorName);
      setIsDeleteOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFloorId) return;
    try {
      setSubmittingDelete(true);
      await deleteFloor(selectedFloorId);
      setIsDeleteOpen(false);
      setSelectedFloorId(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete floor level.');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50 dark:bg-zinc-950">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Page Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 dark:border-zinc-800/60 dark:bg-zinc-950">
          <div>
            <h1 className="text-sm font-black text-gray-900 dark:text-zinc-50 uppercase tracking-wider">
              Building Floors
            </h1>
            <p className="text-[10px] font-bold text-slate-400">
              Manage level layouts, room allocation plans, and bed totals
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/floors/create')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white shadow-xs hover:bg-red-700 transition duration-150 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Configure Floor</span>
            </button>
          )}
        </header>

        {/* Content Panel */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Dashboard Summary Widgets */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Configured Levels
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{stats.totalFloors}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Total Rooms
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{stats.totalRooms}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 shrink-0">
                <DoorOpen className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Total Bed Spaces
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{stats.totalBeds}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 shrink-0">
                <Bed className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Active Levels
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{stats.activeCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 shrink-0">
                <ToggleLeft className="h-4 w-4 text-sky-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs col-span-2 lg:col-span-1">
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Archived Levels
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{stats.archivedCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
            </div>
          </section>

          {/* Search, Filter bar */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-4 shadow-xs">
            <FloorSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <FloorFilter
              buildingValue={buildingFilter}
              onBuildingChange={setBuildingFilter}
              statusValue={statusFilter}
              onStatusChange={setStatusFilter}
              onClearFilters={handleClearFilters}
            />
          </section>

          {/* Floors list */}
          <section>
            {loading ? (
              <LoadingSkeleton rows={5} type={viewMode} />
            ) : error ? (
              <div className="p-4 bg-rose-50 text-rose-700 dark:bg-rose-950/25 dark:text-rose-400 border border-rose-100 rounded-2xl text-xs font-bold text-center">
                {error}
              </div>
            ) : floors.length === 0 ? (
              <EmptyState
                title="No Floors Found"
                description="We couldn't find any floor levels matching your search query or operational filters."
                actionButton={
                  isAdmin && (
                    <button
                      onClick={() => navigate('/floors/create')}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
                    >
                      Set Up Floor Level
                    </button>
                  )
                }
              />
            ) : viewMode === 'table' ? (
              <FloorTable
                data={floors}
                isAdmin={isAdmin}
                onView={handleView}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onDelete={handleDeleteTrigger}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {floors.map((floor) => (
                  <FloorCard
                    key={floor.id}
                    floor={floor}
                    isAdmin={isAdmin}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onDelete={handleDeleteTrigger}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Floor Deletion"
        description={`Are you absolutely sure you want to permanently delete "${deleteName}"? This action cannot be reversed. All associated rooms and students living on this level will be cascading unassigned/deleted.`}
        confirmLabel="Delete Level"
        cancelLabel="Keep Level"
        variant="danger"
        isSubmitting={submittingDelete}
      />
    </div>
  );
}
