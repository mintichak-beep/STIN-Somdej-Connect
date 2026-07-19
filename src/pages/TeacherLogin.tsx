import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { Mail, ShieldAlert, ArrowRight, Home, Lock } from 'lucide-react';

export function TeacherLogin() {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Branding Column - Left side */}
      <div className="relative hidden md:flex md:w-1/2 flex-col justify-between bg-gradient-to-br from-red-700 via-red-800 to-red-950 p-12 text-white overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-red-600/20 blur-2xl"></div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600 shadow-md">
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

        <div className="space-y-6 max-w-lg z-10 my-auto">
          <div className="inline-flex rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-red-100 backdrop-blur-md">
            Teacher & Staff Administration
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none">
            STIN-Somdej Connect
          </h2>
          <p className="text-base text-red-100/90 leading-relaxed">
            Clinical placement workspace for instructors and supervisors. Register training placements, manage student sections, allocate housing, and compile transit schedules.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-red-200 z-10 border-t border-white/10 pt-6">
          <p>© 2026 STIN Nursing Institute. All Rights Reserved.</p>
        </div>
      </div>

      {/* Login Form Column - Right side */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 bg-white dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-md space-y-8">
          
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <Home className="h-4 w-4" />
              กลับหน้าแรก
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              อาจารย์และเจ้าหน้าที่ลงชื่อเข้าใช้
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Teacher & Staff Sign In
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 animate-shake">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-500" />
                <div className="font-semibold">{error}</div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                อีเมลสถาบัน / Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                </div>
                <input
                  type="email"
                  placeholder="name@stin.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                รหัสผ่าน / Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white py-3 text-sm font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  ลงชื่อเข้าใช้ (Sign In)
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Teacher Demo Credentials Helper */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 text-xs">
            <h4 className="mb-1.5 font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              🔑 บัญชีเข้าทดสอบระบบอาจารย์ (Demo Teacher accounts):
            </h4>
            <div className="space-y-1.5 text-gray-500 dark:text-zinc-400 font-medium">
              <div className="flex justify-between">
                <span>บัญชีอาจารย์ (Teacher): <strong className="text-gray-700 dark:text-zinc-200">teacher@stin.ac.th</strong></span>
                <span>รหัสผ่าน: <strong className="text-gray-700 dark:text-zinc-200">TeacherPassword123!</strong></span>
              </div>
              <div className="flex justify-between border-t border-gray-100 dark:border-zinc-800 pt-1.5 mt-1.5">
                <span>ผู้ดูแลระบบ (Admin): <strong className="text-gray-700 dark:text-zinc-200">admin@stin.ac.th</strong></span>
                <span>รหัสผ่าน: <strong className="text-gray-700 dark:text-zinc-200">AdminPassword123!</strong></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
