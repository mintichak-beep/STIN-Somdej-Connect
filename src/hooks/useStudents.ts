import { useState, useEffect } from 'react';
import { studentService } from '../services/student.service';
import { Student } from '../types/student';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = studentService.subscribe((data) => {
      setStudents(data);
      setLoading(false);
    });
    
    // Initial fetch
    studentService.getAll().then(data => {
      setStudents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { students, loading };
}
