import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { HospitalSearchBar } from '../../components/HospitalSearchBar';
import { HospitalFilter } from '../../components/HospitalFilter';
import { HospitalTable } from '../../components/HospitalTable';
import { HospitalCard } from '../../components/HospitalCard';
import { HospitalDialog } from '../../components/HospitalDialog';
import { HospitalDeleteDialog } from '../../components/HospitalDeleteDialog';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useHospitals } from '../../hooks/useHospitals';
import { useRole } from '../../hooks/useRole';
import { hospitalService } from '../../services/hospital.service';
import { Plus, Building2, Layers, Percent, Users, Landmark } from 'lucide-react';

export function HospitalListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  
  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');

  // Preview Dialog state
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHospital, setPreviewHospital] = useState<any>(null);

  // Delete/Archive confirmation state
  const [deleteHospitalId, setDeleteHospitalId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteHospitalName, setDeleteHospitalName] = useState('');

  // Global summary statistics
  const [globalStats, setGlobalStats] = useState({
    totalHospitals: 0,
    totalCapacity: 0,
    totalStudents: 0,
    occupancyRate: 0
  });

  // Load hospitals hook with live filters
  const {
    hospitals,
    loading,
    error,
    archiveHospital,
    restoreHospital,
    deleteHospital,
    duplicateHospital
  } = useHospitals({
    search: searchQuery,
    status: statusFilter as any,
    type: typeFilter,
    province: provinceFilter,
    limit: 100 // pull all for interactive list filtering
  });

  // Calculate global summary metrics
  const loadGlobalStats = async () => {
    try {
      const stats = await hospitalService.getGlobalStats();
      setGlobalStats(stats);
    } catch (e) {
      console.error('Failed to load global metrics', e);
    }
  };

  useEffect(() => {
    loadGlobalStats();
    const unsubscribe = hospitalService.subscribe(() => {
      loadGlobalStats();
    });
    return unsubscribe;
  }, []);

  // View quick preview dialog
  const handleView = async (id: string) => {
    const target = hospitals.find(h => h.id === id);
    if (target) {
      setPreviewHospital(target);
      setIsPreviewOpen(true);
    }
  };

  // Duplicate hospital profile handler
  const handleDuplicate = async (id: string) => {
    try {
      await duplicateHospital(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to duplicate profile.');
    }
  };

  // Delete dialogue triggers
  const handleDeleteTrigger = (id: string) => {
    const target = hospitals.find(h => h.id === id);
    if (target) {
      setDeleteHospitalId(id);
      setDeleteHospitalName(target.hospitalNameTH);
      setIsDeleteOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteHospitalId) {
      try {
        await deleteHospital(deleteHospitalId);
        setIsDeleteOpen(false);
        setDeleteHospitalId(null);
      } catch (err: any) {
        alert(err?.message || 'Failed to delete hospital.');
      }
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveHospital(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to archive hospital.');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreHospital(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to restore hospital.');
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setProvinceFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <Sidebar />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Module Header Bar */}
        <header className="h-16 shrink-0 border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-between px-6 z-10">
          <div>
            <h1 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">Clinical Placement Accommodations</h1>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">Master Registry & Logistics Center</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate('/hospitals/create')}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register Hospital
            </button>
          )}
        </header>

        {/* Inner Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Global Summary Statistics Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4.5 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Hospitals Registered</span>
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                  {globalStats.totalHospitals}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4.5 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Accommodation Quotas</span>
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                  {globalStats.totalCapacity} <span className="text-xs font-semibold text-zinc-400">Seats</span>
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4.5 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Placed Active Students</span>
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                  {globalStats.totalStudents} <span className="text-xs font-semibold text-zinc-400">Placed</span>
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4.5 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Average Occupancy Rate</span>
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                  {globalStats.occupancyRate}%
                </span>
              </div>
            </div>

          </div>

          {/* Filter & Command Center Box */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <HospitalSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <HospitalFilter
              statusValue={statusFilter}
              onStatusChange={setStatusFilter}
              typeValue={typeFilter}
              onTypeChange={setTypeFilter}
              provinceValue={provinceFilter}
              onProvinceChange={setProvinceFilter}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Module Inner Render Block */}
          {loading ? (
            <LoadingSkeleton type={viewMode} />
          ) : error ? (
            <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl p-4.5 text-xs font-semibold text-rose-700 dark:text-rose-400 text-center">
              {error}
            </div>
          ) : hospitals.length === 0 ? (
            <EmptyState
              title="No clinical hospitals found"
              description={
                searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || provinceFilter !== 'all'
                  ? 'No registered hospital profiles match your search/filter parameters.'
                  : 'Start by registering your first clinical hospital profile in the master data registries.'
              }
              actionButton={
                searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || provinceFilter !== 'all' ? (
                  <button
                    onClick={clearFilters}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : (
                  isAdmin && (
                    <button
                      onClick={() => navigate('/hospitals/create')}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 shadow-xs transition-colors cursor-pointer"
                    >
                      Add Hospital Profile
                    </button>
                  )
                )
              }
            />
          ) : viewMode === 'table' ? (
            <HospitalTable
              data={hospitals}
              isAdmin={isAdmin}
              onView={handleView}
              onEdit={(id) => navigate(`/hospitals/${id}/edit`)}
              onDelete={handleDeleteTrigger}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDuplicate={handleDuplicate}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hospitals.map((h) => (
                <HospitalCard
                  key={h.id}
                  hospital={h}
                  isAdmin={isAdmin}
                  onView={handleView}
                  onEdit={(id) => navigate(`/hospitals/${id}/edit`)}
                  onDelete={handleDeleteTrigger}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Hospital Quick Preview Modal Dialog */}
      <HospitalDialog
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewHospital(null);
        }}
        hospital={previewHospital}
      />

      {/* Hospital Permanent Delete Confirmation Warning */}
      <HospitalDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteHospitalId(null);
        }}
        onConfirm={handleDeleteConfirm}
        hospitalName={deleteHospitalName}
      />
    </div>
  );
}
