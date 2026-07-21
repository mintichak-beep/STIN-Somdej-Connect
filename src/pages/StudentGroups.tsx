import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, UserCheck, X, Check, AlertTriangle } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { studentGroupService, studentService, courseService } from '../services/app.service';
import { StudentGroup, Student, Course } from '../types/app';
import { deduplicationService } from '../services/deduplication.service';
import { RelationshipService } from '../services/relationship.service';

export function StudentGroups() {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);
  const [integrityError, setIntegrityError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<StudentGroup>>({
    name: '',
    studentIds: [],
    courseId: ''
  });

  const fetchData = async () => {
    const [groupData, studentData, courseData] = await Promise.all([
      studentGroupService.getAll(),
      studentService.getAll(),
      courseService.getAll()
    ]);
    setGroups(groupData);
    setStudents(studentData);
    setCourses(courseData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedGroup(null);
    setFormData({
      name: '',
      studentIds: [],
      courseId: ''
    });
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: StudentGroup) => {
    setSelectedGroup(group);
    setFormData(group);
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!bypassDuplicate) {
        const dup = await deduplicationService.checkDuplicateBeforeSave("studentGroups", formData, selectedGroup?.id);
        if (dup) {
          setDuplicateWarning(`A student group with name "${formData.name}" already exists for this course. Do you want to proceed and create a duplicate?`);
          setIsSaving(false);
          return;
        }
      }

      let savedGroupId = selectedGroup?.id;
      if (selectedGroup) {
        await studentGroupService.update(selectedGroup.id, formData);
      } else {
        savedGroupId = await studentGroupService.create(formData as any);
      }

      if (savedGroupId) {
        const savedGroup = { id: savedGroupId, ...formData } as StudentGroup;
        await RelationshipService.syncStudentGroupChanges(savedGroup, formData.studentIds || []);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBypassAndSave = async () => {
    setDuplicateWarning(null);
    setBypassDuplicate(true);
    setIsSaving(true);
    try {
      let savedGroupId = selectedGroup?.id;
      if (selectedGroup) {
        await studentGroupService.update(selectedGroup.id, formData);
      } else {
        savedGroupId = await studentGroupService.create(formData as any);
      }

      if (savedGroupId) {
        const savedGroup = { id: savedGroupId, ...formData } as StudentGroup;
        await RelationshipService.syncStudentGroupChanges(savedGroup, formData.studentIds || []);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setIsSaving(false);
      setBypassDuplicate(false);
    }
  };

  const handleDelete = async (group: StudentGroup) => {
    setIntegrityError(null);
    const check = await RelationshipService.checkStudentGroupDeletion(group.id);
    if (!check.canDelete) {
      setIntegrityError(check.message || "Cannot delete group because related records exist.");
      return;
    }

    if (confirm('Are you sure you want to delete this group?')) {
      await studentGroupService.delete(group.id);
      fetchData();
    }
  };

  const toggleStudent = (studentId: string) => {
    const currentIds = formData.studentIds || [];
    if (currentIds.includes(studentId)) {
      setFormData({ ...formData, studentIds: currentIds.filter(id => id !== studentId) });
    } else {
      setFormData({ ...formData, studentIds: [...currentIds, studentId] });
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        title="Student Clinical Groups"
        data={groups}
        searchFields={["name"]}
        columns={[
          {
            header: "Group Name",
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {courses.find(c => c.id === item.courseId)?.courseCode || "General Group"}
                  </span>
                </div>
              </div>
            )
          },
          {
            header: "Total Students",
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                  {item.studentIds?.length || 0} Students
                </div>
              </div>
            )
          },
          {
            header: "Members",
            accessor: (item) => (
              <div className="flex -space-x-2 overflow-hidden">
                {item.studentIds?.slice(0, 5).map((id, i) => (
                  <div key={id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                    {students.find(s => s.id === id)?.fullName.charAt(0) || "?"}
                  </div>
                ))}
                {item.studentIds?.length > 5 && (
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-800 flex items-center justify-center text-[8px] font-bold text-white">
                    +{item.studentIds.length - 5}
                  </div>
                )}
              </div>
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
        title={selectedGroup ? "Edit Student Group" : "Create Student Group"}
        maxWidth="max-w-3xl"
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

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Group Name</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Group A - Med/Surg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">Select Course (Optional)</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.courseCode} {c.courseName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assign Students ({formData.studentIds?.length || 0})</label>
              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
              {filteredStudents.map(student => {
                const isSelected = formData.studentIds?.includes(student.id);
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => toggleStudent(student.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-slate-100 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 truncate">{student.fullName}</p>
                      <p className="text-[9px] font-medium text-slate-400 uppercase">{student.studentId}</p>
                    </div>
                  </button>
                );
              })}
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
              {isSaving ? "Saving..." : "Save Group"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
