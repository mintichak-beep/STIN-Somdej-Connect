import { ArrowRight, ShieldCheck, Users, User, GraduationCap } from "lucide-react";

interface WelcomePageProps {
  onSelectRole: (role: "Teacher" | "Student") => void;
}

export function WelcomePage({ onSelectRole }: WelcomePageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-[#FDF5E6] font-sans relative overflow-hidden">
      
      {/* Mobile Background (hidden on desktop) */}
      <div 
        className="md:hidden absolute inset-0 bg-cover bg-center z-0 opacity-20"
        style={{ backgroundImage: "url('/src/assets/images/medical_collage_background_1784615107928.jpg')" }}
      ></div>

      {/* Left Side: Blue Area */}
      <div className="flex w-full md:w-[55%] lg:w-[50%] flex-col justify-between bg-[#BBE2F9]/95 md:bg-[#BBE2F9] backdrop-blur-sm md:backdrop-blur-none p-6 md:p-12 lg:p-16 relative z-10 md:shadow-[20px_0_40px_-15px_rgba(0,0,0,0.1)] min-h-screen md:min-h-0">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg font-black shrink-0">
            <span className="text-3xl leading-none pt-1">+</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight">STIN-Somdej Connect</h1>
            <p className="text-xs font-bold text-slate-700">Student Nursing Practice Management System</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-12 flex-1">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Welcome</h2>
          <h3 className="text-2xl md:text-3xl font-bold text-red-600 mt-2 tracking-tight">Nursing Practice</h3>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Management System</h3>
          <p className="text-slate-700 mt-3 text-sm md:text-base font-semibold">ระบบบริหารจัดการการฝึกปฏิบัติการพยาบาล</p>

          <div className="mt-10 flex items-center gap-2 text-slate-800">
            <Users className="h-5 w-5 text-red-600" />
            <h4 className="text-lg font-bold">Choose Your Role</h4>
          </div>

          {/* Cards Container */}
          <div className="mt-6 flex flex-col sm:flex-row gap-6">
            
            {/* Teacher Card */}
            <div className="flex-1 rounded-3xl bg-white p-6 shadow-xl flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300 border border-slate-100">
              <div className="h-32 w-32 rounded-full overflow-hidden mb-4 bg-red-50 p-2 border-4 border-red-50">
                <img src="/src/assets/images/nursing_instructor_avatar_1784615029312.jpg" alt="Teacher" className="h-full w-full object-cover rounded-full" referrerPolicy="no-referrer" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-red-600" fill="currentColor" />
                <h5 className="text-xl font-black text-red-600">Teacher</h5>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-6 px-2">For instructors and administrators</p>
              <button
                onClick={() => onSelectRole("Teacher")}
                className="w-full mt-auto flex items-center justify-center gap-2 rounded-xl bg-[#CD321A] hover:bg-red-700 px-6 py-3 text-sm font-bold text-white transition-colors shadow-md group"
              >
                Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Student Card */}
            <div className="flex-1 rounded-3xl bg-white p-6 shadow-xl flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300 border border-slate-100">
              <div className="h-32 w-32 rounded-full overflow-hidden mb-4 bg-red-50 p-2 border-4 border-red-50">
                <img src="/src/assets/images/nursing_student_avatar_1784615043179.jpg" alt="Student" className="h-full w-full object-cover rounded-full" referrerPolicy="no-referrer" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-red-600" fill="currentColor" />
                <h5 className="text-xl font-black text-red-600">Student</h5>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-6 px-2">For nursing students</p>
              <button
                onClick={() => onSelectRole("Student")}
                className="w-full mt-auto flex items-center justify-center gap-2 rounded-xl bg-[#CD321A] hover:bg-red-700 px-6 py-3 text-sm font-bold text-white transition-colors shadow-md group"
              >
                Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-2 text-slate-600 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>Secure • Reliable • Efficient</span>
        </div>
      </div>

      {/* Right Side: Medical Illustration Background */}
      <div 
        className="hidden md:block md:w-[45%] lg:w-[50%] bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/src/assets/images/medical_collage_background_1784615107928.jpg')" }}
      >
      </div>
    </div>
  );
}
