import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRole } from "../hooks/useRole";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Bed,
  Bus,
  Zap,
  FileText,
  FileSearch,
  Megaphone,
  BarChart3,
  Activity,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  CheckCircle,
  Bell,
  Calendar,
  Bug,
  MessageSquare,
  Shield,
} from "lucide-react";

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
  const { role, isTeacher, isStudent } = useRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  // Sync dark mode state with document classes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Define role-based menu items
  const teacherMenu = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "operation-center", label: "Operation Center", icon: Activity },
    { id: "reports", label: "Reports Center", icon: BarChart3 },
    { id: "courses", label: "Course Center", icon: FileText },
    { id: "hospitals-master", label: "Hospital Center", icon: MapPin },
    { id: "practice-groups-master", label: "Practice Group Center", icon: Users },
    { id: "groups", label: "Training Groups", icon: Users },
    { id: "practice-schedule-center", label: "Practice Schedule Center", icon: Calendar },
    { id: "practice-assignments", label: "Practice Assignment", icon: MapPin },
    { id: "sites", label: "Training Sites", icon: MapPin },
    { id: "students", label: "Student Management Center", icon: Users },
    { id: "import-students", label: "Student Import", icon: FileText },
    { id: "pdf-analysis", label: "AI PDF Analysis", icon: FileSearch },
    { id: "activity-log", label: "System Activity Log", icon: Shield },
    { id: "dorms", label: "Dormitory", icon: Bed },
    { id: "transportation", label: "Transportation", icon: Bus },
    { id: "utilities", label: "Utilities", icon: Zap },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "supervision", label: "Supervision", icon: Calendar },
    { id: "evaluations", label: "Evaluations", icon: CheckCircle },
    { id: "hospitals", label: "Hospital Coordination", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "users", label: "User Management", icon: Users },
    { id: "data", label: "Data Management", icon: FileText },
    { id: "issues", label: "System Issues", icon: Bug },
    { id: "feedback", label: "User Feedback", icon: MessageSquare },
    { id: "analytics", label: "System Analytics", icon: BarChart3 },
  ];

  const studentMenu = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-practice", label: "My Practice", icon: MapPin },
    { id: "training", label: "My Training", icon: Users },
    { id: "dormitory", label: "My Dormitory", icon: Bed },
    { id: "transportation", label: "My Transportation", icon: Bus },
    { id: "utilities", label: "My Utilities", icon: Zap },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
  ];

  const menuItems = isTeacher ? teacherMenu : studentMenu;

  // Find label for active tab to construct the Breadcrumb
  const activeItem = menuItems.find((item) => item.id === activeTab);
  const breadcrumbPath = ["Internship Hub", activeItem?.label || "Overview"];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 border-r border-slate-100 dark:border-zinc-900 transition-colors">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-50 dark:border-zinc-900 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 font-sans text-sm font-black text-white shadow-md shadow-red-200 dark:shadow-none">
          ST
        </div>
        <div>
          <h2 className="text-xs font-black tracking-wide text-zinc-900 dark:text-zinc-50 leading-tight">
            STIN-Somdej Connect
          </h2>
          <p className="text-[10px] font-extrabold text-red-600 dark:text-red-500 uppercase tracking-wider">
            Placement Portal
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
        <p className="px-3 pb-2 text-[9px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
          Menu Navigation
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

      {/* Role Footer */}
      <div className="p-4 border-t border-slate-50 dark:border-zinc-900/60 bg-slate-50/50 dark:bg-zinc-950/20">
        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          <span>Terminal Status</span>
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
        </div>
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
          Verified as:{" "}
          <strong className="text-zinc-700 dark:text-zinc-300">{role}</strong>
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 md:block shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (sliding overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            {/* Slide-out Panel */}
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

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-4 md:px-6 transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* Mobile menu hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-xl border border-slate-100 p-2 text-zinc-500 hover:bg-slate-50 hover:text-zinc-800 dark:border-zinc-900 dark:hover:bg-zinc-900 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Display */}
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

          {/* User actions / Control Panel */}
          <div className="flex items-center gap-3">
            {/* Role Perspective Switcher */}
            <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-zinc-900 rounded-xl p-1 border border-slate-200/50 dark:border-zinc-800">
              <button
                onClick={() => {
                  const authCtx = useAuth() as any;
                  if (authCtx.switchRole) authCtx.switchRole('Teacher');
                  setActiveTab('dashboard');
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200 cursor-pointer ${
                  isTeacher
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
                title="Switch to Teacher View"
              >
                Teacher (Admin)
              </button>
              <button
                onClick={() => {
                  const authCtx = useAuth() as any;
                  if (authCtx.switchRole) authCtx.switchRole('Nursing Student');
                  setActiveTab('dashboard');
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200 cursor-pointer ${
                  isStudent
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
                title="Switch to Student View"
              >
                Student
              </button>
            </div>

            {/* Dark Mode Toggle */}
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

            {/* Simple user card details */}
            <div className="flex items-center gap-2 border-l border-slate-100 dark:border-zinc-900 pl-3">
              <img
                src={
                  user?.photoURL ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                }
                alt={user?.displayName || "User"}
                referrerPolicy="no-referrer"
                className="h-8.5 w-8.5 rounded-full border border-red-200 object-cover dark:border-zinc-800"
              />
              <div className="hidden text-left md:block">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {user?.displayName}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                  {role}
                </p>
              </div>
            </div>

            {/* Reset simulated session button */}
            <button
              onClick={() => {
                localStorage.removeItem('stin_simulated_user');
                window.location.reload();
              }}
              className="rounded-xl border border-slate-100 dark:border-zinc-900 p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors cursor-pointer"
              title="Reset Settings & Cache"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Inner page content container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
