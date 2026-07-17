import { LoginForm } from '../components/LoginForm';

export function Login() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Left side: Red Cross branding banner */}
      <div className="relative hidden md:flex md:w-1/2 flex-col justify-between bg-gradient-to-br from-red-700 via-red-800 to-red-950 p-12 text-white overflow-hidden">
        {/* Abstract design vector decorations in background */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-red-600/20 blur-2xl"></div>

        {/* Top brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600 shadow-md">
            {/* Elegant Red Cross Icon */}
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5V3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase">STIN</h1>
            <p className="text-[10px] font-semibold tracking-wider text-red-200">
              Srisavarindhira Thai Red Cross
            </p>
          </div>
        </div>

        {/* Core welcoming copy */}
        <div className="space-y-6 max-w-lg z-10 my-auto">
          <div className="inline-flex rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-red-100 backdrop-blur-md">
            Academic Year 2026/2027
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none">
            Clinical Placement Accommodation & Transportation
          </h2>
          <p className="text-base text-red-100/90 leading-relaxed">
            Welcome to the CPATMS portal for Srisavarindhira Thai Red Cross Institute of Nursing. Seamlessly manage academic schedules, clinic room allocations, and transit assignments in one integrated platform.
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-red-200 z-10 border-t border-white/10 pt-6">
          <p>© 2026 STIN Nursing Institute. All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Support</a>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
          </div>
        </div>
      </div>

      {/* Right side: Modern login card column */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 bg-white dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile brand header (visible on small displays only) */}
          <div className="flex md:hidden items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5V3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase text-gray-900 dark:text-white">CPATMS Portal</h2>
              <p className="text-[10px] font-semibold text-red-600 dark:text-red-500">STIN Nursing Institute</p>
            </div>
          </div>

          <div className="space-y-2 mb-8 text-left">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Sign In
            </h3>
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
              Enter your STIN account credentials to access CPATMS portal.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
