import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { X, CalendarRange, Edit3 } from 'lucide-react';
import { Semester, AcademicYear } from '../types/db';

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
  // Registration shouldn't expand beyond semester end date
  return semEnd >= regEnd;
}, {
  message: 'Registration cannot close after the Semester ends.',
  path: ['registrationEnd']
});

type SemesterFormValues = zod.infer<typeof semesterSchema>;

interface SemesterDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SemesterFormValues) => void | Promise<void>;
  academicYears: AcademicYear[];
  initialData?: Semester | null;
  isSubmitting?: boolean;
}

export function SemesterDialog({
  id,
  isOpen,
  onClose,
  onSubmit,
  academicYears,
  initialData,
  isSubmitting = false
}: SemesterDialogProps) {
  const isEdit = !!initialData;

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

  // Sync initialData when open or item changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          academicYearId: initialData.academicYearId,
          semesterNumber: initialData.semesterNumber as '1' | '2' | 'Summer',
          semesterName: initialData.semesterName,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          registrationStart: initialData.registrationStart,
          registrationEnd: initialData.registrationEnd,
          status: initialData.status
        });
      } else {
        reset({
          academicYearId: academicYears.find(ay => ay.status === 'active')?.id || '',
          semesterNumber: '1',
          semesterName: 'Semester 1',
          startDate: '',
          endDate: '',
          registrationStart: '',
          registrationEnd: '',
          status: 'inactive'
        });
      }
    }
  }, [isOpen, initialData, reset, academicYears]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id={id} className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 dark:border-zinc-900/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                {isEdit ? <Edit3 className="h-5 w-5" /> : <CalendarRange className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-50">
                  {isEdit ? 'Modify Semester Term' : 'Register New Semester'}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                  Academic Calendaring Details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit((values) => onSubmit(values as any))} className="mt-5 space-y-4 text-left">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Academic Year parent */}
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
                      {ay.name} {ay.status === 'active' ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
                {errors.academicYearId && (
                  <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.academicYearId.message}</p>
                )}
              </div>

              {/* Semester Number */}
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

              {/* Default Status dropdown */}
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

            {/* Actions Footer */}
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-50 pt-4 dark:border-zinc-900/60">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/80 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Register Semester'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
