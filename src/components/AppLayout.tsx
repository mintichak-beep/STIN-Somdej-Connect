import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Home,
  Bus,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  UserCheck,
  ClipboardList,
  Droplets,
  Bell,
  LogOut,
  BookOpen,
  FileText,
  User,
  CreditCard,
  Megaphone,
  ChevronLeft,
  Search,
  MessageSquare,
  Building2,
  Clock,
  MapPin
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
  const { user: authUser, logout } = useAuth();
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
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "teachers", label: "Teachers", icon: UserCheck },
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "room-assignments", label: "Weekly Room Assignment", icon: Calendar },
    { id: "rooms", label: "Room Management", icon: Home },
    { id: "van-trips", label: "Transport Schedule", icon: MapPin },
    { id: "vans", label: "Van Management", icon: Bus },
    { id: "utility-billing", label: "Utility Bills", icon: Droplets },
    { id: "payment-verification", label: "Payments", icon: ClipboardList },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const studentMenuItems = [
    { id: "dashboard", label: "My Profile", icon: User },
    { id: "subjects", label: "My Subject", icon: BookOpen },
    { id: "rooms", label: "My Room", icon: Home },
    { id: "my-transportation", label: "My Transportation", icon: Bus },
    { id: "student-utilities", label: "My Utility Bills", icon: Droplets },
    { id: "payment-history", label: "Payment History", icon: Clock },
    { id: "upload-slip", label: "Upload Payment Slip", icon: FileText },
    { id: "announcements", label: "Announcements", icon: Megaphone },
  ];

  const menuItems = role === "Teacher" ? adminMenuItems : studentMenuItems;

  const activeItem = menuItems.find((item) => item.id === activeTab);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await notificationService.update(id, { isRead: true });
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const SidebarItem = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => {
          setActiveTab(item.id);
          setIsMobileMenuOpen(false);
        }}
        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 relative group cursor-pointer ${
          isActive
            ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
            : "text-slate-500 hover:bg-primary-container hover:text-primary"
        }`}
      >
        <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
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
          <div className="absolute left-16 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
            {item.label}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 88 : 280 }}
        className="hidden md:flex flex-col border-r border-outline bg-surface h-full z-40 transition-all duration-300 ease-in-out relative"
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
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight text-slate-900 leading-tight">STIN-Somdej Connect</h2>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Dormitory & Hospital</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-primary-container rounded-xl text-primary transition-colors cursor-pointer shrink-0"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar pb-8">
          {menuItems.map((item) => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </div>

        <div className="p-4 border-t border-outline bg-surface-variant/30">
          <button 
            onClick={onSwitchRole}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl p-3 text-xs font-bold uppercase tracking-widest transition-all border border-primary/20 text-primary hover:bg-primary hover:text-white cursor-pointer ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}
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
              className="fixed inset-y-0 left-0 w-72 bg-surface z-[70] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-outline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">STIN-Somdej Connect</h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="h-6 w-6 text-slate-400" />
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
        {/* Top App Bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-surface border-b border-outline z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 md:hidden cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900">{activeItem?.label || "Overview"}</h1>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-surface-variant rounded-full text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border border-outline">
                Dormitory Management System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-surface-variant/50 border border-outline rounded-2xl px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Global search..." className="bg-transparent border-none focus:ring-0 text-xs font-medium w-full ml-2 text-slate-600 outline-none" />
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors cursor-pointer">
                <MessageSquare className="h-5 w-5" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors relative cursor-pointer"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-surface" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-surface rounded-2xl shadow-2xl border border-outline z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-outline flex justify-between items-center bg-surface-variant/30">
                        <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs">No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} onClick={() => handleMarkRead(n.id)} className={`p-3 rounded-xl hover:bg-surface-variant transition-colors cursor-pointer ${!n.isRead ? 'bg-primary-container/30' : ''}`}>
                              <p className="text-xs font-bold text-slate-900">{n.title}</p>
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
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

            <div className="h-8 w-px bg-outline" />
            
            <button
              onClick={onSwitchRole}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Switch Role
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-32">{user?.displayName?.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{role}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary-container flex items-center justify-center border border-primary/10 overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>
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
  );
}
