import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Floor } from '../types/db';
import { Info, Layers, AlertCircle, HelpCircle } from 'lucide-react';
import { mockDB } from '../services/mockData';

const floorFormSchema = z.object({
  buildingId: z.string().min(1, 'Please select a parent building.'),
  floorNumber: z.union([
    z.number(),
    z.string().transform((val) => Number(val)),
  ]).refine((val) => !isNaN(val) && val >= -5 && val <= 100, {
    message: 'Floor level must be a valid number (-5 to 100).',
  }),
  floorName: z.string().min(3, 'Floor name must be at least 3 characters.'),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
});

type FloorFormValues = z.infer<typeof floorFormSchema>;

interface FloorFormProps {
  id?: string;
  initialData?: Floor | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function FloorForm({ id, initialData, onSubmit, onCancel, loading }: FloorFormProps) {
  const buildings = mockDB.getBuildings();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(floorFormSchema),
    defaultValues: {
      buildingId: initialData?.buildingId || '',
      floorNumber: initialData?.floorNumber !== undefined ? initialData.floorNumber : 1,
      floorName: initialData?.floorName || '',
      description: initialData?.description || '',
      status: (initialData?.status as any) || 'active',
    },
  });

  const selectedBuildingId = watch('buildingId');

  // Pre-generate floor name when floor number changes for convenience
  const floorNumberVal = watch('floorNumber');
  useEffect(() => {
    if (floorNumberVal && !initialData) {
      const num = Number(floorNumberVal);
      const ordinal = (n: number) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };
      if (num > 0) {
        setValue('floorName', `${ordinal(num)} Floor`);
      } else if (num === 0) {
        setValue('floorName', 'Ground Floor');
      } else if (num < 0) {
        setValue('floorName', `Basement ${Math.abs(num)}`);
      }
    }
  }, [floorNumberVal, setValue, initialData]);

  const handleFormSubmit = (values: any) => {
    // Find associated building to populate correct hospitalId automatically!
    const building = buildings.find((b) => b.id === values.buildingId);
    if (!building) {
      alert('Error: Building parent not found.');
      return;
    }

    const payload = {
      ...values,
      hospitalId: building.hospitalId,
    };

    onSubmit(payload);
  };

  return (
    <form
      id={id || 'floor-form'}
      onSubmit={handleSubmit(handleFormSubmit)}
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

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
          <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-extrabold text-gray-900 dark:text-zinc-100 uppercase tracking-wider">
            Floor Architecture Details
          </span>
        </div>

        {/* Building Parent */}
        <div className="space-y-1">
          <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
            Parent Building *
          </label>
          <select
            {...register('buildingId')}
            className={`block w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 ${
              errors.buildingId
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800'
            } bg-white dark:bg-zinc-950 dark:text-zinc-50`}
          >
            <option value="">-- Select Parent Building --</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.buildingName} ({b.buildingCode})
              </option>
            ))}
          </select>
          {errors.buildingId && (
            <p className="text-[10px] font-bold text-rose-600">{errors.buildingId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Floor Level Number */}
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
              Floor Level Number *
            </label>
            <input
              type="number"
              placeholder="e.g. 1"
              {...register('floorNumber')}
              className={`block w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 ${
                errors.floorNumber
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800'
              } bg-white dark:bg-zinc-950 dark:text-zinc-50`}
            />
            <p className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">
              Enter 0 for Ground, negative for Basement.
            </p>
            {errors.floorNumber && (
              <p className="text-[10px] font-bold text-rose-600">{errors.floorNumber.message}</p>
            )}
          </div>

          {/* Floor Level Status */}
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

        {/* Floor Custom Name */}
        <div className="space-y-1">
          <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
            Floor Display Name *
          </label>
          <input
            type="text"
            placeholder="e.g. 1st Floor Standard Rooms"
            {...register('floorName')}
            className={`block w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 ${
              errors.floorName
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800'
            } bg-white dark:bg-zinc-950 dark:text-zinc-50`}
          />
          {errors.floorName && (
            <p className="text-[10px] font-bold text-rose-600">{errors.floorName.message}</p>
          )}
        </div>

        {/* Floor Description */}
        <div className="space-y-1">
          <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
            Floor Description / Specifications
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Female student rooms, study common area, laundry room location..."
            {...register('description')}
            className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
      </div>

      {/* Action Buttons */}
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
          {loading ? 'Saving Floor Level...' : 'Save Floor Level'}
        </button>
      </div>
    </form>
  );
}
