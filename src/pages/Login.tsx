import { useState, useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';
import { welcomeSettingsService } from '../services/welcomeSettings.service';
import { appImageService } from '../services/app.service';
import { appSettingsService } from '../services/appSettings.service';
import { HeartPulse, ShieldCheck, Hospital } from 'lucide-react';

const DEFAULT_HOSPITAL_BG = "/src/assets/images/login_medical_flat_left_1784648165379.jpg";

export function Login() {
  const [bgImageUrl, setBgImageUrl] = useState<string>(DEFAULT_HOSPITAL_BG);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLoginBackgroundAndLogo = async () => {
      try {
        // 1. Try Welcome Settings map
        const welcomeMap = await welcomeSettingsService.getAsMap();
        if (welcomeMap.backgroundImage || welcomeMap.loginBackgroundImage) {
          if (isMounted) setBgImageUrl(welcomeMap.backgroundImage || welcomeMap.loginBackgroundImage);
        } else {
          // 2. Try App Images collection
          const images = await appImageService.getAll();
          const loginImg = images.find(img => img.imageType === 'login');
          if (loginImg?.imageUrl) {
            if (isMounted) setBgImageUrl(loginImg.imageUrl);
          } else {
            // 3. Try App Settings
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
        console.error("Failed to load custom login background:", err);
      }
    };

    loadLoginBackgroundAndLogo();

    // Real-time listener for welcomeSettings changes
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

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden font-sans select-none">
      {/* Full-screen hospital background image automatically scaled to all screen sizes */}
      <img
        src={bgImageUrl}
        alt="Hospital Background"
        className="fixed inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-700"
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_HOSPITAL_BG;
        }}
      />

      {/* Soft dark overlay over background for optimal contrast and readability */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[3px] z-0 pointer-events-none transition-all duration-300" />

      {/* Decorative Red Ambient Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D32F2F]/15 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Centered White Glassmorphism Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl shadow-red-950/30 rounded-[20px] p-6 sm:p-10 border-t-4 border-t-[#D32F2F] my-auto transition-all duration-300 hover:shadow-red-900/40 animate-in fade-in zoom-in-95">
        
        {/* Top Header & Branding */}
        <div className="flex flex-col items-center text-center mb-6 space-y-2">
          
          {/* Logo Badge */}
          <div className="h-16 w-16 rounded-[20px] bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-400/30 transition-transform duration-300 hover:scale-105 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="STIN Logo" className="h-11 w-11 object-contain rounded-xl" />
            ) : (
              <svg className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5V3z" />
              </svg>
            )}
          </div>

          {/* Badge Label */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 text-[#D32F2F] text-[11px] font-black uppercase tracking-wider border border-red-100 shadow-2xs">
            <HeartPulse className="h-3.5 w-3.5 text-[#D32F2F] animate-pulse" />
            <span>STIN-Somdej Connect</span>
          </div>

          {/* System Name */}
          <div className="pt-1 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              ระบบประสานงานแหล่งฝึก
            </h1>
            <p className="text-sm font-extrabold text-[#D32F2F]">
              รพ.สมเด็จพระบรมราชเทวี ณ ศรีราชา
            </p>
          </div>

          {/* Short Welcome Message */}
          <p className="text-xs font-semibold text-slate-500 max-w-xs leading-relaxed pt-1">
            ยินดีต้อนรับเข้าสู่ระบบจัดการฝึกปฏิบัติการพยาบาล กรุณาลงชื่อเข้าใช้งานด้วยบัญชีสถาบัน
          </p>
        </div>

        {/* Existing Login Functionality Form */}
        <LoginForm />

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-1 text-[#D32F2F]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secure System</span>
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
