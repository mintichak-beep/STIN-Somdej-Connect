import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Sidebar } from '../../components/Sidebar';
import { useSemesters } from '../../hooks/useSemesters';
import { useAcademicYears } from '../../hooks/useAcademicYears';
import { semesterService } from '../../services/semester.service';
import { CalendarRange, ArrowLeft, ShieldAlert } from 'lucide-react';

const semesterSchema = zod.object({
  academicYearId: zod.string().min(1, 'Academic Year selection is required.'),
  semesterNumber: zod.enum(['1', '2', 'Summer']),
  semesterName: zod.string().min(1, 'Semester Name is required.'),
  startDate: zod.string().min(1, 'Start Date is required.'),
  endDate: zod.string().min(1, 'End Date is required.'),
  registrationStart: zod.string().min(1, 'Registration Start Date is required.'),
  registrationEnd: zod.string().min(1, 'Registration End Date is required.'),
  status: zod.enum(['active', 'inactive', 'archived'])
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'Semester End Date must be strictly after the Start Date.',
  path: ['endDate']
}).refine((data) => {
  const regStart = new Date(data.registrationStart);
  const regEnd = new Date(data.registrationEnd);
  return regEnd > regStart;
}, {
  message: 'Registration End Date must be strictly after the Registration Start Date.',
  path: ['registrationEnd']
}).refine((data) => {
  const regEnd = new Date(data.registrationEnd);
  const semEnd = new Date(data.endDate);
  return semEnd >= regEnd;
}, {
  message: 'Registration cannot close after the Semester ends.',
  path: ['registrationEnd']
});

type SemesterFormValues = zod.infer<typeof semesterSchema>;

export function SemesterForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { createSemester, updateSemester } = useSemesters();
  const { academicYears } = useAcademicYears();

  const [loading, setLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      academicYearId: '',
      semesterNumber: '1',
      semesterName: 'Semester 1',
      startDate: '',
      endDate: '',
      registrationStart: '',
      registrationEnd: '',
      status: 'inactive'
    }
  });

  const watchedNumber = watch('semesterNumber');

  // Sync Semester Name automatically based on Number selection for better UX!
  useEffect(() => {
    if (watchedNumber) {
      if (watchedNumber === 'Summer') {
        setValue('semesterName', 'Summer Semester');
      } else {
        setValue('semesterName', `Semester ${watchedNumber}`);
      }
    }
  }, [watchedNumber, setValue]);

  // Load existing data if editing
  useEffect(() => {
    async function loadSemester() {
      if (!id) return;
      try {
        setLoading(true);
        const sem = await semesterService.getById(id);
        if (!sem) {
          setPageError('Semester Term not found.');
          return;
        }
        reset({
          academicYearId: sem.academicYearId,
          semesterNumber: sem.semesterNumber as '1' | '2' | 'Summer',
          semesterName: sem.semesterName,
          startDate: sem.startDate,
          endDate: sem.endDate,
          registrationStart: sem.registrationStart,
          registrationEnd: sem.registrationEnd,
          status: sem.status
        });
      } catch (err: any) {
        setPageError(err?.message || 'Failed to load semester.');
      } finally {
        setLoading(false);
      }
    }
    loadSemester();
  }, [id, reset]);

  const handleFormSubmit = async (values: SemesterFormValues) => {
    try {
      setIsSubmitting(true);
      if (isEdit && id) {
        await updateSemester(id, values);
      } else {
        await createSemester(values);
      }
      navigate('/semesters');
    } catch (err: any) {
      setPageError(err?.message || 'Failed to save Semester Term.');
    } finally {
      setIsSubmitting(false);
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
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight font-sans">
              {isEdit ? 'Modify Semester' : 'Register Semester Term'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              {isEdit ? 'Edit details of existing master semester' : 'Add new active calendared period for clinical placements'}
            </p>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-3xl">
          {pageError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950/30 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold">{pageError}</p>
            </div>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
              <div className="h-40 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950">
              <div className="flex items-center gap-2.5 mb-6 border-b border-slate-50 pb-4 dark:border-zinc-900/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                  <CalendarRange className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-50">
                    Academic Calendaring Profile
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                    Fields with asterisk * are mandatory
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit((values) => handleFormSubmit(values as SemesterFormValues))} className="space-y-5 text-left">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Parent Academic Year dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Academic Year <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register('academicYearId')}
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    >
                      <option value="">Select Academic Year</option>
                      {academicYears.map(ay => (
                        <option key={ay.id} value={ay.id}>
                          {ay.name} {ay.status === 'active' ? '(Active)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.academicYearId && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.academicYearId.message}</p>
                    )}
                  </div>

                  {/* Semester Number select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Semester Term <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register('semesterNumber')}
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    >
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="Summer">Summer</option>
                    </select>
                    {errors.semesterNumber && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.semesterNumber.message}</p>
                    )}
                  </div>

                  {/* Semester Name auto-filled */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Semester Display Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('semesterName')}
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      placeholder="e.g. Semester 1"
                    />
                    {errors.semesterName && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.semesterName.message}</p>
                    )}
                  </div>

                  {/* Semester Start Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Semester Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('startDate')}
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.startDate.message}</p>
                    )}
                  </div>

                  {/* Semester End Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Semester End Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('endDate')}
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.endDate.message}</p>
                    )}
                  </div>

                  {/* Registration Start Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Registration Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('registrationStart')}
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                    {errors.registrationStart && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.registrationStart.message}</p>
                    )}
                  </div>

                  {/* Registration End Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Registration End Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('registrationEnd')}
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                    {errors.registrationEnd && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.registrationEnd.message}</p>
                    )}
                  </div>

                  {/* Status dropdown */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register('status')}
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    >
                      <option value="inactive">Inactive</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.status.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-50 pt-5 dark:border-zinc-900/60 font-sans">
                  <button
                    type="button"
                    onClick={() => navigate('/semesters')}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-gray-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/80 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Semester'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default SemesterForm;
