import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { roomService, dormitoryService, studentService } from "../services/app.service";
import { Room, Dormitory, Student } from "../types/app";
import { Home, Plus } from "lucide-react";

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDormModalOpen, setIsDormModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [formData, setFormData] = useState({
    dormitoryId: "",
    building: "",
    floor: "",
    roomNumber: "",
    capacity: 0,
    currentOccupancy: 0,
    studentId: ""
  });

  const [dormFormData, setDormFormData] = useState({
    dormitoryName: ""
  });

  const fetchData = async () => {
    const [roomsData, dormsData, studentsData] = await Promise.all([
      roomService.getAll(),
      dormitoryService.getAll(),
      studentService.getAll()
    ]);
    setRooms(roomsData);
    setDormitories(dormsData);
    setStudents(studentsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedRoom(null);
    setFormData({ dormitoryId: "", building: "", floor: "", roomNumber: "", capacity: 0, currentOccupancy: 0, studentId: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      dormitoryId: room.dormitoryId,
      building: room.building,
      floor: room.floor,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      currentOccupancy: room.currentOccupancy,
      studentId: room.studentId || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoom) {
      await roomService.update(selectedRoom.id, formData);
    } else {
      await roomService.create(formData as any);
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleSaveDorm = async (e: React.FormEvent) => {
    e.preventDefault();
    await dormitoryService.create(dormFormData as any);
    setIsDormModalOpen(false);
    setDormFormData({ dormitoryName: "" });
    fetchData();
  };

  const handleDelete = async () => {
    if (selectedRoom) {
      await roomService.delete(selectedRoom.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">หอพักและห้องพัก</h2>
        <button 
          onClick={() => setIsDormModalOpen(true)}
          className="px-4 py-2 text-xs font-black text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-100 transition-all flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span>เพิ่มหอพัก</span>
        </button>
      </div>

      <DataTable
        title="จัดการข้อมูลห้องพัก"
        data={rooms.map(r => ({
          ...r,
          dormName: dormitories.find(d => d.id === r.dormitoryId)?.dormitoryName || "N/A",
          studentName: students.find(s => s.id === r.studentId)?.fullName || "ว่าง"
        }))}
        searchFields={["dormName", "building", "roomNumber", "studentName"]}
        columns={[
          { header: "หอพัก", accessor: (r: any) => r.dormName },
          { header: "อาคาร", accessor: "building" },
          { header: "ชั้น", accessor: "floor" },
          { header: "หมายเลขห้อง", accessor: "roomNumber" },
          { header: "ความจุ (เตียง)", accessor: "capacity" },
          { header: "นักศึกษาที่เข้าพัก", accessor: (r: any) => r.studentName },
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
        title={selectedRoom ? "แก้ไขข้อมูลห้องพัก" : "เพิ่มข้อมูลห้องพัก"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">หอพัก</label>
            <select
              required
              value={formData.dormitoryId}
              onChange={(e) => setFormData({ ...formData, dormitoryId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
            >
              <option value="">เลือกหอพัก...</option>
              {dormitories.map(d => (
                <option key={d.id} value={d.id}>{d.dormitoryName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">อาคาร</label>
              <input
                required
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">ชั้น</label>
              <input
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">หมายเลขห้อง</label>
              <input
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">ความจุ (เตียง)</label>
              <input
                type="number"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">นักศึกษาผู้พัก (สำหรับแจ้งหนี้)</label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
            >
              <option value="">-- ยังไม่มีผู้พัก --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-black text-zinc-500">ยกเลิก</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-black text-white bg-red-600 rounded-xl shadow-sm shadow-red-100">บันทึก</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDormModalOpen}
        onClose={() => setIsDormModalOpen(false)}
        title="เพิ่มข้อมูลหอพัก"
      >
        <form onSubmit={handleSaveDorm} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">ชื่อหอพัก</label>
            <input
              required
              value={dormFormData.dormitoryName}
              onChange={(e) => setDormFormData({ ...dormFormData, dormitoryName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsDormModalOpen(false)} className="px-6 py-2.5 text-sm font-black text-zinc-500">ยกเลิก</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-black text-white bg-red-600 rounded-xl shadow-sm shadow-red-100">บันทึก</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="ยืนยันการลบข้อมูล"
        message={`คุณต้องการลบข้อมูลห้องพัก ${selectedRoom?.roomNumber} ใช่หรือไม่?`}
      />
    </div>
  );
}
