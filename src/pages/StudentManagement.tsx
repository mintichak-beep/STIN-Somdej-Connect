import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlertCircle } from "lucide-react";
import { studentService } from "../services/app.service";
import { Student } from "../types/app";

import { excelUtils } from "../lib/excel";

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    yearLevel: "1",
    classGroup: "",
    phone: "",
    status: "active" as "active" | "inactive"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    const exportData = students.map(({ id, createdAt, updatedAt, ...rest }) => rest);
    excelUtils.exportToExcel(exportData, "students_list");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await excelUtils.importFromExcel(file);
        for (const item of data) {
          await studentService.create({
            studentId: String(item.studentId || ""),
            firstName: item.firstName || "",
            lastName: item.lastName || "",
            fullName: `${item.firstName || ""} ${item.lastName || ""}`,
            yearLevel: String(item.yearLevel || "1"),
            classGroup: item.classGroup || "",
            phone: String(item.phone || ""),
            status: "active"
          } as any);
        }
        fetchData();
        alert("Import สำเร็จ");
      } catch (error) {
        console.error("Import error:", error);
        alert("เกิดข้อผิดพลาดในการ Import");
      }
    }
  };

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setFormData({
      studentId: "",
      firstName: "",
      lastName: "",
      yearLevel: "1",
      classGroup: "",
      phone: "",
      status: "active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      yearLevel: student.yearLevel,
      classGroup: student.classGroup,
      phone: student.phone,
      status: student.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    const data = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`
    };

    try {
      if (selectedStudent) {
        await studentService.update(selectedStudent.id, data);
      } else {
        await studentService.create(data as any);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedStudent) {
      await studentService.delete(selectedStudent.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="จัดการข้อมูลนักศึกษา"
        data={students}
        searchFields={["studentId", "fullName", "phone"]}
        columns={[
          { header: "รหัสนักศึกษา", accessor: "studentId" },
          { header: "ชื่อ-นามสกุล", accessor: "fullName" },
          { header: "ชั้นปี", accessor: "yearLevel" },
          { header: "กลุ่มเรียน", accessor: "classGroup" },
          { header: "เบอร์โทรศัพท์", accessor: "phone" },
          { 
            header: "สถานะ", 
            accessor: (item) => (
              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.status}
              </span>
            ) 
          },
        ]}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(student) => {
          setSelectedStudent(student);
          setIsDeleteOpen(true);
        }}
        onImport={() => document.getElementById("excel-import")?.click()}
        onExport={handleExport}
      />

      <input
        id="excel-import"
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleImport}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? "แก้ไขข้อมูลนักศึกษา" : "เพิ่มข้อมูลนักศึกษา"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">รหัสนักศึกษา</label>
              <input
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">ชื่อ</label>
              <input
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">นามสกุล</label>
              <input
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">ชั้นปี</label>
              <select
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              >
                <option value="1">ปี 1</option>
                <option value="2">ปี 2</option>
                <option value="3">ปี 3</option>
                <option value="4">ปี 4</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">กลุ่มเรียน</label>
              <input
                value={formData.classGroup}
                onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 text-sm font-black text-zinc-500 disabled:opacity-50"
              disabled={isSaving}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-black text-white bg-red-600 rounded-xl shadow-sm shadow-red-100 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="ยืนยันการลบข้อมูล"
        message={`คุณต้องการลบข้อมูลนักศึกษา ${selectedStudent?.fullName} ใช่หรือไม่?`}
      />
    </div>
  );
}
