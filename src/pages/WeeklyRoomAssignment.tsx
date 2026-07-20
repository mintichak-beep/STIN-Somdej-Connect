import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { roomService, studentService, weeklyRoomAssignmentService, subjectService, dormitoryService } from "../services/app.service";
import { Room, Student, WeeklyRoomAssignment, Subject, Dormitory } from "../types/app";
import { StatusChip } from "../components/StatusChip";
import { Timestamp } from "firebase/firestore";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Search, 
  X, 
  Plus, 
  AlertCircle,
  Home,
  ArrowRight
} from "lucide-react";

export function WeeklyRoomAssignmentPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [weeklyAssignments, setWeeklyAssignments] = useState<WeeklyRoomAssignment[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentFormData, setAssignmentFormData] = useState({
    studentIds: [] as string[],
    startDate: "",
    endDate: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubAll = [
      roomService.onSnapshot([], setRooms),
      dormitoryService.onSnapshot([], setDormitories),
      studentService.onSnapshot([], setStudents),
      subjectService.onSnapshot([], setSubjects),
      weeklyRoomAssignmentService.onSnapshot([], setWeeklyAssignments)
    ];
    return () => unsubAll.forEach(unsub => unsub());
  }, []);

  const weekStart = parseISO(selectedWeek);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const getOccupants = (roomId: string) => {
    return weeklyAssignments.filter(a => 
      a.roomId === roomId && 
      a.status === 'active' &&
      isWithinInterval(weekStart, { 
        start: a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate), 
        end: a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate) 
      })
    );
  };

  const handleAssignStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingRoom) return;
    setIsSaving(true);
    setError(null);

    try {
      const currentOccupants = getOccupants(viewingRoom.id);
      if (currentOccupants.length + assignmentFormData.studentIds.length > viewingRoom.capacity) {
        throw new Error(`Cannot exceed room capacity of ${viewingRoom.capacity} students.`);
      }

      const start = new Date(assignmentFormData.startDate);
      const end = new Date(assignmentFormData.endDate);

      for (const studentId of assignmentFormData.studentIds) {
        const existing = weeklyAssignments.find(a => 
          a.studentId === studentId && 
          a.status === 'active' &&
          isWithinInterval(start, { 
            start: a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate), 
            end: a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate) 
          })
        );

        if (existing) {
          const student = students.find(s => s.id === studentId);
          throw new Error(`Student ${student?.fullName} is already assigned to another room for this period.`);
        }

        await weeklyRoomAssignmentService.create({
          studentId,
          roomId: viewingRoom.id,
          startDate: Timestamp.fromDate(start),
          endDate: Timestamp.fromDate(end),
          status: 'active',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        } as any);
      }

      setIsAssignModalOpen(false);
      setAssignmentFormData({ studentIds: [], startDate: "", endDate: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-3xl border border-outline shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Weekly Room Assignment</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Manage student residents by week and room capacity</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-outline">
          <div className="flex items-center gap-2 px-3">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Week</span>
          </div>
          <input 
            type="date"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-900 outline-none pr-4"
          />
        </div>
      </div>

      <DataTable
        title="Room Occupancy Overview"
        description={`Current assignments for ${format(weekStart, 'MMM do')} - ${format(weekEnd, 'MMM do, yyyy')}`}
        data={rooms.map(r => ({
          ...r,
          dormName: dormitories.find(d => d.id === r.dormitoryId)?.dormitoryName || "N/A",
          occupants: getOccupants(r.id)
        }))}
        searchFields={["roomNumber", "building", "dormName"]}
        emptyTitle="No Rooms Available"
        emptyDescription="No housing units found. Please create rooms in Room Management first."
        columns={[
          { 
            header: "Location", 
            accessor: (r: any) => (
              <div className="space-y-0.5">
                <div className="text-sm font-extrabold text-slate-900">{r.dormName}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Building {r.building} • Unit {r.roomNumber}</div>
              </div>
            )
          },
          { 
            header: "Occupancy", 
            accessor: (r: any) => (
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${r.occupants.length >= r.capacity ? 'bg-medical-red' : 'bg-primary'}`}
                    style={{ width: `${(r.occupants.length / r.capacity) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-black text-slate-600 font-mono">
                  {r.occupants.length}/{r.capacity}
                </span>
              </div>
            ) 
          },
          {
            header: "Current Residents",
            accessor: (r: any) => (
              <div className="flex -space-x-2 overflow-hidden">
                {r.occupants.map((occ: any, i: number) => {
                  const student = students.find(s => s.id === occ.studentId);
                  return (
                    <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500" title={student?.fullName}>
                      {student?.fullName?.charAt(0) || '?'}
                    </div>
                  );
                })}
                {r.occupants.length === 0 && <span className="text-[10px] text-slate-300 italic font-medium">Empty</span>}
              </div>
            )
          },
          {
            header: "Action",
            accessor: (r: any) => (
              <button
                onClick={() => {
                  setViewingRoom(r);
                  setAssignmentFormData({
                    studentIds: [],
                    startDate: format(weekStart, 'yyyy-MM-dd'),
                    endDate: format(weekEnd, 'yyyy-MM-dd')
                  });
                  setIsAssignModalOpen(true);
                }}
                disabled={r.occupants.length >= r.capacity}
                className="md-button-text p-2 flex items-center gap-2 group disabled:opacity-30"
              >
                <UserPlus className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Assign</span>
              </button>
            )
          }
        ]}
      />

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Students to Unit ${viewingRoom?.roomNumber}`}
      >
        <form onSubmit={handleAssignStudents} className="space-y-6">
          {error && (
            <div className="p-4 bg-medical-red/5 text-medical-red text-xs font-bold rounded-2xl border border-medical-red/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="md-label">Find Students (ID or Name)</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by Student ID or Name..."
                value={assignmentSearch}
                onChange={(e) => setAssignmentSearch(e.target.value)}
                className="md-input pl-12"
              />
            </div>

            {assignmentSearch && (
              <div className="mt-2 p-2 bg-slate-50 rounded-2xl border border-outline max-h-48 overflow-y-auto space-y-1">
                {students
                  .filter(s => 
                    !assignmentFormData.studentIds.includes(s.id) &&
                    (s.fullName?.toLowerCase().includes(assignmentSearch.toLowerCase()) || 
                     s.studentId?.toLowerCase().includes(assignmentSearch.toLowerCase()))
                  )
                  .map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setAssignmentFormData(prev => ({
                          ...prev,
                          studentIds: [...prev.studentIds, s.id]
                        }));
                        setAssignmentSearch("");
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-white rounded-xl text-left transition-colors"
                    >
                      <div>
                        <div className="text-sm font-black text-slate-900">{s.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.studentId} • {s.faculty}</div>
                      </div>
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="md-label">Selected Students ({assignmentFormData.studentIds.length})</label>
            <div className="flex flex-wrap gap-2">
              {assignmentFormData.studentIds.map(id => {
                const student = students.find(s => s.id === id);
                return (
                  <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-xs font-black text-primary">
                    <span>{student?.fullName}</span>
                    <button 
                      type="button"
                      onClick={() => setAssignmentFormData(prev => ({
                        ...prev,
                        studentIds: prev.studentIds.filter(x => x !== id)
                      }))}
                      className="hover:text-medical-red transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="md-label">Start Date</label>
              <input type="date" required value={assignmentFormData.startDate} onChange={e => setAssignmentFormData({...assignmentFormData, startDate: e.target.value})} className="md-input" />
            </div>
            <div className="space-y-2">
              <label className="md-label">End Date</label>
              <input type="date" required value={assignmentFormData.endDate} onChange={e => setAssignmentFormData({...assignmentFormData, endDate: e.target.value})} className="md-input" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-outline">
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="md-button-text px-6">Cancel</button>
            <button type="submit" disabled={isSaving || assignmentFormData.studentIds.length === 0} className="md-button-filled px-8 disabled:opacity-50">
              {isSaving ? "Saving..." : "Confirm Assignments"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
