import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlertCircle, BookOpen, Calendar, Hash, Building2, CheckCircle2, XCircle } from "lucide-react";
import { subjectService } from "../services/app.service";
import { Subject } from "../types/app";
import { StatusChip } from "../components/StatusChip";

export function SubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subjectCode: "",
    subjectName: "",
    academicYear: "",
    semester: "",
    department: "",
    status: "active" as "active" | "inactive"
  });

  useEffect(() => {
    setLoading(true);
    // Real-time updates subscription
    const unsubscribe = subjectService.onSnapshot([], (data) => {
      const sortedData = [...data].sort((a, b) => (a.subjectCode || "").localeCompare(b.subjectCode || ""));
      setSubjects(sortedData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setSelectedSubject(null);
    setFormData({
      subjectCode: "",
      subjectName: "",
      academicYear: String(new Date().getFullYear() + 543), // Default to current Thai year level
      semester: "1",
      department: "Nursing Fundamentals",
      status: "active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      academicYear: subject.academicYear,
      semester: subject.semester,
      department: subject.department,
      status: subject.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (selectedSubject) {
        await subjectService.update(selectedSubject.id, formData);
      } else {
        await subjectService.create(formData as any);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save subject error:", err);
      setError(err.message || "An error occurred while saving the course record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedSubject) {
      try {
        setLoading(true);
        await subjectService.delete(selectedSubject.id);
        setIsDeleteOpen(false);
      } catch (err: any) {
        console.error("Delete subject error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DataTable
        title="Clinical Course Directory"
        description="Comprehensive index of nursing curricula, theoretical modules, and practical clinical courses."
        data={subjects}
        searchFields={["subjectCode", "subjectName", "department"]}
        emptyTitle="No Courses Found"
        emptyDescription="The course directory is empty. Click 'Add New Record' to create your first clinical course."
        columns={[
          { 
            header: "Course Identifier", 
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-black tracking-wider text-primary uppercase">{item.subjectCode}</span>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Clinical Code</div>
                </div>
              </div>
            ),
            sortable: true
          },
          { 
            header: "Course Title", 
            accessor: (item) => (
              <div className="max-w-[250px]">
                <div className="text-sm font-extrabold text-slate-800 leading-snug">{item.subjectName}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.department}</div>
              </div>
            ),
            sortable: true
          },
          { 
            header: "Term / Year", 
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black">SEM {item.semester}</span>
                <span className="px-2 py-1 bg-primary/5 text-primary rounded text-[10px] font-black">AY {item.academicYear}</span>
              </div>
            )
          },
          { 
            header: "Curriculum Status", 
            accessor: (item) => <StatusChip status={item.status} /> 
          },
        ]}
        onAdd={handleOpenAdd}
        onEdit={(item) => handleOpenEdit(item as Subject)}
        onDelete={(item) => {
          setSelectedSubject(item as Subject);
          setIsDeleteOpen(true);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSubject ? "Update Clinical Course" : "Register New Clinical Course"}
      >
        <form onSubmit={handleSave} className="space-y-8">
          {error && (
            <div className="p-5 bg-medical-red/5 text-medical-red text-sm font-bold rounded-2xl border border-medical-red/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-6 w-6 shrink-0" />
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Course Code
                </label>
                <input
                  required
                  placeholder="e.g. NUR211"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  Course Title
                </label>
                <input
                  required
                  placeholder="e.g. Nursing Fundamentals"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="md-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Academic Year
                </label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 2569"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="md-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Summer Session</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  Responsible Department
                </label>
                <input
                  required
                  placeholder="e.g. Mental Health Nursing"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  {formData.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Curriculum Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  className="md-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                >
                  <option value="active">Active Curriculum</option>
                  <option value="inactive">Archived Curriculum</option>
                </select>
              </div>
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
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{selectedSubject ? "Update Curriculum" : "Register Course"}</span>
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
        title="Archive Course Record"
        message={`Are you sure you want to permanently archive ${selectedSubject?.subjectName} (${selectedSubject?.subjectCode})? This will remove it from active curriculum management.`}
      />
    </div>
  );
}
