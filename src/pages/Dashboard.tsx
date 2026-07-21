import { useEffect, useState } from "react";
import { 
  Users, 
  UserCheck, 
  Bed, 
  Bus, 
  AlertCircle,
  Droplets,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Calendar,
  Building2,
  CreditCard,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  studentService, 
  teacherService, 
  roomService, 
  vanTripService,
  weeklyBillService,
  notificationService,
  weeklyRoomAssignmentService,
  allocationService,
  hospitalService,
  dormitoryService,
  studentPaymentService
} from "../services/app.service";
import { useAuth } from "../hooks/useAuth";
import { format } from "date-fns";
import { CuteMedicalBadge, CuteEmptyState, CUTE_MEDICAL_IMAGES } from "../components/CuteMedicalIllustration";

export function Dashboard() {
  const { user: authUser } = useAuth();
  const user = authUser || { role: 'Teacher' };
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    weeklyAssignments: 0,
    todayVanTrips: 0,
    pendingUpload: 0,
    paymentSlipUploaded: 0,
    paidBills: 0
  });

  const [hospitalStats, setHospitalStats] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [dormitoryName, setDormitoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [students, teachers, rooms, vanTrips, bills, notifications, assignments, allocations, hospitals, dormitories, studentPayments] = await Promise.all([
          studentService.getAll(),
          teacherService.getAll(),
          roomService.getAll(),
          vanTripService.getAll(),
          weeklyBillService.getAll(),
          notificationService.getAll(),
          weeklyRoomAssignmentService.getAll(),
          allocationService.getAll(),
          hospitalService.getAll(),
          dormitoryService.getAll(),
          studentPaymentService.getAll()
        ]);

        if (dormitories.length > 0) {
          setDormitoryName(dormitories[0].dormitoryName);
        }

        const today = format(new Date(), 'yyyy-MM-dd');
        const todayTrips = vanTrips.filter(t => t.date === today).length;
        
        const availableRoomsCount = rooms.filter(r => r.status === 'active' && (r.currentOccupancy || 0) < r.capacity).length;
        const occupiedRoomsCount = rooms.filter(r => r.status === 'active' && (r.currentOccupancy || 0) >= r.capacity).length;

        const pendingUploadCount = studentPayments.filter(p => p.paymentStatus === 'pending' || !p.paymentStatus).length;
        const slipUploadedCount = studentPayments.filter(p => p.paymentStatus === 'payment_slip_uploaded' || p.paymentStatus === 'waiting_verification').length;

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          availableRooms: availableRoomsCount,
          occupiedRooms: occupiedRoomsCount,
          weeklyAssignments: assignments.filter(a => a.status === 'active').length,
          todayVanTrips: todayTrips,
          pendingUpload: pendingUploadCount,
          paymentSlipUploaded: slipUploadedCount,
          paidBills: studentPayments.filter(p => p.paymentStatus === 'paid').length
        });

        // Calculate hospital distribution
        const hStats = hospitals.map(h => {
          const count = allocations.filter(a => a.hospitalId === h.id).length;
          return { name: h.name, students: count };
        }).filter(h => h.students > 0).slice(0, 5);
        
        setHospitalStats(hStats.length > 0 ? hStats : [{ name: 'No Data', students: 0 }]);
        setRecentActivities(notifications.slice(0, 5));
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, trend: "Real-time", color: "medical-blue" },
    { label: "Total Teachers", value: stats.totalTeachers, icon: UserCheck, trend: "Verified", color: "medical-teal" },
    { label: "Available Rooms", value: stats.availableRooms, icon: Bed, trend: "Ready", color: "medical-green" },
    { label: "Occupied Rooms", value: stats.occupiedRooms, icon: Building2, trend: "Active", color: "medical-orange" },
    { label: "Weekly Assignments", value: stats.weeklyAssignments, icon: Calendar, trend: "Current", color: "primary" },
    { label: "Today's Van Trips", value: stats.todayVanTrips, icon: Bus, trend: "Scheduled", color: "medical-blue" },
    { label: "Pending Upload", value: stats.pendingUpload, icon: AlertTriangle, trend: "Action Needed", color: "medical-red" },
    { label: "Payment Slip Uploaded", value: stats.paymentSlipUploaded, icon: CheckCircle2, trend: "Submitted", color: "medical-blue" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synchronizing System Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in">
      <header className="w-full py-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-800 via-primary to-primary-dark p-6 md:p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden group text-center md:text-left space-y-4 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Subtle Banner Background Decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <Building2 className="h-40 w-40 rotate-12" />
          </div>
          
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                <Activity className="h-3.5 w-3.5 text-white animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Institutional Dashboard</span>
              </div>
              <CuteMedicalBadge icon="heart" text="Nursing Practice Center" variant="rose" />
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Welcome to Queen Savang Vadhana Memorial Hospital
            </h1>
            
            <p className="text-primary-container font-bold text-sm md:text-base opacity-90 uppercase tracking-widest">
              {dormitoryName.replace("เรือนไม้", "").trim() || "Dormitory Management System"}
            </p>
            
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm">
                <Calendar className="h-3.5 w-3.5 text-white" />
                <span className="text-[10px] font-bold text-white">{format(new Date(), 'MMMM do, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1 w-6 bg-white/30 rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">STIN Nursing Institute</span>
              </div>
            </div>
          </div>

          {/* Banner Illustration Thumbnail */}
          <div className="relative z-10 shrink-0 hidden sm:block">
            <div className="w-32 h-32 md:w-40 md:h-28 rounded-2xl p-1 bg-white/20 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden flex items-center justify-center">
              <img 
                src={CUTE_MEDICAL_IMAGES.hospitalBanner} 
                alt="Hospital Banner Illustration"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>
      </header>

      {/* Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="md-card p-6 relative overflow-hidden group hover:border-primary/30"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-start justify-between relative z-10">
              <div className={`p-3 rounded-2xl bg-primary/5 text-primary`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-medical-green bg-medical-green/5 px-2 py-1 rounded-full border border-medical-green/10">
                <Activity className="h-3 w-3" />
                {stat.trend}
              </div>
            </div>
            <div className="mt-6 relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 md-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hospital Placement Distribution</h3>
              <p className="text-sm font-medium text-slate-400">Student count per training facility</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Bar dataKey="students" radius={[8, 8, 0, 0]} barSize={40}>
                  <Cell fill="#C62828" />
                  <Cell fill="#EF5350" />
                  <Cell fill="#1565C0" />
                  <Cell fill="#00897B" />
                  <Cell fill="#F9A825" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Recent Activities */}
        <div className="md-card p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Recent Activities</h3>
          </div>
          
          <div className="flex-1 space-y-6">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="flex gap-4 relative group">
                  {idx !== recentActivities.length - 1 && (
                    <div className="absolute left-2.5 top-8 bottom-[-24px] w-0.5 bg-slate-100 group-hover:bg-primary/20 transition-colors" />
                  )}
                  <div className={`h-5 w-5 rounded-full border-2 border-white ring-4 ring-slate-50 shrink-0 z-10 ${
                    activity.type === 'bill' ? 'bg-medical-blue' :
                    activity.type === 'payment' ? 'bg-medical-teal' :
                    'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{activity.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{activity.message}</p>
                    <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-tighter">{format(activity.createdAt?.toDate ? activity.createdAt.toDate() : new Date(activity.createdAt), 'HH:mm • dd MMM')}</p>
                  </div>
                </div>
              ))
            ) : (
              <CuteEmptyState
                title="System Quiet"
                description="ยังไม่มีประวัติกิจกรรมล่าสุดในขณะนี้"
                className="py-6 border-none bg-transparent shadow-none"
              />
            )}
          </div>

          <button className="mt-8 md-button-outlined w-full text-xs">View Full Audit Log</button>
        </div>
      </div>
    </div>
  );
}
