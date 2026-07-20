import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { roomService, dormitoryService, studentService, weeklyRoomAssignmentService, subjectService } from "../services/app.service";
import { Room, Dormitory, Student, WeeklyRoomAssignment, Subject } from "../types/app";
import { StatusChip } from "../components/StatusChip";
import { Timestamp } from "firebase/firestore";
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO } from "date-fns";
import { 
  Home, 
  AlertCircle, 
  ArrowLeft, 
  DollarSign, 
  Droplets, 
  Zap, 
  Users, 
  UserPlus, 
  UserMinus,
  Plus,
  Building2,
  Layers,
  Hash,
  Hotel,
  Search,
  Calendar,
  Check,
  Trash2,
  Edit2,
  Move,
  X
} from "lucide-react";

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [weeklyAssignments, setWeeklyAssignments] = useState<WeeklyRoomAssignment[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDormModalOpen, setIsDormModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dormError, setDormError] = useState<string | null>(null);

  const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentFormData, setAssignmentFormData] = useState({
    studentIds: [] as string[],
    startDate: "",
    endDate: ""
  });
  const [editingAssignment, setEditingAssignment] = useState<WeeklyRoomAssignment | null>(null);
  const [movingAssignment, setMovingAssignment] = useState<WeeklyRoomAssignment | null>(null);

  const [formData, setFormData] = useState({
    dormitoryId: "",
    building: "",
    floor: "",
    roomNumber: "",
    capacity: 4,
    monthlyRent: 3500,
    waterRate: 18,
    electricityRate: 7,
    status: "active" as "active" | "inactive"
  });

  const [dormFormData, setDormFormData] = useState({
    dormitoryName: ""
  });

  const fetchData = async () => {
    try {
      const [roomsData, dormsData, studentsData] = await Promise.all([
        roomService.getAll(),
        dormitoryService.getAll(),
        studentService.getAll()
      ]);
      setRooms(roomsData);
      setDormitories(dormsData);
      setStudents(studentsData);
    } catch (err) {
      console.error("fetchData error:", err);
    }
  };

  useEffect(() => {
    const unsubscribeRooms = roomService.onSnapshot([], (data) => {
      setRooms(data);
      if (viewingRoom) {
        const updated = data.find(r => r.id === viewingRoom.id);
        if (updated) setViewingRoom(updated);
      }
    });
    const unsubscribeDorms = dormitoryService.onSnapshot([], (data) => {
      setDormitories(data);
    });
    const unsubscribeStudents = studentService.onSnapshot([], (data) => {
      setStudents(data);
    });
    const unsubscribeSubjects = subjectService.onSnapshot([], (data) => {
      setSubjects(data);
    });
    const unsubscribeAssignments = weeklyRoomAssignmentService.onSnapshot([], (data) => {
      setWeeklyAssignments(data);
    });

    return () => {
      unsubscribeRooms();
      unsubscribeDorms();
      unsubscribeStudents();
      unsubscribeSubjects();
      unsubscribeAssignments();
    };
  }, [viewingRoom]);

  const handleOpenAdd = () => {
    setSelectedRoom(null);
    setFormData({
      dormitoryId: dormitories[0]?.id || "",
      building: "",
      floor: "",
      roomNumber: "",
      capacity: 4,
      monthlyRent: 3500,
      waterRate: 18,
      electricityRate: 7,
      status: "active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      dormitoryId: room.dormitoryId,
      building: room.building,
      floor: room.floor,
      roomNumber: room.roomNumber,
      capacity: room.capacity || 4,
      monthlyRent: room.monthlyRent || 0,
      waterRate: room.waterRate || 0,
      electricityRate: room.electricityRate || 0,
      status: room.status || "active"
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (selectedRoom) {
        await roomService.update(selectedRoom.id, formData);
      } else {
        await roomService.create(formData as any);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "An error occurred while saving the room data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDorm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setDormError(null);
    try {
      await dormitoryService.create(dormFormData as any);
      setIsDormModalOpen(false);
      setDormFormData({ dormitoryName: "" });
      await fetchData();
    } catch (err: any) {
      console.error("Save dorm error:", err);
      setDormError(err.message || "An error occurred while registering the dormitory.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedRoom) {
      await roomService.delete(selectedRoom.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  // Render detail view if viewing a specific room
  if (viewingRoom) {
    const weekStart = parseISO(selectedWeek);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    const currentAssignments = weeklyAssignments.filter(a => 
      a.roomId === viewingRoom.id && 
      a.status === 'active' &&
      isWithinInterval(weekStart, { 
        start: a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate), 
        end: a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate) 
      })
    );

    const otherRooms = rooms.filter(r => r.id !== viewingRoom.id && r.status === 'active');

    const handleAssignStudents = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      setError(null);

      try {
        if (currentAssignments.length + assignmentFormData.studentIds.length > viewingRoom.capacity) {
          throw new Error(`Cannot exceed room capacity of ${viewingRoom.capacity} students.`);
        }

        const start = new Date(assignmentFormData.startDate);
        const end = new Date(assignmentFormData.endDate);

        for (const studentId of assignmentFormData.studentIds) {
          // Check if student is already assigned elsewhere this week
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

    const handleRemoveAssignment = async (assignmentId: string) => {
      if (confirm("Are you sure you want to remove this assignment?")) {
        await weeklyRoomAssignmentService.delete(assignmentId);
      }
    };

    const handleMoveAssignment = async (assignmentId: string, targetRoomId: string) => {
      const assignment = weeklyAssignments.find(a => a.id === assignmentId);
      if (!assignment) return;

      const targetRoom = rooms.find(r => r.id === targetRoomId);
      if (!targetRoom) return;

      // Check target room capacity
      const targetRoomCurrentOccupants = weeklyAssignments.filter(a => 
        a.roomId === targetRoomId && 
        a.status === 'active' &&
        isWithinInterval(assignment.startDate?.toDate ? assignment.startDate.toDate() : new Date(assignment.startDate), { 
          start: a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate), 
          end: a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate) 
        })
      ).length;

      if (targetRoomCurrentOccupants >= targetRoom.capacity) {
        alert(`Room ${targetRoom.roomNumber} is full for this period.`);
        return;
      }

      await weeklyRoomAssignmentService.update(assignmentId, { 
        roomId: targetRoomId,
        updatedAt: Timestamp.now()
      });
      setMovingAssignment(null);
    };

    const handleUpdateDates = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingAssignment) return;
      setIsSaving(true);
      setError(null);

      try {
        const start = new Date(assignmentFormData.startDate);
        const end = new Date(assignmentFormData.endDate);

        await weeklyRoomAssignmentService.update(editingAssignment.id, {
          startDate: Timestamp.fromDate(start),
          endDate: Timestamp.fromDate(end),
          updatedAt: Timestamp.now()
        });

        setEditingAssignment(null);
        setAssignmentFormData({ studentIds: [], startDate: "", endDate: "" });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setViewingRoom(null)}
              className="md-button-text p-4"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  Unit {viewingRoom.roomNumber}
                </h2>
                <StatusChip status={viewingRoom.status} />
              </div>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Building {viewingRoom.building}, Floor {viewingRoom.floor} • {dormitories.find(d => d.id === viewingRoom.dormitoryId)?.dormitoryName || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-outline shadow-sm">
            <div className="flex items-center gap-2 px-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Week</span>
            </div>
            <input 
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-900 outline-none pr-4"
            />
          </div>
        </div>

        {/* Room Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Monthly Base Rent", value: `${viewingRoom.monthlyRent || 0} THB`, icon: DollarSign, color: "text-primary bg-primary/5" },
            { label: "Water Rate", value: `${viewingRoom.waterRate || 0} THB/U`, icon: Droplets, color: "text-info bg-info/5" },
            { label: "Electricity Rate", value: `${viewingRoom.electricityRate || 0} THB/U`, icon: Zap, color: "text-warning bg-warning/5" },
            { label: "Bed Occupancy", value: `${currentAssignments.length} / ${viewingRoom.capacity}`, icon: Users, color: "text-success bg-success/5" },
          ].map((stat, idx) => (
            <div key={idx} className="md-card p-6 flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 font-mono tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Assigned Students</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Residents for the period of {format(weekStart, 'MMM do')} - {format(weekEnd, 'MMM do, yyyy')}</p>
            </div>
            <button
              onClick={() => {
                setAssignmentFormData({
                  studentIds: [],
                  startDate: format(weekStart, 'yyyy-MM-dd'),
                  endDate: format(weekEnd, 'yyyy-MM-dd')
                });
                setIsAssignModalOpen(true);
              }}
              disabled={currentAssignments.length >= viewingRoom.capacity}
              className="md-button-filled flex items-center gap-3 py-3 px-6 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              <span>Assign Students</span>
            </button>
          </div>

          <div className="md-card overflow-hidden">
            <DataTable
              title="Current Residents"
              searchFields={["studentId"]}
              data={currentAssignments.map(a => {
                const student = students.find(s => s.id === a.studentId);
                const subject = subjects.find(sub => sub.id === student?.subjectId);
                return { ...a, student, subject };
              })}
              columns={[
                {
                  header: "Student ID",
                  accessor: (a: any) => (
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{a.student?.studentId || 'N/A'}</span>
                  )
                },
                {
                  header: "Full Name",
                  accessor: (a: any) => (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-black">
                        {a.student?.fullName?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">{a.student?.fullName || 'N/A'}</span>
                    </div>
                  )
                },
                {
                  header: "Faculty / Major",
                  accessor: (a: any) => (
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{a.student?.faculty || 'N/A'}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{a.student?.major || 'N/A'}</div>
                    </div>
                  )
                },
                {
                  header: "Subject",
                  accessor: (a: any) => (
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{a.subject?.subjectName || 'N/A'}</span>
                  )
                },
                {
                  header: "Period",
                  accessor: (a: any) => (
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {format(a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate), 'dd/MM')} - {format(a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate), 'dd/MM')}
                    </div>
                  )
                },
                {
                  header: "Actions",
                  accessor: (a: any) => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingAssignment(a);
                          setAssignmentFormData({
                            studentIds: [a.studentId],
                            startDate: format(a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate), 'yyyy-MM-dd'),
                            endDate: format(a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate), 'yyyy-MM-dd')
                          });
                        }}
                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Dates"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setMovingAssignment(a)}
                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Move to Another Room"
                      >
                        <Move className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveAssignment(a.id)}
                        className="p-2 text-medical-red hover:bg-medical-red/5 rounded-lg transition-colors"
                        title="Remove Assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>

        {/* Multi-Assign Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Assign Multiple Students"
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
                  placeholder="Search students..."
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
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.studentId}</div>
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
                {assignmentFormData.studentIds.length === 0 && (
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest p-4 text-center w-full bg-slate-50 rounded-2xl border border-dashed border-outline">
                    No students selected
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="md-label">Start Date</label>
                <input 
                  type="date"
                  required
                  value={assignmentFormData.startDate}
                  onChange={(e) => setAssignmentFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label">End Date</label>
                <input 
                  type="date"
                  required
                  value={assignmentFormData.endDate}
                  onChange={(e) => setAssignmentFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="md-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-outline">
              <button 
                type="button" 
                onClick={() => setIsAssignModalOpen(false)} 
                className="md-button-text px-6"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving || assignmentFormData.studentIds.length === 0}
                className="md-button-filled px-8 flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? "Processing..." : "Assign Selection"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Dates Modal */}
        <Modal
          isOpen={!!editingAssignment}
          onClose={() => setEditingAssignment(null)}
          title="Update Assignment Period"
        >
          <form onSubmit={handleUpdateDates} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="md-label">Start Date</label>
                <input 
                  type="date"
                  required
                  value={assignmentFormData.startDate}
                  onChange={(e) => setAssignmentFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label">End Date</label>
                <input 
                  type="date"
                  required
                  value={assignmentFormData.endDate}
                  onChange={(e) => setAssignmentFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="md-input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-outline">
              <button type="button" onClick={() => setEditingAssignment(null)} className="md-button-text px-6">Cancel</button>
              <button type="submit" className="md-button-filled px-8">Save Changes</button>
            </div>
          </form>
        </Modal>

        {/* Move Room Modal */}
        <Modal
          isOpen={!!movingAssignment}
          onClose={() => setMovingAssignment(null)}
          title="Transfer to Another Room"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="md-label">Select Target Room</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {otherRooms.map(r => {
                  const occupants = weeklyAssignments.filter(a => 
                    a.roomId === r.id && 
                    a.status === 'active' &&
                    movingAssignment &&
                    isWithinInterval(movingAssignment.startDate?.toDate ? movingAssignment.startDate.toDate() : new Date(movingAssignment.startDate), { 
                      start: a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate), 
                      end: a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate) 
                    })
                  ).length;
                  const isFull = occupants >= r.capacity;

                  return (
                    <button
                      key={r.id}
                      onClick={() => handleMoveAssignment(movingAssignment!.id, r.id)}
                      disabled={isFull}
                      className="flex flex-col p-4 bg-slate-50 border border-outline rounded-2xl text-left hover:border-primary hover:bg-white transition-all group disabled:opacity-50 disabled:hover:border-outline disabled:hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900">Unit {r.roomNumber}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{occupants}/{r.capacity}</span>
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Building {r.building}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-outline">
              <button onClick={() => setMovingAssignment(null)} className="md-button-text px-6">Cancel</button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-3xl border border-outline shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Housing</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Facility & Accommodation Infrastructure Management</p>
        </div>
        <button 
          onClick={() => setIsDormModalOpen(true)}
          className="md-button-filled flex items-center gap-3 py-4 px-8"
        >
          <Hotel className="h-5 w-5" />
          <span>Register Dormitory</span>
        </button>
      </div>

      <DataTable
        title="Unit Inventory"
        description="Comprehensive index of all dormitory units, occupancy states, and utility rates."
        data={rooms.map(r => ({
          ...r,
          dormName: dormitories.find(d => d.id === r.dormitoryId)?.dormitoryName || "N/A",
          occupancyCount: students.filter(s => s.roomId === r.id).length
        }))}
        searchFields={["dormName", "building", "roomNumber"]}
        emptyTitle="No rooms available."
        emptyDescription="No rooms available. Click 'Add Room' to create one."
        columns={[
          { 
            header: "Location", 
            accessor: (r: any) => (
              <div className="space-y-0.5">
                <div className="text-sm font-extrabold text-slate-900">{r.dormName}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Building {r.building}</div>
              </div>
            ),
            sortable: true
          },
          { 
            header: "Unit Index", 
            accessor: (r: any) => (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase">FL {r.floor}</span>
                <span className="px-2 py-1 bg-primary/5 text-primary rounded text-[10px] font-black uppercase tracking-widest">RM {r.roomNumber}</span>
              </div>
            ),
            sortable: true
          },
          { 
            header: "Base Rent", 
            accessor: (r: any) => (
              <div className="text-sm font-black text-slate-700 font-mono tracking-tight">
                {r.monthlyRent || 0} <span className="text-[10px] text-slate-400">THB</span>
              </div>
            ),
            sortable: true
          },
          { 
            header: "Unit Status", 
            accessor: (r: any) => <StatusChip status={r.status} /> 
          },
          { 
            header: "Occupancy State", 
            accessor: (r: any) => (
              <div className="flex items-center gap-3">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${r.occupancyCount >= r.capacity ? 'bg-medical-red' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, (r.occupancyCount / r.capacity) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-black text-slate-600 font-mono">
                  {r.occupancyCount}/{r.capacity}
                </span>
              </div>
            ) 
          },
          {
            header: "Residents",
            accessor: (r: any) => (
              <button
                onClick={() => setViewingRoom(r)}
                className="md-button-text p-2 flex items-center gap-2 group"
              >
                <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Manage</span>
              </button>
            )
          }
        ]}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(room) => {
          setSelectedRoom(room as Room);
          setIsDeleteOpen(true);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRoom ? "Modify Unit Parameters" : "Provision New Housing Unit"}
      >
        <form onSubmit={handleSave} className="space-y-8">
          {error && (
            <div className="p-5 bg-medical-red/5 text-medical-red text-sm font-bold rounded-2xl border border-medical-red/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-6 w-6 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="md-label flex items-center gap-2">
                <Hotel className="h-3 w-3" />
                Dormitory Assignment
              </label>
              <select
                required
                value={formData.dormitoryId}
                onChange={(e) => setFormData({ ...formData, dormitoryId: e.target.value })}
                className="md-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
              >
                <option value="">Select Target Facility...</option>
                {dormitories.map(d => (
                  <option key={d.id} value={d.id}>{d.dormitoryName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  Building Index
                </label>
                <input
                  required
                  placeholder="e.g. Wing A"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Layers className="h-3 w-3" />
                  Floor Level
                </label>
                <input
                  required
                  placeholder="e.g. 4"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="md-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Unit Number
                </label>
                <input
                  required
                  placeholder="e.g. 401"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Max Bed Capacity
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="md-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="md-label">Base Rent (Monthly)</label>
                <input
                  type="number"
                  required
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label">Water (Rate/Unit)</label>
                <input
                  type="number"
                  required
                  value={formData.waterRate}
                  onChange={(e) => setFormData({ ...formData, waterRate: parseFloat(e.target.value) || 0 })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label">Elec. (Rate/Unit)</label>
                <input
                  type="number"
                  required
                  value={formData.electricityRate}
                  onChange={(e) => setFormData({ ...formData, electricityRate: parseFloat(e.target.value) || 0 })}
                  className="md-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="md-label">Operational Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                className="md-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
              >
                <option value="active">Active (Available for Assignment)</option>
                <option value="inactive">Under Maintenance (Offline)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-outline">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="md-button-text py-3.5 px-8"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="md-button-filled py-3.5 px-10 flex items-center gap-3"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>{selectedRoom ? "Update Unit" : "Deploy Unit"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDormModalOpen}
        onClose={() => setIsDormModalOpen(false)}
        title="Register New Dormitory Facility"
      >
        <form onSubmit={handleSaveDorm} className="space-y-8">
          {dormError && (
            <div className="p-5 bg-medical-red/5 text-medical-red text-sm font-bold rounded-2xl border border-medical-red/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-6 w-6 shrink-0" />
              {dormError}
            </div>
          )}
          <div className="space-y-2">
            <label className="md-label">Facility Name</label>
            <input
              required
              placeholder="e.g. North Wing Residences"
              value={dormFormData.dormitoryName}
              onChange={(e) => setDormFormData({ ...dormFormData, dormitoryName: e.target.value })}
              className="md-input"
            />
          </div>
          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-outline">
            <button 
              type="button" 
              onClick={() => setIsDormModalOpen(false)} 
              className="md-button-text py-3.5 px-8"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="md-button-filled py-3.5 px-10 flex items-center gap-3"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Register Facility</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Decommission Housing Unit"
        message={`Are you sure you want to permanently decommission Unit ${selectedRoom?.roomNumber}? This action will wipe all configuration parameters.`}
      />
    </div>
  );
}
