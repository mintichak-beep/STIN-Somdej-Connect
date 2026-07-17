import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Hospital } from '../types/db';
import { HospitalLogoUploader } from './HospitalLogoUploader';
import { HospitalImageUploader } from './HospitalImageUploader';
import { Info, MapPin, Phone, Users, Landmark, AlertCircle } from 'lucide-react';

const phoneRegex = /^0[1-9][0-9]-?[0-9]{3}-?[0-9]{3,4}$|^02-?[0-9]{3}-?[0-9]{4}$|^0[3-8][0-9]-?[0-9]{3}-?[0-9]{3}$/;

const hospitalFormSchema = z.object({
  hospitalCode: z.string().min(2, 'Hospital code must be at least 2 characters.'),
  hospitalNameTH: z.string().min(3, 'Thai name must be at least 3 characters.'),
  hospitalNameEN: z.string().min(3, 'English name must be at least 3 characters.'),
  shortName: z.string().min(1, 'Short name is required.'),
  type: z.enum([
    'University Hospital',
    'Regional Hospital',
    'General Hospital',
    'Community Hospital',
    'Private Hospital',
    'Specialized Hospital'
  ]),
  affiliation: z.string().min(2, 'Affiliation is required.'),
  province: z.string().min(2, 'Province is required.'),
  district: z.string().min(2, 'District is required.'),
  subdistrict: z.string().min(2, 'Subdistrict is required.'),
  postalCode: z.string().length(5, 'Postal Code must be exactly 5 digits.'),
  address: z.string().min(5, 'Address details are required.'),
  latitude: z.union([
    z.number(),
    z.string().transform((val) => Number(val))
  ]).refine((val) => !isNaN(val) && val >= -90 && val <= 90, {
    message: 'Latitude must be a valid coordinate (-90 to 90).'
  }),
  longitude: z.union([
    z.number(),
    z.string().transform((val) => Number(val))
  ]).refine((val) => !isNaN(val) && val >= -180 && val <= 180, {
    message: 'Longitude must be a valid coordinate (-180 to 180).'
  }),
  telephone: z.string().min(9, 'Telephone number is required.').refine((val) => phoneRegex.test(val), {
    message: 'Invalid Thai telephone format (e.g., 02-419-7000, 081-111-2222).'
  }),
  fax: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address format.').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL format (must include http/https).').optional().or(z.literal('')),
  directorName: z.string().optional().or(z.literal('')),
  coordinatorName: z.string().min(2, 'Coordinator name is required.'),
  coordinatorPhone: z.string().min(9, 'Coordinator phone is required.').refine((val) => phoneRegex.test(val), {
    message: 'Invalid Thai mobile/phone format (e.g., 081-111-2222).'
  }),
  coordinatorEmail: z.string().email('Invalid email address format.').optional().or(z.literal('')),
  studentCapacity: z.union([
    z.number(),
    z.string().transform((val) => Number(val))
  ]).refine((val) => !isNaN(val) && val >= 0, {
    message: 'Student capacity must be a positive number.'
  }),
  teacherCapacity: z.union([
    z.number(),
    z.string().transform((val) => Number(val))
  ]).refine((val) => !isNaN(val) && val >= 0, {
    message: 'Teacher capacity must be a positive number.'
  }),
  status: z.enum(['active', 'inactive', 'archived']),
  note: z.string().optional().or(z.literal('')),
  logoURL: z.string().optional().or(z.literal('')),
  imageURL: z.string().optional().or(z.literal('')),
  numberOfBuildings: z.number().default(0),
  numberOfRooms: z.number().default(0)
});

type HospitalFormValues = z.infer<typeof hospitalFormSchema>;

