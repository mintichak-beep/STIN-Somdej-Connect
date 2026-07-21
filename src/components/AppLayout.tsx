import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  ChevronRight,
  Bell,
  LogOut,
  ChevronLeft,
  Search,
  MessageSquare,
  User
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { notificationService } from "../services/app.service";
import { Notification } from "../types/app";
import { format } from "date-fns";
import { AssetImage } from "./AssetImage";

interface AppLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  role: "Teacher" | "Student";
  onSwitchRole: () => void;
}

export function AppLayout({
  activeTab,
  setActiveTab,
  children,
  role,
  onSwitchRole,
}: AppLayoutProps) {
  const { user: authUser } = useAuth();
  const user = authUser || (role === "Teacher" ? {
    uid: "dev-teacher-id",
    email: "coordinator.admin@stin.ac.th",
    displayName: "อาจารย์ ผู้ประสานงาน (Teacher Admin)",
    role: "Teacher",
    status: "active",
    photoURL: "/src/assets/images/nursing_instructor_icon_1784479023431.jpg",
    createdAt: new Date().toISOString()
  } : {
    uid: "dev-student-id",
    email: "mintra.r@stin.ac.th",
    displayName: "มินทรา รักษ์ดี (Student)",
    role: "Nursing Student",
    status: "active",
    createdAt: new Date().toISOString()
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        const data = await notificationService.getAll();
        setNotifications(data.filter(n => n.userId === user.uid || (role === 'Teacher' && n.userId === 'admin')));
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, role]);

  const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", emoji: "🏥" },
    { id: "profile", label: "My Profile", emoji: "👤" },
    { id: "students", label: "Students", emoji: "🎓" },
    { id: "teachers", label: "Teachers", emoji: "👨‍🏫" },
    { id: "subjects", label: "Subjects", emoji: "📚" },
    { id: "clinical-planner", label: "Clinical Practice Planner", emoji: "🏥" },
    { id: "clinical-sites", label: "Clinical Sites", emoji: "🏥" },
    { id: "wards", label: "Wards", emoji: "🏢" },
    { id: "student-groups", label: "Student Groups", emoji: "👥" },
    { id: "rooms", label: "Rooms", emoji: "🛏️" },
    { id: "van-trips", label: "Shuttle Van Management", emoji: "🚐" },
    { id: "my-transportation", label: "My Transportation", emoji: "🚐" },
    { id: "utility-billing", label: "Utility Bills", emoji: "💧" },
    { id: "payment-verification", label: "Payments", emoji: "💳" },
    { id: "reports", label: "Reports", emoji: "📊" },
    { id: "settings", label: "Settings", emoji: "⚙️" },
    { id: "welcome-settings", label: "Welcome Settings", emoji: "🎨" },
    { id: "announcements", label: "Announcements", emoji: "📢" },
  ];

  const studentMenuItems = [
    { id: "home", label: "Home", emoji: "🏠" },
    { id: "dashboard", label: "My Profile", emoji: "👤" },
    { id: "subjects", label: "My Subject", emoji: "📖" },
    { id: "student-academic-schedule", label: "My Academic Timeline", emoji: "📊" },
    { id: "clinical-duty", label: "My Clinical Practice", emoji: "🏥" },
    { id: "duty-schedule", label: "My Duty Schedule", emoji: "📅" },
    { id: "rooms", label: "My Room", emoji: "🛏️" },
    { id: "my-transportation", label: "My Transportation", emoji: "🚐" },
    { id: "student-utilities", label: "My Utility Bills", emoji: "💧" },
    { id: "payment-history", label: "Payment History", emoji: "🧾" },
    { id: "upload-slip", label: "Upload Slip", emoji: "📤" },
    { id: "announcements", label: "Announcements", emoji: "📢" },
  ];

  const menuItems = role === "Teacher" ? adminMenuItems : studentMenuItems;

  const activeItem = menuItems.find((item) => item.id === activeTab);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await notificationService.update(id, { isRead: true });
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const SidebarItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => {
          setActiveTab(item.id);
          setIsMobileMenuOpen(false);
        }}
        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 relative group cursor-pointer ${
          isActive
            ? "bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white shadow-md shadow-red-900/20"
            : "text-[#424242] hover:bg-slate-100 hover:text-[#212121]"
        }`}
      >
        <span className={`text-xl shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
          {item.emoji}
        </span>
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="truncate"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {isSidebarCollapsed && !isMobileMenuOpen && (
          <div className="absolute left-16 px-3 py-1.5 bg-[#212121] text-white text-xs rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
            {item.label}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-white text-[#212121] bg-medical-pattern relative">
      <div className="relative z-10 flex h-full w-full">
        {/* Sidebar - Desktop */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarCollapsed ? 88 : 280 }}
          className="hidden md:flex flex-col border-r border-slate-200/80 bg-white h-full z-40 transition-all duration-300 ease-in-out relative shadow-sm"
        >
          <div className="p-6 flex items-center justify-between mb-2">
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <div className="h-10 w-10 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-red-900/20">
                    <span className="text-2xl font-black leading-none pt-0.5">+</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-tight text-[#212121] leading-tight">STIN Connect</h2>
                    <p className="text-[10px] font-extrabold text-[#D32F2F] uppercase tracking-widest">Medical Hub</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-[#212121] transition-colors cursor-pointer shrink-0"
            >
              {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar pb-8">
            {menuItems.map((item) => (
              <SidebarItem key={item.id} item={item} />
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50/80">
            <button 
              onClick={onSwitchRole}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl p-3 text-xs font-extrabold uppercase tracking-widest transition-all border border-[#D32F2F]/30 text-[#D32F2F] bg-white hover:bg-[#D32F2F] hover:text-white shadow-sm cursor-pointer ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}
            >
              <LogOut className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Switch Role</span>}
            </button>
          </div>
        </motion.aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-[70] md:hidden flex flex-col shadow-2xl"
              >
                <div className="p-6 flex items-center justify-between border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] rounded-xl flex items-center justify-center text-white">
                      <span className="text-2xl font-black leading-none pt-0.5">+</span>
                    </div>
                    <h2 className="text-lg font-black text-[#212121]">Menu</h2>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-[#212121]">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  {menuItems.map((item) => (
                    <SidebarItem key={item.id} item={item} />
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top App Bar - Hospital Red Gradient Header */}
          <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-gradient-to-r from-[#D32F2F] via-[#C62828] to-[#B71C1C] border-b border-red-800 z-30 sticky top-0 shadow-md">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-white/10 rounded-xl text-white md:hidden cursor-pointer"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/30 shadow-sm shrink-0">
                  <span className="text-2xl font-black leading-none pt-0.5">+</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-black text-white tracking-tight leading-tight">STIN-Somdej Connect</h1>
                  <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-white/90 uppercase tracking-widest mt-0.5">
                    Overview • {activeItem?.label || "Overview"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-2 sm:px-4 py-2 w-full sm:w-64 focus-within:ring-2 focus-within:ring-white/50 focus-within:bg-white/25 transition-all text-white placeholder-white/70">
                <Search className="h-4 w-4 text-white/80" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 text-xs font-medium w-full ml-2 text-white outline-none placeholder-white/80 hidden sm:block" />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-white/15 rounded-xl text-white transition-colors cursor-pointer">
                  <MessageSquare className="h-5 w-5" />
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 hover:bg-white/15 rounded-xl text-white transition-colors relative cursor-pointer"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-white rounded-full ring-2 ring-[#D32F2F]" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-[#212121]"
                      >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 text-[#212121]">
                          <h4 className="text-sm font-black text-[#212121]">Notifications</h4>
                          <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-[#212121]">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar text-left">
                          {notifications.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-xs font-medium">No notifications yet</div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} onClick={() => handleMarkRead(n.id)} className={`p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-red-50/80 border border-red-200' : ''}`}>
                                <p className="text-xs font-bold text-[#212121]">{n.title}</p>
                                <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                                <p className="text-[9px] text-slate-400 mt-2">{format(n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt), 'dd MMM HH:mm')}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              
              <button
                onClick={onSwitchRole}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/20 cursor-pointer shadow-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Switch</span>
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-32 group-hover:text-red-100 transition-colors">{user?.displayName?.split(' ')[0]}</p>
                  <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest">{role}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md overflow-hidden text-white border border-white/30 group-hover:ring-2 ring-white/60 transition-all">
                  {user?.photoURL ? (
                    <AssetImage src={user.photoURL} alt="" className="h-full w-full object-cover" fallbackType={role === 'Teacher' ? 'teacher' : 'student'} />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
              </button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
