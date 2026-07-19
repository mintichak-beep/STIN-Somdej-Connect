import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { courseService } from '../services/course.service';
import { Course } from '../types/db';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const CourseCenter = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    academicYear: '2569',
    semester: '1',
    status: 'active' as 'active' | 'inactive'
  });

  const fetchCourses = async () => {
    setLoading(true);
    const data = await courseService.getAll(search);
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
    return courseService.subscribe(fetchCourses);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseService.update(editingCourse.id, formData);
      } else {
        await courseService.create(formData);
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      setFormData({
        courseCode: '',
        courseName: '',
        academicYear: '2569',
        semester: '1',
        status: 'active'
      });
      fetchCourses();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      academicYear: course.academicYear,
      semester: course.semester,
      status: course.status
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    await courseService.toggleStatus(id);
    fetchCourses();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Course Center</h1>
          <p className="text-sm text-zinc-500 font-medium">Manage nursing curriculum and clinical courses</p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Add New Course
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Code</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Course Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">Year/Sem</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500 font-medium">
                      No courses found matching your criteria
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300">
                          {course.courseCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{course.courseName}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {course.academicYear} / {course.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          course.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(course.id)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                            title={course.status === 'active' ? 'Disable' : 'Enable'}
                          >
                            {course.status === 'active' ? <ToggleRight className="w-5 h-5 text-indigo-600" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleEdit(course)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., NS321"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Course Name</label>
                  <input
                    type="text"
                    required
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Maternal Nursing Practice 1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Academic Year</label>
                    <input
                      type="text"
                      required
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
