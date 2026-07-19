import { useState, useEffect, useCallback } from 'react';
import { AcademicYear, Semester } from '../types/db';
import { academicYearService } from '../services/academicYear.service';
import { semesterService } from '../services/semester.service';

export function useAcademicYear(id: string | undefined) {
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
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
      const ay = await academicYearService.getById(id);
      if (!ay) {
        setError('Academic Year not found.');
        setAcademicYear(null);
        return;
      }

      setAcademicYear(ay);

      // Fetch semesters belonging to this year
      const semList = await semesterService.getByAcademicYear(id);
      setSemesters(semList);

      // Dynamic calculations for stats
      const students = [].filter(s => s.academicYearId === id);
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
      setError(err?.message || 'Failed to load Academic Year details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();

    // Listen to updates in both academic years and semesters to refresh detail page in realtime
    const handleUpdate = () => {
      fetchData();
    };

    window.addEventListener('cpatms_db_update', handleUpdate);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  }, [fetchData]);

  return {
    academicYear,
    semesters,
    stats,
    loading,
    error,
    refresh: fetchData
  };
}
