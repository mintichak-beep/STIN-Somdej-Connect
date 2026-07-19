import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building } from '../types/db';
import { BuildingImageUploader } from './BuildingImageUploader';
import { Info, Home, MapPin, AlignLeft, AlertCircle } from 'lucide-react';

const buildingFormSchema = z.object({
  hospitalId: z.string().min(1, 'Please select a clinical hospital site.'),
  buildingCode: z.string().min(2, 'Building code must be at least 2 characters.'),
  buildingName: z.string().min(3, 'Building name must be at least 3 characters.'),
  buildingType: z.enum(['Dormitory', 'Residence', 'Apartment', 'Guest House']),
  gender: z.enum(['Female', 'Male', 'Mixed']),
  address: z.string().min(5, 'Address details are required.'),
  description: z.string().optional().or(z.literal('')),
  imageURL: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
});

type BuildingFormValues = z.infer<typeof buildingFormSchema>;

interface BuildingFormProps {
  id?: string;
  initialData?: Building | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function BuildingForm({ id, initialData, onSubmit, onCancel, loading }: BuildingFormProps) {
  const hospitals = [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues: {
      hospitalId: initialData?.hospitalId || '',
      buildingCode: initialData?.buildingCode || '',
      buildingName: initialData?.buildingName || '',
      buildingType: (initialData?.buildingType as any) || 'Dormitory',
      gender: (initialData?.gender as any) || 'Female',
      address: initialData?.address || '',
      description: initialData?.description || '',
      imageURL: initialData?.imageURL || '',
      status: (initialData?.status as any) || 'active',
    },
  });

  return (
    <form
      id={id || 'building-form'}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white dark:bg-zinc-900"
    >
      {/* Visual Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-extrabold text-rose-800 dark:text-rose-400">
              Please resolve form validation issues:
            </h4>
            <ul className="list-disc pl-4 mt-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 space-y-1">
              {Object.values(errors).map((err: any, idx) => (
                <li key={idx}>{err?.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column inputs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <Home className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-extrabold text-gray-900 dark:text-zinc-100 uppercase tracking-wider">
              Basic Building Details
            </span>
          </div>

          {/* Hospital Association */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
              Clinical Hospital Site *
            </label>
            <select
              {...register('hospitalId')}
              disabled={!!initialData}
              className={`block w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 ${
                errors.hospitalId
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800'
              } bg-white dark:bg-zinc-950 dark:text-zinc-50 disabled:bg-slate-50 dark:disabled:bg-zinc-900/40`}
            >
              <option value="">-- Select Hospital Site --</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.hospitalNameEN} ({h.hospitalCode})
                </option>
              ))}
            </select>
            {errors.hospitalId && (
              <p className="text-[10px] font-bold text-rose-600">{errors.hospitalId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Code */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
                Building Code *
              </label>
              <input
                type="text"
                placeholder="e.g. BLDG-A"
                {...register('buildingCode')}
                className={`block w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 ${
                  errors.buildingCode
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800'
                } bg-white dark:bg-zinc-950 dark:text-zinc-50`}
              />
              {errors.buildingCode && (
                <p className="text-[10px] font-bold text-rose-600">{errors.buildingCode.message}</p>
              )}
            </div>

            {/* Building Type */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
                Building Type *
              </label>
              <select
                {...register('buildingType')}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="Dormitory">Dormitory</option>
                <option value="Residence">Residence</option>
                <option value="Apartment">Apartment</option>
                <option value="Guest House">Guest House</option>
              </select>
            </div>
          </div>

          {/* Building Name */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
              Building Name *
            </label>
            <input
              type="text"
              placeholder="e.g. STIN Main Residence A"
              {...register('buildingName')}
              className={`block w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 ${
                errors.buildingName
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800'
              } bg-white dark:bg-zinc-950 dark:text-zinc-50`}
            />
            {errors.buildingName && (
              <p className="text-[10px] font-bold text-rose-600">{errors.buildingName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Target Gender */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
                Target Gender Users *
              </label>
              <select
                {...register('gender')}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
                Operational Status *
              </label>
              <select
                {...register('status')}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right column inputs (Address, Description, Image Uploader) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-extrabold text-gray-900 dark:text-zinc-100 uppercase tracking-wider">
              Location & Imagery
            </span>
          </div>

          {/* Address Details */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
              Complete Location Address *
            </label>
            <textarea
              rows={2}
              placeholder="Full physical street address..."
              {...register('address')}
              className={`block w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 ${
                errors.address
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800'
              } bg-white dark:bg-zinc-950 dark:text-zinc-50`}
            />
            {errors.address && (
              <p className="text-[10px] font-bold text-rose-600">{errors.address.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
              Building Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Additional information, landmarks, or capacity guidelines..."
              {...register('description')}
              className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          {/* Cover image uploader */}
          <Controller
            control={control}
            name="imageURL"
            render={({ field }) => (
              <BuildingImageUploader
                value={field.value}
                onChange={(url) => setValue('imageURL', url, { shouldValidate: true })}
              />
            )}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Saving Building...' : 'Save Building Profile'}
        </button>
      </div>
    </form>
  );
}
