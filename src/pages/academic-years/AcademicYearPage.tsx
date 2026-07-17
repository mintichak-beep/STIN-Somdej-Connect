import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAcademicYears } from '../../hooks/useAcademicYears';
import { useRole } from '../../hooks/useRole';
import { Sidebar } from '../../components/Sidebar';
import { SearchBox } from '../../components/SearchBox';
import { FilterBar } from '../../components/FilterBar';
import { AcademicYearTable } from '../../components/AcademicYearTable';
import { AcademicYearCard } from '../../components/AcademicYearCard';
import { AcademicYearDialog } from '../../components/AcademicYearDialog';
import { AcademicYearDeleteDialog } from '../../components/AcademicYearDeleteDialog';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { 
  Calendar, Plus, Grid, List, ShieldAlert, CheckCircle 
} from 'lucide-react';

export function AcademicYearPage() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load custom hooks
  const {
    academicYears,
    loading,
    error,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    archiveAcademicYear
  } = useAcademicYears({
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter as any
  });

  const createYear = createAcademicYear;
  const updateYear = updateAcademicYear;
  const deleteYear = deleteAcademicYear;
  const archiveYear = archiveAcademicYear;

  const toggleYearStatus = async (id: string, status: 'active' | 'inactive' | 'archived') => {
    await updateAcademicYear(id, { status });
  };

  const duplicateYear = async (item: any) => {
    const nextYearName = String(parseInt(item.name, 10) + 1);
    const nextStart = String(parseInt(item.startYear, 10) + 1);
    const nextEnd = String(parseInt(item.endYear, 10) + 1);
    await createAcademicYear({
      name: nextYearName,
      year: nextYearName,
      startYear: nextStart,
      endYear: nextEnd,
      description: item.description ? `${item.description} (Copy)` : '',
      status: 'inactive',
      createdBy: '',
      updatedBy: ''
    });
  };

  // Dialog management states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>(undefined);
  const [deletingName, setDeletingName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      await createYear(values);
      setIsCreateOpen(false);
      triggerToast('Academic Year registered successfully.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to register Academic Year.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingItem) return;
    try {
      setIsSubmitting(true);
      await updateYear(editingItem.id, values);
      setIsEditOpen(false);
      setEditingItem(null);
      triggerToast('Academic Year updated successfully.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to update Academic Year.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteYear(deletingId);
      setIsDeleteOpen(false);
      triggerToast('Academic Year records deleted permanently.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to delete Academic Year.', 'error');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveYear(id);
      triggerToast('Academic Year status set to Archived.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to archive Academic Year.', 'error');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await toggleYearStatus(id, 'active');
      triggerToast('Academic Year is now active.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to activate Academic Year.', 'error');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await toggleYearStatus(id, 'inactive');
      triggerToast('Academic Year is now inactive.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to deactivate Academic Year.', 'error');
    }
  };

  const handleDuplicate = async (item: any) => {
    try {
      await duplicateYear(item);
      triggerToast(`Duplicate record created for ${item.name}.`);
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to duplicate Academic Year.', 'error');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Subheader */}
        <header className="flex flex-col gap-4 border-b border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight font-sans">
              Academic Years Master Registry
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Configure student cohorts, clinical cycles, and master terms calendar
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/academic-years/create')}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Standalone</span>
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Quick Register</span>
              </button>
            </div>
          )}
        </header>

        {/* Toast alerts */}
        {toast && (
          <div className={`fixed bottom-5 right-5 z-55 flex items-center gap-2 rounded-xl border px-4 py-3 shadow-lg transition-all ${
            toast.type === 'success' 
              ? 'border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/80 dark:text-emerald-300' 
              : 'border-rose-100 bg-rose-50 text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/80 dark:text-rose-300'
          }`}>
            <span className={`h-2 w-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <p className="text-xs font-bold">{toast.message}</p>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950/30 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {/* Search, Filter, and View Mode Layout controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by year name..."
              />
              <FilterBar
                statusValue={statusFilter}
                onStatusChange={setStatusFilter}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Layout switch controls */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-zinc-900/80 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg p-1.5 transition cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-xs text-red-600 dark:bg-zinc-800' : 'text-slate-400 hover:text-gray-900'}`}
                title="Table List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`rounded-lg p-1.5 transition cursor-pointer ${viewMode === 'cards' ? 'bg-white shadow-xs text-red-600 dark:bg-zinc-800' : 'text-slate-400 hover:text-gray-900'}`}
                title="Grid Cards View"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Core Table / Grid Cards render */}
          {loading ? (
            <LoadingSkeleton type={viewMode === 'table' ? 'table' : 'cards'} />
          ) : academicYears.length === 0 ? (
            <EmptyState
              title="No Academic Years Found"
              description="Create a new academic year to register clinical cohorts and schedules."
              actionButton={
                isAdmin ? (
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Academic Year</span>
                  </button>
                ) : null
              }
            />
          ) : viewMode === 'table' ? (
            <AcademicYearTable
              data={academicYears}
              isAdmin={isAdmin}
              onView={(id) => navigate(`/academic-years/${id}`)}
              onEdit={(id) => {
                const item = academicYears.find(ay => ay.id === id);
                if (item) {
                  setEditingItem(item);
                  setIsEditOpen(true);
                }
              }}
              onDelete={(id) => {
                const item = academicYears.find(ay => ay.id === id);
                if (item) {
                  setDeletingId(id);
                  setDeletingName(item.name);
                  setIsDeleteOpen(true);
                }
              }}
              onArchive={(id) => { handleArchive(id); }}
              onActivate={(id) => { handleActivate(id); }}
              onDeactivate={(id) => { handleDeactivate(id); }}
              onDuplicate={(item) => { handleDuplicate(item); }}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {academicYears.map(ay => (
                <AcademicYearCard
                  key={ay.id}
                  item={ay}
                  isAdmin={isAdmin}
                  onView={(id) => navigate(`/academic-years/${id}`)}
                  onEdit={(id) => {
                    const item = academicYears.find(x => x.id === id);
                    if (item) {
                      setEditingItem(item);
                      setIsEditOpen(true);
                    }
                  }}
                  onDelete={(id) => {
                    const item = academicYears.find(x => x.id === id);
                    if (item) {
                      setDeletingId(id);
                      setDeletingName(item.name);
                      setIsDeleteOpen(true);
                    }
                  }}
                  onArchive={(id) => { handleArchive(id); }}
                  onActivate={(id) => { handleActivate(id); }}
                  onDeactivate={(id) => { handleDeactivate(id); }}
                  onDuplicate={(item) => { handleDuplicate(item); }}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Quick Add Dialog Modal */}
      <AcademicYearDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Quick Edit Dialog Modal */}
      <AcademicYearDialog
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditSubmit}
        initialData={editingItem}
        isSubmitting={isSubmitting}
      />

      {/* Safety checked Delete Dialog Modal */}
      <AcademicYearDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingId(undefined);
        }}
        onConfirm={handleDeleteConfirm}
        academicYearId={deletingId}
        academicYearName={deletingName}
      />
    </div>
  );
}
