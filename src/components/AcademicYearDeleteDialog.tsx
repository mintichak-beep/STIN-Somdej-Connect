import { useState, useEffect } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface AcademicYearDeleteDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  academicYearId: string | undefined;
  academicYearName: string;
}

export function AcademicYearDeleteDialog({
  id,
  isOpen,
  onClose,
  onConfirm,
  academicYearId,
  academicYearName
}: AcademicYearDeleteDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isOpen && academicYearId) {
      setIsChecking(true);
      setErrorMsg(null);

      // Perform synchronous checks on our mock DB
      const students = [];
      const linkedStudents = students.filter(s => s.academicYearId === academicYearId);

      const semesters = [];
      const linkedSemesters = semesters.filter(s => s.academicYearId === academicYearId);

      if (linkedStudents.length > 0) {
        setErrorMsg(`Cannot delete this Academic Year because it is currently assigned to ${linkedStudents.length} student profile(s). Please reassign them first.`);
      } else if (linkedSemesters.length > 0) {
        setErrorMsg(`Cannot delete this Academic Year because it contains ${linkedSemesters.length} semester(s). Please delete all semesters under this year first.`);
      }

      setIsChecking(false);
    }
  }, [isOpen, academicYearId]);

  return (
    <ConfirmDialog
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete Academic Year ${academicYearName}`}
      description={
        errorMsg 
          ? errorMsg 
          : `Are you absolutely sure you want to delete Academic Year ${academicYearName}? This action is permanent and cannot be undone.`
      }
      confirmLabel={errorMsg ? undefined : 'Delete Registry'}
      variant="danger"
      isSubmitting={isChecking}
    />
  );
}
