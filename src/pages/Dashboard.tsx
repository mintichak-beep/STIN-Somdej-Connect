import { useEffect, useState } from "react";
import { 
  Users, 
  MapPin, 
  UserCheck, 
  Bed, 
  Bus, 
  AlertCircle,
  Droplets,
  Zap,
  Clock,
  CheckCircle2,
  XCircle
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
  hospitalService, 
  roomService, 
  vanService, 
  allocationService,
  weeklyBillService
} from "../services/app.service";
import { useAuth } from "../hooks/useAuth";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    hospitals: 0,
    rooms: 0,
    vans: 0,
    unallocatedStudents: 0,
    pendingBills: 0,
    waitingVerification: 0
  });

  const [studentStats, setStudentStats] = useState({
    unpaidBills: 0,
    totalOwed: 0,
    nextDueDate: ""
  });

  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [students, teachers, hospitals, rooms, vans, allocations, bills] = await Promise.all([
          studentService.getAll(),
          teacherService.getAll(),
          hospitalService.getAll(),
          roomService.getAll(),
          vanService.getAll(),
          allocationService.getAll(),
          weeklyBillService.getAll()
        ]);

        const allocatedStudentIds = new Set(allocations.map(a => a.studentId));
        const unallocatedCount = students.filter(s => !allocatedStudentIds.has(s.id)).length;

        const pendingBillsCount = bills.filter(b => b.paymentStatus === 'pending').length;
        const waitingVerificationCount = bills.filter(b => b.paymentStatus === 'waiting_verification').length;

        setStats({
          students: students.length,
          teachers: teachers.length,
          hospitals: hospitals.length,
          rooms: rooms.length,
          vans: vans.length,
          unallocatedStudents: unallocatedCount,
          pendingBills: pendingBillsCount,
          waitingVerification: waitingVerificationCount
        });

        if (user?.role === 'Nursing Student') {
          const myBills = bills.filter(b => b.studentId === user.uid || b.studentId === 'dev-student-id');
          const unpaid = myBills.filter(b => b.paymentStatus === 'pending' || b.paymentStatus === 'rejected');
          const total = unpaid.reduce((sum, b) => sum + b.totalAmount, 0);
          const nextDue = unpaid.length > 0 ? unpaid[0].dueDate : "";
          
          setStudentStats({
            unpaidBills: unpaid.length,
            totalOwed: total,
            nextDueDate: nextDue
          });
        }

        // Group allocations by hospital for the chart
        const hospitalMap: Record<string, number> = {};
        allocations.forEach(a => {
          const hospital = hospitals.find(h => h.id === a.hospitalId);
          if (hospital) {
            hospitalMap[hospital.name] = (hospitalMap[hospital.name] || 0) + 1;
          }
        });

        const chartData = Object.entries(hospitalMap).map(([name, count]) => ({
          name,
          count
        }));

        setAllocationData(chartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const adminStatCards = [
    { label: "จำนวนนักศึกษา", value: stats.students, icon: Users, color: "red" },
    { label: "จำนวนอาจารย์", value: stats.teachers, icon: UserCheck, color: "red" },
    { label: "จำนวนแหล่งฝึก", value: stats.hospitals, icon: MapPin, color: "red" },
    { label: "บิลรอตรวจสอบ", value: stats.waitingVerification, icon: Clock, color: "amber" },
    { label: "บิลที่ยังไม่ชำระ", value: stats.pendingBills, icon: AlertCircle, color: "red" },
    { label: "นักศึกษาที่ยังไม่ได้จัดสรร", value: stats.unallocatedStudents, icon: AlertCircle, color: "red" },
  ];

  const studentStatCards = [
    { label: "บิลที่ค้างชำระ", value: studentStats.unpaidBills, icon: AlertCircle, color: "red" },
    { label: "ยอดที่ต้องชำระ (บาท)", value: studentStats.totalOwed.toLocaleString(), icon: Droplets, color: "red" },
    { label: "สถานะการจัดสรร", value: "จัดสรรแล้ว", icon: CheckCircle2, color: "green" },
  ];

  const COLORS = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {(user?.role === 'Teacher' ? adminStatCards : studentStatCards).map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-zinc-800">
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 mb-6">
            {user?.role === 'Teacher' ? 'สรุปการจัดสรรตามแหล่งฝึก' : 'การจัดสรรของฉัน'}
          </h3>
          <div className="h-[400px]">
            {user?.role === 'Teacher' ? (
              allocationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={allocationData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400 font-bold">
                  ไม่มีข้อมูลการจัดสรร
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="bg-red-50 p-6 rounded-full">
                  <MapPin className="h-12 w-12 text-red-600" />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-black text-zinc-900 dark:text-white">แหล่งฝึกสมเด็จพระบรมราชเทวี ณ ศรีราชา</h4>
                  <p className="text-zinc-500 font-bold">แผนกอายุรกรรมชาย • ตึกสมเด็จ • ชั้น 4</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-zinc-800">
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 mb-6">สถานะการทำงาน</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">จัดสรรรวม</span>
                <span className="text-sm font-black text-red-700 dark:text-red-300">
                  {Math.round(((stats.students - stats.unallocatedStudents) / stats.students) * 100 || 0)}%
                </span>
              </div>
              <div className="h-2 w-full bg-red-200 dark:bg-red-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats.students - stats.unallocatedStudents) / stats.students) * 100 || 0}%` }}
                  className="h-full bg-red-600"
                />
              </div>
            </div>

            {user?.role === 'Nursing Student' && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">ยอดค้างชำระ</span>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-300">
                    {studentStats.totalOwed > 0 ? 'รอชำระ' : 'ไม่มีค้าง'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold text-amber-700">{studentStats.totalOwed.toLocaleString()} ฿</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <h4 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">รายละเอียดด่วน</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400 font-bold">โควตาแหล่งฝึกรวม</span>
                <span className="text-zinc-900 dark:text-zinc-50 font-black">{stats.hospitals > 0 ? 'เปิดรับ' : 'ไม่มีข้อมูล'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400 font-bold">เตียงว่างทั้งหมด</span>
                <span className="text-zinc-900 dark:text-zinc-50 font-black">--</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400 font-bold">ที่นั่งรถตู้ว่าง</span>
                <span className="text-zinc-900 dark:text-zinc-50 font-black">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
