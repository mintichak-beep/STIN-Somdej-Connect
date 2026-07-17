import { useMemo } from 'react';
import { Teacher, Course } from '../types/db';
import { UserCheck, Mail, Phone, BookOpen, GraduationCap } from 'lucide-react';

interface TeacherSummaryCardProps {
  teachers: Teacher[];
  courses: Course[];
}

export function TeacherSummaryCard({ teachers, courses }: TeacherSummaryCardProps) {
  const enhancedTeachers = useMemo(() => {
    return teachers.map(t => {
      const assignedCourses = t.courseIds.map(cId => {
        const c = courses.find(course => course.id === cId);
        return c ? c.code : '';
      }).filter(code => code !== '');

      return {
        ...t,
        assignedCoursesStr: assignedCourses.length > 0 ? assignedCourses.join(', ') : 'None'
      };
    });
  }, [teachers, courses]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600/10 via-red-600/20 to-red-600/10" />
      
      <div className="mb-4 border-b border-gray-50 pb-3 dark:border-zinc-800/60">
        <h4 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
          Clinical Faculty & Mentors
        </h4>
        <p className="text-[10px] text-gray-400 dark:text-zinc-500">Academic supervisors roster</p>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {enhancedTeachers.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">No supervisors registered.</p>
        ) : (
          enhancedTeachers.map(t => (
            <div key={t.id} className="group rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 transition-all hover:bg-slate-50 dark:border-zinc-900 dark:bg-zinc-900/30">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate flex items-center gap-1.5">
                    <GraduationCap className="h-4.5 w-4.5 text-red-600 shrink-0" />
                    <span>{t.name}</span>
                    <span className="text-[9px] font-semibold text-gray-400 dark:text-zinc-500">({t.teacherId})</span>
                  </h5>
                  <p className="mt-0.5 text-[10px] font-semibold text-gray-400 dark:text-zinc-500">
                    {t.department}
                  </p>
                  
                  <div className="mt-2 flex flex-col gap-1 text-[10px] text-gray-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 shrink-0" />
                      <a href={`mailto:${t.email}`} className="hover:underline hover:text-red-600 truncate">{t.email}</a>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 shrink-0" />
                      <a href={`tel:${t.phone}`} className="hover:underline hover:text-red-600">{t.phone}</a>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    t.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                  }`}>
                    {t.status === 'active' ? 'Duty Active' : 'On Leave'}
                  </span>
                  <div className="mt-2.5 text-right">
                    <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase block">Instructing:</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 mt-0.5">
                      <BookOpen className="h-3 w-3" />
                      {t.assignedCoursesStr}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
