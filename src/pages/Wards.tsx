import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, MapPin, Layers, AlertTriangle } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { wardService, clinicalSiteService } from '../services/app.service';
import { Ward, ClinicalSite } from '../types/app';
import { StatusChip } from '../components/StatusChip';
import { deduplicationService } from '../services/deduplication.service';

export function Wards() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [sites, setSites] = useState<ClinicalSite[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);

  const [formData, setFormData] = useState<Partial<Ward>>({
    name: '',
    department: '',
    clinicalSiteId: '',
    status: 'active'
  });

  const fetchData = async () => {
    const [wardData, siteData] = await Promise.all([
      wardService.getAll(),
      clinicalSiteService.getAll()
    ]);
    setWards(wardData);
    setSites(siteData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedWard(null);
    setFormData({
      name: '',
      department: '',
      clinicalSiteId: '',
      status: 'active'
    });
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ward: Ward) => {
    setSelectedWard(ward);
    setFormData(ward);
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!bypassDuplicate) {
        const dup = await deduplicationService.checkDuplicateBeforeSave("wards", formData, selectedWard?.id);
        if (dup) {
          const site = sites.find(s => s.id === formData.clinicalSiteId);
          setDuplicateWarning(`A ward with matching name "${formData.name}" already exists for clinical site "${site?.name || 'Selected Site'}". Do you want to proceed and create a duplicate?`);
          setIsSaving(false);
          return;
        }
      }

      if (selectedWard) {
        await wardService.update(selectedWard.id, formData);
      } else {
        await wardService.create(formData as any);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving ward:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBypassAndSave = async () => {
    setDuplicateWarning(null);
    setBypassDuplicate(true);
    setIsSaving(true);
    try {
      if (selectedWard) {
        await wardService.update(selectedWard.id, formData);
      } else {
        await wardService.create(formData as any);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving ward:', error);
    } finally {
      setIsSaving(false);
      setBypassDuplicate(false);
    }
  };

  const handleDelete = async (ward: Ward) => {
    if (confirm('Are you sure you want to delete this ward?')) {
      await wardService.delete(ward.id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Wards & Departments"
        data={wards}
        searchFields={["name", "department"]}
        columns={[
          {
            header: "Ward Name",
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.department}</span>
                </div>
              </div>
            )
          },
          {
            header: "Clinical Site",
            accessor: (item) => {
              const site = sites.find(s => s.id === item.clinicalSiteId);
              return (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  {site?.name || "Unknown Site"}
                </div>
              );
            }
          },
          {
            header: "Status",
            accessor: (item) => (
              <StatusChip 
                status={item.status} 
                variant={item.status === 'active' ? 'success' : 'neutral'} 
              />
            )
          }
        ]}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedWard ? "Edit Ward" : "Add Ward"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          {duplicateWarning && (
            <div className="p-5 bg-amber-50 text-amber-800 text-sm font-medium rounded-2xl border border-amber-200 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-500" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950">Duplicate Detected</p>
                  <p className="text-xs leading-relaxed">{duplicateWarning}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={handleBypassAndSave}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-extrabold hover:bg-amber-700 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                >
                  Confirm & Create
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateWarning(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-extrabold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Site</label>
            <select
              required
              value={formData.clinicalSiteId}
              onChange={(e) => setFormData({ ...formData, clinicalSiteId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="">Select a Site</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ward Name</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. Pediatric Ward"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</label>
              <input
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Nursing"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-10 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Ward"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
