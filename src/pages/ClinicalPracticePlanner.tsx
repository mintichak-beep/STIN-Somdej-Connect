import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  Edit2, 
  Trash2, 
  Hospital, 
  BookOpen, 
  User, 
  Info, 
  CalendarDays, 
  Stethoscope, 
  AlertTriangle,
  UserPlus,
  UserMinus,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  Sunrise,
  ArrowRight,
  Layers,
  Palette
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  parseISO, 
  differenceInDays, 
  addWeeks,
  addDays,
  isWithinInterval,
  isSameDay
} from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { 
  CuteMedicalBadge, 
  CuteEmptyState, 
  CuteMedicalLoadingCard, 
  CuteCharacterBox,
  CUTE_MEDICAL_IMAGES 
} from '../components/CuteMedicalIllustration';
import { 
  clinicalScheduleService, 
  courseService, 
  clinicalSiteService, 
  wardService, 
  studentGroupService,
  studentService,
  teacherService
} from '../services/app.service';
import { 
  ClinicalSchedule, 
  Course, 
  ClinicalSite, 
  Ward, 
  StudentGroup, 
  Student, 
  Teacher 
} from '../types/app';
import { deduplicationService } from '../services/deduplication.service';

const SHIFTS = [
  { id: 'Morning', label: 'Morning (เช้า)', icon: Sunrise, emoji: '🌅', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'Afternoon', label: 'Afternoon (บ่าย)', icon: Sun, emoji: '🌞', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'Night', label: 'Night (ดึก)', icon: Moon, emoji: '🌙', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
];

const PRESET_COLORS = [
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Amber', hex: '#D97706' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Indigo', hex: '#4F46E5' },
];

export function ClinicalPracticePlanner() {
  const [activeTab, setActiveTab] = useState('academic-overview');
  const [loading, setLoading] = useState(true);

  // Firestore Data State
  const [schedules, setSchedules] = useState<ClinicalSchedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sites, setSites] = useState<ClinicalSite[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Filter States
  const [yearFilter, setYearFilter] = useState('2567');
  const [semesterFilter, setSemesterFilter] = useState('1');
  const [courseFilter, setCourseFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [primaryInstructorFilter, setPrimaryInstructorFilter] = useState('all');
  const [secondaryInstructorFilter, setSecondaryInstructorFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyDateFilter, setDailyDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Selected Schedule for Student Assignment Tab
  const [assignmentScheduleId, setAssignmentScheduleId] = useState<string>('');

  // Modals & Dialogs
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isIndividualAssignModalOpen, setIsIndividualAssignModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ClinicalSchedule | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [bypassDup, setBypassDup] = useState(false);

  // Form State
  const [scheduleForm, setScheduleForm] = useState<Partial<ClinicalSchedule>>({
    academicYear: '2567',
    semester: '1',
    courseId: '',
    studentGroupId: '',
    studentIds: [],
    clinicalSiteId: '',
    wardId: '',
    instructorId: '',
    secondaryInstructorId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addWeeks(new Date(), 4), 'yyyy-MM-dd'),
    shift: 'Morning',
    subShift: '',
    remarks: '',
    status: 'Upcoming',
    courseColor: '#0284C7'
  });

  // Individual student assignment picker query
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentForAdd, setSelectedStudentForAdd] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        scheduleData,
        courseData,
        siteData,
        wardData,
        groupData,
        studentData,
        teacherData
      ] = await Promise.all([
        clinicalScheduleService.getAll(),
        courseService.getAll(),
        clinicalSiteService.getAll(),
        wardService.getAll(),
        studentGroupService.getAll(),
        studentService.getAll(),
        teacherService.getAll()
      ]);

      setSchedules(scheduleData);
      setCourses(courseData);
      setSites(siteData);
      setWards(wardData);
      setStudentGroups(groupData);
      setStudents(studentData);
      setTeachers(teacherData);

      if (scheduleData.length > 0 && !assignmentScheduleId) {
        setAssignmentScheduleId(scheduleData[0].id);
      }
    } catch (err) {
      console.error('Error fetching Clinical Planner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper: Get Instructor Display String
  const getInstructorDisplay = (schedule: ClinicalSchedule) => {
    const pTeacher = teachers.find(t => t.id === schedule.instructorId);
    const sTeacher = teachers.find(t => t.id === schedule.secondaryInstructorId);
    if (pTeacher && sTeacher) {
      return `${pTeacher.name} / ${sTeacher.name}`;
    } else if (pTeacher) {
      return pTeacher.name;
    } else if (sTeacher) {
      return sTeacher.name;
    }
    return "ไม่ระบุอาจารย์นิเทศ";
  };

  // Filtered schedules for Academic & Schedule Management views
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const yearMatch = !yearFilter || yearFilter === 'all' || s.academicYear === yearFilter;
      const semesterMatch = !semesterFilter || semesterFilter === 'all' || s.semester === semesterFilter;
      const courseMatch = courseFilter === 'all' || s.courseId === courseFilter;
      const groupMatch = groupFilter === 'all' || s.studentGroupId === groupFilter;
      const siteMatch = siteFilter === 'all' || s.clinicalSiteId === siteFilter;
      const primaryInstMatch = primaryInstructorFilter === 'all' || s.instructorId === primaryInstructorFilter;
      const secondaryInstMatch = secondaryInstructorFilter === 'all' || s.secondaryInstructorId === secondaryInstructorFilter;
      const shiftMatch = shiftFilter === 'all' || s.shift === shiftFilter;
      
      const studentMatch = studentFilter === 'all' || (
        (s.studentIds && s.studentIds.includes(studentFilter)) ||
        (s.studentGroupId && studentGroups.find(g => g.id === s.studentGroupId)?.studentIds?.includes(studentFilter))
      );

      const dateMatch = !dateFilter || (
        s.startDate && s.endDate && parseISO(dateFilter) >= parseISO(s.startDate) && parseISO(dateFilter) <= parseISO(s.endDate)
      );

      const courseObj = courses.find(c => c.id === s.courseId);
      const siteObj = sites.find(st => st.id === s.clinicalSiteId);
      const wardObj = wards.find(w => w.id === s.wardId);
      const primaryTeacher = teachers.find(t => t.id === s.instructorId);
      const secondaryTeacher = teachers.find(t => t.id === s.secondaryInstructorId);
      
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = !searchQuery || 
        (courseObj?.courseCode || '').toLowerCase().includes(searchLower) ||
        (courseObj?.courseName || '').toLowerCase().includes(searchLower) ||
        (siteObj?.name || '').toLowerCase().includes(searchLower) ||
        (wardObj?.name || '').toLowerCase().includes(searchLower) ||
        (primaryTeacher?.name || '').toLowerCase().includes(searchLower) ||
        (secondaryTeacher?.name || '').toLowerCase().includes(searchLower) ||
        (s.remarks || '').toLowerCase().includes(searchLower);

      return yearMatch && semesterMatch && courseMatch && groupMatch && siteMatch && primaryInstMatch && secondaryInstMatch && shiftMatch && studentMatch && dateMatch && searchMatch;
    });
  }, [schedules, yearFilter, semesterFilter, courseFilter, groupFilter, siteFilter, primaryInstructorFilter, secondaryInstructorFilter, shiftFilter, studentFilter, dateFilter, searchQuery, courses, sites, wards, teachers, studentGroups]);

  // Daily Duty schedules
  const dailySchedules = useMemo(() => {
    if (!dailyDateFilter) return [];
    return schedules.filter(s => {
      if (!s.startDate || !s.endDate) return false;
      const target = parseISO(dailyDateFilter);
      const start = parseISO(s.startDate);
      const end = parseISO(s.endDate);
      const inRange = target >= start && target <= end;
      const siteMatch = siteFilter === 'all' || s.clinicalSiteId === siteFilter;
      return inRange && siteMatch;
    });
  }, [schedules, dailyDateFilter, siteFilter]);

  // Selected Schedule for Tab 3 Student Assignment
  const activeAssignmentSchedule = useMemo(() => {
    return schedules.find(s => s.id === assignmentScheduleId) || schedules[0] || null;
  }, [schedules, assignmentScheduleId]);

  // Handler: Open Add Modal
  const handleOpenAddSchedule = () => {
    setSelectedSchedule(null);
    setScheduleForm({
      academicYear: yearFilter !== 'all' ? yearFilter : '2567',
      semester: semesterFilter !== 'all' ? semesterFilter : '1',
      courseId: courseFilter !== 'all' ? courseFilter : (courses[0]?.id || ''),
      studentGroupId: groupFilter !== 'all' ? groupFilter : (studentGroups[0]?.id || ''),
      studentIds: [],
      clinicalSiteId: siteFilter !== 'all' ? siteFilter : (sites[0]?.id || ''),
      wardId: wards[0]?.id || '',
      instructorId: teachers[0]?.id || '',
      secondaryInstructorId: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addWeeks(new Date(), 4), 'yyyy-MM-dd'),
      shift: 'Morning',
      subShift: '',
      remarks: '',
      status: 'Upcoming',
      courseColor: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].hex
    });
    setDupWarning(null);
    setBypassDup(false);
    setIsScheduleModalOpen(true);
  };

  // Handler: Open Edit Modal
  const handleEditSchedule = (schedule: ClinicalSchedule) => {
    setSelectedSchedule(schedule);
    setScheduleForm({
      ...schedule,
      secondaryInstructorId: schedule.secondaryInstructorId || '',
      instructorId: schedule.instructorId || '',
      studentIds: schedule.studentIds || []
    });
    setDupWarning(null);
    setBypassDup(false);
    setIsScheduleModalOpen(true);
  };

  // Handler: Save Schedule (Create / Update)
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!scheduleForm.instructorId) {
        alert('กรุณาเลือกอาจารย์นิเทศหลัก (Primary Instructor)');
        setIsSaving(false);
        return;
      }

      if (scheduleForm.instructorId && scheduleForm.secondaryInstructorId && scheduleForm.instructorId === scheduleForm.secondaryInstructorId) {
        alert('อาจารย์นิเทศหลักและอาจารย์นิเทศร่วมต้องไม่เป็นบุคคลเดียวกัน');
        setIsSaving(false);
        return;
      }

      if (!bypassDup && (scheduleForm.instructorId || scheduleForm.secondaryInstructorId)) {
        const conflictingSchedule = schedules.find(s => {
          if (selectedSchedule && s.id === selectedSchedule.id) return false;
          const instMatch = s.instructorId === scheduleForm.instructorId || s.secondaryInstructorId === scheduleForm.instructorId ||
                            (scheduleForm.secondaryInstructorId && (s.instructorId === scheduleForm.secondaryInstructorId || s.secondaryInstructorId === scheduleForm.secondaryInstructorId));
          if (!instMatch) return false;
          const sStart = parseISO(s.startDate);
          const sEnd = parseISO(s.endDate);
          const fStart = parseISO(scheduleForm.startDate || '');
          const fEnd = parseISO(scheduleForm.endDate || '');
          const overlap = fStart <= sEnd && fEnd >= sStart;
          const shiftMatch = !scheduleForm.shift || !s.shift || scheduleForm.shift === s.shift;
          return overlap && shiftMatch;
        });

        if (conflictingSchedule) {
          setDupWarning(`อาจารย์นิเทศมีตารางสอนซ้ำซ้อนในช่วงวันที่ ${conflictingSchedule.startDate} ถึง ${conflictingSchedule.endDate} (เวร ${conflictingSchedule.shift || 'Morning'}) คุณต้องการยืนยันบันทึกหรือไม่?`);
          setIsSaving(false);
          return;
        }
      }

      if (!bypassDup) {
        const dup = await deduplicationService.checkDuplicateBeforeSave("clinicalSchedules", scheduleForm, selectedSchedule?.id);
        if (dup) {
          const groupName = studentGroups.find(g => g.id === scheduleForm.studentGroupId)?.name || 'Specified Group';
          const wardName = wards.find(w => w.id === scheduleForm.wardId)?.name || 'Specified Ward';
          setDupWarning(`ตารางฝึกปฏิบัติงานของ "${groupName}" ที่หวอร์ด "${wardName}" วันที่เริ่มต้น ${scheduleForm.startDate} มีอยู่ในระบบแล้ว คุณต้องการบันทึกข้อมูลซ้ำหรือไม่?`);
          setIsSaving(false);
          return;
        }
      }

      // Automatically attach group students if studentIds is empty and group is selected
      let finalStudentIds = scheduleForm.studentIds || [];
      if (finalStudentIds.length === 0 && scheduleForm.studentGroupId) {
        const grp = studentGroups.find(g => g.id === scheduleForm.studentGroupId);
        if (grp?.studentIds) {
          finalStudentIds = [...grp.studentIds];
        }
      }

      const payload = {
        ...scheduleForm,
        studentIds: finalStudentIds
      };

      if (selectedSchedule) {
        await clinicalScheduleService.update(selectedSchedule.id, payload);
      } else {
        const newId = await clinicalScheduleService.create(payload as any);
        if (newId) setAssignmentScheduleId(newId);
      }

      setIsScheduleModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Error saving clinical schedule:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Bypass & Save
  const handleBypassAndSave = async () => {
    setDupWarning(null);
    setBypassDup(true);
    setIsSaving(true);
    try {
      let finalStudentIds = scheduleForm.studentIds || [];
      if (finalStudentIds.length === 0 && scheduleForm.studentGroupId) {
        const grp = studentGroups.find(g => g.id === scheduleForm.studentGroupId);
        if (grp?.studentIds) {
          finalStudentIds = [...grp.studentIds];
        }
      }

      const payload = {
        ...scheduleForm,
        studentIds: finalStudentIds
      };

      if (selectedSchedule) {
        await clinicalScheduleService.update(selectedSchedule.id, payload);
      } else {
        const newId = await clinicalScheduleService.create(payload as any);
        if (newId) setAssignmentScheduleId(newId);
      }

      setIsScheduleModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Error saving schedule:', err);
    } finally {
      setIsSaving(false);
      setBypassDup(false);
    }
  };

  // Handler: Delete Schedule
  const handleDeleteSchedule = async () => {
    if (selectedSchedule) {
      await clinicalScheduleService.delete(selectedSchedule.id);
      setIsDeleteModalOpen(false);
      setIsScheduleModalOpen(false);
      await fetchData();
    }
  };

  // Handler: Assign Student Group to Active Schedule
  const handleAssignGroup = async (groupId: string) => {
    if (!activeAssignmentSchedule) return;
    const grp = studentGroups.find(g => g.id === groupId);
    if (!grp || !grp.studentIds) return;

    const currentIds = activeAssignmentSchedule.studentIds || [];
    const mergedIds = Array.from(new Set([...currentIds, ...grp.studentIds]));

    await clinicalScheduleService.update(activeAssignmentSchedule.id, {
      studentGroupId: groupId,
      studentIds: mergedIds
    });
    await fetchData();
  };

  // Handler: Add Individual Student
  const handleAddIndividualStudent = async (studentIdToAdd: string) => {
    if (!activeAssignmentSchedule || !studentIdToAdd) return;
    const currentIds = activeAssignmentSchedule.studentIds || [];
    if (currentIds.includes(studentIdToAdd)) return;

    const updated = [...currentIds, studentIdToAdd];
    await clinicalScheduleService.update(activeAssignmentSchedule.id, {
      studentIds: updated
    });
    setSelectedStudentForAdd('');
    setIsIndividualAssignModalOpen(false);
    await fetchData();
  };

  // Handler: Remove Student Assignment
  const handleRemoveStudent = async (studentIdToRemove: string) => {
    if (!activeAssignmentSchedule) return;
    const currentIds = activeAssignmentSchedule.studentIds || [];
    const updated = currentIds.filter(id => id !== studentIdToRemove);

    await clinicalScheduleService.update(activeAssignmentSchedule.id, {
      studentIds: updated
    });
    await fetchData();
  };

  // Helper for Gantt Timeline Weeks
  const ganttWeeks = useMemo(() => {
    if (filteredSchedules.length === 0) return [];

    let minDate = new Date();
    let maxDate = addWeeks(new Date(), 12);

    filteredSchedules.forEach(s => {
      if (s.startDate) {
        const st = parseISO(s.startDate);
        if (st < minDate) minDate = st;
      }
      if (s.endDate) {
        const ed = parseISO(s.endDate);
        if (ed > maxDate) maxDate = ed;
      }
    });

    const start = startOfMonth(minDate);
    const end = endOfMonth(maxDate);

    // Filter Mondays for week headers
    return eachDayOfInterval({ start, end }).filter(d => d.getDay() === 1);
  }, [filteredSchedules]);

  if (loading) {
    return (
      <div className="py-20">
        <CuteMedicalLoadingCard text="กำลังโหลดระบบจัดการการฝึกปฏิบัติการพยาบาล..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-600 to-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <Stethoscope className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-primary">Clinical Practice Management</span>
              <CuteMedicalBadge icon="stethoscope" text="Central Module" variant="rose" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Clinical Practice Planner</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              ศูนย์รวมการจัดตารางฝึกปฏิบัติการพยาบาล - แหล่งข้อมูลเดียวสำหรับทุกมุมมอง (Single Source of Truth)
            </p>
          </div>
        </div>

        <button 
          onClick={handleOpenAddSchedule}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3.5 rounded-2xl text-xs font-extrabold shadow-lg shadow-primary/25 hover:scale-102 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>สร้างตารางฝึกใหม่</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/80 p-1.5 rounded-3xl mb-8 flex flex-wrap gap-1 border border-slate-200/50">
          <TabsTrigger value="academic-overview" className="rounded-2xl px-6 py-3 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all">
            <LayoutGrid className="h-4 w-4" />
            <span>1. Academic Year Overview</span>
          </TabsTrigger>
          <TabsTrigger value="schedule-management" className="rounded-2xl px-6 py-3 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all">
            <Calendar className="h-4 w-4" />
            <span>2. Schedule Management</span>
          </TabsTrigger>
          <TabsTrigger value="student-assignment" className="rounded-2xl px-6 py-3 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all">
            <Users className="h-4 w-4" />
            <span>3. Student Assignment</span>
          </TabsTrigger>
          <TabsTrigger value="daily-duty" className="rounded-2xl px-6 py-3 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all">
            <Clock className="h-4 w-4" />
            <span>4. Daily Duty View</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* TAB 1: ACADEMIC YEAR OVERVIEW (GANTT VIEW)  */}
        {/* ========================================== */}
        <TabsContent value="academic-overview" className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-xs flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ปีการศึกษา</label>
              <select 
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="all">ทั้งหมด</option>
                <option value="2567">2567</option>
                <option value="2568">2568</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[110px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ภาคเรียน</label>
              <select 
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="all">ทั้งหมด</option>
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">วิชา</label>
              <select 
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="all">ทุกวิชา</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">กลุ่มนักศึกษา</label>
              <select 
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="all">ทุกกลุ่ม</option>
                {studentGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">แหล่งฝึกปฏิบัติ</label>
              <select 
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="all">ทุกแหล่งฝึก</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">อ.นิเทศหลัก</label>
              <select 
                value={primaryInstructorFilter}
                onChange={(e) => setPrimaryInstructorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="all">ทุกอาจารย์หลัก</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">อ.นิเทศร่วม</label>
              <select 
                value={secondaryInstructorFilter}
                onChange={(e) => setSecondaryInstructorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="all">ทุกอาจารย์ร่วม</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">นักศึกษา</label>
              <select 
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="all">ทุกคน</option>
                {students.map(st => (
                  <option key={st.id} value={st.id}>{st.studentId} - {st.firstName} {st.lastName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">เวรปฏิบัติงาน</label>
              <select 
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="all">ทุกเวร</option>
                {SHIFTS.map(sh => (
                  <option key={sh.id} value={sh.id}>{sh.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">วันที่</label>
              <input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-1.5 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          {/* Gantt Timeline Board */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">ภาพรวมไทม์ไลน์การฝึกปฏิบัติ (Academic Timeline Gantt)</h3>
                <p className="text-xs font-semibold text-slate-500">แสดงระยะเวลาฝึก จำนวนนักศึกษาต่อสัปดาห์ แหล่งฝึก และหวอร์ด</p>
              </div>
              <CuteMedicalBadge icon="heart" text={`พบ ${filteredSchedules.length} ตาราง`} variant="blue" />
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* Timeline Header Row */}
                <div className="flex border-b border-slate-200/80 bg-slate-100/60">
                  <div className="w-[320px] border-r border-slate-200/80 p-4 shrink-0 font-extrabold text-xs text-slate-700">
                    รายวิชา / กลุ่มนักศึกษา / แหล่งฝึก
                  </div>
                  <div className="flex-1 flex">
                    {ganttWeeks.map((weekDate, i) => {
                      const isFirstOfMonth = i === 0 || format(ganttWeeks[i-1], 'MMM') !== format(weekDate, 'MMM');
                      return (
                        <div key={i} className="w-16 shrink-0 flex flex-col items-center justify-center py-2 border-r border-slate-200/50 text-center relative">
                          {isFirstOfMonth && (
                            <span className="text-[9px] font-black text-primary uppercase tracking-wider block">
                              {format(weekDate, 'MMM yyyy')}
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-slate-500 uppercase">W{i+1}</span>
                          <span className="text-[10px] font-black text-slate-800">{format(weekDate, 'd/M')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline Body Rows */}
                <div className="divide-y divide-slate-100">
                  {filteredSchedules.length === 0 ? (
                    <CuteEmptyState
                      title="ไม่พบข้อมูลตารางการฝึกปฏิบัติ"
                      description="ลองเปลี่ยนเงื่อนไขการกรอง หรือเพิ่มตารางการฝึกปฏิบัติใหม่"
                      className="py-16"
                    />
                  ) : (
                    filteredSchedules.map((schedule) => {
                      const course = courses.find(c => c.id === schedule.courseId);
                      const group = studentGroups.find(g => g.id === schedule.studentGroupId);
                      const site = sites.find(s => s.id === schedule.clinicalSiteId);
                      const ward = wards.find(w => w.id === schedule.wardId);
                      const teacher = teachers.find(t => t.id === schedule.instructorId);

                      const count = (schedule.studentIds && schedule.studentIds.length > 0)
                        ? schedule.studentIds.length
                        : (group?.studentIds?.length || 0);

                      // Calculate Bar Offsets
                      const firstWeekDate = ganttWeeks[0] || new Date();
                      const start = parseISO(schedule.startDate);
                      const end = parseISO(schedule.endDate);
                      const startOffsetDays = differenceInDays(start, firstWeekDate);
                      const durationDays = differenceInDays(end, start);

                      const dayWidthPx = 64 / 7; // 64px per week (7 days)
                      const leftPosPx = Math.max(0, startOffsetDays * dayWidthPx);
                      const widthPx = Math.max(30, durationDays * dayWidthPx);

                      const barColor = schedule.courseColor || course?.color || '#0284C7';

                      return (
                        <div key={schedule.id} className="flex hover:bg-slate-50/80 transition-colors group">
                          {/* Row Label Sidebar */}
                          <div className="w-[320px] border-r border-slate-100 p-4 shrink-0 flex items-center justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="h-3 w-3 rounded-full shrink-0 shadow-xs" 
                                  style={{ backgroundColor: barColor }} 
                                />
                                <h4 className="text-xs font-black text-slate-900 truncate">
                                  {course?.courseCode}: {course?.courseName}
                                </h4>
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 truncate">
                                {group?.name || "ไม่ระบุกลุ่ม"} • {site?.name} ({ward?.name})
                              </p>
                              <div className="flex items-center gap-2 text-[9px] font-extrabold text-slate-400">
                                <span>จำนวนนักศึกษา: <strong className="text-slate-800">{count} คน</strong></span>
                                <span>•</span>
                                <span>{schedule.shift || "Morning"}</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => handleEditSchedule(schedule)}
                              className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
                              title="แก้ไขตาราง"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Gantt Bar Chart Area */}
                          <div className="flex-1 relative h-20 flex items-center">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex pointer-events-none">
                              {ganttWeeks.map((_, i) => (
                                <div key={i} className="w-16 border-r border-slate-100/80 h-full" />
                              ))}
                            </div>

                            {/* Gantt Bar */}
                            <motion.div 
                              initial={{ opacity: 0, scaleX: 0 }}
                              animate={{ opacity: 1, scaleX: 1 }}
                              style={{ 
                                left: `${leftPosPx}px`, 
                                width: `${widthPx}px`,
                                backgroundColor: barColor,
                                transformOrigin: 'left'
                              }}
                              className="absolute h-11 rounded-xl shadow-md text-white flex items-center px-3 overflow-hidden cursor-pointer hover:brightness-110 transition-all group/bar"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              <div className="min-w-0 text-white">
                                <p className="text-[10px] font-black uppercase tracking-wider truncate leading-tight">
                                  {site?.name}
                                </p>
                                <p className="text-[9px] font-bold opacity-90 truncate leading-tight">
                                  {ward?.name} ({count} คน) • {teacher?.name || "อาจารย์นิเทศ"}
                                </p>
                              </div>

                              <div className="ml-auto shrink-0 opacity-0 group-hover/bar:opacity-100 transition-opacity pl-2">
                                <Info className="h-3.5 w-3.5 text-white" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 2: SCHEDULE MANAGEMENT (CREATE / EDIT) */}
        {/* ========================================== */}
        <TabsContent value="schedule-management" className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="ค้นหารายวิชา, แหล่งฝึก, หวอร์ด..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select 
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 outline-none"
              >
                <option value="all">ทุกวิชา</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.courseCode} {c.courseName}</option>
                ))}
              </select>

              <select 
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold py-2 px-3 outline-none"
              >
                <option value="all">ทุกแหล่งฝึก</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleOpenAddSchedule}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md hover:bg-primary-dark transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>สร้างตารางฝึกปฏิบัติ</span>
            </button>
          </div>

          {/* Schedule List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.length === 0 ? (
              <div className="col-span-full">
                <CuteEmptyState
                  title="ไม่มีรายการตารางฝึกปฏิบัติงาน"
                  description="กดปุ่ม 'สร้างตารางฝึกปฏิบัติ' เพื่อสร้างรายการใหม่เข้าสู่ระบบ"
                />
              </div>
            ) : (
              filteredSchedules.map((schedule) => {
                const course = courses.find(c => c.id === schedule.courseId);
                const group = studentGroups.find(g => g.id === schedule.studentGroupId);
                const site = sites.find(s => s.id === schedule.clinicalSiteId);
                const ward = wards.find(w => w.id === schedule.wardId);
                const teacher = teachers.find(t => t.id === schedule.instructorId);

                const count = (schedule.studentIds && schedule.studentIds.length > 0)
                  ? schedule.studentIds.length
                  : (group?.studentIds?.length || 0);

                const shiftConfig = SHIFTS.find(s => s.id === schedule.shift) || SHIFTS[0];
                const ShiftIcon = shiftConfig.icon;

                return (
                  <motion.div 
                    layout
                    key={schedule.id}
                    className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all space-y-5 relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Color Accent */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-2" 
                      style={{ backgroundColor: schedule.courseColor || course?.color || '#0284C7' }} 
                    />

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                            ปีการศึกษา {schedule.academicYear} / {schedule.semester}
                          </span>
                          <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                            {course?.courseCode}: {course?.courseName || "วิชาการฝึกปฏิบัติงาน"}
                          </h4>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold border shrink-0 ${shiftConfig.color}`}>
                          <ShiftIcon className="h-3 w-3" />
                          <span>{schedule.shift || 'Morning'}</span>
                        </span>
                      </div>

                      {/* Location & Details */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <Hospital className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">{site?.name || "ไม่ระบุแหล่งฝึก"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Building2Icon className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">{ward?.name || "ไม่ระบุหวอร์ด"} ({ward?.department || "แผนก"})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <User className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">อาจารย์: {teacher?.name || "ไม่ระบุอาจารย์นิเทศ"}</span>
                        </div>
                      </div>

                      {/* Schedule Meta */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                          <span className="text-[9px] font-black uppercase text-blue-500 tracking-wider block">กลุ่ม/จำนวน</span>
                          <span className="font-extrabold text-blue-900">{group?.name || "รายบุคคล"} ({count} คน)</span>
                        </div>
                        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                          <span className="text-[9px] font-black uppercase text-purple-500 tracking-wider block">ช่วงเวลา</span>
                          <span className="font-extrabold text-purple-900 truncate block">
                            {schedule.startDate ? format(parseISO(schedule.startDate), 'dd/MM/yy') : '-'} ถึง {schedule.endDate ? format(parseISO(schedule.endDate), 'dd/MM/yy') : '-'}
                          </span>
                        </div>
                      </div>

                      {schedule.remarks && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] font-medium text-amber-800 flex items-start gap-2">
                          <Info className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{schedule.remarks}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button 
                        onClick={() => {
                          setAssignmentScheduleId(schedule.id);
                          setActiveTab('student-assignment');
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>จัดการนักศึกษา</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEditSchedule(schedule)}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-primary rounded-xl transition-colors cursor-pointer"
                          title="แก้ไข"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 3: STUDENT ASSIGNMENT                  */}
        {/* ========================================== */}
        <TabsContent value="student-assignment" className="space-y-6">
          {/* Active Schedule Selection Selector */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-black text-primary uppercase tracking-widest">Select Clinical Schedule</span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">เลือกตารางการฝึกปฏิบัติงานเพื่อจัดสรรนักศึกษา</h3>
              </div>

              <select 
                value={assignmentScheduleId}
                onChange={(e) => setAssignmentScheduleId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold p-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 max-w-md"
              >
                {schedules.map(s => {
                  const course = courses.find(c => c.id === s.courseId);
                  const site = sites.find(st => st.id === s.clinicalSiteId);
                  const ward = wards.find(w => w.id === s.wardId);
                  return (
                    <option key={s.id} value={s.id}>
                      {course?.courseCode} - {site?.name} ({ward?.name}) [{s.startDate} ถึง {s.endDate}]
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Active Schedule Summary Header */}
            {activeAssignmentSchedule ? (
              <div className="p-6 bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 rounded-[28px] border border-sky-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CuteMedicalBadge icon="stethoscope" text={`ปีการศึกษา ${activeAssignmentSchedule.academicYear} / ${activeAssignmentSchedule.semester}`} variant="blue" />
                    <h2 className="text-xl font-black text-slate-900 mt-2">
                      {courses.find(c => c.id === activeAssignmentSchedule.courseId)?.courseCode}: {courses.find(c => c.id === activeAssignmentSchedule.courseId)?.courseName}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsIndividualAssignModalOpen(true)}
                      className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-md hover:bg-primary-dark transition-all cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>เพิ่มนักศึกษารายบุคคล</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-sky-200/50 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">แหล่งฝึกปฏิบัติ</span>
                    <span className="font-extrabold text-slate-800">{sites.find(s => s.id === activeAssignmentSchedule.clinicalSiteId)?.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">หวอร์ด / แผนก</span>
                    <span className="font-extrabold text-slate-800">{wards.find(w => w.id === activeAssignmentSchedule.wardId)?.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">อาจารย์นิเทศ</span>
                    <span className="font-extrabold text-slate-800">{teachers.find(t => t.id === activeAssignmentSchedule.instructorId)?.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">เวรการปฏิบัติงาน</span>
                    <span className="font-extrabold text-slate-800">{activeAssignmentSchedule.shift || "Morning"}</span>
                  </div>
                </div>

                {/* Quick Assign Group Action */}
                <div className="pt-4 border-t border-sky-200/50 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">หรือมอบหมายยกกลุ่มนักศึกษา:</span>
                  <div className="flex flex-wrap gap-2">
                    {studentGroups.map(grp => (
                      <button
                        key={grp.id}
                        onClick={() => handleAssignGroup(grp.id)}
                        className="px-3 py-1.5 bg-white hover:bg-primary hover:text-white text-slate-700 text-xs font-extrabold rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
                      >
                        + เพิ่มกลุ่ม {grp.name} ({grp.studentIds?.length || 0} คน)
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <CuteEmptyState title="ยังไม่ได้เลือกตารางการฝึกปฏิบัติงาน" description="โปรดเลือกตารางการฝึกปฏิบัติจากเมนูด้านบน" />
            )}

            {/* Assigned Students List */}
            {activeAssignmentSchedule && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">
                    รายชื่อนักศึกษาที่ได้รับมอบหมายในตารางนี้ ({activeAssignmentSchedule.studentIds?.length || 0} คน)
                  </h4>
                </div>

                {!activeAssignmentSchedule.studentIds || activeAssignmentSchedule.studentIds.length === 0 ? (
                  <CuteEmptyState
                    title="ยังไม่มีนักศึกษาในตารางนี้"
                    description="กดปุ่ม 'เพิ่มนักศึกษารายบุคคล' หรือเลือกกลุ่มนักศึกษาด้านบนเพื่อมอบหมาย"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {activeAssignmentSchedule.studentIds.map((stId) => {
                      const st = students.find(s => s.id === stId);
                      return (
                        <div 
                          key={stId} 
                          className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-white hover:shadow-xs transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">
                              {st?.firstName?.[0] || "S"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate">{st?.fullName || stId}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">รหัส: {st?.studentId || stId}</p>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleRemoveStudent(stId)}
                            className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="ถอนสิทธิ์นักศึกษาออก"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 4: DAILY DUTY VIEW                      */}
        {/* ========================================== */}
        <TabsContent value="daily-duty" className="space-y-6">
          {/* Date Picker Header */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Sun className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-600">Daily Duty Management</span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">รายการปฏิบัติงานเวรประจำวัน</h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
                <button 
                  onClick={() => {
                    const prev = addDays(parseISO(dailyDateFilter), -1);
                    setDailyDateFilter(format(prev, 'yyyy-MM-dd'));
                  }}
                  className="px-3 py-1.5 hover:bg-white rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  ◄ วันก่อนหน้า
                </button>
                <input 
                  type="date" 
                  value={dailyDateFilter}
                  onChange={(e) => setDailyDateFilter(e.target.value)}
                  className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
                <button 
                  onClick={() => {
                    const next = addDays(parseISO(dailyDateFilter), 1);
                    setDailyDateFilter(format(next, 'yyyy-MM-dd'));
                  }}
                  className="px-3 py-1.5 hover:bg-white rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  วันถัดไป ►
                </button>
              </div>

              <select 
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-extrabold outline-none"
              >
                <option value="all">ทุกแหล่งฝึก</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Daily Duty Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dailySchedules.length === 0 ? (
              <div className="col-span-full">
                <CuteEmptyState
                  title={`ไม่มีเวรปฏิบัติงานในวันที่ ${format(parseISO(dailyDateFilter), 'dd MMMM yyyy')}`}
                  description="สลับวันที่ หรือปรับเปลี่ยนเงื่อนไขตารางการฝึกใน Tab Schedule Management"
                />
              </div>
            ) : (
              dailySchedules.map((schedule) => {
                const course = courses.find(c => c.id === schedule.courseId);
                const site = sites.find(s => s.id === schedule.clinicalSiteId);
                const ward = wards.find(w => w.id === schedule.wardId);
                const teacher = teachers.find(t => t.id === schedule.instructorId);

                const shiftConfig = SHIFTS.find(s => s.id === schedule.shift) || SHIFTS[0];
                const ShiftIcon = shiftConfig.icon;

                const assignedStudentsList = (schedule.studentIds || []).map(id => students.find(s => s.id === id)).filter(Boolean);

                return (
                  <motion.div 
                    layout
                    key={schedule.id}
                    className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm space-y-6 relative overflow-hidden"
                  >
                    {/* Shift Badge Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold border ${shiftConfig.color}`}>
                          <ShiftIcon className="h-4 w-4" />
                          <span>{shiftConfig.label}</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        {schedule.subShift || "08:00 - 16:00"}
                      </span>
                    </div>

                    {/* Course & Location Info */}
                    <div className="space-y-2">
                      <h4 className="text-base font-black text-slate-900">
                        {course?.courseCode}: {course?.courseName}
                      </h4>

                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 text-xs border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-500">แหล่งฝึก:</span>
                          <span className="font-extrabold text-slate-900">{site?.name || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-500">หวอร์ด / แผนก:</span>
                          <span className="font-extrabold text-slate-900">{ward?.name || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-500">อาจารย์ผู้ดูแล:</span>
                          <span className="font-extrabold text-primary">{teacher?.name || "-"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Student Avatars / List */}
                    <div className="space-y-3">
                      <span className="text-xs font-extrabold text-slate-700 block">
                        นักศึกษาผู้ปฏิบัติงาน ({assignedStudentsList.length} คน)
                      </span>

                      {assignedStudentsList.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium italic">ยังไม่ได้จัดสรรรายชื่อนักศึกษา</p>
                      ) : (
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                          {assignedStudentsList.map((st) => (
                            <div key={st?.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl text-xs">
                              <span className="font-bold text-slate-800">{st?.fullName}</span>
                              <span className="text-[10px] font-semibold text-slate-400">{st?.studentId}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Edit Action */}
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          setAssignmentScheduleId(schedule.id);
                          setActiveTab('student-assignment');
                        }}
                        className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black rounded-xl transition-colors cursor-pointer text-center"
                      >
                        จัดการนักศึกษาในตารางนี้
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT CLINICAL SCHEDULE     */}
      {/* ========================================== */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={selectedSchedule ? "แก้ไขตารางการฝึกปฏิบัติงาน" : "สร้างตารางการฝึกปฏิบัติงานใหม่"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-6">
          {dupWarning && (
            <div className="p-4 bg-amber-50 text-amber-900 text-xs rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">แจ้งเตือนข้อมูลซ้ำซ้อน</p>
                  <p className="mt-1 leading-relaxed">{dupWarning}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={handleBypassAndSave}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition-colors cursor-pointer"
                >
                  ยืนยันบันทึกซ้ำ
                </button>
                <button 
                  type="button" 
                  onClick={() => setDupWarning(null)}
                  className="px-4 py-2 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">ปีการศึกษา *</label>
              <input 
                type="text" 
                required
                value={scheduleForm.academicYear}
                onChange={(e) => setScheduleForm({...scheduleForm, academicYear: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">ภาคเรียน *</label>
              <select 
                required
                value={scheduleForm.semester}
                onChange={(e) => setScheduleForm({...scheduleForm, semester: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
                <option value="3">ภาคฤดูร้อน</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">สีประจำวิชา (Gantt Color)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={scheduleForm.courseColor || '#0284C7'}
                  onChange={(e) => setScheduleForm({...scheduleForm, courseColor: e.target.value})}
                  className="h-10 w-12 rounded-xl cursor-pointer border-none bg-transparent"
                />
                <span className="text-xs font-extrabold text-slate-600">{scheduleForm.courseColor}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">รายวิชาการฝึก *</label>
              <select 
                required
                value={scheduleForm.courseId}
                onChange={(e) => setScheduleForm({...scheduleForm, courseId: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">เลือกรายวิชา</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.courseCode} {c.courseName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">กลุ่มนักศึกษาหลัก *</label>
              <select 
                value={scheduleForm.studentGroupId}
                onChange={(e) => setScheduleForm({...scheduleForm, studentGroupId: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">เลือกกลุ่มนักศึกษา</option>
                {studentGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.studentIds?.length || 0} คน)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">แหล่งฝึกปฏิบัติ *</label>
              <select 
                required
                value={scheduleForm.clinicalSiteId}
                onChange={(e) => setScheduleForm({...scheduleForm, clinicalSiteId: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">เลือกแหล่งฝึก</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">หวอร์ด / แผนก *</label>
              <select 
                required
                value={scheduleForm.wardId}
                onChange={(e) => setScheduleForm({...scheduleForm, wardId: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">เลือกหวอร์ด</option>
                {wards.filter(w => !scheduleForm.clinicalSiteId || w.clinicalSiteId === scheduleForm.clinicalSiteId).map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.department})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Multi-Instructor Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            {/* Primary Instructor */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-primary tracking-wider block">
                อาจารย์นิเทศหลัก (Primary Instructor) *
              </label>
              <select 
                required
                value={scheduleForm.instructorId || ''}
                onChange={(e) => setScheduleForm({...scheduleForm, instructorId: e.target.value})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">เลือกอาจารย์นิเทศหลัก</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id} disabled={t.id === scheduleForm.secondaryInstructorId}>
                    {t.name} {t.employeeId ? `(${t.employeeId})` : ''} - {t.department}
                  </option>
                ))}
              </select>

              {scheduleForm.instructorId && (() => {
                const t = teachers.find(tr => tr.id === scheduleForm.instructorId);
                if (!t) return null;
                return (
                  <div className="p-3 bg-white rounded-xl border border-blue-100 flex items-center gap-3 shadow-2xs">
                    <img 
                      src={t.photoUrl || CUTE_MEDICAL_IMAGES.nursingStudent} 
                      alt={t.name}
                      className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 text-xs">
                      <p className="font-black text-slate-900 truncate">{t.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 truncate">
                        ID: {t.employeeId || '-'} • ภาควิชา: {t.department}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">โทร: {t.phone || '-'}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Secondary Instructor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  อาจารย์นิเทศร่วม (Secondary Instructor - Optional)
                </label>
                {scheduleForm.secondaryInstructorId && (
                  <button
                    type="button"
                    onClick={() => setScheduleForm({...scheduleForm, secondaryInstructorId: ''})}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    ลบออก
                  </button>
                )}
              </div>
              <select 
                value={scheduleForm.secondaryInstructorId || ''}
                onChange={(e) => setScheduleForm({...scheduleForm, secondaryInstructorId: e.target.value})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- ไม่ระบุ (มี 1 ท่าน) --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id} disabled={t.id === scheduleForm.instructorId}>
                    {t.name} {t.employeeId ? `(${t.employeeId})` : ''} - {t.department}
                  </option>
                ))}
              </select>

              {scheduleForm.secondaryInstructorId && (() => {
                const t = teachers.find(tr => tr.id === scheduleForm.secondaryInstructorId);
                if (!t) return null;
                return (
                  <div className="p-3 bg-white rounded-xl border border-purple-100 flex items-center gap-3 shadow-2xs">
                    <img 
                      src={t.photoUrl || CUTE_MEDICAL_IMAGES.nursingStudent} 
                      alt={t.name}
                      className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 text-xs">
                      <p className="font-black text-slate-900 truncate">{t.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 truncate">
                        ID: {t.employeeId || '-'} • ภาควิชา: {t.department}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">โทร: {t.phone || '-'}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">ผลัดการปฏิบัติงาน (Shift) *</label>
              <select 
                required
                value={scheduleForm.shift}
                onChange={(e) => setScheduleForm({...scheduleForm, shift: e.target.value as any})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Morning">Morning (เวรเช้า)</option>
                <option value="Afternoon">Afternoon (เวรบ่าย)</option>
                <option value="Night">Night (เวรดึก)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">ช่วงเวลาปฏิบัติงาน (Sub Shift)</label>
              <input 
                type="text" 
                placeholder="เช่น 08:00 - 16:00"
                value={scheduleForm.subShift || ''}
                onChange={(e) => setScheduleForm({...scheduleForm, subShift: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">วันที่เริ่มต้น *</label>
              <input 
                type="date" 
                required
                value={scheduleForm.startDate}
                onChange={(e) => setScheduleForm({...scheduleForm, startDate: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">วันที่สิ้นสุด *</label>
              <input 
                type="date" 
                required
                value={scheduleForm.endDate}
                onChange={(e) => setScheduleForm({...scheduleForm, endDate: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">หมายเหตุเพิ่มเติม (Remarks)</label>
            <textarea 
              rows={2}
              value={scheduleForm.remarks || ''}
              onChange={(e) => setScheduleForm({...scheduleForm, remarks: e.target.value})}
              placeholder="ระบุหมายเหตุหรือข้อปฏิบัติตนเพิ่มเติม..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึกตารางฝึกปฏิบัติ"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: ADD INDIVIDUAL STUDENT TO SCHEDULE  */}
      {/* ========================================== */}
      <Modal
        isOpen={isIndividualAssignModalOpen}
        onClose={() => setIsIndividualAssignModalOpen(false)}
        title="เลือกเพิ่มนักศึกษารายบุคคล"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ หรือ รหัสนักศึกษา..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {students
              .filter(st => {
                const searchLower = studentSearch.toLowerCase();
                return st.fullName.toLowerCase().includes(searchLower) || st.studentId.includes(searchLower);
              })
              .map(st => {
                const isAlreadyAssigned = activeAssignmentSchedule?.studentIds?.includes(st.id);
                return (
                  <div key={st.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xs font-black text-slate-900">{st.fullName}</p>
                      <p className="text-[10px] font-bold text-slate-400">รหัส: {st.studentId}</p>
                    </div>

                    {isAlreadyAssigned ? (
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        มอบหมายแล้ว
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleAddIndividualStudent(st.id)}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
                      >
                        + เพิ่ม
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSchedule}
        title="ยืนยันการลบตารางการฝึกปฏิบัติงาน"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบรายการตารางนี้ การลบจะทำให้อัปเดตข้อมูลถูกถอดถอนออกจากทุกมุมมอง"
      />
    </div>
  );
}

function Building2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0 2 2h-4" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
