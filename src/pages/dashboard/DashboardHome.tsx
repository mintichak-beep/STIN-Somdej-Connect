import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { useDashboardStatistics } from '../../hooks/useDashboardStatistics';
import { useAuth } from '../../hooks/useAuth';
import { mockDB } from '../../services/mockData';
import { DashboardHeader } from '../../components/DashboardHeader';
import { SummaryCard } from '../../components/SummaryCard';
import { StatisticCard } from '../../components/StatisticCard';
import { ChartCard } from '../../components/ChartCard';
import { RecentActivityCard } from '../../components/RecentActivityCard';
import { QuickActionCard } from '../../components/QuickActionCard';
import { HospitalSummaryCard } from '../../components/HospitalSummaryCard';
import { RoomSummaryCard } from '../../components/RoomSummaryCard';
import { TransportationSummaryCard } from '../../components/TransportationSummaryCard';
import { StudentSummaryCard } from '../../components/StudentSummaryCard';
import { TeacherSummaryCard } from '../../components/TeacherSummaryCard';
import { DashboardSkeleton } from '../../components/DashboardSkeleton';

import { 
  LayoutDashboard, Building2, ShieldAlert, KeyRound, Truck, 
  Bed, Users, GraduationCap, RefreshCw, Layers, CheckCircle,
  CalendarRange, CalendarDays
} from 'lucide-react';

