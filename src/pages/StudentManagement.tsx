import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlertCircle, User, Phone, Hash, BookOpen, GraduationCap, Users, Edit2, Trash2, Plus } from "lucide-react";
import { studentService, subjectService, subjectGroupService, teacherService, trainingSiteService } from "../services/app.service";
import { Student, Subject, SubjectGroup, Teacher, TrainingSite } from "../types/app";
import { StatusChip } from "../components/StatusChip";
import { excelUtils } from "../lib/excel";

export function StudentManagement({ onSelectStudent }: { onSelectStudent: (studentId: string) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [trainingSites, setTrainingSites] = useState<TrainingSite[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'grouped' | 'groups'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subject Group states
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SubjectGroup | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    groupName: "",
    subjectId: "",
    hospitalId: "",
    teacherId: "",
    startDate: "",
    endDate: "",
    capacity: 0
  });
  const [groupError, setGroupError] = useState<string | null>(null);

  // Filter states for Grouped view
  const [filterSubjectId, setFilterSubjectId] = useState<string>("");
  const [filterGroupId, setFilterGroupId] = useState<string>("");

  const [formData, setFormData] = useState({
    studentId: "",
    title: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
    status: "active" as "active" | "inactive",
    subjectId: "",
    groupId: ""
  });

  const [subjectSearch, setSubjectSearch] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      const sortedData = [...data].sort((a, b) => {
        const idA = a.studentId || "";
        const idB = b.studentId || "";
        const prefixA = idA.substring(0, 4);
        const prefixB = idB.substring(0, 4);
        
        if (prefixA === prefixB) return idA.localeCompare(idB);
        if (prefixA === "6710") return -1;
        if (prefixB === "6710") return 1;
        if (prefixA === "6610") return -1;
        if (prefixB === "6610") return 1;
        return idA.localeCompare(idB);
      });

      const indexedData = sortedData.map((s, idx) => ({
        ...s,
        displayIndex: idx + 1
      }));

      setStudents(indexedData as any);
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
      const sortedData = [...data].sort((a, b) => {
        const idA = a.studentId || "";
        const idB = b.studentId || "";
        const prefixA = idA.substring(0, 4);
        const prefixB = idB.substring(0, 4);
        
        if (prefixA === prefixB) return idA.localeCompare(idB);
        if (prefixA === "6710") return -1;
        if (prefixB === "6710") return 1;
        if (prefixA === "6610") return -1;
        if (prefixB === "6610") return 1;
        return idA.localeCompare(idB);
      });
      
      const indexedData = sortedData.map((s, idx) => ({
        ...s,
        displayIndex: idx + 1
      }));
      
      setStudents(indexedData as any);
      setLoading(false);
    });

    // Subscribe to subjects in real-time
    const unsubscribeSubjects = subjectService.onSnapshot([], (data) => {
      setSubjects(data);
    });

    // Subscribe to subject groups in real-time
    const unsubscribeGroups = subjectGroupService.onSnapshot([], (data) => {
      setSubjectGroups(data);
    });

    // Subscribe to teachers in real-time
    const unsubscribeTeachers = teacherService.onSnapshot([], (data) => {
      setTeachers(data);
    });

    // Subscribe to training sites in real-time
    const unsubscribeSites = trainingSiteService.onSnapshot([], (data) => {
      setTrainingSites(data);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeSubjects();
      unsubscribeGroups();
      unsubscribeTeachers();
      unsubscribeSites();
    };
  }, []);

  const handleExport = () => {
    const exportData = students.map((s: any) => {
      const matchedSubject = subjects.find(sub => sub.id === s.subjectId);
      const matchedGroup = subjectGroups.find(g => g.id === s.groupId);
      return {
        "No.": s.displayIndex,
        "Student ID": s.studentId,
        "Title": s.title || "",
        "First Name": s.firstName,
        "Last Name": s.lastName,
        "Clinical Course": matchedSubject ? matchedSubject.subjectName : "",
        "Subject Code": matchedSubject ? matchedSubject.subjectCode : "",
        "Group": matchedGroup ? matchedGroup.groupName : "",
        "Phone": s.phone,
        "Email": s.email || "",
        "Notes": s.notes || "",
        "Status": s.status
      };
    });
    excelUtils.exportToExcel(exportData, "students_list");
  };

  const handleDownloadTemplate = () => {
    const template = [{
      "Student ID": "",
      "Title": "",
      "First Name": "",
      "Last Name": "",
      "Subject": "",
      "Group": "",
      "Phone": "",
      "Email": "",
      "Notes": ""
    }];
    excelUtils.exportToExcel(template, "student_import_template");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await excelUtils.importFromExcel(file);
        
        // Fetch existing students to check for duplicates
        const existingStudents = await studentService.getAll();
        const existingIds = new Set(existingStudents.map(s => s.studentId));
        
        let importedCount = 0;
        let skippedCount = 0;

        for (const item of data) {
          const studentId = String(item["Student ID"] || "");
          
          if (!studentId || existingIds.has(studentId)) {
            skippedCount++;
            continue;
          }

          // Map subject and group
          let mappedSubjectId = "";
          let mappedGroupId = "";
          
          if (item["Subject"]) {
            const subjectName = String(item["Subject"]).toLowerCase();
            const matchedSubject = subjects.find(s => s.subjectName.toLowerCase() === subjectName || s.subjectCode.toLowerCase() === subjectName);
            if (matchedSubject) {
              mappedSubjectId = matchedSubject.id;
              
              if (item["Group"]) {
                const groupName = String(item["Group"]).toLowerCase();
                const matchedGroup = subjectGroups.find(g => g.subjectId === mappedSubjectId && g.groupName.toLowerCase() === groupName);
                if (matchedGroup) {
                  // Check capacity during import
                  if (matchedGroup.capacity) {
                    const currentCount = existingStudents.filter(s => s.groupId === matchedGroup.id).length;
                    // Count already imported in this session too
                    const sessionImported = 0; // Simplified, would need more tracking
                    if (currentCount >= matchedGroup.capacity) {
                      console.warn(`Skipping student ${studentId} assignment to group ${matchedGroup.groupName} - Capacity reached`);
                    } else {
                      mappedGroupId = matchedGroup.id;
                    }
                  } else {
                    mappedGroupId = matchedGroup.id;
                  }
                }
              }
            }
          }

          await studentService.create({
            studentId: studentId,
            title: item["Title"] || "",
            firstName: item["First Name"] || "",
            lastName: item["Last Name"] || "",
            fullName: `${item["First Name"] || ""} ${item["Last Name"] || ""}`,
            phone: String(item["Phone"] || ""),
            email: item["Email"] || "",
            notes: item["Notes"] || "",
            status: "active",
            subjectId: mappedSubjectId,
            groupId: mappedGroupId
          } as any);
          
          existingIds.add(studentId);
          importedCount++;
        }
        alert(`Import complete. Imported: ${importedCount}, Skipped: ${skippedCount}`);
        fetchData();
      } catch (error) {
        console.error("Import error:", error);
        alert("Import failed. Please check the file format.");
      }
    }
  };

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setFormData({
      studentId: "",
      title: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      notes: "",
      status: "active",
      subjectId: "",
      groupId: ""
    });
    setSubjectSearch("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      studentId: student.studentId,
      title: student.title || "",
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      email: student.email || "",
      notes: student.notes || "",
      status: student.status,
      subjectId: student.subjectId || "",
      groupId: student.groupId || ""
    });
    const sub = subjects.find(s => s.id === student.subjectId);
    setSubjectSearch(sub ? `${sub.subjectName} (${sub.subjectCode})` : "");
    setIsModalOpen(true);
  };

  // Subject Group handlers
  const handleOpenAddGroup = () => {
    setSelectedGroup(null);
    setGroupFormData({
      groupName: "",
      subjectId: "",
      hospitalId: "",
      teacherId: "",
      startDate: "",
      endDate: "",
      capacity: 10 // Default capacity
    });
    setGroupError(null);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: SubjectGroup) => {
    setSelectedGroup(group);
    setGroupFormData({
      groupName: group.groupName,
      subjectId: group.subjectId,
      hospitalId: group.hospitalId || "",
      teacherId: group.teacherId || "",
      startDate: group.startDate || "",
      endDate: group.endDate || "",
      capacity: group.capacity || 0
    });
    setGroupError(null);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupError(null);
    if (!groupFormData.groupName.trim() || !groupFormData.subjectId) {
      setGroupError("Please fill out all required fields.");
      return;
    }
    try {
      if (selectedGroup) {
        await subjectGroupService.update(selectedGroup.id!, groupFormData);
      } else {
        await subjectGroupService.create(groupFormData as any);
      }
      setIsGroupModalOpen(false);
    } catch (err: any) {
      console.error("Error saving subject group:", err);
      setGroupError(err.message || "An error occurred.");
    }
  };

  const handleDeleteGroup = async () => {
    if (selectedGroup) {
      try {
        await subjectGroupService.delete(selectedGroup.id!);
        setIsDeleteGroupOpen(false);
      } catch (err: any) {
        console.error("Error deleting group:", err);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!formData.subjectId || !formData.groupId) {
      setError("Please select both a Clinical Course and a Subject Group.");
      setIsSaving(false);
      return;
    }

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

      // Check capacity
      if (formData.groupId) {
        const group = subjectGroups.find(g => g.id === formData.groupId);
        if (group && group.capacity) {
          const currentCount = existingStudents.filter(s => s.groupId === formData.groupId && s.id !== selectedStudent?.id).length;
          if (currentCount >= group.capacity) {
            throw new Error(`Subject Group "${group.groupName}" has reached its maximum capacity of ${group.capacity} students.`);
          }
        }
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

  // Get subjects for display in grouped view
  const displayGroupedSubjects = subjects.filter(sub => !filterSubjectId || sub.id === filterSubjectId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Sub Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Configure student directories, group rotations, and track clinical courses.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0 self-start md:self-auto border border-outline/30 shadow-sm">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'all'
                ? 'bg-white text-primary shadow-md scale-100'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => setActiveSubTab('grouped')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'grouped'
                ? 'bg-white text-primary shadow-md scale-100'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Grouped View
          </button>
          <button
            onClick={() => setActiveSubTab('groups')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'groups'
                ? 'bg-white text-primary shadow-md scale-100'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Subject Groups
          </button>
        </div>
      </div>

      {activeSubTab === 'all' && (
        <DataTable
          title="Students Directory"
          description="Maintain a centralized repository of student profiles, clinical assignments, and academic status."
          data={students}
          searchFields={["studentId", "fullName", "phone"]}
          emptyTitle="No Students Registered"
          emptyDescription="No student records found. Click 'Add Student' to register your first nursing student."
          columns={[
            { 
              header: "No.", 
              accessor: (item: any) => (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {item.displayIndex}
                </span>
              ),
              className: "w-16"
            },
            { 
              header: "Student ID", 
              accessor: (item: any) => (
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
                  <div className="text-sm font-extrabold text-slate-900">{item.title ? `${item.title} ` : ''}{item.firstName} {item.lastName}</div>
                </div>
              ),
              sortable: true
            },
            { 
              header: "Clinical Assignment", 
              accessor: (item) => {
                const matchedSubject = subjects.find(s => s.id === item.subjectId);
                const matchedGroup = subjectGroups.find(g => g.id === item.groupId);
                return matchedSubject ? (
                  <div className="max-w-[200px] truncate">
                    <div className="text-xs font-bold text-slate-700 truncate">
                      {matchedSubject.subjectName}
                      {matchedGroup && (
                        <span className="ml-2 px-2 py-0.5 bg-primary/5 text-primary rounded-md text-[9px] font-extrabold tracking-wider uppercase border border-primary/10">
                          {matchedGroup.groupName}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase mt-0.5">{matchedSubject.subjectCode}</div>
                  </div>
                ) : (
                  <span className="text-slate-300 italic text-xs font-medium">No assignment</span>
                );
              }
            },
            { 
              header: "Contact", 
              accessor: (item) => (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-3 w-3" />
                    <span className="text-xs font-bold">{item.phone}</span>
                  </div>
                  {item.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="h-3 w-3 text-center text-[10px] font-black">@</span>
                      <span className="text-xs font-bold">{item.email}</span>
                    </div>
                  )}
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
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}

      {activeSubTab === 'grouped' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Filtering Bar */}
          <div className="p-6 bg-surface border border-outline rounded-3xl flex flex-col sm:flex-row items-center gap-4 shadow-sm">
            <div className="w-full sm:w-1/2 space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Filter by Subject</label>
              <select
                value={filterSubjectId}
                onChange={(e) => {
                  setFilterSubjectId(e.target.value);
                  setFilterGroupId("");
                }}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.subjectName} ({s.subjectCode})</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-1/2 space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Filter by Group</label>
              <select
                value={filterGroupId}
                onChange={(e) => setFilterGroupId(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
              >
                <option value="">All Groups</option>
                {subjectGroups
                  .filter(g => !filterSubjectId || g.subjectId === filterSubjectId)
                  .map(g => {
                    const sub = subjects.find(s => s.id === g.subjectId);
                    return (
                      <option key={g.id} value={g.id}>
                        {g.groupName} {sub ? `(${sub.subjectCode})` : ""}
                      </option>
                    );
                  })
                }
              </select>
            </div>
          </div>

          {/* Grouped Lists */}
          <div className="space-y-8">
            {displayGroupedSubjects.map(sub => {
              const subjectGroupsList = subjectGroups.filter(g => g.subjectId === sub.id && (!filterGroupId || g.id === filterGroupId));
              
              if (filterGroupId && subjectGroupsList.length === 0) return null;
              
              return (
                <div key={sub.id} className="p-8 bg-surface border border-outline rounded-3xl space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline pb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">{sub.subjectName}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {sub.subjectCode} • Semester {sub.semester}/{sub.academicYear} • {sub.department}
                      </p>
                    </div>
                    <span className="px-3.5 py-1.5 bg-primary/5 text-primary text-[10px] font-black rounded-2xl uppercase tracking-wider self-start sm:self-auto">
                      {subjectGroupsList.length} {subjectGroupsList.length === 1 ? "Group" : "Groups"}
                    </span>
                  </div>

                  {subjectGroupsList.length === 0 ? (
                    <div className="py-8 text-center text-sm font-bold text-slate-400 uppercase tracking-widest italic">
                      No active groups defined for this clinical course.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subjectGroupsList.map(g => {
                        const groupStudents = students.filter(s => s.subjectId === sub.id && s.groupId === g.id);
                        const matchedSite = trainingSites.find(site => site.id === g.hospitalId);
                        const matchedTeacher = teachers.find(t => t.id === g.teacherId);
                        const isFull = g.capacity ? groupStudents.length >= g.capacity : false;

                        return (
                          <div key={g.id} className={`bg-slate-50/40 border ${isFull ? 'border-medical-red/20 ring-1 ring-medical-red/5' : 'border-slate-100'} rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
                            {isFull && (
                              <div className="absolute top-0 right-0 px-3 py-1 bg-medical-red text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl z-10 shadow-sm">
                                FULL
                              </div>
                            )}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-extrabold text-slate-800">{g.groupName}</span>
                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${isFull ? 'bg-medical-red/10 text-medical-red' : 'bg-slate-200/55 text-slate-600'}`}>
                                  {groupStudents.length} / {g.capacity || "∞"}
                                </span>
                              </div>
                              
                              <div className="mb-4 space-y-1">
                                <div className="text-[10px] font-bold text-slate-500 truncate" title={matchedSite?.name}>
                                  🏥 {matchedSite ? matchedSite.name : "No Practice Site"}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400">
                                  👨‍🏫 {matchedTeacher ? matchedTeacher.name : "No Teacher"}
                                </div>
                                {(g.startDate || g.endDate) && (
                                  <div className="text-[9px] font-bold text-slate-400 mt-1">
                                    📅 {g.startDate || "?"} - {g.endDate || "?"}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2.5">
                                {groupStudents.map(student => (
                                  <div 
                                    key={student.id} 
                                    onClick={() => onSelectStudent(student.id)}
                                    className="p-3 bg-white border border-slate-100 hover:border-primary rounded-2xl shadow-sm transition-all cursor-pointer group/item flex items-center justify-between"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-800 group-hover/item:text-primary transition-colors truncate">
                                        <span className="text-[10px] text-slate-400 mr-1.5 font-black">{(student as any).displayIndex}.</span>
                                        {student.title ? `${student.title} ` : ''}{student.firstName} {student.lastName}
                                      </p>
                                      <p className="text-[9px] font-mono font-bold text-slate-400 tracking-wider mt-0.5">
                                        {student.studentId}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {groupStudents.length === 0 && (
                                  <div className="py-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic bg-white/50 rounded-2xl border border-dashed border-slate-200">
                                    No students assigned
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unassigned Students Section */}
            {students.filter(s => !s.subjectId || !s.groupId).length > 0 && !filterSubjectId && !filterGroupId && (
              <div className="p-8 bg-amber-50/20 border border-amber-100/65 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-lg font-black text-amber-800 tracking-tight">Unassigned Students</h3>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">
                    Students currently lacking a complete Subject or Group assignment
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.filter(s => !s.subjectId || !s.groupId).map(student => (
                    <div 
                      key={student.id} 
                      onClick={() => onSelectStudent(student.id)}
                      className="p-4 bg-white border border-amber-200/50 hover:border-amber-400 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{student.fullName}</p>
                        <p className="text-[9px] font-mono font-bold text-slate-400 mt-0.5">{student.studentId}</p>
                      </div>
                      <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'groups' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="md-card p-8 bg-surface border border-outline rounded-3xl shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-outline pb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Subject Groups Directory</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Configure clinical course cohorts and organize students into specific study groups.
                </p>
              </div>
              <button
                onClick={handleOpenAddGroup}
                className="md-button-filled flex items-center gap-2 py-3 px-6"
              >
                <Plus className="h-5 w-5" />
                <span>Add Subject Group</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-outline">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Practice Site / Teacher</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectGroups.map((group) => {
                    const matchedSubject = subjects.find(s => s.id === group.subjectId);
                    const matchedSite = trainingSites.find(s => s.id === group.hospitalId);
                    const matchedTeacher = teachers.find(t => t.id === group.teacherId);
                    const groupStudentsCount = students.filter(s => s.subjectId === group.subjectId && s.groupId === group.id).length;
                    const isFull = group.capacity ? groupStudentsCount >= group.capacity : false;
                    
                    return (
                      <tr key={group.id} className="border-b border-outline hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/5 text-primary flex items-center justify-center font-extrabold text-xs">
                              {group.groupName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-800 text-sm">{group.groupName}</div>
                              {matchedSubject ? (
                                <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-0.5">{matchedSubject.subjectCode} - {matchedSubject.subjectName}</div>
                              ) : (
                                <div className="text-[10px] text-slate-300 italic font-mono uppercase mt-0.5">Unknown Subject</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                              {matchedSite ? matchedSite.name : "No Practice Site"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {matchedTeacher ? matchedTeacher.name : "Unassigned Teacher"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {group.startDate && group.endDate ? (
                            <div className="text-[10px] font-bold text-slate-600">
                              {group.startDate} - {group.endDate}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">No period set</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black w-fit ${isFull ? 'bg-medical-red/10 text-medical-red' : 'bg-slate-100 text-slate-600'}`}>
                              {groupStudentsCount} / {group.capacity || "∞"}
                            </span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${isFull ? 'bg-medical-red' : 'bg-primary'}`}
                                style={{ width: `${Math.min((groupStudentsCount / (group.capacity || 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleOpenEditGroup(group)}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-primary-container/20 rounded-xl transition-all"
                              title="Edit Group"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              disabled={groupStudentsCount > 0}
                              onClick={() => {
                                setSelectedGroup(group);
                                setIsDeleteGroupOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-medical-red hover:bg-medical-red/10 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                              title={groupStudentsCount > 0 ? "Cannot delete group with active students" : "Delete Group"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {subjectGroups.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                        No subject groups configured. Click "Add Subject Group" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <input
        id="excel-import"
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleImport}
      />

      {/* Student Modal */}
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
                <label className="md-label flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Title
                </label>
                <input
                  placeholder="e.g. Mr., Ms."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label">Email</label>
                <input
                  type="email"
                  placeholder="e.g. email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="md-label">Notes</label>
                <textarea
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="md-input min-h-[100px] resize-none"
                />
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <label className="md-label flex items-center gap-2">
                <BookOpen className="h-3 w-3" />
                Clinical Course *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
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
                      setFormData({ ...formData, subjectId: "", groupId: "" });
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
                          setFormData({ ...formData, subjectId: s.id, groupId: "" });
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

            <div className="space-y-2">
              <label className="md-label flex items-center gap-2">
                <Users className="h-3 w-3" />
                Subject Group *
              </label>
              <select
                required
                disabled={!formData.subjectId}
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                className="md-input appearance-none bg-no-repeat bg-[right_1rem_center] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
              >
                <option value="">{formData.subjectId ? "-- Select Subject Group --" : "-- Select Subject Course First --"}</option>
                {subjectGroups
                  .filter(g => g.subjectId === formData.subjectId)
                  .map(g => (
                    <option key={g.id} value={g.id}>{g.groupName}</option>
                  ))
                }
              </select>
              {formData.subjectId && subjectGroups.filter(g => g.subjectId === formData.subjectId).length === 0 && (
                <p className="text-xs font-bold text-amber-500 mt-1 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  No groups defined for this clinical course. Please create one in the "Subject Groups" tab.
                </p>
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

      {/* Subject Group Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={selectedGroup ? "Edit Subject Group" : "Create Subject Group"}
      >
        <form onSubmit={handleSaveGroup} className="space-y-8">
          {groupError && (
            <div className="p-5 bg-medical-red/5 text-medical-red text-sm font-bold rounded-2xl border border-medical-red/20 flex items-center gap-4 animate-in fade-in">
              <AlertCircle className="h-6 w-6 shrink-0" />
              {groupError}
            </div>
          )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Group Name *
                </label>
                <input
                  required
                  placeholder="e.g. Group A, Cohort 1"
                  value={groupFormData.groupName}
                  onChange={(e) => setGroupFormData({ ...groupFormData, groupName: e.target.value })}
                  className="md-input"
                />
              </div>

              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  Clinical Course *
                </label>
                <select
                  required
                  value={groupFormData.subjectId}
                  onChange={(e) => setGroupFormData({ ...groupFormData, subjectId: e.target.value })}
                  className="md-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                >
                  <option value="">-- Select Clinical Course --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.subjectName} ({s.subjectCode})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <Plus className="h-3 w-3" />
                  Practice Site
                </label>
                <select
                  value={groupFormData.hospitalId}
                  onChange={(e) => setGroupFormData({ ...groupFormData, hospitalId: e.target.value })}
                  className="md-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                >
                  <option value="">-- Select Practice Site --</option>
                  {trainingSites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="md-label flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Assigned Teacher
                </label>
                <select
                  value={groupFormData.teacherId}
                  onChange={(e) => setGroupFormData({ ...groupFormData, teacherId: e.target.value })}
                  className="md-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="md-label">Start Date</label>
                <input
                  type="date"
                  value={groupFormData.startDate}
                  onChange={(e) => setGroupFormData({ ...groupFormData, startDate: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label">End Date</label>
                <input
                  type="date"
                  value={groupFormData.endDate}
                  onChange={(e) => setGroupFormData({ ...groupFormData, endDate: e.target.value })}
                  className="md-input"
                />
              </div>
              <div className="space-y-2">
                <label className="md-label">Student Capacity</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={groupFormData.capacity}
                  onChange={(e) => setGroupFormData({ ...groupFormData, capacity: parseInt(e.target.value) || 0 })}
                  className="md-input"
                />
              </div>
            </div>

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-outline">
            <button
              type="button"
              onClick={() => setIsGroupModalOpen(false)}
              className="md-button-text py-3.5 px-8"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="md-button-filled py-3.5 px-10 flex items-center gap-3"
            >
              <Users className="h-5 w-5" />
              <span>{selectedGroup ? "Update Group" : "Create Group"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deletions */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete student ${selectedStudent?.fullName}? All associated data will be removed.`}
      />

      <ConfirmDialog
        isOpen={isDeleteGroupOpen}
        onClose={() => setIsDeleteGroupOpen(false)}
        onConfirm={handleDeleteGroup}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete group "${selectedGroup?.groupName}"? This action cannot be undone.`}
      />
    </div>
  );
}
