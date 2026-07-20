import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlertCircle, User, Phone, Hash, BookOpen, GraduationCap, Users } from "lucide-react";
import { studentService, subjectService } from "../services/app.service";
import { Student, Subject } from "../types/app";
import { StatusChip } from "../components/StatusChip";
import { excelUtils } from "../lib/excel";

export function StudentManagement({ onSelectStudent }: { onSelectStudent: (studentId: string) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    yearLevel: "1",
    classGroup: "",
    faculty: "",
    major: "",
    phone: "",
    status: "active" as "active" | "inactive",
    subjectId: ""
  });

  const [subjectSearch, setSubjectSearch] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      const sortedData = [...data].sort((a, b) => (a.studentId || "").localeCompare(b.studentId || ""));
      setStudents(sortedData);
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to students in real-time
    const unsubscribeStudents = studentService.onSnapshot([], (data) => {
      const sortedData = [...data].sort((a, b) => (a.studentId || "").localeCompare(b.studentId || ""));
      setStudents(sortedData);
      setLoading(false);
    });

    // Subscribe to subjects in real-time
    const unsubscribeSubjects = subjectService.onSnapshot([], (data) => {
      setSubjects(data);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeSubjects();
    };
  }, []);

  const handleExport = () => {
    const exportData = students.map(({ id, createdAt, updatedAt, ...rest }) => {
      const matchedSubject = subjects.find(s => s.id === rest.subjectId);
      return {
        ...rest,
        subjectCode: matchedSubject ? matchedSubject.subjectCode : "",
        subjectName: matchedSubject ? matchedSubject.subjectName : ""
      };
    });
    excelUtils.exportToExcel(exportData, "students_list");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await excelUtils.importFromExcel(file);
        const existingSubjects = await subjectService.getAll();
        for (const item of data) {
          const matchedSubject = existingSubjects.find(
            s => s.subjectCode === String(item.subjectCode || item.subjectId || "") ||
                 s.subjectName === String(item.subjectName || item.subject || "")
          );
          await studentService.create({
            studentId: String(item.studentId || ""),
            firstName: item.firstName || "",
            lastName: item.lastName || "",
            fullName: `${item.firstName || ""} ${item.lastName || ""}`,
            yearLevel: String(item.yearLevel || "1"),
            classGroup: item.classGroup || "",
            phone: String(item.phone || ""),
            status: "active",
            subjectId: matchedSubject ? matchedSubject.id : ""
          } as any);
        }
        fetchData();
      } catch (error) {
        console.error("Import error:", error);
      }
    }
  };

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setFormData({
      studentId: "",
      firstName: "",
      lastName: "",
      yearLevel: "1",
      classGroup: "",
      faculty: "",
      major: "",
      phone: "",
      status: "active",
      subjectId: ""
    });
    setSubjectSearch("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      yearLevel: student.yearLevel,
      classGroup: student.classGroup,
      faculty: student.faculty || "",
      major: student.major || "",
      phone: student.phone,
      status: student.status,
      subjectId: student.subjectId || ""
    });
    const sub = subjects.find(s => s.id === student.subjectId);
    setSubjectSearch(sub ? `${sub.subjectName} (${sub.subjectCode})` : "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    const data = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`
    };

    try {
      // Check for duplicate student ID
      const existingStudents = await studentService.getAll();
      const duplicate = existingStudents.find(
        (s) => s.studentId === formData.studentId && (!selectedStudent || s.id !== selectedStudent.id)
      );
      if (duplicate) {
        throw new Error("Student ID already exists.");
      }

      if (selectedStudent) {
        await studentService.update(selectedStudent.id, data);
      } else {
        await studentService.create(data as any);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "An error occurred while saving the record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedStudent) {
      await studentService.delete(selectedStudent.id);
      setIsDeleteOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DataTable
        title="Students Directory"
        description="Maintain a centralized repository of student profiles, clinical assignments, and academic status."
        data={students}
        searchFields={["studentId", "fullName", "phone"]}
        emptyTitle="No Students Registered"
        emptyDescription="No student records found. Click 'Add Student' to register your first nursing student."
        columns={[
          { 
            header: "Student ID", 
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-black">
                  {item.studentId.slice(-2)}
                </div>
                <span className="font-mono text-xs tracking-wider">{item.studentId}</span>
              </div>
            ),
            sortable: true 
          },
          { 
            header: "Full Name", 
            accessor: (item) => (
              <div className="space-y-0.5">
                <div className="text-sm font-extrabold text-slate-900">{item.fullName}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.faculty || 'N/A'} • {item.major || 'N/A'}</div>
              </div>
            ),
            sortable: true
          },
          { 
            header: "Year / Group", 
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black tracking-tight">YEAR {item.yearLevel}</span>
                <span className="px-2 py-1 bg-primary/5 text-primary rounded text-[10px] font-black tracking-tight">{item.classGroup}</span>
              </div>
            ) 
          },
          { 
            header: "Clinical Assignment", 
            accessor: (item) => {
              const matchedSubject = subjects.find(s => s.id === item.subjectId);
              return matchedSubject ? (
                <div className="max-w-[200px] truncate">
                  <div className="text-xs font-bold text-slate-700 truncate">{matchedSubject.subjectName}</div>
                  <div className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{matchedSubject.subjectCode}</div>
                </div>
              ) : (
                <span className="text-slate-300 italic text-xs font-medium">No assignment</span>
              );
            }
          },
          { 
            header: "Contact", 
            accessor: (item) => (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3 w-3" />
                <span className="text-xs font-bold">{item.phone}</span>
              </div>
            ) 
          },
          { 
            header: "Account Status", 
            accessor: (item) => <StatusChip status={item.status} /> 
          },
        ]}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={(student) => {
          setSelectedStudent(student);
          setIsDeleteOpen(true);
        }}
        onView={(student) => onSelectStudent(student.id)}
        onImport={() => document.getElementById("excel-import")?.click()}
        onExport={handleExport}
      />

      <input
        id="excel-import"
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleImport}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? "Edit Student Record" : "Add New Student"}
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
                  Student ID
                </label>
                <input
                  required
                  placeholder="e.g. 6610001"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Phone Number
                </label>
                <input
                  placeholder="e.g. 0812345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="md-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label">Faculty</label>
                <input
                  placeholder="e.g. Nursing"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label">Major</label>
                <input
                  placeholder="e.g. Professional Nursing"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="md-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <User className="h-3 w-3" />
                  First Name
                </label>
                <input
                  required
                  placeholder="Given name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Last Name
                </label>
                <input
                  required
                  placeholder="Family name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="md-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <GraduationCap className="h-3 w-3" />
                  Academic Year
                </label>
                <select
                  value={formData.yearLevel}
                  onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                  className="md-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Class Group
                </label>
                <input
                  placeholder="e.g. Clinical Group A"
                  value={formData.classGroup}
                  onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
                  className="md-input"
                />
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <label className="md-label flex items-center gap-2">
                <BookOpen className="h-3 w-3" />
                Clinical Course
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clinical courses..."
                  value={subjectSearch}
                  onFocus={() => setShowSubjectDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSubjectDropdown(false), 200)}
                  onChange={(e) => {
                    setSubjectSearch(e.target.value);
                    setShowSubjectDropdown(true);
                  }}
                  className="md-input cursor-pointer"
                />
                {formData.subjectId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, subjectId: "" });
                      setSubjectSearch("");
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-medical-red hover:bg-medical-red/10 px-3 py-1.5 rounded-xl transition-all"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              {showSubjectDropdown && (
                <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-surface border border-outline rounded-3xl shadow-2xl animate-in fade-in zoom-in-95">
                  {subjects
                    .filter(s => 
                      (s.subjectName || '').toLowerCase().includes(subjectSearch.toLowerCase()) || 
                      (s.subjectCode || '').toLowerCase().includes(subjectSearch.toLowerCase())
                    )
                    .map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onMouseDown={() => {
                          setFormData({ ...formData, subjectId: s.id });
                          setSubjectSearch(`${s.subjectName} (${s.subjectCode})`);
                          setShowSubjectDropdown(false);
                        }}
                        className="w-full text-left px-6 py-4 hover:bg-primary-container/20 transition-all border-b border-outline last:border-none group"
                      >
                        <div className="font-extrabold text-slate-800 group-hover:text-primary transition-colors">{s.subjectName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">{s.subjectCode}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.department}</span>
                        </div>
                      </button>
                    ))}
                  {subjects.filter(s => 
                    (s.subjectName || '').toLowerCase().includes(subjectSearch.toLowerCase()) || 
                    (s.subjectCode || '').toLowerCase().includes(subjectSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="p-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                      No matching clinical courses.
                    </div>
                  )}
                </div>
              )}
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
                  <User className="h-5 w-5" />
                  <span>{selectedStudent ? "Update Record" : "Register Student"}</span>
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
        message={`Are you sure you want to permanently delete student ${selectedStudent?.fullName}? All associated data will be removed.`}
      />
    </div>
  );
}
