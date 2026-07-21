import { useState, useEffect, useMemo } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { academicScheduleService, teacherService } from "../services/app.service";
import { AcademicSchedule, Teacher, Milestone } from "../types/app";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  X, 
  BookOpen, 
  User, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Trash2,
  Edit2,
  Filter,
  ArrowRight,
  CheckCircle2,
  Info
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
  differenceInDays,
  addDays,
  isWithinInterval,
  eachWeekOfInterval,
  startOfToday
} from "date-fns";
import { Timestamp } from "firebase/firestore";

export function AcademicScheduleManagement() {
  const [schedules, setSchedules] = useState<AcademicSchedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AcademicSchedule | null>(null);
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt');
  const [timelineMode, setTimelineMode] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filters
  const [filters, setFilters] = useState({
    academicYear: "",
    semester: "",
    department: "",
    status: ""
  });

  const [formData, setFormData] = useState({
    academicYear: format(new Date(), 'yyyy'),
    semester: "1",
    courseCode: "",
    courseName: "",
    instructor: "",
    department: "",
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 4), 'yyyy-MM-dd'),
    milestones: [] as Milestone[],
    status: 'Planned' as 'Planned' | 'Ongoing' | 'Completed'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubSchedules = academicScheduleService.onSnapshot([], setSchedules);
    const unsubTeachers = teacherService.onSnapshot([], setTeachers);

    return () => {
      unsubSchedules();
      unsubTeachers();
    };
  }, []);

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      return (
        (!filters.academicYear || s.academicYear === filters.academicYear) &&
        (!filters.semester || s.semester === filters.semester) &&
        (!filters.department || s.department.toLowerCase().includes(filters.department.toLowerCase())) &&
        (!filters.status || s.status === filters.status)
      );
    });
  }, [schedules, filters]);

  const handleOpenModal = (schedule?: AcademicSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        academicYear: schedule.academicYear,
        semester: schedule.semester,
        courseCode: schedule.courseCode,
        courseName: schedule.courseName,
        instructor: schedule.instructor,
        department: schedule.department,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        milestones: schedule.milestones || [],
        status: schedule.status
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        academicYear: format(new Date(), 'yyyy'),
        semester: "1",
        courseCode: "",
        courseName: "",
        instructor: "",
        department: "",
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addMonths(new Date(), 4), 'yyyy-MM-dd'),
        milestones: [],
        status: 'Planned'
      });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const scheduleData = {
        ...formData,
        updatedAt: Timestamp.now()
      };

      if (editingSchedule) {
        await academicScheduleService.update(editingSchedule.id, scheduleData);
      } else {
        await academicScheduleService.create({
          ...scheduleData,
          createdAt: Timestamp.now()
        } as any);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this course schedule?")) {
      await academicScheduleService.delete(id);
    }
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      type: 'Orientation',
      date: formData.startDate,
      label: ""
    };
    setFormData({
      ...formData,
      milestones: [...formData.milestones, newMilestone]
    });
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index)
    });
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setFormData({ ...formData, milestones: newMilestones });
  };

  // Gantt Chart Logic
  const ganttStart = timelineMode === 'month' 
    ? startOfMonth(subMonths(currentDate, 1))
    : startOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });
    
  const ganttEnd = timelineMode === 'month'
    ? endOfMonth(addMonths(currentDate, 6))
    : endOfWeek(addWeeks(currentDate, 12), { weekStartsOn: 1 });

  const timelineDays = eachDayOfInterval({ start: ganttStart, end: ganttEnd });
  const timelineWeeks = eachWeekOfInterval({ start: ganttStart, end: ganttEnd }, { weekStartsOn: 1 });
  const timelineMonths = useMemo(() => {
    const months = [];
    let curr = startOfMonth(ganttStart);
    while (curr <= ganttEnd) {
      months.push(curr);
      curr = addMonths(curr, 1);
    }
    return months;
  }, [ganttStart, ganttEnd]);

  const totalDays = differenceInDays(ganttEnd, ganttStart) + 1;

  const getPosition = (date: string) => {
    const d = parseISO(date);
    const diff = differenceInDays(d, ganttStart);
    return (diff / totalDays) * 100;
  };

  const getDurationWidth = (start: string, end: string) => {
    const s = parseISO(start);
    const e = parseISO(end);
    const diff = differenceInDays(e, s) + 1;
    return (diff / totalDays) * 100;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-outline shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Academic Gantt Schedule</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Manage and visualize course timelines
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-outline">
            <button 
              onClick={() => setViewMode('gantt')}
              className={`p-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'gantt' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-4 w-4" />
              Timeline
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <List className="h-4 w-4" />
              List View
            </button>
          </div>

          <button 
            onClick={() => handleOpenModal()}
            className="md-button-filled group"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            <span>Add Course Schedule</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-outline shadow-sm grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
          <select 
            value={filters.academicYear}
            onChange={e => setFilters({...filters, academicYear: e.target.value})}
            className="md-input py-2.5 text-xs"
          >
            <option value="">All Years</option>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y.toString()}>{y}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
          <select 
            value={filters.semester}
            onChange={e => setFilters({...filters, semester: e.target.value})}
            className="md-input py-2.5 text-xs"
          >
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="Summer">Summer</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
          <input 
            type="text"
            placeholder="Search dept..."
            value={filters.department}
            onChange={e => setFilters({...filters, department: e.target.value})}
            className="md-input py-2.5 text-xs"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
          <select 
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
            className="md-input py-2.5 text-xs"
          >
            <option value="">All Status</option>
            <option value="Planned">Planned</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button 
          onClick={() => setFilters({ academicYear: "", semester: "", department: "", status: "" })}
          className="md-button-text py-2.5 text-xs h-fit"
        >
          Reset Filters
        </button>
      </div>

      {/* Gantt View */}
      {viewMode === 'gantt' && (
        <div className="bg-white rounded-[2.5rem] border border-outline shadow-sm overflow-hidden flex flex-col">
          {/* Gantt Header */}
          <div className="p-6 border-b border-outline flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="flex bg-white p-1 rounded-xl border border-outline">
                <button 
                  onClick={() => setTimelineMode('week')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timelineMode === 'week' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setTimelineMode('month')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timelineMode === 'month' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'}`}
                >
                  Monthly
                </button>
              </div>
              <div className="h-6 w-[1px] bg-outline" />
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 3))} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-xs font-black text-slate-900 min-w-[120px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 3))} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="overflow-x-auto">
            <div className="min-w-[1200px] relative">
              {/* Vertical Today Line */}
              <div 
                className="absolute top-0 bottom-0 w-[2px] bg-medical-red z-30 pointer-events-none"
                style={{ left: `${getPosition(format(startOfToday(), 'yyyy-MM-dd'))}%` }}
              >
                <div className="bg-medical-red text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm absolute -top-1 -translate-x-1/2 uppercase tracking-widest">Today</div>
              </div>

              {/* Timeline Header (Months/Weeks) */}
              <div className="flex border-b border-outline bg-slate-50 sticky top-0 z-20">
                <div className="w-64 flex-shrink-0 p-4 border-r border-outline font-black text-[10px] text-slate-400 uppercase tracking-widest">Course Schedule</div>
                <div className="flex-1 flex">
                  {timelineMonths.map((m, idx) => (
                    <div 
                      key={idx} 
                      className="border-r border-outline p-4 flex-1 text-center"
                      style={{ flexBasis: `${(30 / totalDays) * 100}%` }}
                    >
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{format(m, 'MMM yyyy')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Grid Rows */}
              <div className="relative">
                {filteredSchedules.map((s, idx) => (
                  <div key={s.id} className="flex border-b border-outline hover:bg-slate-50 transition-colors group">
                    <div className="w-64 flex-shrink-0 p-6 border-r border-outline space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{s.courseCode}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(s)} className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"><Edit2 className="h-3 w-3" /></button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-medical-red/10 rounded-lg text-medical-red transition-colors"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">{s.courseName}</h4>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                        <User className="h-3 w-3" />
                        {s.instructor}
                      </div>
                    </div>
                    <div className="flex-1 relative py-8">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex">
                        {timelineMonths.map((_, i) => (
                          <div key={i} className="flex-1 border-r border-outline/30" />
                        ))}
                      </div>

                      {/* Bar */}
                      <div 
                        className={`absolute h-8 top-1/2 -translate-y-1/2 rounded-full border shadow-sm transition-all z-10 flex items-center px-4 overflow-hidden group/bar ${
                          s.status === 'Ongoing' ? 'bg-primary border-primary text-white' :
                          s.status === 'Completed' ? 'bg-medical-teal border-medical-teal text-white' :
                          'bg-white border-primary/20 text-primary'
                        }`}
                        style={{ 
                          left: `${getPosition(s.startDate)}%`, 
                          width: `${getDurationWidth(s.startDate, s.endDate)}%` 
                        }}
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest truncate">{s.status}</span>
                      </div>

                      {/* Milestones */}
                      {(s.milestones || []).map((m, mIdx) => (
                        <div 
                          key={mIdx}
                          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group/milestone z-20"
                          style={{ left: `${getPosition(m.date)}%` }}
                        >
                          <div className={`w-3 h-3 rotate-45 border-2 border-white shadow-sm mb-1 ${
                            m.type === 'Midterm' || m.type === 'Final Examination' ? 'bg-medical-red' : 'bg-primary'
                          }`} />
                          <div className="absolute top-full mt-2 hidden group-hover:block group-hover/milestone:block z-50">
                            <div className="bg-slate-900 text-white text-[9px] font-bold p-2 rounded-xl whitespace-nowrap shadow-2xl">
                              <p className="text-primary-container mb-1">{m.type}</p>
                              <p>{format(parseISO(m.date), 'MMM d, yyyy')}</p>
                              {m.label && <p className="opacity-70 mt-1 border-t border-white/10 pt-1">{m.label}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredSchedules.length === 0 && (
                  <div className="flex border-b border-outline p-20 items-center justify-center text-center">
                    <div className="space-y-4">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="h-8 w-8 text-slate-200" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No course schedules found matching filters</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <DataTable
          title="Course Schedules"
          description="Detailed list of all academic course schedules"
          data={filteredSchedules}
          searchFields={["courseCode", "courseName", "instructor"]}
          columns={[
            {
              header: "Course",
              accessor: (s) => (
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest">{s.courseCode}</div>
                  <div className="text-sm font-black text-slate-900">{s.courseName}</div>
                </div>
              )
            },
            {
              header: "Period",
              accessor: (s) => (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-700">{s.startDate} to {s.endDate}</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Year {s.academicYear} • Sem {s.semester}
                  </div>
                </div>
              )
            },
            {
              header: "Instructor",
              accessor: (s) => (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                    {s.instructor.charAt(0)}
                  </div>
                  <div className="text-xs font-bold text-slate-700">{s.instructor}</div>
                </div>
              )
            },
            {
              header: "Status",
              accessor: (s) => (
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ${
                  s.status === 'Completed' ? 'bg-medical-teal/10 text-medical-teal' :
                  s.status === 'Ongoing' ? 'bg-primary/10 text-primary' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {s.status}
                </div>
              )
            },
            {
              header: "Actions",
              accessor: (s) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(s)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 hover:bg-medical-red/5 rounded-xl text-medical-red transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            }
          ]}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? "Edit Course Schedule" : "Add Course Schedule"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-medical-red/5 text-medical-red text-xs font-bold rounded-2xl border border-medical-red/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="md-label">Academic Year</label>
              <select required value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} className="md-input">
                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y.toString()}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="md-label">Semester</label>
              <select required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="md-input">
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="md-label">Course Code</label>
              <input type="text" required placeholder="e.g., NUR101" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} className="md-input" />
            </div>
            <div className="space-y-2">
              <label className="md-label">Course Name</label>
              <input type="text" required placeholder="e.g., Introduction to Nursing" value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} className="md-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="md-label">Instructor Name</label>
              <input type="text" required placeholder="Dr. Somchai" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className="md-input" />
            </div>
            <div className="space-y-2">
              <label className="md-label">Department</label>
              <input type="text" required placeholder="Nursing" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="md-input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="md-label">Start Date</label>
              <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="md-input" />
            </div>
            <div className="space-y-2">
              <label className="md-label">End Date</label>
              <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="md-input" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="md-label">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="md-input">
              <option value="Planned">Planned</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="space-y-4 pt-4 border-t border-outline">
            <div className="flex justify-between items-center">
              <label className="md-label mb-0">Milestones ({formData.milestones.length})</label>
              <button type="button" onClick={addMilestone} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-70">
                <Plus className="h-4 w-4" /> Add Milestone
              </button>
            </div>

            <div className="space-y-3">
              {formData.milestones.map((m, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-outline grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                  <button 
                    type="button" 
                    onClick={() => removeMilestone(idx)}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-medical-red text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                    <select value={m.type} onChange={e => updateMilestone(idx, 'type', e.target.value as any)} className="md-input py-2 text-xs">
                      <option value="Orientation">Orientation</option>
                      <option value="Lecture">Lecture</option>
                      <option value="Clinical Practice">Clinical Practice</option>
                      <option value="Midterm">Midterm</option>
                      <option value="Final Examination">Final Examination</option>
                      <option value="Evaluation">Evaluation</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                    <input type="date" value={m.date} onChange={e => updateMilestone(idx, 'date', e.target.value)} className="md-input py-2 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <input type="text" placeholder="Optional label" value={m.label} onChange={e => updateMilestone(idx, 'label', e.target.value)} className="md-input py-2 text-xs" />
                  </div>
                </div>
              ))}
              {formData.milestones.length === 0 && (
                <div className="text-center py-4 border-2 border-dashed border-outline rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No milestones defined for this course</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-outline">
            <button type="button" onClick={() => setIsModalOpen(false)} className="md-button-text px-6">Cancel</button>
            <button type="submit" disabled={isSaving} className="md-button-filled px-8 disabled:opacity-50 min-w-[140px]">
              {isSaving ? "Saving..." : (editingSchedule ? "Update Schedule" : "Create Schedule")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
