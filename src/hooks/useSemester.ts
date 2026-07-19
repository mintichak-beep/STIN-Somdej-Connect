import { useState, useEffect, useCallback } from 'react';
import { Semester, AcademicYear } from '../types/db';
import { semesterService } from '../services/semester.service';
import { academicYearService } from '../services/academicYear.service';

export function useSemester(id: string | undefined) {
  const [semester, setSemester] = useState<Semester | null>(null);
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    coursesCount: 0,
    sectionsCount: 0,
    studentsCount: 0,
    teachersCount: 0
  });

  const fetchData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const sem = await semesterService.getById(id);
      if (!sem) {
        setError('Semester not found.');
        setSemester(null);
        return;
      }

      setSemester(sem);

      // Fetch academic year
      const ay = await academicYearService.getById(sem.academicYearId);
      setAcademicYear(ay);

      // Dynamic statistics
      const students = [].filter(s => 
        s.academicYearId === sem.academicYearId && 
        (s.semester === sem.semesterNumber || s.semester === sem.id)
      );
      const studentsCount = students.length;

      const courseIds = new Set(students.map(s => s.courseId).filter(Boolean));
      const coursesCount = courseIds.size;

      const sectionIds = new Set(students.map(s => s.sectionId).filter(Boolean));
      const sectionsCount = sectionIds.size;

      const teachersCount = [].filter(t => 
        t.courseIds.some(cid => courseIds.has(cid))
      ).length;

      setStats({
        coursesCount,
        sectionsCount,
        studentsCount,
        teachersCount
      });

    } catch (err: any) {
      setError(err?.message || 'Failed to load semester details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();

    const handleUpdate = () => {
      fetchData();
    };

    window.addEventListener('cpatms_db_update', handleUpdate);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  }, [fetchData]);

  return {
    semester,
    academicYear,
    stats,
    loading,
    error,
    refresh: fetchData
  };
}
