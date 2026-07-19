import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { teacherService } from "../services/app.service";
import { Teacher } from "../types/app";

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    phone: ""
  });

  const fetchData = async () => {
    const data = await teacherService.getAll();
    setTeachers(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedTeacher(null);
    setFormData({ name: "", department: "", phone: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      department: teacher.department,
      phone: teacher.phone
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeacher) {
      await teacherService.update(selectedTeacher.id, formData);
    } else {
      await teacherService.create(formData as any);
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (selectedTeacher) {
      await teacherService.delete(selectedTeacher.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="จัดการข้อมูลอาจารย์"
        data={teachers}
        searchFields={["name", "department"]}
        columns={[
          { 
            header: "ชื่อ-นามสกุล", 
            accessor: (teacher) => (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 overflow-hidden flex items-center justify-center">
                  <img 
                    src="/src/assets/images/nursing_instructor_icon_1784479023431.jpg" 
                    alt={teacher.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span>{teacher.name}</span>
              </div>
            )
          },
          { header: "ภาควิชา", accessor: "department" },
          { header: "เบอร์โทรศัพท์", accessor: "phone" },
        ]}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(teacher) => {
          setSelectedTeacher(teacher);
          setIsDeleteOpen(true);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTeacher ? "แก้ไขข้อมูลอาจารย์" : "เพิ่มข้อมูลอาจารย์"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">ชื่อ-นามสกุล</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">ภาควิชา</label>
            <input
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">เบอร์โทรศัพท์</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
            />
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
        title="ยืนยันการลบข้อมูล"
        message={`คุณต้องการลบข้อมูลอาจารย์ ${selectedTeacher?.name} ใช่หรือไม่?`}
      />
    </div>
  );
}
