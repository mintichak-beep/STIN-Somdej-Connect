import React from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { StudentForm } from './StudentForm';
import { Student } from '../../types/student';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Student, 'id'>) => void;
  initialData?: Student;
}

export function StudentDialog({ open, onClose, onSubmit, initialData }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? 'Edit Student' : 'Create Student'}</DialogTitle>
      <DialogContent>
        <StudentForm initialData={initialData} onSubmit={(data) => { onSubmit(data); onClose(); }} />
      </DialogContent>
    </Dialog>
  );
}
