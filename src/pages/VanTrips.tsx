import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { vanTripService, vanService, studentService, teacherService } from "../services/app.service";
import { VanTrip, Van, Student, Teacher, Passenger } from "../types/app";
import { Plus, Trash2, Calendar, Clock, MapPin, Bus, Users, Search, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function VanTrips() {
  const [trips, setTrips] = useState<VanTrip[]>([]);
  const [vans, setVans] = useState<Van[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<VanTrip | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tripDate: "",
    departureTime: "",
    returnTime: "",
    destination: "",
    subject: "",
    vanId: "",
    passengers: [] as Passenger[]
  });

  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const tripData = await vanTripService.getAll();
    setTrips(tripData);
    const vanData = await vanService.getAll();
    setVans(vanData);
    const studentData = await studentService.getAll();
    setStudents(studentData);
    const teacherData = await teacherService.getAll();
    setTeachers(teacherData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedTrip(null);
    setFormData({ 
      tripDate: "",
      departureTime: "",
      returnTime: "",
      destination: "",
      subject: "",
      vanId: "",
      passengers: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trip: VanTrip) => {
    setSelectedTrip(trip);
    setFormData({
      tripDate: trip.tripDate,
      departureTime: trip.departureTime,
      returnTime: trip.returnTime,
      destination: trip.destination,
      subject: trip.subject,
      vanId: trip.vanId,
      passengers: trip.passengers || []
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
      if (selectedTrip) {
        await vanTripService.update(selectedTrip.id, dataToSave);
      } else {
        await vanTripService.create({
            ...dataToSave,
            createdAt: new Date()
        } as any);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลทริปรถตู้");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTrip) {
      await vanTripService.delete(selectedTrip.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  const selectedVan = vans.find(v => v.id === formData.vanId);
  const capacity = selectedVan?.capacity || 0;
  const totalPassengers = formData.passengers.length;

  const addPassenger = (p: Passenger) => {
    if (totalPassengers >= capacity) return;
    if (formData.passengers.find(x => x.personId === p.personId)) return;
    setFormData(prev => ({ ...prev, passengers: [...prev.passengers, p] }));
  };

  const removePassenger = (personId: string) => {
    setFormData(prev => ({ ...prev, passengers: prev.passengers.filter(x => x.personId !== personId) }));
  };

  const filteredPeople = [...students.map(s => ({ personId: s.id, fullName: s.fullName || '', role: 'Student' as const })), 
                          ...teachers.map(t => ({ personId: t.id, fullName: t.name || '', role: 'Teacher' as const }))]
                         .filter(p => (p.fullName || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <DataTable
        title="Weekly Room Assignment & Transport"
        data={trips}
        searchFields={["destination", "subject"]}
        columns={[
          { 
            header: "Schedule", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{item.tripDate}</span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {item.departureTime} - {item.returnTime}
                </span>
              </div>
            )
          },
          { 
            header: "Destination", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{item.destination}</span>
                <span className="text-[10px] font-bold text-primary truncate max-w-[150px]">{item.subject}</span>
              </div>
            )
          },
          { 
            header: "Vehicle", 
            accessor: (item) => {
              const van = vans.find(v => v.id === item.vanId);
              return (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary-container flex items-center justify-center text-primary">
                    <Bus className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{van?.plateNumber || "-"}</span>
                    <span className="text-[10px] font-bold text-slate-400">{van?.vanNumber || "External"}</span>
                  </div>
                </div>
              );
            }
          },
          { 
            header: "Occupancy", 
            accessor: (item) => {
              const van = vans.find(v => v.id === item.vanId);
              const cap = van?.capacity || 0;
              const current = item.passengers?.length || 0;
              const percent = cap > 0 ? (current / cap) * 100 : 0;
              
              return (
                <div className="flex flex-col gap-1.5 w-24">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-600">{current}/{cap}</span>
                    <span className={percent >= 90 ? "text-error" : "text-slate-400"}>{Math.round(percent)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className={`h-full rounded-full ${
                        percent >= 90 ? "bg-error" : 
                        percent >= 70 ? "bg-warning" : "bg-success"
                      }`}
                    />
                  </div>
                </div>
              );
            }
          },
        ]}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(trip) => {
          setSelectedTrip(trip);
          setIsDeleteOpen(true);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTrip ? "Edit Transport Assignment" : "Schedule New Transport"}
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="date" 
                  required 
                  value={formData.tripDate} 
                  onChange={(e) => setFormData({ ...formData, tripDate: e.target.value })} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assigned Vehicle</label>
              <div className="relative">
                <Bus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select 
                  required 
                  value={formData.vanId} 
                  onChange={(e) => setFormData({ ...formData, vanId: e.target.value })} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="">Select vehicle...</option>
                  {vans.map(v => <option key={v.id} value={v.id}>{v.plateNumber} ({v.vanNumber})</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Departure Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="time" 
                  required 
                  value={formData.departureTime} 
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Return Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="time" 
                  required 
                  value={formData.returnTime} 
                  onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                required 
                placeholder="e.g. Siriraj Hospital"
                value={formData.destination} 
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Purpose / Subject</label>
            <div className="relative">
              <Info className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <textarea 
                required 
                placeholder="Details of the assignment..."
                value={formData.subject} 
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[80px]" 
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-outline">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-bold text-slate-900">Passenger Manifesto</h4>
              </div>
              <div className="px-3 py-1 bg-surface-variant rounded-full text-[10px] font-bold text-slate-600 border border-outline">
                {totalPassengers} / {capacity} Seats Used
              </div>
            </div>

            {totalPassengers >= capacity && capacity > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 bg-error/10 text-error text-[10px] font-bold rounded-xl border border-error/20 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Vehicle capacity reached. Cannot add more passengers.
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  placeholder="Search students or teachers..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-2">
                <AnimatePresence>
                  {filteredPeople.map(p => {
                    const isAdded = formData.passengers.find(x => x.personId === p.personId);
                    return (
                      <motion.div 
                        key={p.personId} 
                        layout
                        className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                          isAdded ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{p.fullName}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.role}</span>
                        </div>
                        {isAdded ? (
                          <button 
                            type="button" 
                            onClick={() => removePassenger(p.personId)}
                            className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => addPassenger(p)}
                            disabled={totalPassengers >= capacity}
                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors disabled:opacity-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
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
              disabled={isSaving || (totalPassengers > capacity && capacity > 0)}
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
        title="Cancel Assignment" 
        message={`Are you sure you want to cancel the transport assignment to ${selectedTrip?.destination}? This will remove all passenger records for this trip.`} 
      />
    </div>
  );
}
