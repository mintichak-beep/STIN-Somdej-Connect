import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlertCircle, User, Phone, BookOpen, UserPlus } from "lucide-react";
import { teacherService } from "../services/app.service";
import { Teacher } from "../types/app";

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsSaving(true);
    setError(null);
    try {
      if (selectedTeacher) {
        await teacherService.update(selectedTeacher.id, formData);
      } else {
        await teacherService.create(formData as any);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "An error occurred while saving the instructor record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTeacher) {
      await teacherService.delete(selectedTeacher.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DataTable
        title="Instructor Directory"
        description="Manage nursing faculty profiles, departmental affiliations, and professional contact details."
        data={teachers}
        searchFields={["name", "department"]}
        emptyTitle="No Faculty Registered"
        emptyDescription="The instructor directory is empty. Click 'Add New Record' to register your first nursing faculty member."
        columns={[
          { 
            header: "Faculty Member", 
            accessor: (teacher) => (
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary-container overflow-hidden flex items-center justify-center border border-outline shadow-sm">
                  <img 
                    src="/src/assets/images/nursing_instructor_icon_1784479023431.jpg" 
                    alt={teacher.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-extrabold text-slate-900 block">{teacher.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nursing Faculty</span>
                </div>
              </div>
            ),
            sortable: true
          },
          { 
            header: "Department", 
            accessor: (teacher) => (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-variant/50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-tight">
                {teacher.department}
              </div>
            ),
            sortable: true 
          },
          { 
            header: "Contact Details", 
            accessor: (teacher) => (
              <div className="flex items-center gap-2.5 text-slate-500">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold font-mono tracking-wider">{teacher.phone}</span>
              </div>
            ) 
          },
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
        title={selectedTeacher ? "Update Instructor Profile" : "Register New Instructor"}
      >
        <form onSubmit={handleSave} className="space-y-8">
          {error && (
            <div className="p-5 bg-medical-red/5 text-medical-red text-sm font-bold rounded-2xl border border-medical-red/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-6 w-6 shrink-0" />
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="md-label flex items-center gap-2">
                <User className="h-3 w-3" />
                Full Name
              </label>
              <input
                required
                placeholder="e.g. Dr. Jane Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="md-input"
              />
            </div>

            <div className="space-y-2">
              <label className="md-label flex items-center gap-2">
                <BookOpen className="h-3 w-3" />
                Department
              </label>
              <input
                required
                placeholder="e.g. Fundamental Nursing"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="md-input"
              />
            </div>

            <div className="space-y-2">
              <label className="md-label flex items-center gap-2">
                <Phone className="h-3 w-3" />
                Contact Number
              </label>
              <input
                required
                placeholder="e.g. 0812345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="md-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-outline">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="md-button-text py-3.5 px-8"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="md-button-filled py-3.5 px-10 flex items-center gap-3"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>{selectedTeacher ? "Update Faculty Record" : "Add Faculty Member"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete faculty member ${selectedTeacher?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
