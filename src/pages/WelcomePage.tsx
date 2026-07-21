import { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, ArrowLeft, KeyRound, HeartPulse, Stethoscope, Hospital } from "lucide-react";
import { studentService } from "../services/app.service";
import { where } from "firebase/firestore";
import { AssetImage } from "../components/AssetImage";
import { loginImagesService } from "../services/loginImages.service";
import { appSettingsService, AppSettings } from "../services/appSettings.service";
import { CuteMedicalBadge, CUTE_MEDICAL_IMAGES } from "../components/CuteMedicalIllustration";
import { MedicalFlatVector } from "../components/illustrations/MedicalFlatVector";

interface WelcomePageProps {
  onSelectRole: (role: "Teacher" | "Student") => void;
  onSelectStudent: (studentId: string) => void;
}

interface ResponsiveAvatarProps {
  src: string;
  alt: string;
  fallbackType: "teacher" | "student";
}

function ResponsiveAvatar({ src, alt, fallbackType }: ResponsiveAvatarProps) {
  return (
    <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-full overflow-hidden mb-6 border-4 border-[#D32F2F] shadow-xl shadow-red-900/20 bg-slate-50 flex items-center justify-center shrink-0 relative group">
      <AssetImage 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        fallbackType={fallbackType}
      />
      <div className="absolute inset-0 rounded-full ring-2 ring-black/5 group-hover:ring-[#D32F2F] transition-all" />
    </div>
  );
}

export function WelcomePage({ onSelectRole, onSelectStudent }: WelcomePageProps) {
  const [isStudentLogin, setIsStudentLogin] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const unsubscribe = loginImagesService.onSnapshot([], (data) => {
      const map: Record<string, string> = {};
      data.forEach((item) => {
        const type = item.imageType || item.id;
        const val = item.imageUrl || (item as any).value;
        if (type && val) {
          map[type] = val;
        }
      });
      setSettings(map);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAppSet = async () => {
      const set = await appSettingsService.getSettings();
      setAppSettings(set);
    };
    fetchAppSet();
  }, []);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const students = await studentService.getAll([where("studentId", "==", studentIdInput.trim())]);
      if (students.length > 0) {
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
    <div 
      className="flex min-h-screen w-full flex-col md:flex-row bg-[#FAF8F5] text-[#212121] font-sans relative overflow-hidden"
      style={
        settings.backgroundImage
          ? { backgroundImage: `url(${settings.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : {}
      }
    >
      {/* Decorative Soft Red & Light Blue Gradient Glows */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-sky-100/60 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-rose-100/40 rounded-full blur-[160px] pointer-events-none z-0" />

      {settings.backgroundImage && (
        <div className="absolute inset-0 bg-[#FAF8F5]/85 backdrop-blur-sm pointer-events-none z-0" />
      )}
      
      {/* Left Side: Light Blue Panel for Welcome Content */}
      <div className="flex w-full md:w-[58%] flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-16 relative z-10 overflow-y-auto items-center md:items-start bg-[#92C7F7] backdrop-blur-md md:border-r border-sky-200/80 shadow-lg">
        
        {/* Header/Logo */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left justify-center sm:justify-start w-full">
          {settings.logo ? (
            <img 
              src={settings.logo} 
              alt="App Logo" 
              className="h-12 w-12 rounded-2xl object-cover shadow-md shrink-0 border border-slate-200" 
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white shadow-lg shadow-red-900/20 font-black shrink-0 border border-red-400/30">
              {settings.medicalIcon ? (
                <img src={settings.medicalIcon} alt="Medical" className="h-7 w-7 object-contain" />
              ) : (
                <span className="text-2xl leading-none">+</span>
              )}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-lg font-black tracking-tight text-[#212121] leading-none">STIN-Somdej Connect</h1>
              {settings.medicalIcon && settings.logo && (
                <img src={settings.medicalIcon} alt="Medical" className="h-4 w-4 object-contain" />
              )}
            </div>
            <p className="text-[11px] font-bold text-[#D32F2F] tracking-tight mt-0.5">ระบบประสานงานแหล่งฝึกปฏิบัติการพยาบาล</p>
          </div>
        </div>

        {/* Mobile Healthcare Illustration */}
        <div className="md:hidden w-full max-w-sm mt-6 flex justify-center">
          <MedicalFlatVector />
        </div>

        {/* Main Content Area */}
        <div className="mt-8 md:mt-12 flex-1 w-full flex flex-col items-center md:items-start">
          {!isStudentLogin ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 flex flex-col items-center md:items-start text-center md:text-left w-full">
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                <CuteMedicalBadge icon="heart" text="Srisavarindhira Thai Red Cross" variant="rose" />
                <CuteMedicalBadge icon="stethoscope" text="Practical Nursing Training" variant="blue" />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#212121] tracking-tight leading-[1.1] text-center md:text-left whitespace-nowrap">
                ระบบประสานงานแหล่งฝึก
              </h2>
              <div className="mt-2 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#D32F2F] tracking-tight whitespace-nowrap">
                  รพ.สมเด็จพระบรมราชเทวี ณ ศรีราชา
                </h3>
              </div>

              <div className="mt-8 flex flex-col items-center md:items-start gap-2 text-[#424242] w-full">
                <div className="flex -space-x-1 justify-center md:justify-start">
                  <div className="h-2 w-2 rounded-full bg-[#D32F2F]"></div>
                  <div className="h-2 w-2 rounded-full bg-[#D32F2F]/40"></div>
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#616161]">Choose Your Portal / เลือกบทบาทผู้ใช้งาน</h4>
              </div>

              {/* Role Cards Container */}
              <div className="mt-6 flex flex-col md:flex-row gap-6 max-w-2xl w-full">
                
                {/* Teacher Card */}
                <div className="flex-1 rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-xl border border-slate-200/80 border-t-4 border-t-[#D32F2F] flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#D32F2F] w-full relative group">
                  <ResponsiveAvatar 
                    src={settings.teacherImage || "/src/assets/images/teacher.jpg"} 
                    alt="Teacher" 
                    fallbackType="teacher"
                  />
                  <div className="flex items-center justify-center mb-6">
                    <h5 className="text-2xl font-black text-[#212121] tracking-tight">Teacher</h5>
                  </div>
                  <button
                    onClick={() => onSelectRole("Teacher")}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] hover:from-[#C62828] hover:to-[#9A0007] active:scale-95 px-6 py-4 text-sm font-black text-white transition-all shadow-md shadow-red-900/20 cursor-pointer mt-auto"
                  >
                    Enter Portal{" "}
                    {settings.continueIcon ? (
                      <img src={settings.continueIcon} alt="Continue" className="h-4 w-4 object-contain transition-transform group-hover:translate-x-1 invert brightness-0" />
                    ) : (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                </div>

                {/* Student Card */}
                <div className="flex-1 rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-xl border border-slate-200/80 border-t-4 border-t-[#D32F2F] flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#D32F2F] w-full relative group">
                  <ResponsiveAvatar 
                    src={settings.studentImage || "/src/assets/images/student.jpg"} 
                    alt="Student" 
                    fallbackType="student"
                  />
                  <div className="flex items-center justify-center mb-6">
                    <h5 className="text-2xl font-black text-[#212121] tracking-tight">Student</h5>
                  </div>
                  <button
                    onClick={() => setIsStudentLogin(true)}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] hover:from-[#C62828] hover:to-[#9A0007] active:scale-95 px-6 py-4 text-sm font-black text-white transition-all shadow-md shadow-red-900/20 cursor-pointer mt-auto"
                  >
                    Enter Portal{" "}
                    {settings.continueIcon ? (
                      <img src={settings.continueIcon} alt="Continue" className="h-4 w-4 object-contain transition-transform group-hover:translate-x-1 invert brightness-0" />
                    ) : (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="max-w-md w-full animate-in fade-in slide-in-from-left-4 duration-500 bg-white p-8 rounded-[2.5rem] border border-slate-200 border-t-4 border-t-[#D32F2F] shadow-2xl">
              <button 
                onClick={() => setIsStudentLogin(false)}
                className="flex items-center gap-2 text-[#616161] hover:text-[#D32F2F] transition-colors font-black text-xs uppercase tracking-widest mb-8 group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shadow-xs group-hover:bg-red-50 transition-colors">
                  <ArrowLeft className="h-4 w-4 text-[#212121]" />
                </div>
                Back to Role Selection
              </button>

              <div className="mb-3">
                <CuteMedicalBadge icon="sparkles" text="Nursing Student Dashboard" variant="rose" />
              </div>
              <h2 className="text-3xl font-black text-[#212121] tracking-tight leading-tight">Student Authentication</h2>
              <p className="text-[#616161] mt-2 font-medium text-xs leading-relaxed">Enter your institutional Student ID to log into your clinical practice, duty schedule, and transportation portal.</p>

              <form onSubmit={handleStudentLogin} className="mt-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#616161] uppercase tracking-widest flex items-center gap-2 ml-1">
                    <KeyRound className="h-3.5 w-3.5 text-[#D32F2F]" />
                    Institutional Student ID
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. 6710XXXXXX"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    className="w-full h-16 px-6 rounded-2xl bg-[#F8F9FA] border border-slate-200 focus:border-[#D32F2F] focus:ring-4 focus:ring-[#D32F2F]/10 transition-all outline-none text-xl font-black text-[#212121] placeholder:text-slate-400 shadow-inner"
                  />
                  {error && (
                    <div className="bg-red-50 p-4 rounded-2xl flex items-start gap-3 mt-4 border border-red-200 animate-in shake duration-500">
                      <div className="h-5 w-5 rounded-full bg-[#D32F2F] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white font-black text-xs">!</span>
                      </div>
                      <p className="text-xs font-bold text-[#D32F2F] leading-relaxed">
                        {error}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] hover:from-[#C62828] hover:to-[#9A0007] disabled:bg-slate-300 px-8 py-3 text-base font-black text-white transition-all shadow-lg shadow-red-900/20 active:scale-[0.98] cursor-pointer"
                >
                  {loading ? (
                    <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Access Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center gap-6 text-[#616161] text-[10px] font-black uppercase tracking-widest w-full justify-center md:justify-start">
          <div className="flex items-center gap-2 text-[#D32F2F]">
            <ShieldCheck className="h-4 w-4" />
            <span>Encrypted Portal</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-300"></div>
          <span>Srisavarindhira Standard</span>
          <div className="h-1 w-1 rounded-full bg-slate-300"></div>
          <span>Somdej Hospital</span>
        </div>
      </div>

      {/* Right Side: Healthcare Flat Vector Illustration Panel */}
      <div className="hidden md:flex md:w-[42%] bg-[#FCEADE] relative items-center justify-center p-8 md:p-12 overflow-hidden shrink-0">
        {/* Decorative Gradient Blobs */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl opacity-70"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-rose-200/30 blur-3xl opacity-70"></div>
        
        {/* Main Illustration Showcase */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center space-y-6">
          <MedicalFlatVector />
          
          <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-sky-100 shadow-xl text-center space-y-1.5 max-w-sm">
            <div className="flex items-center justify-center gap-2">
              <Hospital className="h-4 w-4 text-[#D32F2F]" />
              <span className="text-xs font-black text-[#212121] tracking-wide">สถาบันการพยาบาลศรีสวรินทิรา</span>
            </div>
            <p className="text-[11px] font-bold text-[#616161]">สภากาชาดไทย • Thai Red Cross Society</p>
          </div>
        </div>
      </div>
    </div>
  );
}
