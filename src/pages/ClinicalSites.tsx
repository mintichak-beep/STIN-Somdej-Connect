import React, { useState, useEffect } from 'react';
import { Hospital, MapPin, Phone, Plus, Search, Building2, AlertTriangle } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { clinicalSiteService } from '../services/app.service';
import { ClinicalSite } from '../types/app';
import { StatusChip } from '../components/StatusChip';
import { deduplicationService } from '../services/deduplication.service';
import { RelationshipService } from '../services/relationship.service';

export function ClinicalSites() {
  const [sites, setSites] = useState<ClinicalSite[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<ClinicalSite | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);
  const [integrityError, setIntegrityError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ClinicalSite>>({
    name: '',
    type: 'Hospital',
    address: '',
    phone: '',
    status: 'active'
  });

  const fetchData = async () => {
    const data = await clinicalSiteService.getAll();
    setSites(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedSite(null);
    setFormData({
      name: '',
      type: 'Hospital',
      address: '',
      phone: '',
      status: 'active'
    });
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (site: ClinicalSite) => {
    setSelectedSite(site);
    setFormData(site);
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!bypassDuplicate) {
        const dup = await deduplicationService.checkDuplicateBeforeSave("clinicalSites", formData, selectedSite?.id);
        if (dup) {
          setDuplicateWarning(`A clinical site with matching name and address already exists (Name: ${dup.name}, Address: ${dup.address}). Do you want to proceed and create a duplicate?`);
          setIsSaving(false);
          return;
        }
      }

      if (selectedSite) {
        await clinicalSiteService.update(selectedSite.id, formData);
      } else {
        await clinicalSiteService.create(formData as any);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving site:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBypassAndSave = async () => {
    setDuplicateWarning(null);
    setBypassDuplicate(true);
    setIsSaving(true);
    try {
      if (selectedSite) {
        await clinicalSiteService.update(selectedSite.id, formData);
      } else {
        await clinicalSiteService.create(formData as any);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving site:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (site: ClinicalSite) => {
    setIntegrityError(null);
    const check = await RelationshipService.checkPracticeSiteDeletion(site.id);
    if (!check.canDelete) {
      setIntegrityError(check.message || "Cannot delete practice site because related records exist.");
      return;
    }

    if (confirm('Are you sure you want to delete this clinical site?')) {
      await clinicalSiteService.delete(site.id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      {integrityError && (
        <div className="p-4 bg-rose-50 text-rose-900 text-xs font-bold rounded-2xl border border-rose-200 flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{integrityError}</span>
          </div>
          <button 
            onClick={() => setIntegrityError(null)} 
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-black cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <DataTable
        title="Clinical Practice Sites"
        data={sites}
        searchFields={["name", "address"]}
        columns={[
          {
            header: "Site Name",
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                  <Hospital className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.type}</span>
                </div>
              </div>
            )
          },
          {
            header: "Location",
            accessor: (item) => (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span className="truncate max-w-[200px]">{item.address}</span>
              </div>
            )
          },
          {
            header: "Contact",
            accessor: (item) => (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Phone className="h-3 w-3 text-slate-400" />
                {item.phone}
              </div>
            )
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
        title={selectedSite ? "Edit Clinical Site" : "Add Clinical Site"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          {duplicateWarning && (
            <div className="p-5 bg-amber-50 text-amber-800 text-sm font-medium rounded-2xl border border-amber-200 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-500" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950">Duplicate Detected</p>
                  <p>{duplicateWarning}</p>
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Site Name</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. Somdej Hospital"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="Hospital">Hospital</option>
                <option value="Health Center">Health Center</option>
                <option value="Clinic">Clinic</option>
              </select>
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

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              rows={3}
              placeholder="Full address of the site..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
            <input
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. 02-xxx-xxxx"
            />
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
              {isSaving ? "Saving..." : "Save Site"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
