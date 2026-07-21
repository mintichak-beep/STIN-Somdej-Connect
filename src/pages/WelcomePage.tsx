import { useState } from "react";
import { ArrowRight, ShieldCheck, User, GraduationCap, ArrowLeft, KeyRound } from "lucide-react";
import { studentService } from "../services/app.service";
import { where } from "firebase/firestore";

interface WelcomePageProps {
  onSelectRole: (role: "Teacher" | "Student") => void;
  onSelectStudent: (studentId: string) => void;
}

export function WelcomePage({ onSelectRole, onSelectStudent }: WelcomePageProps) {
  const [isStudentLogin, setIsStudentLogin] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const students = await studentService.getAll([where("studentId", "==", studentIdInput.trim())]);
      if (students.length > 0) {
        // ID Found
        const student = students[0];
        onSelectRole("Student");
        onSelectStudent(student.id!);
      } else {
        setError("Invalid Student ID. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-[#BEE3F8] font-sans relative overflow-hidden">
      
      {/* Left Side: Information and Role Selection */}
      <div className="flex w-full md:w-[58%] flex-col justify-between p-8 md:p-12 lg:p-20 relative z-10 overflow-y-auto">
        
        {/* Header/Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md font-black shrink-0">
            <span className="text-2xl leading-none">+</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">Nursing Practice</h1>
            <p className="text-[10px] font-bold text-slate-600 tracking-tight">Management System</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-12 md:mt-16 flex-1">
          {!isStudentLogin ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h2 className="text-5xl md:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
                Welcome
              </h2>
              <div className="mt-2 space-y-1">
                <h3 className="text-3xl md:text-4xl font-black text-red-600 tracking-tight">Nursing Practice</h3>
                <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">Management System</h3>
              </div>
              <p className="text-slate-600 mt-4 text-sm md:text-base font-bold">ระบบบริหารจัดการการฝึกปฏิบัติการพยาบาล</p>

              <div className="mt-10 flex items-center gap-2 text-slate-800">
                <div className="flex -space-x-1">
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                  <div className="h-2 w-2 rounded-full bg-red-600/50"></div>
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Choose Your Role</h4>
              </div>

              {/* Role Cards Container */}
              <div className="mt-8 flex flex-col sm:flex-row gap-8 max-w-2xl">
                
                {/* Teacher Card */}
                <div className="flex-1 rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-blue-900/10 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-blue-900/20 duration-500 border border-white/50">
                  <div className="h-40 w-40 rounded-full overflow-hidden mb-6 bg-red-50/50 border-8 border-slate-50 shadow-inner flex items-center justify-center">
                    <img 
                      src="/src/assets/images/teacher_avatar_nurse_v3_1784630348949.jpg" 
                      alt="Teacher" 
                      className="h-full w-full object-cover scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-red-600"></div>
                    <h5 className="text-xl font-black text-slate-800 tracking-tight">Teacher</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold mb-8 px-4 leading-relaxed uppercase tracking-wider">
                    For instructors and administrators
                  </p>
                  <button
                    onClick={() => onSelectRole("Teacher")}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#CD321A] hover:bg-red-700 active:scale-95 px-6 py-4 text-sm font-black text-white transition-all shadow-lg shadow-red-600/30 group"
                  >
                    Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Student Card */}
                <div className="flex-1 rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-blue-900/10 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-blue-900/20 duration-500 border border-white/50">
                  <div className="h-40 w-40 rounded-full overflow-hidden mb-6 bg-red-50/50 border-8 border-slate-50 shadow-inner flex items-center justify-center">
                    <img 
                      src="/src/assets/images/student_avatar_nurse_v3_1784630551819.jpg" 
                      alt="Student" 
                      className="h-full w-full object-cover scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-red-600"></div>
                    <h5 className="text-xl font-black text-slate-800 tracking-tight">Student</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold mb-8 px-4 leading-relaxed uppercase tracking-wider">
                    For nursing students
                  </p>
                  <button
                    onClick={() => setIsStudentLogin(true)}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#CD321A] hover:bg-red-700 active:scale-95 px-6 py-4 text-sm font-black text-white transition-all shadow-lg shadow-red-600/30 group"
                  >
                    Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="max-w-md animate-in fade-in slide-in-from-left-4 duration-500">
              <button 
                onClick={() => setIsStudentLogin(false)}
                className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-black text-xs uppercase tracking-widest mb-10 group"
              >
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-red-50 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                Back to Selection
              </button>

              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Student Login</h2>
              <p className="text-slate-600 mt-3 font-bold text-sm">Please enter your Student ID to access your nursing practice dashboard.</p>

              <form onSubmit={handleStudentLogin} className="mt-10 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <KeyRound className="h-3 w-3 text-red-600" />
                    Student ID Number
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. 6710XXXXXX"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    className="w-full h-16 px-8 rounded-3xl bg-white border-none focus:ring-4 focus:ring-red-600/10 transition-all outline-none text-xl font-black text-slate-800 placeholder:text-slate-300 shadow-xl shadow-blue-900/5"
                  />
                  {error && (
                    <div className="bg-red-50 p-4 rounded-2xl flex items-start gap-3 mt-4 border border-red-100 animate-in shake duration-500">
                      <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-600 font-black text-xs">!</span>
                      </div>
                      <p className="text-xs font-black text-red-700 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 flex items-center justify-center gap-3 rounded-3xl bg-[#CD321A] hover:bg-red-700 disabled:bg-slate-300 px-8 py-3 text-lg font-black text-white transition-all shadow-xl shadow-red-600/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Login to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Improved Footer */}
        <div className="mt-16 flex items-center gap-6 text-slate-500 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Secure</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-300"></div>
          <span>Reliable</span>
          <div className="h-1 w-1 rounded-full bg-slate-300"></div>
          <span>Efficient</span>
        </div>
      </div>

      {/* Right Side: Large Medical Illustrations on Peach Background */}
      <div className="hidden md:flex md:w-[42%] bg-[#FFF5F0] relative items-center justify-center p-12 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-[#FFE4D6] blur-3xl opacity-60"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#FFE4D6] blur-3xl opacity-60"></div>
        
        {/* Main Illustration Collage */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <img 
            src="/src/assets/images/medical_illustration_bg_1784609439820.jpg" 
            alt="Medical Illustrations" 
            className="max-w-[120%] w-[120%] object-contain drop-shadow-2xl animate-in zoom-in-95 duration-1000" 
            referrerPolicy="no-referrer" 
          />
          
          {/* Floating Accents */}
          <div className="absolute top-1/4 right-1/4 h-12 w-12 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce duration-[3000ms]">
            <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-black text-sm">+</span>
            </div>
          </div>
          <div className="absolute bottom-1/4 left-1/4 h-8 w-8 bg-white rounded-full shadow-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
