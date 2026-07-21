import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlertCircle, User, Phone, BookOpen, UserPlus, Camera, X, Upload, AlertTriangle } from "lucide-react";
import { teacherService } from "../services/app.service";
import { deduplicationService } from "../services/deduplication.service";
import { Teacher } from "../types/app";
import { resizeImage } from "../lib/imageUtils";
import { AssetImage } from "../components/AssetImage";

interface TeacherManagementProps {
  onSelectTeacher?: (id: string) => void;
}

export function TeacherManagement({ onSelectTeacher }: TeacherManagementProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    phone: "",
    photoUrl: ""
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
    setFormData({ name: "", department: "", phone: "", photoUrl: "" });
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    let photoUrl = teacher.photoUrl || "";
    
    // If it's a large base64 image, try to resize it immediately to fix existing oversized documents
    if (photoUrl.startsWith("data:image/") && photoUrl.length > 500000) {
      try {
        photoUrl = await resizeImage(photoUrl, 400, 0.7);
      } catch (err) {
        console.error("Failed to auto-resize existing image:", err);
      }
    }

    setFormData({
      name: teacher.name,
      department: teacher.department,
      phone: teacher.phone,
      photoUrl: photoUrl
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
        const dup = await deduplicationService.checkDuplicateBeforeSave("teachers", formData, selectedTeacher?.id);
        if (dup) {
          setDuplicateWarning(`An instructor with matching details already exists (Name: ${dup.name}, Department: ${dup.department}). Do you want to proceed and create a duplicate?`);
          setIsSaving(false);
          return;
        }
      }

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

  const handleBypassAndSave = async () => {
    setDuplicateWarning(null);
    setBypassDuplicate(true);
    setIsSaving(true);
    try {
      if (selectedTeacher) {
        await teacherService.update(selectedTeacher.id, formData);
      } else {
        await teacherService.create(formData as any);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          // Resize and compress to stay under Firestore limits
          const resized = await resizeImage(base64, 400, 0.7);
          setFormData({ ...formData, photoUrl: resized });
        } catch (err) {
          console.error("Image processing error:", err);
          setError("Failed to process image. Please try another one.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, photoUrl: "" });
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
                <div className="h-12 w-12 rounded-full bg-primary-container overflow-hidden flex items-center justify-center border border-outline shadow-sm">
                  {teacher.photoUrl ? (
                    <AssetImage 
                      src={teacher.photoUrl} 
                      alt={teacher.name}
                      className="h-full w-full object-cover"
                      fallbackType="teacher"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <User className="h-6 w-6" />
                    </div>
                  )}
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
        onView={(teacher) => onSelectTeacher?.(teacher.id)}
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
          
          <div className="space-y-8">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {formData.photoUrl ? (
                    <AssetImage 
                      src={formData.photoUrl} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                      fallbackType="teacher"
                    />
                  ) : (
                    <User className="h-12 w-12 text-slate-300" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 group-hover:ring-4 ring-primary/20">
                  <Camera className="h-5 w-5" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                </label>
                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 p-1.5 bg-medical-red text-white rounded-full shadow-md hover:bg-medical-red/90 transition-all hover:scale-110"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Photo (Auto-compressed)</p>
            </div>

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
