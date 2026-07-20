import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { roomService, dormitoryService, studentService } from "../services/app.service";
import { Room, Dormitory, Student } from "../types/app";
import { StatusChip } from "../components/StatusChip";
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
  Hotel
} from "lucide-react";

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDormModalOpen, setIsDormModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dormError, setDormError] = useState<string | null>(null);

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

    return () => {
      unsubscribeRooms();
      unsubscribeDorms();
      unsubscribeStudents();
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
    const assignedStudents = students.filter(s => s.roomId === viewingRoom.id);
    const unassignedStudents = students.filter(s => !s.roomId && s.status === 'active');
    const otherRooms = rooms.filter(r => r.id !== viewingRoom.id && r.status === 'active');

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
        </div>

        {/* Room Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Monthly Base Rent", value: `${viewingRoom.monthlyRent || 0} THB`, icon: DollarSign, color: "text-primary bg-primary/5" },
            { label: "Water Rate", value: `${viewingRoom.waterRate || 0} THB/U`, icon: Droplets, color: "text-info bg-info/5" },
            { label: "Electricity Rate", value: `${viewingRoom.electricityRate || 0} THB/U`, icon: Zap, color: "text-warning bg-warning/5" },
            { label: "Bed Occupancy", value: `${assignedStudents.length} / ${viewingRoom.capacity}`, icon: Users, color: "text-success bg-success/5" },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Management */}
          <div className="lg:col-span-1 space-y-8">
            <div className="md-card p-8 space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Resident Allocation</h3>
                <p className="text-xs text-slate-400 font-bold">Assign new students to available beds in this unit.</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="md-label">Candidate Selection</label>
                  <select
                    id="student-to-add"
                    className="md-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                    defaultValue=""
                  >
                    <option value="">-- Select Student Candidate --</option>
                    {unassignedStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={async () => {
                    const selectEl = document.getElementById("student-to-add") as HTMLSelectElement;
                    if (selectEl && selectEl.value) {
                      const studentId = selectEl.value;
                      await studentService.update(studentId, { roomId: viewingRoom.id });
                      selectEl.value = "";
                    }
                  }}
                  className="md-button-filled w-full py-4 flex items-center justify-center gap-3"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Execute Assignment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Table */}
          <div className="lg:col-span-2">
            <DataTable
              title="Current Residents"
              description={`Active occupancy for Unit ${viewingRoom.roomNumber}.`}
              data={assignedStudents}
              searchFields={["fullName", "studentId"]}
              columns={[
                { 
                  header: "Resident Name", 
                  accessor: (student) => (
                    <div className="space-y-0.5">
                      <div className="text-sm font-extrabold text-slate-900">{student.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.studentId}</div>
                    </div>
                  )
                },
                { 
                  header: "Year/Group", 
                  accessor: (student) => (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black">Y{student.yearLevel}</span>
                      <span className="px-2 py-1 bg-primary/5 text-primary rounded text-[10px] font-black">{student.classGroup}</span>
                    </div>
                  )
                },
                { 
                  header: "Relocation", 
                  accessor: (student) => (
                    <select
                      className="md-input py-2 text-xs font-bold appearance-none bg-no-repeat bg-[right_0.5rem_center]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                      value=""
                      onChange={async (e) => {
                        const targetRoomId = e.target.value;
                        if (targetRoomId) {
                          await studentService.update(student.id, { roomId: targetRoomId });
                        }
                      }}
                    >
                      <option value="">Transfer to...</option>
                      {otherRooms.map(r => (
                        <option key={r.id} value={r.id}>
                          Room {r.roomNumber}
                        </option>
                      ))}
                    </select>
                  )
                },
                {
                  header: "Actions",
                  accessor: (student) => (
                    <button
                      onClick={async () => {
                        if (confirm(`Remove ${student.fullName} from this room?`)) {
                          await studentService.update(student.id, { roomId: "" });
                        }
                      }}
                      className="p-2 text-medical-red hover:bg-medical-red/5 rounded-xl transition-all"
                      title="Unassign Student"
                    >
                      <UserMinus className="h-5 w-5" />
                    </button>
                  )
                }
              ]}
            />
          </div>
        </div>
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
