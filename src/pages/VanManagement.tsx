import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { vanService } from "../services/app.service";
import { Van } from "../types/app";

export function VanManagement() {
  const [vans, setVans] = useState<Van[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVan, setSelectedVan] = useState<Van | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    plateNumber: "",
    seats: 0
  });

  const fetchData = async () => {
    const data = await vanService.getAll();
    setVans(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedVan(null);
    setFormData({ plateNumber: "", seats: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (van: Van) => {
    setSelectedVan(van);
    setFormData({
      plateNumber: van.plateNumber,
      seats: van.seats
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (selectedVan) {
        await vanService.update(selectedVan.id, formData);
      } else {
        await vanService.create(formData as any);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลรถตู้");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedVan) {
      await vanService.delete(selectedVan.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="จัดการข้อมูลรถตู้"
        data={vans}
        searchFields={["plateNumber"]}
        columns={[
          { header: "เลขทะเบียนรถ", accessor: "plateNumber" },
          { header: "จำนวนที่นั่ง", accessor: "seats" },
        ]}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(van) => {
          setSelectedVan(van);
          setIsDeleteOpen(true);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVan ? "แก้ไขข้อมูลรถตู้" : "เพิ่มข้อมูลรถตู้"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">เลขทะเบียนรถ</label>
            <input
              required
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">จำนวนที่นั่ง</label>
            <input
              type="number"
              required
              value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
            />
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
        message={`คุณต้องการลบข้อมูลรถตู้ ${selectedVan?.plateNumber} ใช่หรือไม่?`}
      />
    </div>
  );
}
