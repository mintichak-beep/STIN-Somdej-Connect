import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Student } from '../types/db';
import { Search, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

export function StudentSearch() {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = studentId.trim();
    if (!id) {
      setError('กรุณากรอกรหัสนักศึกษา (Please enter your Student ID)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const students = storage.get<Student[]>('students') || [];
      
      // Search by studentId field
      const student = students.find(s => s.studentId === id || (s as any).studentNumber === id);

      if (student) {
        navigate(`/student/profile?id=${student.id}`);
        return;
      }

      setError('ไม่พบข้อมูลรหัสนักศึกษานี้ในระบบ (Student ID not found. Please double check.)');
    } catch (err: any) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5V3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight">STIN-Somdej Connect</h1>
              <p className="text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-500">
                Student Access Portal
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ย้อนกลับ (Back)
          </button>
        </div>
      </header>

      {/* Main Search Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              ค้นหาข้อมูลฝึกงานนักศึกษา
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              กรอกรหัสนักศึกษาเพื่อดูข้อมูลการฝึกปฏิบัติงาน ห้องพัก และการเดินทาง
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                รหัสนักศึกษา / Student ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="เช่น 6710001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 text-base font-bold transition-all text-center tracking-widest"
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:bg-red-800 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  ค้นหาข้อมูล (Search)
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="rounded-xl bg-gray-50 dark:bg-zinc-950/50 p-4 text-xs text-gray-500 dark:text-zinc-400 space-y-1 text-center">
            <p className="font-bold text-gray-700 dark:text-zinc-300">💡 คำแนะนำการใช้งาน</p>
            <p>กรอกรหัสประจำตัวนักศึกษา 7 หลักของสถาบัน</p>
            <p>ระบบนี้เข้าถึงข้อมูลในรูปแบบ อ่านอย่างเดียว (Read Only)</p>
          </div>
        </div>
      </main>
    </div>
  );
}
