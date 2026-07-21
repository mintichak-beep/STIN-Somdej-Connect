import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Hospital, 
  User, 
  Info,
  CalendarDays,
  LayoutGrid,
  Stethoscope
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, differenceInDays } from 'date-fns';
import { motion } from 'motion/react';
import { 
  clinicalScheduleService, 
  dutyAssignmentService, 
  courseService, 
  clinicalSiteService, 
  wardService, 
  teacherService 
} from '../services/app.service';
import { 
  ClinicalSchedule, 
  DutyAssignment, 
  Course, 
  ClinicalSite, 
  Ward, 
  Teacher 
} from '../types/app';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';

const SHIFTS = [
  { id: 'M', label: 'Morning', icon: '🌅', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { id: 'A', label: 'Afternoon', icon: '🌞', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { id: 'N', label: 'Night', icon: '🌙', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  { id: 'OFF', label: 'Off', icon: '⭐', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'EVA', label: 'Evaluation', icon: '📝', color: 'bg-teal-100 text-teal-600 border-teal-200' },
  { id: 'CL', label: 'Clinical Practice', icon: '🏥', color: 'bg-rose-100 text-rose-600 border-rose-200' },
];

export function StudentClinicalPractice({ studentId }: { studentId: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [schedules, setSchedules] = useState<ClinicalSchedule[]>([]);
  const [dutyAssignments, setDutyAssignments] = useState<DutyAssignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sites, setSites] = useState<ClinicalSite[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [
        scheduleData,
        dutyData,
        courseData,
        siteData,
        wardData,
        teacherData
      ] = await Promise.all([
        clinicalScheduleService.getAll(),
        dutyAssignmentService.getAll(),
        courseService.getAll(),
        clinicalSiteService.getAll(),
        wardService.getAll(),
        teacherService.getAll()
      ]);

      setSchedules(scheduleData);
      setDutyAssignments(dutyData.filter(d => d.studentId === studentId));
      setCourses(courseData);
      setSites(siteData);
      setWards(wardData);
      setTeachers(teacherData);
    };
    fetchData();
  }, [studentId]);

  const timelineDates = useMemo(() => {
    if (schedules.length === 0) return [];
    const minDate = startOfMonth(new Date());
    const maxDate = endOfMonth(addWeeks(new Date(), 8));
    return eachDayOfInterval({ start: minDate, end: maxDate }).filter(d => d.getDay() === 1);
  }, [schedules]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Clinical Practice</h1>
        <p className="text-sm font-medium text-slate-500">Your practice rotation overview and daily shift schedule.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl mb-6">
          <TabsTrigger value="overview" className="rounded-xl px-8 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Rotation Overview
          </TabsTrigger>
          <TabsTrigger value="daily" className="rounded-xl px-8 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            My Daily Shifts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">My Practice Rotations</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {schedules.length === 0 ? (
                <div className="p-20 text-center text-slate-400 font-bold">No practice rotations assigned yet.</div>
              ) : schedules.map(schedule => {
                const course = courses.find(c => c.id === schedule.courseId);
                const site = sites.find(s => s.id === schedule.clinicalSiteId);
                const ward = wards.find(w => w.id === schedule.wardId);
                const teacher = teachers.find(t => t.id === schedule.instructorId);

                return (
                  <div key={schedule.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Stethoscope className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{course?.courseCode}: {course?.courseName}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{site?.name} • {ward?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-bold text-slate-700">{format(parseISO(schedule.startDate), 'MMM d')} - {format(parseISO(schedule.endDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-bold text-slate-700">{teacher?.name || "Pending"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="daily">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dutyAssignments.length === 0 ? (
              <div className="col-span-full bg-white rounded-[40px] border border-slate-100 p-20 text-center text-slate-400 font-bold">
                No shift assignments recorded.
              </div>
            ) : dutyAssignments.sort((a, b) => b.date.localeCompare(a.date)).map(duty => {
              const schedule = schedules.find(s => s.id === duty.scheduleId);
              const site = sites.find(s => s.id === schedule?.clinicalSiteId);
              const ward = wards.find(w => w.id === schedule?.wardId);
              const shiftInfo = SHIFTS.find(s => s.id === duty.shift);

              return (
                <div key={duty.id} className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-6 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border-l border-b border-white/20 ${shiftInfo?.color}`}>
                    {shiftInfo?.icon} {shiftInfo?.label}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">{format(parseISO(duty.date), 'EEEE, MMM d')}</h4>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">{site?.name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Hours</p>
                      <p className="text-sm font-bold text-slate-900">{duty.subShift || "As scheduled"}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ward / Unit</p>
                      <p className="text-sm font-bold text-slate-900">{ward?.name}</p>
                    </div>
                  </div>
                  {duty.remarks && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                      <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-[10px] font-medium text-amber-700 italic">{duty.remarks}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function addWeeks(date: Date, weeks: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}
