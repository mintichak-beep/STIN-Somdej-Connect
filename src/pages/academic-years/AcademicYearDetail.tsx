import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAcademicYear } from '../../hooks/useAcademicYear';
import { useSemesters } from '../../hooks/useSemesters';
import { useRole } from '../../hooks/useRole';
import { Sidebar } from '../../components/Sidebar';
import { StatusChip } from '../../components/StatusChip';
import { SemesterTable } from '../../components/SemesterTable';
import { SemesterDialog } from '../../components/SemesterDialog';
import { SemesterDeleteDialog } from '../../components/SemesterDeleteDialog';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { 
  ArrowLeft, Calendar, Users, GraduationCap, Building, 
  Layers, Plus, ShieldAlert, Edit2 
} from 'lucide-react';

export function AcademicYearDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  // Load custom hooks
  const { academicYear, semesters: directSemesters, stats, loading, error, refresh } = useAcademicYear(id);
  const {
    createSemester,
    updateSemester,
    deleteSemester,
    setCurrentSemester,
    archiveSemester,
    restoreSemester,
    semesters: allSemesters
  } = useSemesters({ academicYearId: id });

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

  const handleCreateSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      await createSemester({
        ...values,
        academicYearId: id!
      });
      setIsCreateOpen(false);
      triggerToast('Semester Term registered successfully.');
      refresh();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to register semester.', 'error');
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
      refresh();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to update semester.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteSemester(deletingId);
      setIsDeleteOpen(false);
      triggerToast('Semester deleted permanently.');
      refresh();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to delete semester.', 'error');
    }
  };

  const handleArchive = async (semId: string) => {
    try {
      await archiveSemester(semId);
      triggerToast('Semester status set to Archived.');
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

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 border-b border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            onClick={() => navigate('/academic-years')}
            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-900 cursor-pointer text-slate-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight font-sans">
                  Academic Year {academicYear?.name || ''}
                </h1>
                {academicYear && <StatusChip status={academicYear.status} />}
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Detailed profile summary, core statistics, and nested calendars
              </p>
            </div>

            {academicYear && isAdmin && (
              <button
                onClick={() => navigate(`/academic-years/${academicYear.id}/edit`)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/80 cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </header>

        {/* Toast Alerts */}
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

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950/30 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton type="detail" />
          ) : !academicYear ? (
            <div className="text-center py-12 text-gray-400 font-extrabold">Academic Year not found.</div>
          ) : (
            <div className="space-y-8">
              {/* Profile Card & Info Block */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 text-left">
                  <h3 className="text-sm font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                    Term Description
                  </h3>
                  <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300 leading-relaxed min-h-[60px]">
                    {academicYear.description || 'No detailed memo description registered for this academic year record.'}
                  </p>
                  <div className="mt-6 border-t border-slate-50 pt-4 dark:border-zinc-900/40 grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-zinc-400">
                    <div>
                      <span>Start Year Period:</span>
                      <strong className="block text-gray-900 dark:text-zinc-100 mt-0.5 font-bold font-mono">{academicYear.startYear}</strong>
                    </div>
                    <div>
                      <span>End Year Period:</span>
                      <strong className="block text-gray-900 dark:text-zinc-100 mt-0.5 font-bold font-mono">{academicYear.endYear}</strong>
                    </div>
                  </div>
                </div>

                {/* Audit and metadata card */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 text-left">
                  <h3 className="text-sm font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
                    Registry Logs
                  </h3>
                  <div className="space-y-3.5 text-xs text-gray-500 dark:text-zinc-400">
                    <div className="flex justify-between border-b border-slate-50 pb-2 dark:border-zinc-900/40">
                      <span>Created At:</span>
                      <span className="font-bold font-mono">{new Date(academicYear.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2 dark:border-zinc-900/40">
                      <span>Last Updated:</span>
                      <span className="font-bold font-mono">{new Date(academicYear.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audited Node ID:</span>
                      <span className="font-semibold text-gray-700 dark:text-zinc-300 max-w-[100px] truncate">{academicYear.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Cohort Statistics Widgets */}
              <div>
                <h3 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4 text-left">
                  Cohort Performance & Registered Quantities
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Students */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Placed Students</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-zinc-50">{stats.studentsCount}</p>
                    <p className="mt-1 text-[10px] font-semibold text-gray-400">Nursing students deployed</p>
                  </div>

                  {/* Courses */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Active Courses</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                        <Building className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-zinc-50">{stats.coursesCount}</p>
                    <p className="mt-1 text-[10px] font-semibold text-gray-400">Syllabi models active</p>
                  </div>

                  {/* Sections */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Active Sections</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                        <Layers className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-zinc-50">{stats.sectionsCount}</p>
                    <p className="mt-1 text-[10px] font-semibold text-gray-400">Coordinated classrooms</p>
                  </div>

                  {/* Teachers */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Assigned Supervisors</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-zinc-50">{stats.teachersCount}</p>
                    <p className="mt-1 text-[10px] font-semibold text-gray-400">Coordinating clinical supervisors</p>
                  </div>
                </div>
              </div>

              {/* Nested Semester Calendars Panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-left">
                    Semesters Registered under Academic Year
                  </h3>

                  {isAdmin && (
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Register Semester</span>
                    </button>
                  )}
                </div>

                <SemesterTable
                  data={directSemesters}
                  academicYears={academicYear ? [academicYear] : []}
                  isAdmin={isAdmin}
                  onView={(semId) => navigate(`/semesters/${semId}`)}
                  onEdit={(semId) => {
                    const sem = directSemesters.find(s => s.id === semId);
                    if (sem) {
                      setEditingItem(sem);
                      setIsEditOpen(true);
                    }
                  }}
                  onDelete={(semId) => {
                    const sem = directSemesters.find(s => s.id === semId);
                    if (sem) {
                      setDeletingId(semId);
                      setDeletingName(sem.semesterName);
                      setIsDeleteOpen(true);
                    }
                  }}
                  onArchive={handleArchive}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                  onSetCurrent={handleSetCurrent}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Inline Semester Registration Dialog Modal */}
      {academicYear && (
        <SemesterDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
          academicYears={[academicYear]}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Inline Semester Modify Dialog Modal */}
      {academicYear && (
        <SemesterDialog
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleEditSubmit}
          academicYears={[academicYear]}
          initialData={editingItem}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Safety checked Semester Delete Dialog Modal */}
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
export default AcademicYearDetail;
