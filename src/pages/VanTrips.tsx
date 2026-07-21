import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { vanTripService, studentService, teacherService } from "../services/app.service";
import { VanTrip, Student, Teacher } from "../types/app";
import { Plus, Trash2, Calendar, Clock, MapPin, Bus, Users, Search, AlertCircle, Info, Edit, User, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { deduplicationService } from "../services/deduplication.service";

export function VanTrips() {
  const [trips, setTrips] = useState<VanTrip[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<VanTrip | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    licensePlate: "",
    driverName: "",
    departureTime: "",
    returnTime: "",
    destination: "",
    studentIds: [] as string[],
    instructorIds: [] as string[],
    notes: "",
    status: "Scheduled" as 'Scheduled' | 'Completed' | 'Cancelled'
  });

  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const tripData = await vanTripService.getAll();
    setTrips(tripData);
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
      date: "",
      licensePlate: "",
      driverName: "",
      departureTime: "",
      returnTime: "",
      destination: "",
      studentIds: [],
      instructorIds: [],
      notes: "",
      status: "Scheduled"
    });
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trip: VanTrip) => {
    setSelectedTrip(trip);
    setFormData({
      date: trip.date || (trip as any).tripDate || "",
      licensePlate: trip.licensePlate || "",
      driverName: trip.driverName || "",
      departureTime: trip.departureTime || "",
      returnTime: trip.returnTime || "",
      destination: trip.destination || "",
      studentIds: trip.studentIds || (trip as any).passengers?.filter((p: any) => p.role === 'Student').map((p: any) => p.personId) || [],
      instructorIds: trip.instructorIds || (trip as any).passengers?.filter((p: any) => p.role === 'Teacher').map((p: any) => p.personId) || [],
      notes: trip.notes || (trip as any).subject || "",
      status: trip.status || "Scheduled"
    });
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (!bypassDuplicate) {
        const dup = await deduplicationService.checkDuplicateBeforeSave("vanTrips", formData, selectedTrip?.id);
        if (dup) {
          setDuplicateWarning(`A van trip on ${formData.date} at ${formData.departureTime} with license plate ${formData.licensePlate} already exists. Do you want to proceed and create a duplicate?`);
          setIsSaving(false);
          return;
        }
      }

      const dataToSave = {
        ...formData,
        
      };
      if (selectedTrip) {
        await vanTripService.update(selectedTrip.id, dataToSave);
      } else {
        await vanTripService.create({
            ...dataToSave,
            
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

  const handleBypassAndSave = async () => {
    setDuplicateWarning(null);
    setBypassDuplicate(true);
    setIsSaving(true);
    setError(null);
    try {
      const dataToSave = {
        ...formData,
      };
      if (selectedTrip) {
        await vanTripService.update(selectedTrip.id, dataToSave);
      } else {
        await vanTripService.create({
            ...dataToSave,
        } as any);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลทริปรถตู้");
    } finally {
      setIsSaving(false);
      setBypassDuplicate(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTrip) {
      await vanTripService.delete(selectedTrip.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  const toggleStudent = (id: string) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(id) 
        ? prev.studentIds.filter(x => x !== id) 
        : [...prev.studentIds, id]
    }));
  };

  const toggleInstructor = (id: string) => {
    setFormData(prev => ({
      ...prev,
      instructorIds: prev.instructorIds.includes(id) 
        ? prev.instructorIds.filter(x => x !== id) 
        : [...prev.instructorIds, id]
    }));
  };

  const filteredStudents = students.filter(s => 
    (s.firstName || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.studentId || '').toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredInstructors = teachers.filter(t => 
    (t.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <DataTable
        title="Shuttle Van Management"
        data={trips}
        searchFields={["destination", "driverName", "licensePlate"]}
        columns={[
          { 
            header: "Date", 
            accessor: (item) => (
              <span className="font-bold text-slate-900">{item.date || (item as any).tripDate}</span>
            )
          },
          { 
            header: "Vehicle & Driver", 
            accessor: (item) => (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5"><Bus className="w-3 h-3 text-primary" /> {item.licensePlate || "N/A"}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><User className="w-3 h-3" /> {item.driverName || "N/A"}</span>
              </div>
            )
          },
          { 
            header: "Times", 
            accessor: (item) => (
              <div className="flex flex-col text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <span className="px-1 py-0.25 bg-indigo-50 text-indigo-600 rounded text-[8px] uppercase tracking-wide font-extrabold">Dep</span>
                  {item.departureTime}
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-700 mt-0.5">
                  <span className="px-1 py-0.25 bg-emerald-50 text-emerald-600 rounded text-[8px] uppercase tracking-wide font-extrabold">Ret</span>
                  {item.returnTime}
                </span>
              </div>
            )
          },
          { 
            header: "Destination", 
            accessor: (item) => (
              <span className="text-[11px] font-bold text-slate-800">{item.destination}</span>
            )
          },
          { 
            header: "Passengers", 
            accessor: (item) => {
              const stdCount = item.studentIds?.length || 0;
              const insCount = item.instructorIds?.length || 0;
              return (
                <div className="flex gap-2 text-[10px] font-bold">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg">{stdCount} Students</span>
                  <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg">{insCount} Instructors</span>
                </div>
              );
            }
          },
          {
            header: "Status",
            accessor: (item) => {
              const status = item.status || 'Scheduled';
              const statusColor = {
                'Scheduled': "bg-medical-blue/10 text-medical-blue",
                'Completed': "bg-medical-green/10 text-medical-green",
                'Cancelled': "bg-medical-red/10 text-medical-red"
              }[status as any] || "bg-slate-100 text-slate-600";

              return (
                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                  {status}
                </span>
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
        title={selectedTrip ? "Edit Van Trip" : "Create Van Trip"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-4 bg-error/10 text-error text-xs font-bold rounded-2xl border border-error/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {duplicateWarning && (
            <div className="p-5 bg-amber-50 text-amber-800 text-sm font-medium rounded-2xl border border-amber-200 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-500" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950">Duplicate Trip Warning</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="date" required 
                  value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
              <select 
                required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">License Plate</label>
              <div className="relative">
                <Bus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  required placeholder="e.g. 1AB-1234"
                  value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} 
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Driver Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  required placeholder="Driver name"
                  value={formData.driverName} onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} 
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Departure Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="time" required 
                  value={formData.departureTime} onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })} 
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Return Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="time" required 
                  value={formData.returnTime} onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })} 
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  required placeholder="e.g. Siriraj Hospital"
                  value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} 
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes</label>
              <textarea 
                placeholder="Additional notes..."
                value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none min-h-[60px]" 
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Assign Passengers
            </h4>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                placeholder="Search students or instructors..." 
                value={search} onChange={e => setSearch(e.target.value)} 
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg">
                  <span>Students</span>
                  <span className="bg-white px-2 py-0.5 rounded-md">{formData.studentIds.length} Selected</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-2">
                  {filteredStudents.map(s => {
                    const isAdded = formData.studentIds.includes(s.id);
                    return (
                      <div key={s.id} onClick={() => toggleStudent(s.id)} className={`flex justify-between items-center p-2 rounded-lg border transition-all cursor-pointer ${isAdded ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white border-slate-100 hover:border-indigo-100 text-slate-700'}`}>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{s.firstName || 'Unknown'}</span>
                          <span className="text-[10px] text-slate-500">{s.studentId}</span>
                        </div>
                        {isAdded && <div className="h-4 w-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">✓</div>}
                      </div>
                    );
                  })}
                  {filteredStudents.length === 0 && <div className="text-xs text-slate-400 text-center py-4 italic">No students found</div>}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-teal-700 bg-teal-50 px-3 py-2 rounded-lg">
                  <span>Instructors</span>
                  <span className="bg-white px-2 py-0.5 rounded-md">{formData.instructorIds.length} Selected</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-2">
                  {filteredInstructors.map(t => {
                    const isAdded = formData.instructorIds.includes(t.id);
                    return (
                      <div key={t.id} onClick={() => toggleInstructor(t.id)} className={`flex justify-between items-center p-2 rounded-lg border transition-all cursor-pointer ${isAdded ? 'bg-teal-50 border-teal-200 text-teal-900' : 'bg-white border-slate-100 hover:border-teal-100 text-slate-700'}`}>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{t.name || 'Unknown'}</span>
                        </div>
                        {isAdded && <div className="h-4 w-4 rounded bg-teal-600 text-white flex items-center justify-center text-[10px]">✓</div>}
                      </div>
                    );
                  })}
                  {filteredInstructors.length === 0 && <div className="text-xs text-slate-400 text-center py-4 italic">No instructors found</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors" 
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSaving}
              className="px-6 py-2 text-xs font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2" 
            >
              {isSaving ? (
                <><div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving...</span></>
              ) : ("Save Trip")}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDelete} 
        variant="danger"
        title="Delete Trip" 
        message={`Are you sure you want to delete this trip to ${selectedTrip?.destination}?`} 
      />
    </div>
  );
}
