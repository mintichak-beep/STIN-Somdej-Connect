import { Link } from 'react-router-dom';
import { Shield, Search, ArrowRight, UserCheck } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 transition-colors duration-300">
      {/* Upper header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-500/20">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5V3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">STIN-Somdej Connect</h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-500">
                Srisavarindhira Thai Red Cross Institute of Nursing
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
            Academic Year 2026/2027
          </div>
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 flex flex-col justify-center px-6 py-12 md:py-24">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex rounded-full bg-red-50 dark:bg-red-950/30 px-4 py-1.5 text-xs font-bold tracking-wide text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            Clinical Placement Management System
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white max-w-3xl mx-auto">
            Connecting Students and Faculty to <span className="text-red-600">Clinical Excellence</span>
          </h2>
          
          <p className="text-base sm:text-lg text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Welcome to the centralized portal for nursing clinical training coordination. Effortlessly organize placement rotations, housing allocations, student records, and travel logistics in one unified workspace.
          </p>

          {/* Cards for Role pathways */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-8">
            
            {/* Student pathway */}
            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 text-left shadow-sm transition-all hover:border-red-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 mb-6">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Student Access
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                Lookup your schedule, practice location, roommate assignments, and transport records using your student ID without needing a password.
              </p>
              <div className="mt-6">
                <Link
                  to="/student"
                  className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Enter Student Portal
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Teacher pathway */}
            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 text-left shadow-sm transition-all hover:border-red-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Teacher Login
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                Authorized clinical instructors and coordinators sign in with an official institutional @stin.ac.th email address.
              </p>
              <div className="mt-6">
                <Link
                  to="/teacher/login"
                  className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Sign In as Teacher
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-zinc-900 px-6 py-6 bg-white dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 Srisavarindhira Thai Red Cross Institute of Nursing. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span className="font-semibold text-gray-500">Clinical Placement Management System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
