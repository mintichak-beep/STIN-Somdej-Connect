import { useState, useEffect } from "react";
import { dutyScheduleService, dormitoryService, studentService } from "../services/app.service";
import { DutySchedule, Dormitory, Student } from "../types/app";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Info,
  CheckCircle2,
  CalendarDays
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
  isAfter,
  isBefore
} from "date-fns";

export function StudentDutySchedule({ studentId }: { studentId: string }) {
  const [myDuties, setMyDuties] = useState<DutySchedule[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const unsubDuties = dutyScheduleService.onSnapshot([], (list) => {
      setMyDuties(list.filter(d => d.assignedStudents.includes(studentId)));
      setLoading(false);
    });
    const unsubDorms = dormitoryService.onSnapshot([], setDormitories);

    return () => {
      unsubDuties();
      unsubDorms();
    };
  }, [studentId]);

  const upcomingDuties = myDuties.filter(d => d.status === 'Upcoming').sort((a, b) => a.dutyDate.localeCompare(b.dutyDate));
  const completedDuties = myDuties.filter(d => d.status === 'Completed').sort((a, b) => b.dutyDate.localeCompare(a.dutyDate));

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Duty Schedule</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Your assigned hospital & dormitory duties
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-outline">
            <button 
              onClick={() => setViewMode('month')}
              className={`p-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'month' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-4 w-4" />
              Calendar
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <List className="h-4 w-4" />
              List View
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-lg font-black text-slate-900">{format(currentDate, 'MMMM yyyy')}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft className="h-5 w-5 text-slate-400" /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-colors">Today</button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight className="h-5 w-5 text-slate-400" /></button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-outline shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-outline bg-slate-50">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                const dayDuties = myDuties.filter(d => isSameDay(parseISO(d.dutyDate), day));
                const isCurrentMonth = isSameMonth(day, monthStart);
                
                return (
                  <div 
                    key={i} 
                    className={`min-h-[120px] p-2 border-r border-b last:border-r-0 border-outline transition-colors ${!isCurrentMonth ? 'bg-slate-50/30' : 'hover:bg-primary/5'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-black p-1.5 rounded-lg ${isSameDay(day, new Date()) ? 'bg-primary text-white shadow-lg shadow-primary/20' : isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}`}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayDuties.map(d => (
                        <div 
                          key={d.id} 
                          className={`p-2 rounded-xl text-[10px] font-bold border transition-all ${
                            d.status === 'Completed' 
                              ? 'bg-medical-teal/5 border-medical-teal/10 text-medical-teal' 
                              : 'bg-primary/5 border-primary/10 text-primary shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="h-2.5 w-2.5" />
                            {d.startTime}
                          </div>
                          <div className="truncate">{d.dutyType}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 ml-4">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Upcoming Duties</h3>
            </div>
            
            <div className="space-y-4">
              {upcomingDuties.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] border border-dashed border-outline text-center space-y-4">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <CalendarIcon className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No upcoming duties scheduled</p>
                </div>
              ) : (
                upcomingDuties.map(d => (
                  <DutyCard key={d.id} duty={d} dormitories={dormitories} />
                ))
              )}
            </div>
          </div>

          {/* History Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 ml-4">
              <div className="h-2 w-2 rounded-full bg-medical-teal" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Completed History</h3>
            </div>

            <div className="space-y-4">
              {completedDuties.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] border border-dashed border-outline text-center space-y-4">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No completed duty records</p>
                </div>
              ) : (
                completedDuties.map(d => (
                  <DutyCard key={d.id} duty={d} dormitories={dormitories} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DutyCard({ duty, dormitories }: { duty: DutySchedule, dormitories: Dormitory[] }) {
  const dorm = dormitories.find(d => d.id === duty.dormitoryId);

  return (
    <div className="bg-white p-6 rounded-3xl border border-outline shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{duty.dutyType}</p>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">{format(parseISO(duty.dutyDate), 'EEEE, MMM do')}</h4>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
          duty.status === 'Completed' ? 'bg-medical-teal/10 text-medical-teal' : 'bg-primary/10 text-primary'
        }`}>
          {duty.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-outline flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duty Time</p>
            <p className="text-sm font-black text-slate-900">{duty.startTime} - {duty.endTime}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-outline flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
            <p className="text-sm font-black text-slate-900 truncate" title={duty.dutyLocation}>{duty.dutyLocation}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-slate-600">Assigned at {dorm?.dormitoryName || "Hospital Facility"}</span>
        </div>
        <div className="flex -space-x-1">
          {[1,2,3].map(i => (
            <div key={i} className="h-5 w-5 rounded-full border border-white bg-slate-200" />
          ))}
          <div className="h-5 w-5 rounded-full border border-white bg-primary flex items-center justify-center text-[8px] font-black text-white">
            +{duty.assignedStudents.length}
          </div>
        </div>
      </div>
    </div>
  );
}
