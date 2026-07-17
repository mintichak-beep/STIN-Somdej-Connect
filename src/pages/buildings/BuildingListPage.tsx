import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { BuildingSearchBar } from '../../components/BuildingSearchBar';
import { BuildingFilter } from '../../components/BuildingFilter';
import { BuildingTable } from '../../components/BuildingTable';
import { BuildingCard } from '../../components/BuildingCard';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useBuildings } from '../../hooks/useBuildings';
import { useRole } from '../../hooks/useRole';
import { buildingService } from '../../services/building.service';
import { Plus, Home, Layers, DoorOpen, Bed, Percent } from 'lucide-react';

export function BuildingListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete & Archive confirmations
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteName, setDeleteName] = useState('');
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Global Building Statistics state
  const [globalStats, setGlobalStats] = useState({
    totalBuildings: 0,
    totalFloors: 0,
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
  });

  // Load buildings with reactive filters
  const {
    buildings,
    loading,
    error,
    archiveBuilding,
    restoreBuilding,
    deleteBuilding,
    duplicateBuilding,
  } = useBuildings({
    search: searchQuery,
    hospitalId: hospitalFilter,
    buildingType: typeFilter,
    gender: genderFilter,
    status: statusFilter as any,
    limit: 100, // retrieve all for interactive search filtering
  });

  // Load master statistics
  const fetchGlobalStats = async () => {
    try {
      const stats = await buildingService.getGlobalStatistics();
      setGlobalStats(stats);
    } catch (e) {
      console.error('Failed to load building metrics', e);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
    const unsubscribe = buildingService.subscribe(() => {
      fetchGlobalStats();
    });
    return unsubscribe;
  }, []);

  const handleClearFilters = () => {
    setHospitalFilter('all');
    setTypeFilter('all');
    setGenderFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const handleView = (id: string) => {
    navigate(`/buildings/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/buildings/${id}/edit`);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateBuilding(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to duplicate building.');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveBuilding(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to archive building.');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreBuilding(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to restore building.');
    }
  };

  const handleDeleteTrigger = (id: string) => {
    const target = buildings.find((b) => b.id === id);
    if (target) {
      setSelectedBuildingId(id);
      setDeleteName(target.buildingName);
      setIsDeleteOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBuildingId) return;
    try {
      setSubmittingDelete(true);
      await deleteBuilding(selectedBuildingId);
      setIsDeleteOpen(false);
      setSelectedBuildingId(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete building.');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const occupancyRate =
    globalStats.totalBeds > 0
      ? Math.round((globalStats.occupiedBeds / globalStats.totalBeds) * 100)
      : 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50 dark:bg-zinc-950">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Page Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 dark:border-zinc-800/60 dark:bg-zinc-950">
          <div>
            <h1 className="text-sm font-black text-gray-900 dark:text-zinc-50 uppercase tracking-wider">
              Clinical Buildings
            </h1>
            <p className="text-[10px] font-bold text-slate-400">
              Manage clinical placement lodging & academic dormitories
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/buildings/create')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white shadow-xs hover:bg-red-700 transition duration-150 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Building</span>
            </button>
          )}
        </header>

        {/* Contents Deck */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Quick Info Summary Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Total Lodging
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {globalStats.totalBuildings}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 shrink-0">
                <Home className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Total Floors
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {globalStats.totalFloors}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Total Rooms
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {globalStats.totalRooms}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 shrink-0">
                <DoorOpen className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Bed Capacity
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {globalStats.totalBeds}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 shrink-0">
                <Bed className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs col-span-2 lg:col-span-1">
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Occupancy
                </span>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {occupancyRate}%
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 shrink-0">
                <Percent className="h-4 w-4" />
              </div>
            </div>
          </section>

          {/* Search, filters, view toggle panel */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-4 shadow-xs">
            <BuildingSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <BuildingFilter
              hospitalValue={hospitalFilter}
              onHospitalChange={setHospitalFilter}
              typeValue={typeFilter}
              onTypeChange={setTypeFilter}
              genderValue={genderFilter}
              onGenderChange={setGenderFilter}
              statusValue={statusFilter}
              onStatusChange={setStatusFilter}
              onClearFilters={handleClearFilters}
            />
          </section>

          {/* Data List Section */}
          <section>
            {loading ? (
              <LoadingSkeleton rows={5} type={viewMode} />
            ) : error ? (
              <div className="p-4 bg-rose-50 text-rose-700 dark:bg-rose-950/25 dark:text-rose-400 rounded-2xl border border-rose-100 text-xs font-bold text-center">
                {error}
              </div>
            ) : buildings.length === 0 ? (
              <EmptyState
                title="No Buildings Found"
                description="We couldn't find any buildings matching your search queries or filter selections."
                actionButton={
                  isAdmin && (
                    <button
                      onClick={() => navigate('/buildings/create')}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
                    >
                      Register New Building
                    </button>
                  )
                }
              />
            ) : viewMode === 'table' ? (
              <BuildingTable
                data={buildings}
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
                {buildings.map((building) => (
                  <BuildingCard
                    key={building.id}
                    building={building}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Building Deletion"
        description={`Are you absolutely sure you want to delete the building "${deleteName}"? This action is permanent. All associated floors and rooms will be cascading deleted too!`}
        confirmLabel="Delete Permanently"
        cancelLabel="Keep Building"
        variant="danger"
        isSubmitting={submittingDelete}
      />
    </div>
  );
}
