import { useState, useEffect, useMemo } from "react";
import { academicScheduleService } from "../services/app.service";
import { AcademicSchedule, Milestone } from "../types/app";
import { 
  Calendar as CalendarIcon, 
  Search, 
  X, 
  BookOpen, 
  User, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  Filter,
  ArrowRight,
  Info
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
  differenceInDays,
  startOfToday
} from "date-fns";

export function StudentAcademicSchedule() {
  const [schedules, setSchedules] = useState<AcademicSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filters
  const [filters, setFilters] = useState({
    academicYear: format(new Date(), 'yyyy'),
    semester: "1",
    course: ""
  });

  useEffect(() => {
    const unsub = academicScheduleService.onSnapshot([], (list) => {
      setSchedules(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      return (
        (!filters.academicYear || s.academicYear === filters.academicYear) &&
        (!filters.semester || s.semester === filters.semester) &&
        (!filters.course || 
          s.courseName.toLowerCase().includes(filters.course.toLowerCase()) || 
          s.courseCode.toLowerCase().includes(filters.course.toLowerCase()))
      );
    });
  }, [schedules, filters]);

  // Gantt Logic
  const ganttStart = startOfMonth(subMonths(currentDate, 1));
  const ganttEnd = endOfMonth(addMonths(currentDate, 6));
  const totalDays = differenceInDays(ganttEnd, ganttStart) + 1;

  const timelineMonths = useMemo(() => {
    const months = [];
    let curr = startOfMonth(ganttStart);
    while (curr <= ganttEnd) {
      months.push(curr);
      curr = addMonths(curr, 1);
    }
    return months;
  }, [ganttStart, ganttEnd]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-outline shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Academic Timeline</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Your academic course schedule & milestones
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-outline rounded-2xl">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select 
              value={filters.academicYear} 
              onChange={e => setFilters({...filters, academicYear: e.target.value})}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none"
            >
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y.toString()}>Year {y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-outline rounded-2xl">
            <select 
              value={filters.semester} 
              onChange={e => setFilters({...filters, semester: e.target.value})}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Gantt Card */}
      <div className="bg-white rounded-[2.5rem] border border-outline shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Find a course..."
                value={filters.course}
                onChange={e => setFilters({...filters, course: e.target.value})}
                className="md-input py-2 pl-10 text-xs"
              />
            </div>
            <div className="h-6 w-[1px] bg-outline" />
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 3))} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-xs font-black text-slate-900 min-w-[120px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 3))} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1200px] relative">
            {/* Today Line */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-medical-red z-30 pointer-events-none"
              style={{ left: `${getPosition(format(startOfToday(), 'yyyy-MM-dd'))}%` }}
            >
              <div className="bg-medical-red text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm absolute -top-1 -translate-x-1/2 uppercase tracking-widest">Today</div>
            </div>

            {/* Timeline Headers */}
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

            {/* Course Rows */}
            <div className="relative">
              {filteredSchedules.map((s) => (
                <div key={s.id} className="flex border-b border-outline hover:bg-slate-50 transition-colors group">
                  <div className="w-64 flex-shrink-0 p-6 border-r border-outline space-y-2 bg-white/50 backdrop-blur-sm z-10">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{s.courseCode}</span>
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

                    {/* Timeline Bar */}
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
                <div className="flex border-b border-outline p-24 items-center justify-center text-center">
                  <div className="space-y-4">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No course schedules available for the selected criteria</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
