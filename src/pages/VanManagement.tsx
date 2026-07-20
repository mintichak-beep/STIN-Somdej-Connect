import { useState, useEffect } from "react";
import { AlertCircle, Bus, Phone, User, Settings, Info, CreditCard, Clock } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { vanService } from "../services/app.service";
import { Van } from "../types/app";
import { StatusChip } from "../components/StatusChip";

export function VanManagement() {
  const [vans, setVans] = useState<Van[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVan, setSelectedVan] = useState<Van | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vanNumber: "",
    plateNumber: "",
    driverName: "",
    driverPhone: "",
    capacity: 0,
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    notes: ""
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
    setFormData({ 
      vanNumber: "", 
      plateNumber: "",
      driverName: "",
      driverPhone: "",
      capacity: 0,
      status: 'active',
      notes: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (van: Van) => {
    setSelectedVan(van);
    setFormData({
      vanNumber: van.vanNumber,
      plateNumber: van.plateNumber,
      driverName: van.driverName,
      driverPhone: van.driverPhone,
      capacity: van.capacity,
      status: van.status,
      notes: van.notes || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const dataToSave = {
        ...formData,
        updatedAt: new Date()
      };
      if (selectedVan) {
        await vanService.update(selectedVan.id, dataToSave);
      } else {
        await vanService.create({
            ...dataToSave,
            createdAt: new Date()
        } as any);
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
        title="Van Fleet Management"
        data={vans}
        searchFields={["vanNumber", "plateNumber"]}
        emptyTitle="No Vehicles Registered"
        emptyDescription="The transport fleet is empty. Click 'Add New Record' to register your first transport vehicle."
        columns={[
          { 
            header: "Vehicle Info", 
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-container flex items-center justify-center text-primary border border-primary/10">
                  <Bus className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{item.plateNumber}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.vanNumber}</span>
                </div>
              </div>
            )
          },
          { 
            header: "Driver Details", 
            accessor: (item) => (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <User className="h-3 w-3 text-primary" />
                  {item.driverName}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-0.5">
                  <Phone className="h-3 w-3" />
                  {item.driverPhone}
                </div>
              </div>
            )
          },
          { 
            header: "Capacity", 
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{item.capacity}</span>
                <span className="text-[10px] font-bold text-slate-400">Seats</span>
              </div>
            )
          },
          { 
            header: "Status", 
            accessor: (item) => (
              <StatusChip 
                status={item.status} 
                variant={
                  item.status === 'active' ? 'success' : 
                  item.status === 'maintenance' ? 'warning' : 'error'
                } 
              />
            ) 
          },
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
        title={selectedVan ? "Edit Vehicle Details" : "Register New Vehicle"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-4 bg-error/10 text-error text-xs font-bold rounded-2xl border border-error/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicle No.</label>
              <div className="relative">
                <Bus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  placeholder="e.g. VAN-01"
                  value={formData.vanNumber}
                  onChange={(e) => setFormData({ ...formData, vanNumber: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plate Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  placeholder="e.g. 1กก-1234"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Driver Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  placeholder="Full name"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  placeholder="e.g. 0812345678"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Passenger Capacity</label>
              <div className="relative">
                <Settings className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  required
                  placeholder="e.g. 12"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Operational Status</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                  >
                    <option value="active">Active (Operational)</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance / Repair</option>
                  </select>
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Internal Notes</label>
            <div className="relative">
              <Info className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <textarea
                placeholder="Maintenance logs, notes, etc..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
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
                "Save Vehicle"
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
        title="Decommission Vehicle"
        message={`Are you sure you want to permanently remove vehicle ${selectedVan?.plateNumber} from the fleet? This action cannot be undone.`}
      />
    </div>
  );
}
