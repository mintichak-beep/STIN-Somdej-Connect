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
  vanService 
} from "../services/app.service";
import { AllocationDetails, Student, Hospital, Teacher, Room, Van } from "../types/app";
import { Timestamp } from "firebase/firestore";

export function AllocationManagement() {
  const [allocations, setAllocations] = useState<AllocationDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [vans, setVans] = useState<Van[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    const [allocs, studs, hosps, tchs, rms, vns] = await Promise.all([
      allocationService.getAll(),
      studentService.getAll(),
      hospitalService.getAll(),
      teacherService.getAll(),
      roomService.getAll(),
      vanService.getAll()
    ]);

    setStudents(studs);
    setHospitals(hosps);
    setTeachers(tchs);
    setRooms(rms);
    setVans(vns);

    const enriched = allocs.map(a => ({
      ...a,
      student: studs.find(s => s.id === a.studentId),
      hospital: hosps.find(h => h.id === a.hospitalId),
      teacher: tchs.find(t => t.id === a.teacherId),
      room: rms.find(r => r.id === a.roomId),
      van: vns.find(v => v.id === a.vanId)
    }));

    setAllocations(enriched);
  };

  useEffect(() => {
    fetchData();
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
    setError(null);

    // Validation checks
    const hospital = hospitals.find(h => h.id === formData.hospitalId);
    const room = rooms.find(r => r.id === formData.roomId);
    const van = vans.find(v => v.id === formData.vanId);

    // 1. Check hospital quota
    const hospitalAllocations = allocations.filter(a => a.hospitalId === formData.hospitalId && a.id !== selectedAllocation?.id);
    if (hospital && hospitalAllocations.length >= hospital.quota) {
      setError(`แหล่งฝึก ${hospital.name} เต็มโควตาแล้ว (${hospital.quota} คน)`);
      return;
    }

    // 2. Check room capacity
    const roomAllocations = allocations.filter(a => a.roomId === formData.roomId && a.id !== selectedAllocation?.id);
    if (room && roomAllocations.length >= room.capacity) {
      setError(`ห้องพัก ${room.roomNumber} เต็มแล้ว (${room.capacity} เตียง)`);
      return;
    }

    // 3. Check van seats
    const vanAllocations = allocations.filter(a => a.vanId === formData.vanId && a.id !== selectedAllocation?.id);
    if (van && vanAllocations.length >= van.seats) {
      setError(`รถตู้ ${van.plateNumber} เต็มแล้ว (${van.seats} ที่นั่ง)`);
      return;
    }

    // 4. Check if student already allocated
    const studentAllocated = allocations.find(a => a.studentId === formData.studentId && a.id !== selectedAllocation?.id);
    if (studentAllocated) {
      setError(`นักศึกษานี้ถูกจัดสรรไปแล้ว`);
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
    fetchData();
  };

  const handleDelete = async () => {
    if (selectedAllocation) {
      await allocationService.delete(selectedAllocation.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="จัดการจัดสรรฝึกงาน"
        data={allocations}
        searchFields={["id"]}
        columns={[
          { header: "นักศึกษา", accessor: (a) => a.student?.fullName || "N/A" },
          { header: "แหล่งฝึก", accessor: (a) => a.hospital?.name || "N/A" },
          { header: "อาจารย์ที่ปรึกษา", accessor: (a) => a.teacher?.name || "N/A" },
          { header: "ที่พัก", accessor: (a) => a.room ? `${a.room.building} - ${a.room.roomNumber}` : "N/A" },
          { header: "รถตู้", accessor: (a) => a.van?.plateNumber || "N/A" },
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
        title="เพิ่มการจัดสรร"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">เลือกนักศึกษา</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
            >
              <option value="">เลือกนักศึกษา...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.studentId} - {s.fullName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">แหล่งฝึก</label>
              <select
                required
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              >
                <option value="">เลือกแหล่งฝึก...</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name} (โควตา {h.quota})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">อาจารย์</label>
              <select
                required
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              >
                <option value="">เลือกอาจารย์...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">ห้องพัก</label>
              <select
                required
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              >
                <option value="">เลือกห้องพัก...</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.building} - {r.roomNumber} ({r.currentOccupancy}/{r.capacity})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">รถตู้</label>
              <select
                required
                value={formData.vanId}
                onChange={(e) => setFormData({ ...formData, vanId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              >
                <option value="">เลือกรถตู้...</option>
                {vans.map(v => (
                  <option key={v.id} value={v.id}>{v.plateNumber} ({v.seats} ที่นั่ง)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">วันที่เริ่ม</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">วันที่สิ้นสุด</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-black text-zinc-500">ยกเลิก</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-black text-white bg-red-600 rounded-xl shadow-sm shadow-red-100">บันทึก</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="ยืนยันการยกเลิกการจัดสรร"
        message={`คุณต้องการยกเลิกการจัดสรรของ ${selectedAllocation?.student?.fullName} ใช่หรือไม่?`}
      />
    </div>
  );
}
