import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Bed,
  Bus,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  UserCheck,
  ClipboardList,
  Sun,
  Moon,
  Droplets,
  Home,
  Bell,
  LogOut
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { notificationService } from "../services/app.service";
import { Notification } from "../types/app";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface AppLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function AppLayout({
  activeTab,
  setActiveTab,
  children,
}: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        const data = await notificationService.getAll();
        setNotifications(data.filter(n => n.userId === user.uid || (user.role === 'Teacher' && n.userId === 'admin')));
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const allMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['Teacher', 'Nursing Student'] },
    { id: "students", label: "นักศึกษา", icon: Users, roles: ['Teacher'] },
    { id: "teachers", label: "อาจารย์", icon: UserCheck, roles: ['Teacher'] },
    { id: "hospitals", label: "แหล่งฝึก", icon: MapPin, roles: ['Teacher'] },
    { id: "rooms", label: "หอพักและห้องพัก", icon: Home, roles: ['Teacher'] },
    { id: "utility-billing", label: "ค่าน้ำ-ค่าไฟรายสัปดาห์", icon: Droplets, roles: ['Teacher'] },
    { id: "student-utilities", label: "บิลค่าน้ำ-ค่าไฟของฉัน", icon: Droplets, roles: ['Nursing Student'] },
    { id: "vans", label: "รถตู้", icon: Bus, roles: ['Teacher'] },
    { id: "allocations", label: "จัดสรรฝึกงาน", icon: Calendar, roles: ['Teacher', 'Nursing Student'] },
    { id: "reports", label: "รายงาน", icon: BarChart3, roles: ['Teacher'] },
    { id: "settings", label: "ตั้งค่า", icon: Settings, roles: ['Teacher', 'Nursing Student'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role || ''));

  const activeItem = allMenuItems.find((item) => item.id === activeTab);
  const breadcrumbPath = ["STIN Connect", activeItem?.label || "Overview"];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await notificationService.update(id, { isRead: true });
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 border-r border-slate-100 dark:border-zinc-900 transition-colors">
      <div className="flex h-16 items-center gap-3 border-b border-slate-50 dark:border-zinc-900 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 font-sans text-sm font-black text-white shadow-md shadow-red-200 dark:shadow-none">
          ST
        </div>
        <div>
          <h2 className="text-xs font-black tracking-wide text-zinc-900 dark:text-zinc-50 leading-tight">
            STIN-Somdej Connect
          </h2>
          <p className="text-[10px] font-extrabold text-red-600 dark:text-red-500 uppercase tracking-wider">
            {user?.role === 'Teacher' ? 'Management Portal' : 'Student Portal'}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
        <p className="px-3 pb-2 text-[9px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
          Main Menu
        </p>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-red-600 text-white shadow-xs font-black"
                    : "text-zinc-500 hover:bg-slate-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${isActive ? "scale-110" : ""}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-50 dark:border-zinc-900/60 bg-slate-50/50 dark:bg-zinc-950/20">
        <button 
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-3 py-2 text-xs font-black text-zinc-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      <aside className="hidden w-64 md:block shrink-0">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl md:hidden"
            >
              <div className="absolute right-3 top-3 z-50">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg bg-slate-100 dark:bg-zinc-900 p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-4 md:px-6 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-xl border border-slate-100 p-2 text-zinc-500 hover:bg-slate-50 hover:text-zinc-800 dark:border-zinc-900 dark:hover:bg-zinc-900 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              {breadcrumbPath.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <ChevronRight className="h-3 w-3 text-zinc-300 dark:text-zinc-700" />
                  )}
                  <span
                    className={
                      idx === breadcrumbPath.length - 1
                        ? "text-zinc-700 dark:text-zinc-300 font-bold"
                        : ""
                    }
                  >
                    {crumb}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="rounded-xl border border-slate-100 dark:border-zinc-900 p-2 text-zinc-400 transition-colors hover:bg-slate-50 hover:text-zinc-600 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200 cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-50 dark:border-zinc-800 flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">แจ้งเตือน</h4>
                      <button onClick={() => setShowNotifications(false)}><X className="h-4 w-4 text-zinc-400" /></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs font-bold text-zinc-400">ไม่มีการแจ้งเตือน</div>
                      ) : (
                        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleMarkRead(n.id)}
                            className={`p-4 border-b border-slate-50 dark:border-zinc-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors ${!n.isRead ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 p-1.5 rounded-lg ${
                                n.type === 'bill' ? 'bg-blue-50 text-blue-600' :
                                n.type === 'payment' ? 'bg-amber-50 text-amber-600' :
                                n.type === 'approval' ? 'bg-green-50 text-green-600' :
                                'bg-red-50 text-red-600'
                              }`}>
                                {n.type === 'bill' ? <Droplets className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black text-zinc-900 dark:text-white">{n.title}</p>
                                <p className="text-[11px] font-bold text-zinc-500 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[9px] text-zinc-400 mt-2 font-black uppercase tracking-tighter">
                                  {format(new Date(n.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className="rounded-xl border border-slate-100 dark:border-zinc-900 p-2 text-zinc-400 transition-colors hover:bg-slate-50 hover:text-zinc-600 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200 cursor-pointer"
              title="Toggle theme mode"
            >
              {isDark ? (
                <Sun className="h-4.5 w-4.5 text-amber-500" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-zinc-500" />
              )}
            </button>

            <div className="flex items-center gap-2 border-l border-slate-100 dark:border-zinc-900 pl-3">
              <div className="h-8.5 w-8.5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-black text-xs overflow-hidden">
                {user?.photoURL ? <img src={user.photoURL} alt="User" /> : (user?.displayName?.substring(0, 2).toUpperCase() || 'AD')}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
                  {user?.displayName || 'Administrator'}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  {user?.role === 'Teacher' ? 'Coordinator' : 'Nursing Student'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/40 dark:bg-zinc-950/40">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-7xl h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
