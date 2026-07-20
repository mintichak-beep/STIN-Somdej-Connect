import React, { useState, useEffect } from 'react';
import { studentService } from '../services/app.service';
import { Student } from '../types/app';
import { Search, User, ArrowRight } from 'lucide-react';

interface StudentSelectionPageProps {
  onSelectStudent: (studentId: string) => void;
}

export const StudentSelectionPage: React.FC<StudentSelectionPageProps> = ({ onSelectStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = studentService.onSnapshot([], (data) => {
      setStudents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8 animate-in fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900">Student Selection</h2>
        <p className="text-sm text-slate-500 font-bold">Please select a student profile to continue.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by Student ID or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-100 text-sm font-semibold focus:border-red-500 focus:outline-hidden"
        />
      </div>

      {loading ? (
        <div className="text-center p-10">Loading...</div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectStudent(s.id)}
              className="w-full flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-red-500 transition-all hover:shadow-md"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-900">{s.fullName}</p>
                <p className="text-xs font-mono text-slate-500">{s.studentId}</p>
              </div>
              <ArrowRight className="text-slate-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
