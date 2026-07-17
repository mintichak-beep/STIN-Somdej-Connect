import React, { useState, useMemo } from 'react';
import { 
  UserPlus, UserCheck, ShieldAlert, KeyRound, Building, Car, 
  FileSpreadsheet, Download, FileUp, X, Check, Eye 
} from 'lucide-react';
import { mockDB } from '../services/mockData';
import { Student, Teacher, Room, TransportSchedule, AcademicYear, Course, Section, Hospital } from '../types/db';

interface QuickActionCardProps {
  onAddStudent: (data: Omit<Student, 'id' | 'createdAt'>) => void;
  onAddTeacher: (data: Omit<Teacher, 'id'>) => void;
  onAssignRoom: (roomId: string, studentId: string) => void;
  onAssignTransportation: (scheduleId: string, studentId: string, pickup: string, dropoff: string) => void;
  onImportExcel: (csvText: string) => void;
  onExportReport: (reportType: string) => void;
  academicYears: AcademicYear[];
  courses: Course[];
  sections: Section[];
  hospitals: Hospital[];
  rooms: Room[];
  schedules: TransportSchedule[];
  isAdmin: boolean;
}

type ModalType = 'student' | 'teacher' | 'room' | 'transport' | 'import' | 'export' | null;

export function QuickActionCard({
  onAddStudent,
  onAddTeacher,
  onAssignRoom,
  onAssignTransportation,
  onImportExcel,
  onExportReport,
  academicYears,
  courses,
  sections,
  hospitals,
  rooms,
  schedules,
  isAdmin
}: QuickActionCardProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Lists of students for assignments
  const studentList = useMemo(() => mockDB.getStudents(), [activeModal]);
  const teacherList = useMemo(() => mockDB.getTeachers(), [activeModal]);

  // Form States - Student
  const [studentForm, setStudentForm] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    academicYearId: academicYears[0]?.id || '',
    semester: '1',
    courseId: courses[0]?.id || '',
    sectionId: '',
    hospitalId: hospitals[0]?.id || '',
    roomId: ''
  });

  // Form States - Teacher
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    teacherId: '',
    email: '',
    phone: '',
    department: 'Nursing Science',
    courseIds: [] as string[]
  });

  // Form States - Room Assign
  const [roomAssignForm, setRoomAssignForm] = useState({
    studentId: '',
    roomId: ''
  });

  // Form States - Transport Assign
  const [transportAssignForm, setTransportAssignForm] = useState({
    studentId: '',
    scheduleId: '',
    pickupLocation: 'STIN Main Campus',
    dropoffLocation: ''
  });

  // Form States - Excel Import
  const [excelText, setExcelText] = useState('');

  // Form States - Export Report
  const [exportType, setExportType] = useState('Placement Summary');

  // Load template helper
  const loadExcelTemplate = () => {
    setExcelText(
      `StudentID,Name,Email,Phone\nS6601088,Miss Lalita Somdee,lalita@stin.ac.th,089-111-2222\nS6601089,Mr. Tanakorn Boonmee,tanakorn@stin.ac.th,089-333-4444`
    );
  };

  const handleOpenModal = (type: ModalType) => {
    if (!isAdmin) {
      alert('Permission Denied: Only administrators can trigger clinical management mutations.');
      return;
    }
    setActiveModal(type);
    
    // Reset forms
    if (type === 'student') {
      setStudentForm({
        name: '',
        studentId: '',
        email: '',
        phone: '',
        academicYearId: academicYears.find(ay => ay.status === 'active')?.id || academicYears[0]?.id || '',
        semester: '1',
        courseId: courses[0]?.id || '',
        sectionId: sections.find(s => s.courseId === courses[0]?.id)?.id || '',
        hospitalId: hospitals[0]?.id || '',
        roomId: ''
      });
    } else if (type === 'teacher') {
      setTeacherForm({
        name: '',
        teacherId: '',
        email: '',
        phone: '',
        department: 'Nursing Science',
        courseIds: []
      });
    } else if (type === 'room') {
      setRoomAssignForm({
        studentId: studentList[0]?.id || '',
        roomId: rooms.find(r => r.status === 'active')?.id || ''
      });
    } else if (type === 'transport') {
      const firstSchedule = schedules[0];
      setTransportAssignForm({
        studentId: studentList[0]?.id || '',
        scheduleId: firstSchedule?.id || '',
        pickupLocation: 'STIN Main Campus',
        dropoffLocation: firstSchedule ? firstSchedule.route.split('⇄')[1]?.trim() : ''
      });
    } else if (type === 'import') {
      setExcelText('');
    }
  };

  // Submissions
  const submitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.studentId || !studentForm.email) {
      alert('Please fill out name, student ID, and email.');
      return;
    }
    onAddStudent({
      ...studentForm,
      status: 'active'
    });
    setActiveModal(null);
  };

  const submitTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.teacherId || !teacherForm.email) {
      alert('Please fill out name, teacher ID, and email.');
      return;
    }
    onAddTeacher({
      ...teacherForm,
      status: 'active'
    });
    setActiveModal(null);
  };

  const submitRoomAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomAssignForm.studentId || !roomAssignForm.roomId) {
      alert('Please select both a student and a dormitory room.');
      return;
    }
    onAssignRoom(roomAssignForm.roomId, roomAssignForm.studentId);
    setActiveModal(null);
  };

  const submitTransportAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transportAssignForm.studentId || !transportAssignForm.scheduleId || !transportAssignForm.dropoffLocation) {
      alert('Please complete all transportation fields.');
      return;
    }
    onAssignTransportation(
      transportAssignForm.scheduleId,
      transportAssignForm.studentId,
      transportAssignForm.pickupLocation,
      transportAssignForm.dropoffLocation
    );
    setActiveModal(null);
  };

  const submitImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelText.trim()) {
      alert('Pasted template text is empty.');
      return;
    }
    onImportExcel(excelText);
    setActiveModal(null);
  };

  const submitExport = (e: React.FormEvent) => {
    e.preventDefault();
    onExportReport(exportType);
    setActiveModal(null);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600/10 via-red-600/20 to-red-600/10" />
      
      <div className="mb-4 border-b border-gray-50 pb-3 dark:border-zinc-800/60">
        <h4 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
          Terminal Quick Actions
        </h4>
        <p className="text-[10px] text-gray-400 dark:text-zinc-500">Instant database operations console</p>
      </div>

      {/* Grid of buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="btn-action-add-student"
          onClick={() => handleOpenModal('student')}
          disabled={!isAdmin}
          className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-slate-50/50 p-3.5 text-center transition-all hover:bg-red-50/40 hover:text-red-600 disabled:opacity-40 dark:border-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-red-950/20"
        >
          <UserPlus className="h-5 w-5 stroke-[1.5]" />
          <span className="mt-1.5 text-xs font-bold">Add Student</span>
        </button>

        <button
          id="btn-action-add-teacher"
          onClick={() => handleOpenModal('teacher')}
          disabled={!isAdmin}
          className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-slate-50/50 p-3.5 text-center transition-all hover:bg-red-50/40 hover:text-red-600 disabled:opacity-40 dark:border-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-red-950/20"
        >
          <UserCheck className="h-5 w-5 stroke-[1.5]" />
          <span className="mt-1.5 text-xs font-bold">Add Teacher</span>
        </button>

        <button
          id="btn-action-assign-room"
          onClick={() => handleOpenModal('room')}
          disabled={!isAdmin}
          className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-slate-50/50 p-3.5 text-center transition-all hover:bg-red-50/40 hover:text-red-600 disabled:opacity-40 dark:border-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-red-950/20"
        >
          <Building className="h-5 w-5 stroke-[1.5]" />
          <span className="mt-1.5 text-xs font-bold">Assign Room</span>
        </button>

        <button
          id="btn-action-assign-transport"
          onClick={() => handleOpenModal('transport')}
          disabled={!isAdmin}
          className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-slate-50/50 p-3.5 text-center transition-all hover:bg-red-50/40 hover:text-red-600 disabled:opacity-40 dark:border-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-red-950/20"
        >
          <Car className="h-5 w-5 stroke-[1.5]" />
          <span className="mt-1.5 text-xs font-bold">Assign Bus</span>
        </button>

        <button
          id="btn-action-import"
          onClick={() => handleOpenModal('import')}
          disabled={!isAdmin}
          className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-slate-50/50 p-3.5 text-center transition-all hover:bg-red-50/40 hover:text-red-600 disabled:opacity-40 dark:border-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-red-950/20"
        >
          <FileUp className="h-5 w-5 stroke-[1.5]" />
          <span className="mt-1.5 text-xs font-bold">Import Excel</span>
        </button>

        <button
          id="btn-action-export"
          onClick={() => handleOpenModal('export')}
          className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-slate-50/50 p-3.5 text-center transition-all hover:bg-red-50/40 hover:text-red-600 dark:border-zinc-900 dark:bg-zinc-900/50 dark:hover:bg-red-950/20"
        >
          <FileSpreadsheet className="h-5 w-5 stroke-[1.5]" />
          <span className="mt-1.5 text-xs font-bold">Export Report</span>
        </button>
      </div>

      {!isAdmin && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50/60 p-3 border border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/40">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>Observer Mode:</strong> Teachers and Students have read-only access to placements summary statistics. Direct mutations are locked.
          </p>
        </div>
      )}

      {/* MODAL SYSTEM */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            {/* Modal header */}
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-zinc-800">
              <h3 className="font-sans text-base font-bold text-gray-900 dark:text-zinc-50">
                {activeModal === 'student' && 'Register Clinical Placement Student'}
                {activeModal === 'teacher' && 'Add Clinical Faculty Profile'}
                {activeModal === 'room' && 'Dormitory Room Allocation'}
                {activeModal === 'transport' && 'Vehicle Assignment'}
                {activeModal === 'import' && 'Import Student Batch from Excel'}
                {activeModal === 'export' && 'Export Placements Report'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-zinc-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal content Forms */}
            {activeModal === 'student' && (
              <form onSubmit={submitStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Student Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Miss Apisara Rakdee"
                      value={studentForm.name}
                      onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Student ID</label>
                    <input
                      type="text"
                      required
                      placeholder="S6601011"
                      value={studentForm.studentId}
                      onChange={e => setStudentForm({ ...studentForm, studentId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="apisara@stin.ac.th"
                      value={studentForm.email}
                      onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
                    <input
                      type="text"
                      placeholder="081-445-5667"
                      value={studentForm.phone}
                      onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Placement Course</label>
                    <select
                      value={studentForm.courseId}
                      onChange={e => setStudentForm({ ...studentForm, courseId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name.split(' ')[0]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Hospital Placement</label>
                    <select
                      value={studentForm.hospitalId}
                      onChange={e => setStudentForm({ ...studentForm, hospitalId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Optional: Room Assignment</label>
                  <select
                    value={studentForm.roomId}
                    onChange={e => setStudentForm({ ...studentForm, roomId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="">Do Not Assign Dormitory Room Yet</option>
                    {rooms.filter(r => r.status === 'active').map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} (Occupied {r.occupiedCount}/{r.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Register Student
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'teacher' && (
              <form onSubmit={submitTeacher} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Teacher Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Ajarn Sunee Rakdee"
                      value={teacherForm.name}
                      onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Teacher ID</label>
                    <input
                      type="text"
                      required
                      placeholder="T006"
                      value={teacherForm.teacherId}
                      onChange={e => setTeacherForm({ ...teacherForm, teacherId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="sunee@stin.ac.th"
                      value={teacherForm.email}
                      onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
                    <input
                      type="text"
                      placeholder="083-456-7890"
                      value={teacherForm.phone}
                      onChange={e => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Department</label>
                  <select
                    value={teacherForm.department}
                    onChange={e => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="Fundamental Nursing">Fundamental Nursing</option>
                    <option value="Obstetric Nursing">Obstetric Nursing</option>
                    <option value="Community Nursing">Community Nursing</option>
                    <option value="Nursing Administration">Nursing Administration</option>
                  </select>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Save Teacher Profile
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'room' && (
              <form onSubmit={submitRoomAssign} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Select Student</label>
                  <select
                    value={roomAssignForm.studentId}
                    onChange={e => setRoomAssignForm({ ...roomAssignForm, studentId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="">-- Choose student --</option>
                    {studentList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.studentId} - {s.name} ({s.roomId ? 'Has Dorm Room' : 'Needs Accommodation'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Select Available Dormitory Room</label>
                  <select
                    value={roomAssignForm.roomId}
                    onChange={e => setRoomAssignForm({ ...roomAssignForm, roomId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="">-- Choose room --</option>
                    {rooms.filter(r => r.status === 'active').map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} (Occupied {r.occupiedCount}/{r.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Assign Dorm Room
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'transport' && (
              <form onSubmit={submitTransportAssign} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Select Student</label>
                  <select
                    value={transportAssignForm.studentId}
                    onChange={e => setTransportAssignForm({ ...transportAssignForm, studentId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="">-- Choose student --</option>
                    {studentList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.studentId} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Select Transport Route</label>
                  <select
                    value={transportAssignForm.scheduleId}
                    onChange={e => {
                      const selectedSched = schedules.find(sc => sc.id === e.target.value);
                      const destination = selectedSched ? selectedSched.route.split('⇄')[1]?.trim() : '';
                      setTransportAssignForm({ 
                        ...transportAssignForm, 
                        scheduleId: e.target.value,
                        dropoffLocation: destination || ''
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="">-- Choose route --</option>
                    {schedules.map(sc => (
                      <option key={sc.id} value={sc.id}>
                        {sc.route} (Starts {sc.departureTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Pickup Location</label>
                    <input
                      type="text"
                      required
                      value={transportAssignForm.pickupLocation}
                      onChange={e => setTransportAssignForm({ ...transportAssignForm, pickupLocation: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Dropoff Location</label>
                    <input
                      type="text"
                      required
                      value={transportAssignForm.dropoffLocation}
                      onChange={e => setTransportAssignForm({ ...transportAssignForm, dropoffLocation: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Assign Seat
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'import' && (
              <form onSubmit={submitImport} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Paste Excel CSV Data</label>
                    <button
                      type="button"
                      onClick={loadExcelTemplate}
                      className="text-[10px] font-semibold text-red-600 hover:underline"
                    >
                      Load Sample Template
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    required
                    placeholder="StudentID,Name,Email,Phone&#10;S6601051,Apisara Rakdee,apisara@stin.ac.th,089-222-3333"
                    value={excelText}
                    onChange={e => setExcelText(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white p-3 font-mono text-[11px] text-gray-900 outline-hidden focus:border-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>

                <p className="text-[10px] text-gray-400">
                  Imported records will auto-assign to the currently active term (AY 2569 Semester 1) and default courses.
                </p>

                <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Import Batch
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'export' && (
              <form onSubmit={submitExport} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Report Category</label>
                  <select
                    value={exportType}
                    onChange={e => setExportType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="Placement Summary">Clinical Placement Registry</option>
                    <option value="Dormitory Room Occupancy">Dormitory Housing Occupancy</option>
                    <option value="Transportation Schedule Assignments">Transportation Seat Assignments</option>
                    <option value="All Academic Rollups">Unified CPATMS Master Record</option>
                  </select>
                </div>

                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Generated reports will include student IDs, name, course assignments, assigned hospital wards, dormitory room keys, and vehicle seat schedules in tabular CSV format.
                </p>

                <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CSV Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