interface HospitalFormProps {
  id?: string;
  initialData?: Hospital | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function HospitalForm({ id, initialData, onSubmit, onCancel, loading }: HospitalFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      hospitalCode: initialData?.hospitalCode || '',
      hospitalNameTH: initialData?.hospitalNameTH || '',
      hospitalNameEN: initialData?.hospitalNameEN || '',
      shortName: initialData?.shortName || '',
      type: initialData?.type || 'General Hospital',
      affiliation: initialData?.affiliation || '',
      province: initialData?.province || 'Bangkok',
      district: initialData?.district || '',
      subdistrict: initialData?.subdistrict || '',
      postalCode: initialData?.postalCode || '',
      address: initialData?.address || '',
      latitude: initialData?.latitude || '',
      longitude: initialData?.longitude || '',
      telephone: initialData?.telephone || '',
      fax: initialData?.fax || '',
      email: initialData?.email || '',
      website: initialData?.website || '',
      directorName: initialData?.directorName || '',
      coordinatorName: initialData?.coordinatorName || '',
      coordinatorPhone: initialData?.coordinatorPhone || '',
      coordinatorEmail: initialData?.coordinatorEmail || '',
      studentCapacity: initialData?.studentCapacity || 0,
      teacherCapacity: initialData?.teacherCapacity || 0,
      status: initialData?.status || 'active',
      note: initialData?.note || '',
      logoURL: initialData?.logoURL || '',
      imageURL: initialData?.imageURL || '',
      numberOfBuildings: initialData?.numberOfBuildings || 0,
      numberOfRooms: initialData?.numberOfRooms || 0
    }
  });

  return (
    <form
      id={id || 'hospital-form'}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Visual Header Uploaders */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-indigo-500" />
          <span>Visual Brand Identity</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex justify-center">
            <Controller
              name="logoURL"
              control={control}
              render={({ field }) => (
                <HospitalLogoUploader
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                />
              )}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Controller
              name="imageURL"
              control={control}
              render={({ field }) => (
                <HospitalImageUploader
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Grid container for form blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: General Profile */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>General Registry Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Hospital Code *</label>
              <input
                type="text"
                {...register('hospitalCode')}
                disabled={loading}
                placeholder="e.g. H001"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.hospitalCode && <p className="text-[10px] font-semibold text-rose-500">{errors.hospitalCode.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Short Name / Alias *</label>
              <input
                type="text"
                {...register('shortName')}
                disabled={loading}
                placeholder="e.g. ศิริราช"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.shortName && <p className="text-[10px] font-semibold text-rose-500">{errors.shortName.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Thai Name *</label>
            <input
              type="text"
              {...register('hospitalNameTH')}
              disabled={loading}
              placeholder="e.g. โรงพยาบาลศิริราช"
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.hospitalNameTH && <p className="text-[10px] font-semibold text-rose-500">{errors.hospitalNameTH.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">English Name *</label>
            <input
              type="text"
              {...register('hospitalNameEN')}
              disabled={loading}
              placeholder="e.g. Siriraj Hospital"
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.hospitalNameEN && <p className="text-[10px] font-semibold text-rose-500">{errors.hospitalNameEN.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Hospital Type *</label>
              <select
                {...register('type')}
                disabled={loading}
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="University Hospital">University Hospital</option>
                <option value="Regional Hospital">Regional Hospital</option>
                <option value="General Hospital">General Hospital</option>
                <option value="Community Hospital">Community Hospital</option>
                <option value="Private Hospital">Private Hospital</option>
                <option value="Specialized Hospital">Specialized Hospital</option>
              </select>
              {errors.type && <p className="text-[10px] font-semibold text-rose-500">{errors.type.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Affiliation / Ministry *</label>
              <input
                type="text"
                {...register('affiliation')}
                disabled={loading}
                placeholder="e.g. Mahidol University / MoPH"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.affiliation && <p className="text-[10px] font-semibold text-rose-500">{errors.affiliation.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Location & Geographic coordinates */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Geographic Placement Details</span>
          </h3>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Street Address Details *</label>
            <textarea
              rows={2}
              {...register('address')}
              disabled={loading}
              placeholder="e.g. 2 Wang Lang Road, Bangkok Noi"
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.address && <p className="text-[10px] font-semibold text-rose-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Subdistrict *</label>
              <input
                type="text"
                {...register('subdistrict')}
                disabled={loading}
                placeholder="e.g. Siri Rat"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.subdistrict && <p className="text-[10px] font-semibold text-rose-500">{errors.subdistrict.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">District / Amphoe *</label>
              <input
                type="text"
                {...register('district')}
                disabled={loading}
                placeholder="e.g. Bangkok Noi"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.district && <p className="text-[10px] font-semibold text-rose-500">{errors.district.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Province *</label>
              <input
                type="text"
                {...register('province')}
                disabled={loading}
                placeholder="e.g. Bangkok"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.province && <p className="text-[10px] font-semibold text-rose-500">{errors.province.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Postal Code *</label>
              <input
                type="text"
                {...register('postalCode')}
                disabled={loading}
                placeholder="e.g. 10700"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.postalCode && <p className="text-[10px] font-semibold text-rose-500">{errors.postalCode.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Latitude Coordinate *</label>
              <input
                type="text"
                {...register('latitude')}
                disabled={loading}
                placeholder="e.g. 13.7589"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden font-mono"
              />
              {errors.latitude && <p className="text-[10px] font-semibold text-rose-500">{errors.latitude.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Longitude Coordinate *</label>
              <input
                type="text"
                {...register('longitude')}
                disabled={loading}
                placeholder="e.g. 100.4862"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden font-mono"
              />
              {errors.longitude && <p className="text-[10px] font-semibold text-rose-500">{errors.longitude.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Direct Contact & Communication */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-500" />
            <span>Direct Communications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Telephone Number *</label>
              <input
                type="text"
                {...register('telephone')}
                disabled={loading}
                placeholder="e.g. 02-419-7000"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.telephone && <p className="text-[10px] font-semibold text-rose-500">{errors.telephone.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Fax Number</label>
              <input
                type="text"
                {...register('fax')}
                disabled={loading}
                placeholder="e.g. 02-419-7001"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.fax && <p className="text-[10px] font-semibold text-rose-500">{errors.fax.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Hospital Official Email</label>
            <input
              type="text"
              {...register('email')}
              disabled={loading}
              placeholder="e.g. contact@hospital.go.th"
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.email && <p className="text-[10px] font-semibold text-rose-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Official Website URL</label>
            <input
              type="text"
              {...register('website')}
              disabled={loading}
              placeholder="e.g. https://www.siriraj.go.th"
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.website && <p className="text-[10px] font-semibold text-rose-500">{errors.website.message}</p>}
          </div>
        </div>

        {/* Section 4: Placements Coordinator & Leadership */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>Placement Contacts & Leadership</span>
          </h3>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Hospital Director Name</label>
            <input
              type="text"
              {...register('directorName')}
              disabled={loading}
              placeholder="e.g. Prof. Somchai Prasert"
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.directorName && <p className="text-[10px] font-semibold text-rose-500">{errors.directorName.message}</p>}
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800/50" />

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Coordinator Full Name *</label>
            <input
              type="text"
              {...register('coordinatorName')}
              disabled={loading}
              placeholder="e.g. Ms. Yupin Saelim (Lead Coordinator)"
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.coordinatorName && <p className="text-[10px] font-semibold text-rose-500">{errors.coordinatorName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Coordinator Mobile *</label>
              <input
                type="text"
                {...register('coordinatorPhone')}
                disabled={loading}
                placeholder="e.g. 081-111-2222"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.coordinatorPhone && <p className="text-[10px] font-semibold text-rose-500">{errors.coordinatorPhone.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Coordinator Email</label>
              <input
                type="text"
                {...register('coordinatorEmail')}
                disabled={loading}
                placeholder="e.g. yupin@hospital.go.th"
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
              />
              {errors.coordinatorEmail && <p className="text-[10px] font-semibold text-rose-500">{errors.coordinatorEmail.message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Capacity & System Policies */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-500" />
          <span>Placement Capacity & Policies</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Student Placement Quota *</label>
            <input
              type="number"
              {...register('studentCapacity')}
              disabled={loading}
              placeholder="e.g. 30"
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.studentCapacity && <p className="text-[10px] font-semibold text-rose-500">{errors.studentCapacity.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Max Faculty / Supervisors *</label>
            <input
              type="number"
              {...register('teacherCapacity')}
              disabled={loading}
              placeholder="e.g. 5"
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.teacherCapacity && <p className="text-[10px] font-semibold text-rose-500">{errors.teacherCapacity.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Initial Registry Status *</label>
            <select
              {...register('status')}
              disabled={loading}
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && <p className="text-[10px] font-semibold text-rose-500">{errors.status.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Internal Remarks / Placement Policies Notes</label>
          <textarea
            rows={3}
            {...register('note')}
            disabled={loading}
            placeholder="Specify clinical units, specialty limits, accommodation regulations..."
            className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.note && <p className="text-[10px] font-semibold text-rose-500">{errors.note.message}</p>}
        </div>
      </div>

      {/* Action panel */}
      <div className="flex justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          {loading ? 'Processing...' : initialData ? 'Save Changes' : 'Register Hospital'}
        </button>
      </div>
    </form>
  );
}
