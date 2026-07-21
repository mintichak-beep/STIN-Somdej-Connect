import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { dutyScheduleService, studentService, dormitoryService, notificationService } from "../services/app.service";
import { DutySchedule, Student, Dormitory } from "../types/app";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  X, 
  Users, 
  MapPin, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Trash2,
  Edit2
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
  parseISO
} from "date-fns";
import { Timestamp } from "firebase/firestore";

export function DutyScheduleManagement() {
  const [duties, setDuties] = useState<DutySchedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState<DutySchedule | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [formData, setFormData] = useState({
    dutyDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: "08:00",
    endTime: "16:00",
    dutyType: "Morning Shift",
    dutyLocation: "",
    dormitoryId: "",
    assignedStudents: [] as string[],
    status: 'Upcoming' as 'Upcoming' | 'Completed' | 'Cancelled'
  });

  const [studentSearch, setStudentSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubDuties = dutyScheduleService.onSnapshot([], setDuties);
    const unsubStudents = studentService.onSnapshot([], setStudents);
    const unsubDorms = dormitoryService.onSnapshot([], setDormitories);

    return () => {
      unsubDuties();
      unsubStudents();
      unsubDorms();
    };
  }, []);

  const handleOpenModal = (duty?: DutySchedule) => {
    if (duty) {
      setEditingDuty(duty);
      setFormData({
        dutyDate: duty.dutyDate,
        startTime: duty.startTime,
        endTime: duty.endTime,
        dutyType: duty.dutyType,
        dutyLocation: duty.dutyLocation,
        dormitoryId: duty.dormitoryId,
        assignedStudents: duty.assignedStudents,
        status: duty.status
      });
    } else {
      setEditingDuty(null);
      setFormData({
        dutyDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: "08:00",
        endTime: "16:00",
        dutyType: "Morning Shift",
        dutyLocation: "",
        dormitoryId: "",
        assignedStudents: [],
        status: 'Upcoming'
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
      if (formData.assignedStudents.length === 0) {
        throw new Error("Please assign at least one student.");
      }

      const dutyData = {
        ...formData,
        updatedAt: Timestamp.now()
      };

      if (editingDuty) {
        await dutyScheduleService.update(editingDuty.id, dutyData);
        // Send notification for update
        for (const studentId of formData.assignedStudents) {
          await notificationService.create({
            userId: studentId,
            title: "Duty Schedule Updated",
            message: `Your duty on ${formData.dutyDate} (${formData.dutyType}) has been updated.`,
            type: "duty_update",
            isRead: false,
            createdAt: Timestamp.now()
          } as any);
        }
      } else {
        await dutyScheduleService.create({
          ...dutyData,
          createdAt: Timestamp.now()
        } as any);
        // Send notification for new assignment
        for (const studentId of formData.assignedStudents) {
          await notificationService.create({
            userId: studentId,
            title: "New Duty Assigned",
            message: `You have been assigned a new duty on ${formData.dutyDate} at ${formData.dutyLocation}.`,
            type: "duty_assignment",
            isRead: false,
            createdAt: Timestamp.now()
          } as any);
        }
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (dutyId: string) => {
    if (window.confirm("Are you sure you want to delete this duty schedule?")) {
      const duty = duties.find(d => d.id === dutyId);
      await dutyScheduleService.delete(dutyId);
      
      // Send notification for cancellation
      if (duty) {
        for (const studentId of duty.assignedStudents) {
          await notificationService.create({
            userId: studentId,
            title: "Duty Cancelled",
            message: `Your duty on ${duty.dutyDate} has been cancelled.`,
            type: "duty_cancellation",
            isRead: false,
            createdAt: Timestamp.now()
          } as any);
        }
      }
    }
  };

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const renderMonthView = () => (
    <div className="bg-white rounded-3xl border border-outline shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-outline bg-slate-50">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-outline">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const dayDuties = duties.filter(d => isSameDay(parseISO(d.dutyDate), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={i} 
              className={`min-h-[140px] p-2 border-r border-b last:border-r-0 border-outline transition-colors ${!isCurrentMonth ? 'bg-slate-50/50' : 'hover:bg-primary/5'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-black p-1.5 rounded-lg ${isSameDay(day, new Date()) ? 'bg-primary text-white' : isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
                {dayDuties.length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </div>
              <div className="space-y-1">
                {dayDuties.slice(0, 3).map(d => (
                  <div 
                    key={d.id} 
                    onClick={() => handleOpenModal(d)}
                    className="p-1 px-2 bg-primary/10 rounded-lg text-[9px] font-bold text-primary truncate cursor-pointer hover:bg-primary/20 transition-colors"
                  >
                    {d.startTime} {d.dutyType}
                  </div>
                ))}
                {dayDuties.length > 3 && (
                  <div className="text-[9px] font-bold text-slate-400 text-center">
                    + {dayDuties.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-white rounded-3xl border border-outline shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 divide-x divide-outline border-b border-outline">
        {weekDays.map(day => {
          const dayDuties = duties.filter(d => isSameDay(parseISO(d.dutyDate), day));
          return (
            <div key={day.toString()} className="min-h-[500px] flex flex-col">
              <div className={`p-4 text-center border-b border-outline ${isSameDay(day, new Date()) ? 'bg-primary/5' : ''}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{format(day, 'EEE')}</p>
                <p className={`text-lg font-black ${isSameDay(day, new Date()) ? 'text-primary' : 'text-slate-900'}`}>{format(day, 'd')}</p>
              </div>
              <div className="flex-1 p-2 space-y-2 bg-slate-50/30">
                {dayDuties.map(d => (
                  <div 
                    key={d.id} 
                    onClick={() => handleOpenModal(d)}
                    className="p-3 bg-white rounded-2xl border border-outline shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <p className="text-[10px] font-black text-primary uppercase mb-1">{d.startTime} - {d.endTime}</p>
                    <p className="text-xs font-bold text-slate-900 mb-2">{d.dutyType}</p>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{d.dutyLocation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-outline shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Duty Schedule Management</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assign and oversee student duty rosters
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* View Controls */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-outline">
            <button 
              onClick={() => setViewMode('month')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          {viewMode !== 'list' && (
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-outline shadow-sm">
              <button 
                onClick={() => setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 text-sm font-black text-slate-900 min-w-[140px] text-center">
                {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Week of' MMM d")}
              </span>
              <button 
                onClick={() => setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          <button 
            onClick={() => handleOpenModal()}
            className="md-button-filled group"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            <span>Create Duty Schedule</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'list' && (
        <DataTable
          title="Duty Schedule List"
          description="View and manage all assigned duties in list format"
          data={duties.sort((a, b) => b.dutyDate.localeCompare(a.dutyDate))}
          searchFields={["dutyType", "dutyLocation", "dutyDate"]}
          columns={[
            { 
              header: "Duty Details", 
              accessor: (d) => (
                <div className="space-y-1">
                  <div className="text-sm font-black text-slate-900">{d.dutyType}</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <CalendarIcon className="h-3 w-3" />
                    {d.dutyDate} • <Clock className="h-3 w-3 ml-1" /> {d.startTime} - {d.endTime}
                  </div>
                </div>
              )
            },
            { 
              header: "Location", 
              accessor: (d) => (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-700">{d.dutyLocation}</div>
                  <div className="text-[10px] text-primary font-black uppercase tracking-widest">
                    {dormitories.find(dorm => dorm.id === d.dormitoryId)?.dormitoryName || "N/A"}
                  </div>
                </div>
              ) 
            },
            {
              header: "Assigned Students",
              accessor: (d) => (
                <div className="flex -space-x-2">
                  {d.assignedStudents.map(id => {
                    const s = students.find(std => std.id === id);
                    return (
                      <div key={id} className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-outline" title={s?.fullName}>
                        {s?.fullName?.charAt(0) || '?'}
                      </div>
                    );
                  })}
                  <span className="ml-4 text-[10px] font-black text-slate-400 self-center uppercase tracking-widest">
                    {d.assignedStudents.length} Students
                  </span>
                </div>
              )
            },
            {
              header: "Status",
              accessor: (d) => (
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ${
                  d.status === 'Completed' ? 'bg-medical-teal/10 text-medical-teal' :
                  d.status === 'Cancelled' ? 'bg-medical-red/10 text-medical-red' :
                  'bg-primary/10 text-primary'
                }`}>
                  {d.status}
                </div>
              )
            },
            {
              header: "Actions",
              accessor: (d) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(d)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="p-2 hover:bg-medical-red/5 rounded-xl text-medical-red transition-colors">
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
        title={editingDuty ? "Edit Duty Schedule" : "Create New Duty Schedule"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-medical-red/5 text-medical-red text-xs font-bold rounded-2xl border border-medical-red/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="md-label">Duty Date</label>
              <input 
                type="date" 
                required 
                value={formData.dutyDate} 
                onChange={e => setFormData({...formData, dutyDate: e.target.value})}
                className="md-input"
              />
            </div>
            <div className="space-y-2">
              <label className="md-label">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                className="md-input"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="md-label">Start Time</label>
              <input 
                type="time" 
                required 
                value={formData.startTime} 
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="md-input"
              />
            </div>
            <div className="space-y-2">
              <label className="md-label">End Time</label>
              <input 
                type="time" 
                required 
                value={formData.endTime} 
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="md-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="md-label">Duty Type / Shift Name</label>
            <input 
              type="text" 
              placeholder="e.g., Morning Shift, Night Duty, etc."
              required 
              value={formData.dutyType} 
              onChange={e => setFormData({...formData, dutyType: e.target.value})}
              className="md-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="md-label">Dormitory</label>
              <select 
                required 
                value={formData.dormitoryId} 
                onChange={e => setFormData({...formData, dormitoryId: e.target.value})}
                className="md-input"
              >
                <option value="">Select Dormitory...</option>
                {dormitories.map(dorm => (
                  <option key={dorm.id} value={dorm.id}>{dorm.dormitoryName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="md-label">Location Details</label>
              <input 
                type="text" 
                placeholder="e.g., Main Entrance, Floor 3 Lobby"
                required 
                value={formData.dutyLocation} 
                onChange={e => setFormData({...formData, dutyLocation: e.target.value})}
                className="md-input"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-outline">
            <div className="flex justify-between items-center">
              <label className="md-label mb-0">Assign Students ({formData.assignedStudents.length})</label>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Find student..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="md-input py-2 pl-10 text-xs"
                />
              </div>
            </div>

            {studentSearch && (
              <div className="bg-slate-50 rounded-2xl border border-outline max-h-40 overflow-y-auto p-1 space-y-1">
                {students
                  .filter(s => 
                    !formData.assignedStudents.includes(s.id) &&
                    (s.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                     s.studentId?.toLowerCase().includes(studentSearch.toLowerCase()))
                  )
                  .map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          assignedStudents: [...prev.assignedStudents, s.id]
                        }));
                        setStudentSearch("");
                      }}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-white rounded-xl text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                          {s.fullName?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{s.fullName}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{s.studentId}</div>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
              {formData.assignedStudents.map(id => {
                const s = students.find(std => std.id === id);
                return (
                  <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-black text-primary">
                    <span>{s?.fullName}</span>
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        assignedStudents: prev.assignedStudents.filter(x => x !== id)
                      }))}
                      className="hover:text-medical-red transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {formData.assignedStudents.length === 0 && (
                <div className="text-[10px] text-slate-400 italic py-2">No students assigned yet.</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-outline">
            <button type="button" onClick={() => setIsModalOpen(false)} className="md-button-text px-6">Cancel</button>
            <button type="submit" disabled={isSaving} className="md-button-filled px-8 disabled:opacity-50 min-w-[140px]">
              {isSaving ? "Processing..." : (editingDuty ? "Update Schedule" : "Create Schedule")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
