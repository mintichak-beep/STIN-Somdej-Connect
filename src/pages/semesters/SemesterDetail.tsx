import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSemester } from '../../hooks/useSemester';
import { useRole } from '../../hooks/useRole';
import { useSemesters } from '../../hooks/useSemesters';
import { Sidebar } from '../../components/Sidebar';
import { StatusChip } from '../../components/StatusChip';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { 
  ArrowLeft, CalendarRange, Users, GraduationCap, Building, 
  Layers, ShieldAlert, Edit2, Star 
} from 'lucide-react';

export function SemesterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  // Load Semester detail hook
  const { semester, academicYear, stats, loading, error, refresh } = useSemester(id);
  const { updateSemester, setCurrentSemester } = useSemesters();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSetCurrent = async () => {
    if (!id) return;
    try {
      await setCurrentSemester(id);
      triggerToast('Semester Term highlighted as system Current Term.');
      refresh();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to set current semester.', 'error');
    }
  };

  const handleToggleStatus = async () => {
    if (!semester) return;
    try {
      const nextStatus = semester.status === 'active' ? 'inactive' : 'active';
      await updateSemester(semester.id, { status: nextStatus });
      triggerToast(`Semester Term status set to ${nextStatus === 'active' ? 'Active' : 'Inactive'}.`);
      refresh();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to modify status.', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 border-b border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            onClick={() => navigate('/semesters')}
            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-900 cursor-pointer text-slate-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight font-sans">
                  {semester?.semesterName || ''}
                </h1>
                {semester && <StatusChip status={semester.status} />}
                {semester?.isCurrent && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-black tracking-wider uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                    <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Detailed profile summary, core statistics, and nested calendars
              </p>
            </div>

            {semester && isAdmin && (
              <div className="flex gap-2">
                {!semester.isCurrent && (
                  <button
                    onClick={handleSetCurrent}
                    className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-400 cursor-pointer"
                  >
                    <span>Highlight Current Term</span>
                  </button>
                )}
                <button
                  onClick={() => navigate(`/semesters/${semester.id}/edit`)}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/80 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
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

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950/30 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton type="detail" />
          ) : !semester ? (
            <div className="text-center py-12 text-gray-400 font-extrabold">Semester Term not found.</div>
          ) : (
            <div className="space-y-8">
              {/* Semester Details Block */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 text-left">
                  <h3 className="text-sm font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
                    Date Bounds & Gates
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-500 dark:text-zinc-400 font-sans">
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/60">
                        <span className="font-bold text-slate-400">Semester Start Date:</span>
                        <strong className="block text-gray-900 dark:text-zinc-100 mt-1 font-extrabold font-mono text-sm">{semester.startDate}</strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/60">
                        <span className="font-bold text-slate-400">Registration Opens:</span>
                        <strong className="block text-gray-900 dark:text-zinc-100 mt-1 font-extrabold font-mono text-sm">{semester.registrationStart}</strong>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/60">
                        <span className="font-bold text-slate-400">Semester End Date:</span>
                        <strong className="block text-gray-900 dark:text-zinc-100 mt-1 font-extrabold font-mono text-sm">{semester.endDate}</strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/60">
                        <span className="font-bold text-slate-400">Registration Closes:</span>
                        <strong className="block text-gray-900 dark:text-zinc-100 mt-1 font-extrabold font-mono text-sm">{semester.registrationEnd}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parent Academic Year Profile Card */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
                      Parent Academic Year
                    </h3>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                        <CalendarRange className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-zinc-50">
                          AY {academicYear?.name || ''}
                        </h4>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">
                          Term periods: {academicYear?.startYear} - {academicYear?.endYear}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-50 pt-4 dark:border-zinc-900/40">
                    <button
                      onClick={() => navigate(`/academic-years/${semester.academicYearId}`)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 cursor-pointer"
                    >
                      View Academic Year detail →
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Enrolled Statistics */}
              <div>
                <h3 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4 text-left">
                  Active Enrollment Quantities
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Students count */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Semester Students</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-zinc-50">{stats.studentsCount}</p>
                    <p className="mt-1 text-[10px] font-semibold text-gray-400">Registered this semester</p>
                  </div>

                  {/* Courses count */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Course Syllabus Models</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                        <Building className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-zinc-50">{stats.coursesCount}</p>
                    <p className="mt-1 text-[10px] font-semibold text-gray-400">Syllabi models taught</p>
                  </div>

                  {/* Sections count */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Classrooms</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                        <Layers className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-zinc-50">{stats.sectionsCount}</p>
                    <p className="mt-1 text-[10px] font-semibold text-gray-400">Sections in placement</p>
                  </div>

                  {/* Teachers count */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Coordinators</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-zinc-50">{stats.teachersCount}</p>
                    <p className="mt-1 text-[10px] font-semibold text-gray-400">Supervisors actively deployed</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default SemesterDetail;
