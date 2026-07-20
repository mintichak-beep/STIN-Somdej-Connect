import { Shield, User, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onSelectRole: (role: "Teacher" | "Student") => void;
}

export function LandingPage({ onSelectRole }: LandingPageProps) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 transition-colors duration-300">
      {/* Upper Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/80 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-500/20 font-black">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5V3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase">STIN-Somdej Connect</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500">
                Srisavarindhira Thai Red Cross Institute of Nursing
              </p>
            </div>
          </div>
          <div className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase hidden sm:block">
            Dormitory & Placement Management
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center px-6 py-12 md:py-20">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex rounded-full bg-red-50 dark:bg-red-950/30 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-pulse">
            Dormitory Management System
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
              Centralized <span className="text-red-600 dark:text-red-500">Dormitory & Utilities</span> Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed font-bold">
              ยินดีต้อนรับสู่ระบบบริหารจัดการแหล่งฝึก การเดินทาง หอพักและค่าน้ำ-ค่าไฟสถาบันการพยาบาลศรีสวรินทิรา สภากาชาดไทย กรุณาเลือกสถานะเพื่อเข้าใช้งาน
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto pt-8">
            
            {/* Card 1: Teacher */}
            <div className="group relative rounded-3xl border border-slate-100 bg-white p-8 text-left shadow-xl shadow-slate-100/40 dark:shadow-none transition-all hover:border-red-500/50 hover:-translate-y-1 dark:border-zinc-900 dark:bg-zinc-900 dark:hover:border-red-900/45">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Teacher
              </h3>
              <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400 font-bold leading-relaxed min-h-[48px]">
                Manage students, rooms, utility bills, payments, and reports.
              </p>
              <div className="mt-6 pt-2">
                <button
                  onClick={() => onSelectRole("Teacher")}
                  className="w-full inline-flex items-center justify-between px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-red-500/10 cursor-pointer"
                >
                  <span>Enter Teacher Portal</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Card 2: Student */}
            <div className="group relative rounded-3xl border border-slate-100 bg-white p-8 text-left shadow-xl shadow-slate-100/40 dark:shadow-none transition-all hover:border-red-500/50 hover:-translate-y-1 dark:border-zinc-900 dark:bg-zinc-900 dark:hover:border-red-900/45">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 mb-6 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Student
              </h3>
              <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400 font-bold leading-relaxed min-h-[48px]">
                View personal information, room details, utility bills, and upload payment slips.
              </p>
              <div className="mt-6 pt-2">
                <button
                  onClick={() => onSelectRole("Student")}
                  className="w-full inline-flex items-center justify-between px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-white rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-zinc-500/10 cursor-pointer"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-zinc-900 px-6 py-6 bg-white dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 dark:text-zinc-500 font-black tracking-wider uppercase">
          <p>© 2026 Srisavarindhira Thai Red Cross Institute of Nursing. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span>Dormitory Management System v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
