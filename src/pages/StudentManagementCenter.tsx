import { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Edit2, 
  UserCheck, 
  UserX, 
  Building2, 
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { studentService } from '../services/student.service';
import { courseService } from '../services/course.service';
import { practiceGroupService } from '../services/practiceGroup.service';
import { hospitalService } from '../services/hospital.service';
import { Student, Course, PracticeGroup, Hospital } from '../types/db';
import { DashboardCard } from '../components/DashboardCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../hooks/useAuth';

export const StudentManagementCenter = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<PracticeGroup[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterHospital, setFilterHospital] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignType, setAssignType] = useState<'group' | 'hospital'>('group');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'active' as const
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, cData, gData, hData] = await Promise.all([
        studentService.getStudents(),
        courseService.getAll(),
        practiceGroupService.getAll(),
        hospitalService.getAll({ limit: 1000 })
      ]);
      setStudents(sData);
      setCourses(cData);
      setGroups(gData);
      setHospitals(hData.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || '',
      status: (student.status as any) || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await studentService.updateStudent(selectedStudent.id, {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim()
      });
      fetchData();
      setIsEditModalOpen(false);
    } catch (error) {
      alert('Error updating student');
    }
  };

  const handleDeactivate = async (student: Student) => {
    if (!confirm(`Are you sure you want to deactivate ${student.fullName}?`)) return;
    try {
      await studentService.updateStudent(student.id, { status: 'inactive' });
      fetchData();
    } catch (error) {
      alert('Error deactivating student');
    }
  };

  const handleAssign = async (targetId: string) => {
    if (!selectedStudent) return;
    try {
      if (assignType === 'group') {
        await studentService.assignPracticeGroup(selectedStudent.id, targetId);
      } else {
        await studentService.assignHospital(selectedStudent.id, targetId);
      }
      fetchData();
      setIsAssignModalOpen(false);
    } catch (error) {
      alert('Error assigning student');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = filterCourse === 'all' || s.courseId === filterCourse;
    const matchesGroup = filterGroup === 'all' || s.practiceGroupId === filterGroup;
    const matchesHospital = filterHospital === 'all' || s.hospitalId === filterHospital;
    
    return matchesSearch && matchesCourse && matchesGroup && matchesHospital;
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Student Management Center</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage student profiles, corrections, and placement assignments.</p>
        </div>
      </div>

      <DashboardCard id="student-filters" title="Filters & Search" icon={Filter}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative col-span-1 md:col-span-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID or Name..."
              className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select
            className="rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="all">All Groups</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            value={filterHospital}
            onChange={(e) => setFilterHospital(e.target.value)}
          >
            <option value="all">All Hospitals</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.hospitalNameTH || h.hospitalNameEN}</option>
            ))}
          </select>
        </div>
      </DashboardCard>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Group</th>
                <th className="px-6 py-4">Hospital</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">{student.fullName}</span>
                      <span className="text-xs text-gray-500">{student.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">
                    {courses.find(c => c.id === student.courseId)?.courseCode || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setSelectedStudent(student);
                        setAssignType('group');
                        setIsAssignModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-red-600 hover:underline dark:text-red-400"
                    >
                      <Users className="h-3.5 w-3.5" />
                      {groups.find(g => g.id === student.practiceGroupId)?.name || 'Unassigned'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setSelectedStudent(student);
                        setAssignType('hospital');
                        setIsAssignModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-red-600 hover:underline dark:text-red-400"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      {hospitals.find(h => h.id === student.hospitalId)?.shortName || 'Unassigned'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(student)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                        title="Edit Student"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeactivate(student)}
                        className={`rounded-lg p-1.5 ${
                          student.status === 'active' 
                            ? 'text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20' 
                            : 'text-green-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20'
                        }`}
                        title={student.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {student.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertCircle className="mb-2 h-10 w-10 text-gray-300" />
              <p>No students found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950"
            >
              <h3 className="mb-4 text-xl font-bold dark:text-white">Edit Student Information</h3>
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium dark:text-zinc-300">First Name</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium dark:text-zinc-300">Last Name</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-zinc-300">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-zinc-300">Phone</label>
                  <input
                    type="tel"
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950"
            >
              <h3 className="mb-1 text-xl font-bold dark:text-white">
                {assignType === 'group' ? 'Assign Practice Group' : 'Assign Hospital Placement'}
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Select a target for {selectedStudent?.fullName}
              </p>
              
              <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
                {assignType === 'group' ? (
                  groups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => handleAssign(group.id)}
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        selectedStudent?.practiceGroupId === group.id
                          ? 'border-red-500 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'
                          : 'border-gray-100 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <div className="font-medium dark:text-white">{group.name}</div>
                        <div className="text-xs text-gray-500">Capacity: {group.capacity}</div>
                      </div>
                      {selectedStudent?.practiceGroupId === group.id && <CheckCircle2 className="h-5 w-5 text-red-600" />}
                    </button>
                  ))
                ) : (
                  hospitals.map(hospital => (
                    <button
                      key={hospital.id}
                      onClick={() => handleAssign(hospital.id)}
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        selectedStudent?.hospitalId === hospital.id
                          ? 'border-red-500 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'
                          : 'border-gray-100 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <div className="font-medium dark:text-white">{hospital.hospitalNameTH || hospital.hospitalNameEN}</div>
                        <div className="text-xs text-gray-500">{hospital.type} • {hospital.province}</div>
                      </div>
                      {selectedStudent?.hospitalId === hospital.id && <CheckCircle2 className="h-5 w-5 text-red-600" />}
                    </button>
                  ))
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
