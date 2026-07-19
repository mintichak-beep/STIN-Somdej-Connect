import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Users, BookOpen, Building2, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { practiceGroupService } from '../services/practiceGroup.service';
import { courseService } from '../services/course.service';
import { hospitalService } from '../services/hospital.service';
import { PracticeGroup, Course, Hospital, Student } from '../types/db';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const PracticeGroupCenter = () => {
  const [groups, setGroups] = useState<PracticeGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PracticeGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<PracticeGroup | null>(null);
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    hospitalId: '',
    academicYear: '2569',
    semester: '1',
    capacity: 10,
    status: 'active' as 'active' | 'inactive'
  });

  const fetchData = async () => {
    setLoading(true);
    const [groupsData, coursesData, hospitalsData] = await Promise.all([
      practiceGroupService.getAll(search),
      courseService.getAll('', 'active'),
      hospitalService.getAll({ status: 'active' })
    ]);
    setGroups(groupsData);
    setCourses(coursesData);
    setHospitals(hospitalsData.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const unsub1 = practiceGroupService.subscribe(fetchData);
    const unsub2 = courseService.subscribe(fetchData);
    const unsub3 = hospitalService.subscribe(fetchData);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await practiceGroupService.update(editingGroup.id, formData);
      } else {
        await practiceGroupService.create(formData);
      }
      setIsModalOpen(false);
      setEditingGroup(null);
      setFormData({
        name: '',
        courseId: '',
        hospitalId: '',
        academicYear: '2569',
        semester: '1',
        capacity: 10,
        status: 'active'
      });
      fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleEdit = (group: PracticeGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      courseId: group.courseId,
      hospitalId: group.hospitalId,
      academicYear: group.academicYear,
      semester: group.semester,
      capacity: group.capacity,
      status: group.status
    });
    setIsModalOpen(true);
  };

  const handleViewStudents = async (group: PracticeGroup) => {
    setViewingGroup(group);
    const students = await practiceGroupService.getStudentsInGroup(group.id);
    setGroupStudents(students);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6 text-zinc-900 dark:text-zinc-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Practice Group Center</h1>
          <p className="text-sm text-zinc-500 font-medium">Coordinate nursing practice rotations and student groups</p>
        </div>
        <button
          onClick={() => {
            setEditingGroup(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Create New Group
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSkeleton />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Group Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Course / Hospital</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">Period</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">Capacity</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500 font-medium">
                      No practice groups found
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => {
                    const course = courses.find(c => c.id === group.courseId);
                    const hospital = hospitals.find(h => h.id === group.hospitalId);
                    return (
                      <tr key={group.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-sm font-bold">{group.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              <BookOpen className="w-3 h-3 text-indigo-500" />
                              {course?.courseName || 'Unknown Course'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                              <Building2 className="w-3 h-3 text-rose-500" />
                              {hospital?.name || hospital?.hospitalNameTH || 'Unknown Hospital'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                            <CalendarIcon className="w-3 h-3" />
                            {group.academicYear}/{group.semester}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{group.capacity}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">Max Seats</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleViewStudents(group)}
                              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                              title="View Students"
                            >
                              <Eye className="w-4 h-4 text-indigo-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(group)}
                              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {editingGroup ? 'Edit Group' : 'Create New Group'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., Clinical Rotation A1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Assign Course</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select a course...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Assign Hospital</label>
                  <select
                    required
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select a hospital...</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name || h.hospitalNameTH}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Capacity</label>
                    <input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
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
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase transition-colors shadow-lg shadow-amber-200 dark:shadow-none"
                >
                  {editingGroup ? 'Save Changes' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Students Modal */}
      {isViewModalOpen && viewingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Students in {viewingGroup.name}</h2>
                <p className="text-xs text-zinc-500 font-medium">List of all assigned students for this rotation</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {groupStudents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-zinc-500 font-medium">No students currently assigned to this group</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groupStudents.map(student => (
                    <div key={student.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 text-xs">
                        {student.studentId.slice(-2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">{student.studentId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
