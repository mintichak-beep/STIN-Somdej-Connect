import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSemesters } from '../../hooks/useSemesters';
import { useAcademicYears } from '../../hooks/useAcademicYears';
import { useRole } from '../../hooks/useRole';
import { Sidebar } from '../../components/Sidebar';
import { SearchBox } from '../../components/SearchBox';
import { FilterBar } from '../../components/FilterBar';
import { SemesterTable } from '../../components/SemesterTable';
import { SemesterCard } from '../../components/SemesterCard';
import { SemesterDialog } from '../../components/SemesterDialog';
import { SemesterDeleteDialog } from '../../components/SemesterDeleteDialog';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { 
  CalendarRange, Plus, Grid, List, ShieldAlert 
} from 'lucide-react';

export function SemesterPage() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAYId, setSelectedAYId] = useState('');

  // Fetch parent Academic Years for filters
  const { academicYears } = useAcademicYears();

  // Load Semester hooks
  const {
    semesters,
    loading,
    error,
    createSemester,
    updateSemester,
    deleteSemester,
    setCurrentSemester,
    archiveSemester
  } = useSemesters({
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter as any,
    academicYearId: selectedAYId || undefined
  });

  // Dialog management
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

  const ayOptions = useMemo(() => {
    return academicYears.map(ay => ({
      value: ay.id,
      label: `AY ${ay.name}`
    }));
  }, [academicYears]);

  const handleCreateSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      await createSemester(values);
      setIsCreateOpen(false);
      triggerToast('Semester Term registered successfully.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to register Semester Term.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingItem) return;
    try {
      setIsSubmitting(true);
      await updateSemester(editingItem.id, values);
      setIsEditOpen(false);
      setEditingItem(null);
      triggerToast('Semester Term updated successfully.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to update Semester Term.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteSemester(deletingId);
      setIsDeleteOpen(false);
      triggerToast('Semester Term records deleted permanently.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to delete Semester Term.', 'error');
    }
  };

  const handleArchive = async (semId: string) => {
    try {
      await archiveSemester(semId);
      triggerToast('Semester Term status set to Archived.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to archive semester.', 'error');
    }
  };

  const handleActivate = async (semId: string) => {
    try {
      await updateSemester(semId, { status: 'active' });
      triggerToast('Semester status set to Active.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to activate semester.', 'error');
    }
  };

  const handleDeactivate = async (semId: string) => {
    try {
      await updateSemester(semId, { status: 'inactive' });
      triggerToast('Semester status set to Inactive.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to deactivate semester.', 'error');
    }
  };

  const handleSetCurrent = async (semId: string) => {
    try {
      await setCurrentSemester(semId);
      triggerToast('Semester highlighted as system Current Term.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to set current semester.', 'error');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedAYId('');
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex flex-col gap-4 border-b border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight font-sans">
              Semester Terms Master Registry
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Configure academic terms, dates, and registration windows for placements
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/semesters/create')}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Standalone</span>
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                disabled={academicYears.length === 0}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Quick Register</span>
              </button>
            </div>
          )}
        </header>

        {/* Toast Alert popup */}
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
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950/30 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 text-left">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {/* Advanced Search & Filtering Panels */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search semesters..."
              />
              <FilterBar
                statusValue={statusFilter}
                onStatusChange={setStatusFilter}
                academicYearValue={selectedAYId}
                onAcademicYearChange={setSelectedAYId}
                academicYearOptions={ayOptions}
                onClearFilters={handleClearFilters}
                showAcademicYearFilter={true}
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
          ) : semesters.length === 0 ? (
            <EmptyState
              title="No Semesters Found"
              description="Register academic semesters with specific time periods and student registration gates."
              actionButton={
                isAdmin ? (
                  <button
                    disabled={academicYears.length === 0}
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Semester Term</span>
                  </button>
                ) : null
              }
            />
          ) : viewMode === 'table' ? (
            <SemesterTable
              data={semesters}
              academicYears={academicYears}
              isAdmin={isAdmin}
              onView={(id) => navigate(`/semesters/${id}`)}
              onEdit={(id) => {
                const item = semesters.find(x => x.id === id);
                if (item) {
                  setEditingItem(item);
                  setIsEditOpen(true);
                }
              }}
              onDelete={(id) => {
                const item = semesters.find(x => x.id === id);
                if (item) {
                  setDeletingId(id);
                  setDeletingName(item.semesterName);
                  setIsDeleteOpen(true);
                }
              }}
              onArchive={(id) => { handleArchive(id); }}
              onActivate={(id) => { handleActivate(id); }}
              onDeactivate={(id) => { handleDeactivate(id); }}
              onSetCurrent={(id) => { handleSetCurrent(id); }}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {semesters.map(sem => (
                <SemesterCard
                  key={sem.id}
                  item={sem}
                  academicYears={academicYears}
                  isAdmin={isAdmin}
                  onView={(id) => navigate(`/semesters/${id}`)}
                  onEdit={(id) => {
                    const item = semesters.find(x => x.id === id);
                    if (item) {
                      setEditingItem(item);
                      setIsEditOpen(true);
                    }
                  }}
                  onDelete={(id) => {
                    const item = semesters.find(x => x.id === id);
                    if (item) {
                      setDeletingId(id);
                      setDeletingName(item.semesterName);
                      setIsDeleteOpen(true);
                    }
                  }}
                  onArchive={(id) => { handleArchive(id); }}
                  onActivate={(id) => { handleActivate(id); }}
                  onDeactivate={(id) => { handleDeactivate(id); }}
                  onSetCurrent={(id) => { handleSetCurrent(id); }}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Quick Add Dialog Modal */}
      {academicYears.length > 0 && (
        <SemesterDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
          academicYears={academicYears}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Quick Edit Dialog Modal */}
      {academicYears.length > 0 && (
        <SemesterDialog
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleEditSubmit}
          academicYears={academicYears}
          initialData={editingItem}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Safety checked Delete Dialog Modal */}
      <SemesterDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingId(undefined);
        }}
        onConfirm={handleDeleteConfirm}
        semesterId={deletingId}
        semesterName={deletingName}
      />
    </div>
  );
}
