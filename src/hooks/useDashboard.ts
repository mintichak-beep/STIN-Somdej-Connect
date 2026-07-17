import { useState, useMemo } from 'react';
import { useAuth } from './useAuth';
import { mockDB } from '../services/mockData';
import { dashboardService } from '../services/dashboard.service';
import { DashboardFilters } from '../services/statistics.service';
import { Student, Teacher } from '../types/db';

export function useDashboard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<DashboardFilters>({
    academicYearId: 'ay-2569', // Default active
    semester: '1',
    courseId: '',
    sectionId: '',
    hospitalId: '',
    startDate: '',
    endDate: '',
    searchQuery: ''
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Lists for drop-downs
  const academicYears = useMemo(() => mockDB.getAcademicYears(), []);
  const courses = useMemo(() => mockDB.getCourses(), []);
  const sections = useMemo(() => mockDB.getSections(), []);
  const hospitals = useMemo(() => mockDB.getHospitals(), []);
  const rooms = useMemo(() => mockDB.getRooms(), []);
  const vehicles = useMemo(() => mockDB.getVehicles(), []);
  const schedules = useMemo(() => mockDB.getTransportSchedules(), []);

  // Filter sections dynamically based on selected course
  const filteredSectionsList = useMemo(() => {
    if (!filters.courseId) return sections;
    return sections.filter(s => s.courseId === filters.courseId);
  }, [filters.courseId, sections]);

  // Handle filter changes
  const updateFilter = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      // Reset section if course changes and doesn't belong
      if (key === 'courseId') {
        next.sectionId = '';
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({
      academicYearId: 'ay-2569',
      semester: '1',
      courseId: '',
      sectionId: '',
      hospitalId: '',
      startDate: '',
      endDate: '',
      searchQuery: ''
    });
    showToast('Filters reset to default active academic term');
  };

  // Role Security Gating Checks
  const isStudent = user?.role === 'Student';
  const isTeacher = user?.role === 'Teacher';
  const isAdmin = user?.role === 'Administrator';

  // Quick Action execution wrappers
  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    if (isStudent || isTeacher) {
      showToast('Permission Denied: Only administrators can register students', 'error');
      return;
    }
    try {
      dashboardService.addStudent(studentData, user?.displayName || 'Admin', user?.uid || 'unknown');
      showToast(`Successfully registered student ${studentData.name}`);
    } catch (e: any) {
      showToast(e?.message || 'Failed to register student', 'error');
    }
  };

  const handleAddTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    if (isStudent || isTeacher) {
      showToast('Permission Denied: Only administrators can add teacher profiles', 'error');
      return;
    }
    try {
      dashboardService.addTeacher(teacherData, user?.displayName || 'Admin', user?.uid || 'unknown');
      showToast(`Successfully registered teacher ${teacherData.name}`);
    } catch (e: any) {
      showToast(e?.message || 'Failed to register teacher', 'error');
    }
  };

  const handleAssignRoom = async (roomId: string, studentId: string) => {
    if (isStudent || isTeacher) {
      showToast('Permission Denied: Only administrators can assign dormitories', 'error');
      return;
    }
    try {
      dashboardService.assignRoom(
        roomId, 
        studentId, 
        filters.academicYearId || 'ay-2569', 
        filters.semester || '1',
        user?.displayName || 'Admin', 
        user?.uid || 'unknown'
      );
      showToast('Successfully assigned student to dormitory room');
    } catch (e: any) {
      showToast(e?.message || 'Failed to assign room', 'error');
    }
  };

  const handleAssignTransportation = async (scheduleId: string, studentId: string, pickup: string, dropoff: string) => {
    if (isStudent || isTeacher) {
      showToast('Permission Denied: Only administrators can assign transport routes', 'error');
      return;
    }
    try {
      dashboardService.assignTransportation(
        scheduleId, 
        studentId, 
        pickup, 
        dropoff, 
        user?.displayName || 'Admin', 
        user?.uid || 'unknown'
      );
      showToast('Successfully assigned student to transportation route');
    } catch (e: any) {
      showToast(e?.message || 'Failed to assign transportation', 'error');
    }
  };

  const handleImportExcel = async (csvText: string) => {
    if (isStudent || isTeacher) {
      showToast('Permission Denied: Only administrators can import student data', 'error');
      return;
    }
    try {
      const res = dashboardService.importExcel(csvText, user?.displayName || 'Admin', user?.uid || 'unknown');
      if (res.importedCount > 0) {
        showToast(`Successfully imported ${res.importedCount} student records`);
      }
      if (res.errors.length > 0) {
        // Log errors to console or handle in modal
        console.warn('Excel Import warnings/errors:', res.errors);
        showToast(`Import completed with ${res.errors.length} skipped row(s)`, 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Spreadsheet import failed', 'error');
    }
  };

  const handleExportReport = async (reportType: string) => {
    try {
      // Simulate CSV file download
      const students = mockDB.getStudents();
      const csvHeader = 'StudentID,Name,Email,Phone,CourseID,HospitalID,RoomID\n';
      const csvRows = students.map(s => 
        `"${s.studentId}","${s.name}","${s.email}","${s.phone}","${s.courseId}","${s.hospitalId}","${s.roomId || ''}"`
      ).join('\n');
      
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `STIN_Clinical_Placement_Report_${reportType}_${filters.academicYearId || 'All'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`Exported ${reportType} report successfully`);
    } catch (e: any) {
      showToast('Failed to export CSV report', 'error');
    }
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    academicYears,
    courses,
    sections: filteredSectionsList,
    hospitals,
    rooms,
    vehicles,
    schedules,
    toast,
    showToast,
    isAdmin,
    isTeacher,
    isStudent,
    handleAddStudent,
    handleAddTeacher,
    handleAssignRoom,
    handleAssignTransportation,
    handleImportExcel,
    handleExportReport
  };
}
