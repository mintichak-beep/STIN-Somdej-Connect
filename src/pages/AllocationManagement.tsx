import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { 
  allocationService, 
  studentService, 
  hospitalService, 
  teacherService, 
  roomService, 
  vanTripService,
  subjectService
} from "../services/app.service";
import { AllocationDetails, Student, Hospital, Teacher, Room, Van, Subject } from "../types/app";
import { Timestamp } from "firebase/firestore";
import { Calendar, User, MapPin, Home, Bus, AlertCircle, BookOpen, Clock, Users } from "lucide-react";
import { motion } from "motion/react";
import { StatusChip } from "../components/StatusChip";

export function AllocationManagement() {
  const [allocations, setAllocations] = useState<AllocationDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [vans, setVans] = useState<Van[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    hospitalId: "",
    teacherId: "",
    roomId: "",
    vanId: "",
    startDate: "",
    endDate: ""
  });

  const fetchData = async () => {
    const [allocs, studs, hosps, tchs, rms, tripsData, subs] = await Promise.all([
      allocationService.getAll(),
      studentService.getAll(),
      hospitalService.getAll(),
      teacherService.getAll(),
      roomService.getAll(),
      vanTripService.getAll(),
      subjectService.getAll()
    ]);

    const mappedVans = tripsData.map((trip: any) => ({
      id: trip.id,
      vanId: trip.id,
      licensePlate: trip.licensePlate || "N/A",
      driverName: trip.driverName || "N/A",
      driverPhone: "",
      seatCapacity: 15,
      status: "Available" as const,
      createdAt: trip.createdAt,
      updatedAt: trip.createdAt
    }));

    setStudents(studs);
    setHospitals(hosps);
    setTeachers(tchs);
    setRooms(rms);
    setVans(mappedVans);
    setSubjects(subs);

    const enriched = allocs.map(a => ({
      ...a,
      student: studs.find(s => s.id === a.studentId),
      hospital: hosps.find(h => h.id === a.hospitalId),
      teacher: tchs.find(t => t.id === a.teacherId),
      room: rms.find(r => r.id === a.roomId),
      van: mappedVans.find(v => v.id === a.vanId)
    }));

    setAllocations(enriched);
  };

  useEffect(() => {
    let allocsList: any[] = [];
    let studsList: any[] = [];
    let hospsList: any[] = [];
    let tchsList: any[] = [];
    let rmsList: any[] = [];
    let tripsList: any[] = [];

    const updateEnriched = () => {
      const mappedVans = tripsList.map((trip: any) => ({
        id: trip.id,
        vanId: trip.id,
        licensePlate: trip.licensePlate || "N/A",
        driverName: trip.driverName || "N/A",
        driverPhone: "",
        seatCapacity: 15,
        status: "Available" as const,
        createdAt: trip.createdAt,
        updatedAt: trip.createdAt
      }));

      const enriched = allocsList.map(a => ({
        ...a,
        student: studsList.find(s => s.id === a.studentId),
        hospital: hospsList.find(h => h.id === a.hospitalId),
        teacher: tchsList.find(t => t.id === a.teacherId),
        room: rmsList.find(r => r.id === a.roomId),
        van: mappedVans.find(v => v.id === a.vanId)
      }));
      setAllocations(enriched);
    };

    const unsubAll = [
      allocationService.onSnapshot([], (data) => {
        allocsList = data;
        updateEnriched();
      }),
      studentService.onSnapshot([], (data) => {
        studsList = data;
        setStudents(data);
        updateEnriched();
      }),
      hospitalService.onSnapshot([], (data) => {
        hospsList = data;
        setHospitals(data);
        updateEnriched();
      }),
      teacherService.onSnapshot([], (data) => {
        tchsList = data;
        setTeachers(data);
        updateEnriched();
      }),
      roomService.onSnapshot([], (data) => {
        rmsList = data;
        setRooms(data);
        updateEnriched();
      }),
      vanTripService.onSnapshot([], (data) => {
        tripsList = data;
        const mappedVans = data.map((trip: any) => ({
          id: trip.id,
          vanId: trip.id,
          licensePlate: trip.licensePlate || "N/A",
          driverName: trip.driverName || "N/A",
          driverPhone: "",
          seatCapacity: 15,
          status: "Available" as const,
          createdAt: trip.createdAt,
          updatedAt: trip.createdAt
        }));
        setVans(mappedVans);
        updateEnriched();
      }),
      subjectService.onSnapshot([], (data) => {
        setSubjects(data);
      })
    ];

    return () => unsubAll.forEach(unsub => unsub());
  }, []);

  const handleOpenAdd = () => {
    setSelectedAllocation(null);
    setFormData({
      studentId: "",
      hospitalId: "",
      teacherId: "",
      roomId: "",
      vanId: "",
      startDate: "",
      endDate: ""
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
        const hospital = hospitals.find(h => h.id === formData.hospitalId);
        const room = rooms.find(r => r.id === formData.roomId);
        const van = vans.find(v => v.id === formData.vanId);

        const hospitalAllocations = allocations.filter(a => a.hospitalId === formData.hospitalId && a.id !== selectedAllocation?.id);
        if (hospital && hospitalAllocations.length >= hospital.quota) {
          setError(`Training center ${hospital.name} has reached its quota (${hospital.quota}).`);
          setIsSaving(false);
          return;
        }

        const roomAllocations = allocations.filter(a => a.roomId === formData.roomId && a.id !== selectedAllocation?.id);
        if (room && roomAllocations.length >= room.capacity) {
          setError(`Room ${room.roomNumber} is at full capacity (${room.capacity}).`);
          setIsSaving(false);
          return;
        }

        const vanAllocations = allocations.filter(a => a.vanId === formData.vanId && a.id !== selectedAllocation?.id);
        if (van && vanAllocations.length >= van.seatCapacity) {
          setError(`Van ${van.licensePlate} is at full capacity (${van.seatCapacity}).`);
          setIsSaving(false);
          return;
        }

        const studentAllocated = allocations.find(a => a.studentId === formData.studentId && a.id !== selectedAllocation?.id);
        if (studentAllocated) {
          setError(`This student has already been allocated.`);
          setIsSaving(false);
          return;
        }

        const data = {
          ...formData,
          startDate: Timestamp.fromDate(new Date(formData.startDate)),
          endDate: Timestamp.fromDate(new Date(formData.endDate))
        };

        if (selectedAllocation) {
          await allocationService.update(selectedAllocation.id, data as any);
        } else {
          await allocationService.create(data as any);
        }
        setIsModalOpen(false);
    } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred during allocation.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedAllocation) {
      await allocationService.delete(selectedAllocation.id);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Weekly Room Assignment & Practice"
        data={allocations}
        searchFields={["id"]}
        columns={[
          { 
            header: "Student & Subject", 
            accessor: (a) => {
              const matchedSubject = subjects.find(s => s.id === a.student?.subjectId);
              return (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-container flex items-center justify-center text-primary border border-primary/10">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{a.student?.fullName || "N/A"}</span>
                    {matchedSubject && (
                      <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {matchedSubject.subjectName}
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          },
          { 
            header: "Training Center", 
            accessor: (a) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{a.hospital?.name || "N/A"}</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> External Practice
                    </span>
                </div>
            )
          },
          { 
            header: "Supervisor", 
            accessor: (a) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                        {a.teacher?.name?.charAt(0) || "T"}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{a.teacher?.name || "N/A"}</span>
                </div>
            )
          },
          { 
            header: "Accommodation", 
            accessor: (a) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{a.room ? `Room ${a.room.roomNumber}` : "N/A"}</span>
                    <span className="text-[10px] font-bold text-slate-400">{a.room?.building || ""}</span>
                </div>
            )
          },
          { 
            header: "Transport", 
            accessor: (a) => (
                <StatusChip status={a.van?.licensePlate || "No Transport"} variant={a.van ? "info" : "warning"} />
            ) 
          },
        ]}
        onAdd={handleOpenAdd}
        onDelete={(a) => {
          setSelectedAllocation(a);
          setIsDeleteOpen(true);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAllocation ? "Update Assignment" : "New Practice Assignment"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-4 bg-error/10 text-error text-xs font-bold rounded-2xl border border-error/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Student</label>
            <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                    <option value="">Choose student...</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.studentId} - {s.fullName}</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Training Center</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                    required
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                    <option value="">Choose center...</option>
                    {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Supervisor</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                    required
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                    <option value="">Choose teacher...</option>
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assigned Room</label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                    <option value="">Choose room...</option>
                    {rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.building} - {r.roomNumber} ({r.currentOccupancy}/{r.capacity})</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Transport Van</label>
              <div className="relative">
                <Bus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                    required
                    value={formData.vanId}
                    onChange={(e) => setFormData({ ...formData, vanId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                    <option value="">Choose van...</option>
                    {vans.map(v => (
                        <option key={v.id} value={v.id}>{v.licensePlate} ({v.seatCapacity} seats)</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assignment Start</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assignment End</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              disabled={isSaving}
            >
                Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Assignment"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        variant="danger"
        title="Void Assignment"
        message={`Are you sure you want to permanently void the assignment for ${selectedAllocation?.student?.fullName}? This will release the quota and room capacity.`}
      />
    </div>
  );
}
