import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Box, Grid } from '@mui/material';
import { Student } from '../../types/student';

const schema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  studentNumber: z.string().min(1, 'Student Number is required'),
  studentName: z.string().min(1, 'Student Name is required'),
  section: z.string().min(1, 'Section is required'),
  academicYear: z.string().min(1, 'Academic Year is required'),
  hospital: z.string().min(1, 'Hospital is required'),
  rotationGroup: z.string().min(1, 'Rotation Group is required'),
  DRSchedule: z.string().min(1, 'DR Schedule is required'),
  roomId: z.string().optional(),
  bedId: z.string().optional(),
  remark: z.string().optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'suspended', 'archived'] as const).default('active'),
});

interface Props {
  initialData?: Student;
  onSubmit: (data: any) => void;
}

export function StudentForm({ initialData, onSubmit }: Props) {
  const { control, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      studentId: '',
      studentNumber: '',
      studentName: '',
      section: '',
      academicYear: '',
      hospital: '',
      rotationGroup: '',
      DRSchedule: '',
      remark: '',
      status: 'active'
    }
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {[
          { name: 'studentId', label: 'Student ID' },
          { name: 'studentNumber', label: 'Student Number' },
          { name: 'studentName', label: 'Student Name' },
          { name: 'section', label: 'Section' },
          { name: 'academicYear', label: 'Academic Year' },
          { name: 'hospital', label: 'Hospital' },
          { name: 'rotationGroup', label: 'Rotation Group' },
          { name: 'DRSchedule', label: 'DR Schedule' },
          { name: 'remark', label: 'Remark' },
        ].map((field) => (
          <Grid item xs={12} sm={6} key={field.name}>
            <Controller
              name={field.name}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  fullWidth
                  label={field.label}
                  value={value || ''}
                  onChange={onChange}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]?.message as string}
                />
              )}
            />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Student
        </button>
      </Box>
    </Box>
  );
}