export function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    filters,
    updateFilter,
    clearFilters,
    academicYears,
    courses,
    sections,
    hospitals,
    rooms,
    vehicles,
    schedules,
    toast,
    isAdmin,
    isTeacher,
    isStudent,
    handleAddStudent,
    handleAddTeacher,
    handleAssignRoom,
    handleAssignTransportation,
    handleImportExcel,
    handleExportReport
  } = useDashboard();

  const { stats, chartData, loading, error, refresh } = useDashboardStatistics(filters);
  const [activeTab, setActiveTab] = useState<'overview' | 'hospitals' | 'dorms' | 'transport' | 'teachers'>('overview');
  const [syncing, setSyncing] = useState(false);

  const triggerSync = () => {
    setSyncing(true);
    refresh();
    setTimeout(() => setSyncing(false), 600);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Rentention color indicators based on quota
  const getProgressColor = (val: number, max: number) => {
    const r = max > 0 ? (val / max) : 0;
    if (r >= 0.9) return 'bg-red-600';
    if (r >= 0.6) return 'bg-amber-500';
    return 'bg-green-600';
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-gray-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-50 md:flex-row">
      
      {/* Tab Selector Sidebar for larger viewports */}
      <aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:flex md:flex-col">
        {/* Sidebar Brand header */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-50 px-6 dark:border-zinc-800/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 font-extrabold text-white">
            ST
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wide text-gray-900 dark:text-zinc-50">STIN CPATMS</h2>
            <p className="text-[10px] font-bold text-red-600 uppercase dark:text-red-500">Placement Hub</p>
          </div>
        </div>

        {/* Master Navigation Tabs list */}
        <div className="flex-1 space-y-1.5 p-4">
          <p className="px-4 text-[10px] font-black tracking-wider text-gray-400 uppercase dark:text-zinc-500">
            Control center
          </p>
          
          {isStudent ? (
            <div className="px-4 py-2 bg-red-50/50 border border-red-100/50 rounded-xl text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:border-red-900/30">
              Student Mode Verified
            </div>
          ) : (
            <>
              <button
                id="tab-overview"
                onClick={() => setActiveTab('overview')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Overview Deck</span>
              </button>

              <button
                id="tab-hospitals"
                onClick={() => setActiveTab('hospitals')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'hospitals'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <span>Clinical Wards</span>
              </button>

              <button
                id="tab-dorms"
                onClick={() => setActiveTab('dorms')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dorms'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Bed className="h-4 w-4 shrink-0" />
                <span>Dormitory Housing</span>
              </button>

              <button
                id="tab-transport"
                onClick={() => setActiveTab('transport')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'transport'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Truck className="h-4 w-4 shrink-0" />
                <span>Transportation Routes</span>
              </button>

              <button
                id="tab-teachers"
                onClick={() => setActiveTab('teachers')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'teachers'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>Academic Faculty</span>
              </button>

              <div className="pt-2 border-t border-gray-50 dark:border-zinc-900/40">
                <p className="px-4 pb-1 text-[9px] font-black tracking-wider text-gray-400 uppercase dark:text-zinc-500">
                  Academic Calendar
                </p>
                <button
                  onClick={() => navigate('/academic-years')}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  <CalendarRange className="h-4 w-4 shrink-0" />
                  <span>Academic Years</span>
                </button>
                <button
                  onClick={() => navigate('/semesters')}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span>Semester Terms</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Status Footer */}
        <div className="p-4 border-t border-gray-50 dark:border-zinc-800/40">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
            <span>Terminal Security</span>
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
            Role: <strong>{user?.role}</strong> • Node Active
          </p>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Filter Controls Bar */}
        <DashboardHeader
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          academicYears={academicYears}
          onRefresh={triggerSync}
          isRefreshing={syncing}
        />

        {/* Main Dashboard Panel Body */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          
          {/* TOAST SYSTEM ALERTS POPUP */}
          {toast && (
            <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg transition-all duration-300 animate-slide-in ${
              toast.type === 'success' 
                ? 'border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/80 dark:text-emerald-300' 
                : 'border-rose-100 bg-rose-50 text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/80 dark:text-rose-300'
            }`}>
              <span className={`h-2 w-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <p className="text-xs font-bold">{toast.message}</p>
            </div>
          )}

          {/* Fallback Fire Store Queries Error Alerts */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950/30 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">CPATMS Database Listener Error</p>
                <p className="text-[11px] mt-0.5 text-rose-600 dark:text-rose-500">{error}</p>
              </div>
            </div>
          )}

          {/* STUDENT ONLY GATED VIEW OR NORMAL VIEW TABS */}
          {isStudent ? (
            <StudentSummaryCard />
          ) : (
            <>
              {/* Mobile View Tab Selector Header */}
              <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 dark:border-zinc-800/80 dark:bg-zinc-950/50 md:hidden">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('hospitals')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${activeTab === 'hospitals' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                >
                  Clinical Wards
                </button>
                <button
                  onClick={() => setActiveTab('dorms')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${activeTab === 'dorms' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                >
                  Dormitories
                </button>
                <button
                  onClick={() => setActiveTab('transport')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${activeTab === 'transport' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                >
                  Buses
                </button>
                <button
                  onClick={() => setActiveTab('teachers')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${activeTab === 'teachers' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                >
                  Faculty
                </button>
              </div>

              {/* OVERVIEW MODULE DECK */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Master KPI summary metrics grid */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                      title="Placement Students"
                      value={stats.totalStudents}
                      icon={<Users className="h-5 w-5" />}
                      color="primary"
                      description="Active student enrollments"
                      trend={{ value: '+8%', isPositive: true }}
                    />
                    <SummaryCard
                      title="Clinical Faculty"
                      value={stats.totalTeachers}
                      icon={<GraduationCap className="h-5 w-5" />}
                      color="warning"
                      description="Supervising coordinators"
                    />
                    <SummaryCard
                      title="Active Wards"
                      value={stats.totalHospitals}
                      icon={<Building2 className="h-5 w-5" />}
                      color="success"
                      description="Coordinating hospitals"
                      trend={{ value: 'Full', isPositive: true }}
                    />
                    <SummaryCard
                      title="Commute Trips"
                      value={stats.transportationTrips}
                      icon={<Truck className="h-5 w-5" />}
                      color="info"
                      description="Daily vehicle schedules"
                    />
                  </div>

                  {/* Primary charts & operational grids split */}
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Visual analytics chart blocks */}
                    <div className="lg:col-span-2 space-y-6">
                      <ChartCard
                        title="Student Allocations by Clinical Center"
                        type="bar"
                        labels={chartData.studentByHospital.map(c => c.label)}
                        values={chartData.studentByHospital.map(c => c.value)}
                        datasetLabel="Nursing Students Count"
                      />

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <ChartCard
                          title="Students by Registered Course"
                          type="doughnut"
                          labels={chartData.studentsByCourse.map(c => c.label)}
                          values={chartData.studentsByCourse.map(c => c.value)}
                        />
                        <ChartCard
                          title="Monthly Placement Trend"
                          type="line"
                          labels={chartData.monthlyPlacementSummary.map(c => c.label)}
                          values={chartData.monthlyPlacementSummary.map(c => c.value)}
                          datasetLabel="Clinical Admissions"
                        />
                      </div>
                    </div>

                    {/* Operational controls stack */}
                    <div className="space-y-6">
                      <QuickActionCard
                        onAddStudent={handleAddStudent}
                        onAddTeacher={handleAddTeacher}
                        onAssignRoom={handleAssignRoom}
                        onAssignTransportation={handleAssignTransportation}
                        onImportExcel={handleImportExcel}
                        onExportReport={handleExportReport}
                        academicYears={academicYears}
                        courses={courses}
                        sections={sections}
                        hospitals={hospitals}
                        rooms={rooms}
                        schedules={schedules}
                        isAdmin={isAdmin}
                      />

                      <RecentActivityCard />
                    </div>
                  </div>

                  {/* Secondary detailed KPI values */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-950/70">
                    <h4 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400 mb-4">
                      Secondary Operational Ratios
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <StatisticCard
                        title="Dormitory Utilization"
                        value={stats.occupiedRooms}
                        total={stats.totalRooms}
                        color={getProgressColor(stats.occupiedRooms, stats.totalRooms)}
                        subtitle={`${stats.availableRooms} rooms still have open beds`}
                        icon={<Bed className="h-4 w-4" />}
                      />
                      <StatisticCard
                        title="Transit Drivers Duty Ratio"
                        value={stats.totalDrivers}
                        total={stats.totalDrivers + 1}
                        color="bg-sky-600"
                        subtitle="All registered drivers active"
                        icon={<Users className="h-4 w-4" />}
                      />
                      <StatisticCard
                        title="Active Academic Terms"
                        value={stats.academicYearsCount}
                        subtitle="Tracks current & future schedules"
                        icon={<Layers className="h-4 w-4" />}
                      />
                      <StatisticCard
                        title="Hospital Affiliates Ratio"
                        value={stats.totalHospitals}
                        total={stats.totalHospitals}
                        color="bg-emerald-600"
                        subtitle="100% contracts validated"
                        icon={<Building2 className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* HOSPITAL PLACEMENT DIRECTORY MODULE */}
              {activeTab === 'hospitals' && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ChartCard
                      title="Clinical Hospital Wards Density"
                      type="bar"
                      labels={chartData.studentByHospital.map(c => c.label)}
                      values={chartData.studentByHospital.map(c => c.value)}
                      datasetLabel="Students Placed"
                    />
                  </div>
                  <div>
                    <HospitalSummaryCard hospitals={hospitals} students={mockDB.getStudents()} />
                  </div>
                </div>
              )}

              {/* DORMITORY ROOM UTILIZATION MODULE */}
              {activeTab === 'dorms' && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ChartCard
                      title="Dormitory Status Allocation Ratio"
                      type="doughnut"
                      labels={['Full', 'Vacancies', 'Maintenance']}
                      values={[chartData.roomOccupancy.occupied, chartData.roomOccupancy.available, chartData.roomOccupancy.maintenance]}
                      colors={['#D6001C', '#2E7D32', '#ED6C02']}
                    />
                  </div>
                  <div>
                    <RoomSummaryCard rooms={rooms} buildings={mockDB.getBuildings()} />
                  </div>
                </div>
              )}

              {/* VEHICLES COMMUTE DISPATCH MODULE */}
              {activeTab === 'transport' && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ChartCard
                      title="Commuter Shuttle Occupancy Ratios"
                      type="bar"
                      labels={chartData.transportUsage.map(c => c.label)}
                      values={chartData.transportUsage.map(c => c.value)}
                      datasetLabel="Riders Seat Count"
                    />
                  </div>
                  <div>
                    <TransportationSummaryCard schedules={schedules} vehicles={vehicles} drivers={mockDB.getDrivers()} />
                  </div>
                </div>
              )}

              {/* ACADEMIC SUPERVISORS MODULE */}
              {activeTab === 'teachers' && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ChartCard
                      title="Faculty Distribution by Nursing Specialties"
                      type="doughnut"
                      labels={chartData.teacherDistribution.map(c => c.label)}
                      values={chartData.teacherDistribution.map(c => c.value)}
                    />
                  </div>
                  <div>
                    <TeacherSummaryCard teachers={mockDB.getTeachers()} courses={courses} />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
export default DashboardHome;
