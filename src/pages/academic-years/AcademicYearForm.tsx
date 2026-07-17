import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Sidebar } from '../../components/Sidebar';
import { useAcademicYears } from '../../hooks/useAcademicYears';
import { academicYearService } from '../../services/academicYear.service';
import { Calendar, ArrowLeft, ShieldAlert } from 'lucide-react';

const academicYearSchema = zod.object({
  name: zod.string().min(1, 'Academic Year Name is required.').regex(/^\d{4}$/, 'Must be a 4-digit Buddhist/Christian year (e.g. 2569).'),
  startYear: zod.string().min(1, 'Start Year is required.').regex(/^\d{4}$/, 'Must be a 4-digit year (e.g. 2569).'),
  endYear: zod.string().min(1, 'End Year is required.').regex(/^\d{4}$/, 'Must be a 4-digit year (e.g. 2570).'),
  description: zod.string().max(250, 'Description cannot exceed 250 characters.'),
  status: zod.enum(['active', 'inactive', 'archived'])
}).refine((data) => {
  const start = parseInt(data.startYear, 10);
  const end = parseInt(data.endYear, 10);
  return end > start;
}, {
  message: 'End Year must be strictly greater than Start Year.',
  path: ['endYear']
});

type AcademicYearFormValues = zod.infer<typeof academicYearSchema>;

export function AcademicYearForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { createAcademicYear, updateAcademicYear } = useAcademicYears();
  const createYear = createAcademicYear;
  const updateYear = updateAcademicYear;
  const [loading, setLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: '',
      startYear: '',
      endYear: '',
      description: '',
      status: 'inactive'
    }
  });

  // Load existing data if editing
  useEffect(() => {
    async function loadAcademicYear() {
      if (!id) return;
      try {
        setLoading(true);
        const ay = await academicYearService.getById(id);
        if (!ay) {
          setPageError('Academic Year not found.');
          return;
        }
        reset({
          name: ay.name,
          startYear: String(ay.startYear),
          endYear: String(ay.endYear),
          description: ay.description || '',
          status: ay.status
        });
      } catch (err: any) {
        setPageError(err?.message || 'Failed to load Academic Year.');
      } finally {
        setLoading(false);
      }
    }
    loadAcademicYear();
  }, [id, reset]);

  const handleFormSubmit = async (values: AcademicYearFormValues) => {
    try {
      setIsSubmitting(true);
      if (isEdit && id) {
        await updateYear(id, values);
      } else {
        await createYear({
          ...values,
          year: values.name,
          createdBy: '',
          updatedBy: ''
        });
      }
      navigate('/academic-years');
    } catch (err: any) {
      setPageError(err?.message || 'Failed to save Academic Year entry.');
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
            onClick={() => navigate('/academic-years')}
            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-900 cursor-pointer text-slate-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight font-sans">
              {isEdit ? 'Modify Year' : 'Register Academic Year'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              {isEdit ? 'Edit details of existing master year' : 'Add new Buddhist or Christian term to database'}
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
              <div className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950">
              <div className="flex items-center gap-2.5 mb-6 border-b border-slate-50 pb-4 dark:border-zinc-900/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-50">
                    Master Entry Profile
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                    Fields with asterisk * are mandatory
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit((values) => handleFormSubmit(values as AcademicYearFormValues))} className="space-y-5 text-left">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Academic Year Name (e.g. 2569) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      {...register('name')}
                      placeholder="2569"
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                    {errors.name && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Start Year <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      {...register('startYear')}
                      placeholder="2569"
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                    {errors.startYear && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.startYear.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                      End Year <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      {...register('endYear')}
                      placeholder="2570"
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    />
                    {errors.endYear && (
                      <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.endYear.message}</p>
                    )}
                  </div>

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

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                    Description / Memo
                  </label>
                  <textarea
                    rows={4}
                    {...register('description')}
                    placeholder="Specify notes for this academic year registration profile..."
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  />
                  {errors.description && (
                    <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-50 pt-5 dark:border-zinc-900/60">
                  <button
                    type="button"
                    onClick={() => navigate('/academic-years')}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-gray-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/80 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Academic Year'}
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
