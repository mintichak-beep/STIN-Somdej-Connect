import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, CalendarRange, CalendarDays, User, 
  Building2, Bed, Truck, GraduationCap, CheckCircle, Layers, LayoutGrid, Car, Users, BarChart3,
  Sparkles, Calendar, Receipt
} from 'lucide-react';

interface SidebarProps {
  id?: string;
}

export function Sidebar({ id }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isCurrentRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getBtnStyles = (path: string) => {
    return `flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
      isCurrentRoute(path)
        ? 'bg-red-600 text-white shadow-xs'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
    }`;
  };

  const isStudent = user?.role === 'Student';

  return (
    <aside id={id} className="hidden w-64 shrink-0 border-r border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:flex md:flex-col">
      {/* Brand Header */}
      <div 
        onClick={() => navigate('/dashboard')}
        className="flex h-16 items-center gap-3 border-b border-gray-50 px-6 dark:border-zinc-800/60 cursor-pointer"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 font-extrabold text-white font-sans text-sm">
          ST
        </div>
        <div>
          <h2 className="text-sm font-black tracking-wide text-gray-900 dark:text-zinc-50">STIN CPATMS</h2>
          <p className="text-[10px] font-bold text-red-600 uppercase dark:text-red-500">Placement Hub</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1.5 p-4">
        <p className="px-4 text-[10px] font-black tracking-wider text-gray-400 uppercase dark:text-zinc-500">
          Control Center
        </p>

        {isStudent ? (
          <div className="space-y-1.5">
            <button onClick={() => navigate('/dashboard')} className={getBtnStyles('/dashboard')}>
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Overview</span>
            </button>
            <button onClick={() => navigate('/profile')} className={getBtnStyles('/profile')}>
              <User className="h-4 w-4 shrink-0" />
              <span>My Profile</span>
            </button>
            <button onClick={() => navigate('/utilities')} className={getBtnStyles('/utilities')}>
              <Receipt className="h-4 w-4 shrink-0" />
              <span>ค่าน้ำ / ค่าไฟ</span>
            </button>
            <div className="px-4 py-3 mt-4 bg-red-50/55 border border-red-100/50 rounded-xl text-[10px] font-bold text-red-600 leading-relaxed dark:bg-red-950/20 dark:border-red-900/30">
              Student Mode Active: System management panels are administrator-gated.
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button onClick={() => navigate('/dashboard')} className={getBtnStyles('/dashboard')}>
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Overview Deck</span>
            </button>

            {/* Academic Master Registries Section */}
            <div className="pt-2">
              <p className="px-4 pb-1 text-[9px] font-black tracking-wider text-gray-400 uppercase dark:text-zinc-500">
                Academic Calendar
              </p>
              <button onClick={() => navigate('/academic-years')} className={getBtnStyles('/academic-years')}>
                <CalendarRange className="h-4 w-4 shrink-0" />
                <span>Academic Years</span>
              </button>
              <button onClick={() => navigate('/semesters')} className={getBtnStyles('/semesters')}>
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>Semester Terms</span>
              </button>
            </div>

            {/* Inactive placeholders matching Dashboard view category filters to maintain look and feel */}
            <div className="pt-2 border-t border-slate-50 dark:border-zinc-900/40">
              <p className="px-4 pb-1 text-[9px] font-black tracking-wider text-gray-400 uppercase dark:text-zinc-500">
                Operations
              </p>
              <button onClick={() => navigate('/workflow')} className={getBtnStyles('/workflow')}>
                <Sparkles className="h-4 w-4 shrink-0 text-red-600 dark:text-red-500 animate-pulse" />
                <span className="font-extrabold text-red-600 dark:text-red-400">One-Click Workflow</span>
              </button>
              <button onClick={() => navigate('/clinical-wards')} className={getBtnStyles('/clinical-wards')}>
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Clinical Wards & Rotations</span>
              </button>
              <button onClick={() => navigate('/students')} className={getBtnStyles('/students')}>
                <User className="h-4 w-4 shrink-0" />
                <span>Students</span>
              </button>
              <button onClick={() => navigate('/room-allocation')} className={getBtnStyles('/room-allocation')}>
                <LayoutGrid className="h-4 w-4 shrink-0" />
                <span>Room Allocation</span>
              </button>
              <button onClick={() => navigate('/vehicles')} className={getBtnStyles('/vehicles')}>
                <Car className="h-4 w-4 shrink-0" />
                <span>Vehicles</span>
              </button>
              <button onClick={() => navigate('/drivers')} className={getBtnStyles('/drivers')}>
                <Users className="h-4 w-4 shrink-0" />
                <span>Drivers</span>
              </button>
              <button onClick={() => navigate('/transportation')} className={getBtnStyles('/transportation')}>
                <Truck className="h-4 w-4 shrink-0" />
                <span>Transportation</span>
              </button>
              <button onClick={() => navigate('/reports/dashboard')} className={getBtnStyles('/reports/dashboard')}>
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span>Reports</span>
              </button>
              <button onClick={() => navigate('/utilities')} className={getBtnStyles('/utilities')}>
                <Receipt className="h-4 w-4 shrink-0" />
                <span>ตรวจสอบการชำระเงิน</span>
              </button>
              <button onClick={() => navigate('/hospitals')} className={getBtnStyles('/hospitals')}>
                <Building2 className="h-4 w-4 shrink-0" />
                <span>Clinical Hospitals</span>
              </button>
              <button onClick={() => navigate('/buildings')} className={getBtnStyles('/buildings')}>
                <Bed className="h-4 w-4 shrink-0" />
                <span>Buildings</span>
              </button>
              <button onClick={() => navigate('/floors')} className={getBtnStyles('/floors')}>
                <Layers className="h-4 w-4 shrink-0" />
                <span>Floors</span>
              </button>
              <button disabled className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-300 dark:text-zinc-700 cursor-not-allowed">
                <Truck className="h-4 w-4 shrink-0" />
                <span>Transportation</span>
              </button>
              <button disabled className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-300 dark:text-zinc-700 cursor-not-allowed">
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>Faculty</span>
              </button>
            </div>

            {/* My Profile */}
            <div className="pt-2 border-t border-slate-50 dark:border-zinc-900/40">
              <button onClick={() => navigate('/profile')} className={getBtnStyles('/profile')}>
                <User className="h-4 w-4 shrink-0" />
                <span>My Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-gray-50 dark:border-zinc-800/40">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
          <span>Terminal Status</span>
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
        </div>
        <p className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
          Role: <strong>{user?.role}</strong> • Secure Access
        </p>
      </div>
    </aside>
  );
}
