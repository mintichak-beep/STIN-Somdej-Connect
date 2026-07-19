import { useState, useEffect } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface SemesterDeleteDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  semesterId: string | undefined;
  semesterName: string;
}

export function SemesterDeleteDialog({
  id,
  isOpen,
  onClose,
  onConfirm,
  semesterId,
  semesterName
}: SemesterDeleteDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isOpen && semesterId) {
      setIsChecking(true);
      setErrorMsg(null);

      // Perform synchronous checks on our mock DB
      const students = [];
      const semesterObj = [].find(s => s.id === semesterId);

      if (semesterObj) {
        // Check student references
        const linkedStudents = students.filter(s => 
          s.academicYearId === semesterObj.academicYearId && 
          (s.semester === semesterObj.semesterNumber || s.semester === semesterObj.id)
        );

        if (linkedStudents.length > 0) {
          setErrorMsg(`Cannot delete Semester '${semesterName}' because it is currently assigned to ${linkedStudents.length} student profile(s). Please reassign them first.`);
        }
      }

      setIsChecking(false);
    }
  }, [isOpen, semesterId, semesterName]);

  return (
    <ConfirmDialog
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete Semester ${semesterName}`}
      description={
        errorMsg 
          ? errorMsg 
          : `Are you absolutely sure you want to delete Semester '${semesterName}'? This action is permanent and cannot be undone.`
      }
      confirmLabel={errorMsg ? undefined : 'Delete Registry'}
      variant="danger"
      isSubmitting={isChecking}
    />
  );
}
