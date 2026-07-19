import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, Phone, MapPin, User } from 'lucide-react';
import { hospitalService } from '../services/hospital.service';
import { Hospital } from '../types/db';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../hooks/useAuth';

export const HospitalCenter = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'system';
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    department: '',
    contactPerson: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  const fetchHospitals = async () => {
    setLoading(true);
    const response = await hospitalService.getAll({ search });
    setHospitals(response.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHospitals();
    return hospitalService.subscribe(fetchHospitals);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        await hospitalService.update(editingHospital.id, formData, userId);
      } else {
        await hospitalService.create({
          ...formData,
          hospitalCode: `H-${Date.now().toString().slice(-4)}`,
          hospitalNameTH: formData.name,
          hospitalNameEN: formData.name,
          shortName: formData.name.slice(0, 5),
          type: 'General Hospital',
          affiliation: 'MOPH',
          district: '-',
          subdistrict: '-',
          postalCode: '-',
          address: '-',
          latitude: 0,
          longitude: 0,
          telephone: formData.phone,
          coordinatorName: formData.contactPerson,
          coordinatorPhone: formData.phone,
          numberOfBuildings: 0,
          numberOfRooms: 0,
          studentCapacity: 50,
          teacherCapacity: 10,
          createdBy: userId,
          updatedBy: userId
        }, userId);
      }
      setIsModalOpen(false);
      setEditingHospital(null);
      setFormData({
        name: '',
        province: '',
        department: '',
        contactPerson: '',
        phone: '',
        status: 'active'
      });
      fetchHospitals();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name || hospital.hospitalNameTH || '',
      province: hospital.province || '',
      department: hospital.department || '',
      contactPerson: hospital.contactPerson || hospital.coordinatorName || '',
      phone: hospital.phone || hospital.telephone || '',
      status: hospital.status === 'archived' ? 'inactive' : hospital.status
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    await hospitalService.toggleStatus(id, userId);
    fetchHospitals();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Training Site Center</h1>
          <p className="text-sm text-zinc-500 font-medium">Manage clinical training sites and coordinators</p>
        </div>
        <button
          onClick={() => {
            setEditingHospital(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Add New Training Site
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by training site name or province..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {hospitals.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm text-zinc-500 font-medium">
                No hospitals found matching your criteria
              </div>
            ) : (
              hospitals.map((hospital) => (
                <div key={hospital.id} className="group bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-5 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          hospital.status === 'active' ? 'bg-rose-100 text-rose-700' : 'bg-zinc-200 text-zinc-600'
                        }`}>
                          {hospital.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                        {hospital.name || hospital.hospitalNameTH}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {hospital.province}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleStatus(hospital.id)}
                        className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-rose-600"
                        title={hospital.status === 'active' ? 'Disable' : 'Enable'}
                      >
                        {hospital.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleEdit(hospital)}
                        className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-indigo-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase leading-none">Coordinator</p>
                        <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{hospital.contactPerson || hospital.coordinatorName || 'Not Assigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Phone className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase leading-none">Contact</p>
                        <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{hospital.phone || hospital.telephone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {editingHospital ? 'Edit Training Site' : 'Add New Training Site'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Training Site Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g., King Chulalongkorn Memorial Hospital"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Province</label>
                    <input
                      type="text"
                      required
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="e.g., Bangkok"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="e.g., Nursing Unit"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g., Ajarn Malee S."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g., 081-234-5678"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase transition-colors shadow-lg shadow-rose-200 dark:shadow-none"
                >
                  {editingHospital ? 'Save Changes' : 'Register Training Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
