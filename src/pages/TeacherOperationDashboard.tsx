import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Building2, 
  Layers,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { operationAnalyticsService } from '../services/operationAnalytics.service';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { DashboardCard } from '../components/DashboardCard';
import { motion } from 'motion/react';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const DEFAULT_STATS = {
  totalStudents: 0,
  totalCourses: 0,
  totalHospitals: 0,
  totalGroups: 0,
  studentsByCourse: [],
  studentsByHospital: [],
  studentsByGroup: [],
  recentStudents: [],
  recentUpdates: []
};

export const TeacherOperationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(DEFAULT_STATS);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await operationAnalyticsService.getStats();
        setData(stats || DEFAULT_STATS);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(DEFAULT_STATS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  const stats = [
    { label: 'Total Students', value: data.totalStudents, icon: Users, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Courses', value: data.totalCourses, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Hospitals', value: data.totalHospitals, icon: Building2, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Groups', value: data.totalGroups, icon: Layers, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Operation Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">System-wide operational overview and student distributions.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">Updated: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${stat.bg} p-2 dark:bg-zinc-900`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                Live
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Students by Course */}
        <DashboardCard id="chart-courses" title="Students by Course" icon={BookOpen}>
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.studentsByCourse}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Students by Group */}
        <DashboardCard id="chart-groups" title="Students by Practice Group" icon={Layers}>
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.studentsByGroup}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {data.studentsByGroup.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Students by Hospital */}
        <div className="lg:col-span-2">
          <DashboardCard id="chart-hospitals" title="Student Distribution by Hospital" icon={Building2}>
            <div className="h-[350px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.studentsByHospital} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" width={150} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Imported Students */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              <h3 className="font-bold dark:text-white">Recently Imported Students</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {data.recentStudents.map((student: any) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-mono text-xs">{student.studentId}</td>
                    <td className="px-4 py-3 font-medium dark:text-white">{student.fullName}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Updated Records */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold dark:text-white">Recently Updated Records</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {data.recentUpdates.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/30">
                        STUDENT
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium dark:text-white">Update Profile: {item.fullName}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
