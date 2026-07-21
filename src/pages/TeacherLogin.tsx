import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, ShieldAlert, ArrowRight, Home, Lock, HeartPulse, Hospital, ShieldCheck } from 'lucide-react';
import { welcomeSettingsService } from '../services/welcomeSettings.service';
import { appImageService } from '../services/app.service';
import { appSettingsService } from '../services/appSettings.service';

const DEFAULT_HOSPITAL_BG = "/src/assets/images/login_medical_flat_left_1784648165379.jpg";

export function TeacherLogin() {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string>(DEFAULT_HOSPITAL_BG);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadLoginBackgroundAndLogo = async () => {
      try {
        const welcomeMap = await welcomeSettingsService.getAsMap();
        if (welcomeMap.backgroundImage || welcomeMap.loginBackgroundImage) {
          if (isMounted) setBgImageUrl(welcomeMap.backgroundImage || welcomeMap.loginBackgroundImage);
        } else {
          const images = await appImageService.getAll();
          const loginImg = images.find(img => img.imageType === 'login');
          if (loginImg?.imageUrl && isMounted) {
            setBgImageUrl(loginImg.imageUrl);
          } else {
            const appSet = await appSettingsService.getSettings();
            if (appSet?.loginImageUrl && isMounted) {
              setBgImageUrl(appSet.loginImageUrl);
            }
          }
        }

        if (welcomeMap.logo && isMounted) {
          setLogoUrl(welcomeMap.logo);
        }
      } catch (err) {
        console.error("Failed to load custom teacher login background:", err);
      }
    };

    loadLoginBackgroundAndLogo();

    const unsubWelcome = welcomeSettingsService.onSnapshot([], (data) => {
      const map: Record<string, string> = {};
      data.forEach((item) => {
        if (item.id) map[item.id] = item.value;
      });
      if (map.backgroundImage || map.loginBackgroundImage) {
        setBgImageUrl(map.backgroundImage || map.loginBackgroundImage);
      }
      if (map.logo) {
        setLogoUrl(map.logo);
      }
    });

    return () => {
      isMounted = false;
      unsubWelcome();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (!email.endsWith('@stin.ac.th')) {
      setError('เฉพาะบัญชีอีเมล @stin.ac.th เท่านั้นที่สามารถเข้าระบบได้');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userProfile = await login(email.trim(), password, true);
      
      // Verify role
      const isTeacher = userProfile.role === 'teacher' || userProfile.role === 'Teacher';
      if (isTeacher) {
        navigate('/teacher/dashboard');
      } else {
        setError('บัญชีนี้ไม่มีสิทธิ์เข้าใช้ระบบอาจารย์ (Unauthorized access: Teacher role required)');
        await logout();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden font-sans select-none">
      {/* Background Image automatically scaled */}
      <img
        src={bgImageUrl}
        alt="Hospital Background"
        className="fixed inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-700"
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_HOSPITAL_BG;
        }}
      />

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[3px] z-0 pointer-events-none transition-all duration-300" />

      {/* Red ambient light */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D32F2F]/15 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl shadow-red-950/30 rounded-[20px] p-6 sm:p-10 border-t-4 border-t-[#D32F2F] my-auto transition-all duration-300 hover:shadow-red-900/40 animate-in fade-in zoom-in-95">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#D32F2F] transition-colors">
            <Home className="h-4 w-4" />
            <span>กลับหน้าหลัก (Home)</span>
          </Link>
        </div>

        {/* Top Header & Branding */}
        <div className="flex flex-col items-center text-center mb-6 space-y-2">
          
          <div className="h-16 w-16 rounded-[20px] bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-400/30 transition-transform duration-300 hover:scale-105 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="STIN Logo" className="h-11 w-11 object-contain rounded-xl" />
            ) : (
              <svg className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5V3z" />
              </svg>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 text-[#D32F2F] text-[11px] font-black uppercase tracking-wider border border-red-100 shadow-2xs">
            <HeartPulse className="h-3.5 w-3.5 text-[#D32F2F] animate-pulse" />
            <span>STIN-Somdej Connect</span>
          </div>

          <div className="pt-1 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              ระบบประสานงานแหล่งฝึก
            </h1>
            <p className="text-sm font-extrabold text-[#D32F2F]">
              รพ.สมเด็จพระบรมราชเทวี ณ ศรีราชา
            </p>
          </div>

          <p className="text-xs font-semibold text-slate-500 max-w-xs leading-relaxed pt-1">
            อาจารย์และเจ้าหน้าที่ลงชื่อเข้าใช้ (Faculty & Staff Sign In)
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="flex items-start gap-3 rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-800 animate-shake">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div className="font-semibold text-xs leading-relaxed">{error}</div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              อีเมลสถาบัน / Email Address
            </label>
            <div className="relative rounded-[20px] shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                placeholder="name@stin.ac.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-[20px] border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#D32F2F] focus:ring-4 focus:ring-[#D32F2F]/10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              รหัสผ่าน / Password
            </label>
            <div className="relative rounded-[20px] shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-[20px] border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#D32F2F] focus:ring-4 focus:ring-[#D32F2F]/10"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-[20px] bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] hover:from-[#C62828] hover:to-[#9A0007] px-6 py-4 text-base font-black text-white shadow-lg shadow-red-600/25 transition-all duration-200 hover:shadow-red-600/35 active:scale-[0.99] disabled:opacity-55 cursor-pointer"
          >
            {loading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <span>Sign In / เข้าสู่ระบบ</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Teacher Demo Credentials Helper */}
        <div className="mt-6 rounded-[20px] border border-slate-200/80 bg-slate-50/70 p-4 text-xs">
          <h4 className="mb-1.5 font-bold uppercase tracking-wider text-slate-700">
            🔑 บัญชีเข้าทดสอบระบบอาจารย์ (Demo Teacher accounts):
          </h4>
          <div className="space-y-1.5 text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>อาจารย์ (Teacher): <strong className="text-slate-900">teacher@stin.ac.th</strong></span>
              <span>รหัสผ่าน: <strong className="text-slate-900">TeacherPassword123!</strong></span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-1.5 mt-1.5">
              <span>ผู้ดูแลระบบ (Admin): <strong className="text-slate-900">admin@stin.ac.th</strong></span>
              <span>รหัสผ่าน: <strong className="text-slate-900">AdminPassword123!</strong></span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-1 text-[#D32F2F]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Encrypted Access</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Hospital className="h-3.5 w-3.5" />
            <span>STIN Red Cross</span>
          </div>
        </div>

      </div>
    </div>
  );
}
