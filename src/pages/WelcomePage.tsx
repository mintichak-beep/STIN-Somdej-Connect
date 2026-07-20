import { Stethoscope, User, ArrowRight } from "lucide-react";

interface WelcomePageProps {
  onSelectRole: (role: "Teacher" | "Student") => void;
}

export function WelcomePage({ onSelectRole }: WelcomePageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/20 font-black">
              <span className="text-xl">+</span>
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tight uppercase text-slate-900">STIN-Somdej</h1>
              <p className="text-[9px] font-black uppercase tracking-widest text-red-600">Connect</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome</h2>
            <p className="text-sm text-slate-500 font-bold">Please select your role to proceed.</p>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            
            {/* Card 1: Teacher */}
            <button
              onClick={() => onSelectRole("Teacher")}
              className="w-full group flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-lg shadow-slate-100/50 transition-all hover:border-red-500/30 hover:bg-red-50/20"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 group-hover:scale-105 transition-transform">
                <Stethoscope className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-900">Teacher Portal</h3>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">Manage clinical assignments and students.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-red-600 transition-colors" />
            </button>

            {/* Card 2: Student */}
            <button
              onClick={() => onSelectRole("Student")}
              className="w-full group flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-lg shadow-slate-100/50 transition-all hover:border-red-500/30 hover:bg-red-50/20"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 group-hover:scale-105 transition-transform">
                <User className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-900">Student Portal</h3>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">View room details and manage bills.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
