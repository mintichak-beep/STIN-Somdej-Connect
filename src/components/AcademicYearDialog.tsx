import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Edit3, HelpCircle } from 'lucide-react';
import { AcademicYear } from '../types/db';

const academicYearSchema = zod.object({
  name: zod.string().min(1, 'กรุณากรอกชื่อปีการศึกษา').regex(/^\d{4}$/, 'ต้องเป็นปี 4 หลัก (เช่น 2569)'),
  startYear: zod.string().min(1, 'กรุณากรอกปีที่เริ่มต้น').regex(/^\d{4}$/, 'ต้องเป็นปี 4 หลัก (เช่น 2569)'),
  endYear: zod.string().min(1, 'กรุณากรอกปีที่สิ้นสุด').regex(/^\d{4}$/, 'ต้องเป็นปี 4 หลัก (เช่น 2570)'),
  description: zod.string().max(250, 'คำอธิบายต้องไม่เกิน 250 ตัวอักษร'),
  status: zod.enum(['active', 'inactive', 'archived'])
}).refine((data) => {
  const start = parseInt(data.startYear, 10);
  const end = parseInt(data.endYear, 10);
  return end > start;
}, {
  message: 'ปีที่สิ้นสุดต้องมากกว่าปีที่เริ่มต้น',
  path: ['endYear']
});

type AcademicYearFormValues = zod.infer<typeof academicYearSchema>;

interface AcademicYearDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AcademicYearFormValues) => void | Promise<void>;
  initialData?: AcademicYear | null;
  isSubmitting?: boolean;
}

export function AcademicYearDialog({
  id,
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false
}: AcademicYearDialogProps) {
  const isEdit = !!initialData;

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

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          startYear: String(initialData.startYear),
          endYear: String(initialData.endYear),
          description: initialData.description || '',
          status: initialData.status
        });
      } else {
        reset({
          name: '',
          startYear: '',
          endYear: '',
          description: '',
          status: 'inactive'
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id={id} className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Dialog Content */}
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                {isEdit ? <Edit3 className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-50">
                  {isEdit ? 'แก้ไขปีการศึกษา' : 'สร้างปีการศึกษา'}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                  ข้อมูลหลักปีการศึกษา
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Year Name */}
              <div className="sm:col-span-3">
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

              {/* Start Year */}
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

              {/* End Year */}
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

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                  Default Status <span className="text-rose-500">*</span>
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

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                Description / Memo
              </label>
              <textarea
                rows={3}
                {...register('description')}
                placeholder="Specify term scope, clinical placement objectives, or other references..."
                className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-xs focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
              {errors.description && (
                <p className="mt-1 text-[10px] font-bold text-rose-500">{errors.description.message}</p>
              )}
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
                {isSubmitting ? 'Saving...' : 'Save Registry'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
