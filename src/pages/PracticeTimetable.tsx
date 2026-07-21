import React, { useState, useEffect } from 'react';
import { timetableService } from '../services/timetable.service';
import { Timetable } from '../types/timetable';
import { Timestamp } from 'firebase/firestore';

export const PracticeTimetable = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const fetchData = async () => {
    const data = await timetableService.getTimetables();
    setTimetables(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await timetableService.createTimetable({
      academicYear,
      semester,
      subjectId,
      practiceSiteId: 'site-1', // Simplified
      studentGroupId: 'group-1', // Simplified
      startDate: new Date(),
      endDate: new Date(),
      weeklySchedule: [],
      numberOfStudents: 0,
      assignedTeacherId: 'teacher-1',
    });
    setAcademicYear('');
    setSemester('');
    setSubjectId('');
    fetchData();
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-black uppercase tracking-tight">Practice Timetable</h1>
      
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-bold">Create New Timetable</h2>
        <input type="text" placeholder="Academic Year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full p-2 border rounded" />
        <input type="text" placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full p-2 border rounded" />
        <input type="text" placeholder="Subject ID" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full p-2 border rounded" />
        <button type="submit" className="bg-[#D32F2F] text-white px-4 py-2 rounded">Create</button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Timetable List</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left font-bold">Academic Year</th>
              <th className="text-left font-bold">Semester</th>
              <th className="text-left font-bold">Subject</th>
            </tr>
          </thead>
          <tbody>
            {timetables.map((t) => (
              <tr key={t.id}>
                <td>{t.academicYear}</td>
                <td>{t.semester}</td>
                <td>{t.subjectId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
