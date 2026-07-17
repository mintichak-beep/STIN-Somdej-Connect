import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Grid, Button, Card, CardContent } from '@mui/material';
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics';
import { StatisticCard } from '../../components/reports/StatisticCard';
import { ChartCard } from '../../components/reports/ChartCard';
import { OccupancyChart } from '../../components/reports/OccupancyChart';
import { HospitalChart } from '../../components/reports/HospitalChart';
import { TransportationChart } from '../../components/reports/TransportationChart';
import { AccommodationTimeline } from '../../components/reports/AccommodationTimeline';
import { LoadingSkeleton } from '../../components/reports/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Home, Bus, Building2, Calendar, FileSpreadsheet, ArrowRight 
} from 'lucide-react';

export function DashboardAnalyticsPage() {
  const { data, loading } = useDashboardAnalytics();
  const navigate = useNavigate();

  if (loading || !data) {
    return (
      <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Typography variant="h4" mb={1} className="font-bold">Reports & Analytics</Typography>
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  const { stats, hospitalDistribution, periodDistribution, roomOccupancies, tripUsage } = data;

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-slate-100">
              Reports & Analytics
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Real-time executive summaries, clinical rotations overview, and resource optimization.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<FileSpreadsheet size={16} />}
            onClick={() => navigate('/reports/export')}
            className="shadow-sm"
          >
            Export Center
          </Button>
        </Box>

        {/* Executive Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard 
              title="Total Students" 
              value={stats.totalStudents} 
              icon={Users} 
              color="#3b82f6"
              subtext="Enrolled nursing students"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard 
              title="Allocated Students" 
              value={stats.allocatedStudents} 
              icon={Home} 
              color="#10b981"
              subtext={`${stats.waitingStudents} students waiting room`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard 
              title="Occupancy Rate" 
              value={`${stats.occupancyRate}%`} 
              icon={Building2} 
              color="#f59e0b"
              subtext={`${stats.occupiedBeds} / ${stats.totalBeds} total beds filled`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard 
              title="Transit Trips" 
              value={stats.totalTrips} 
              icon={Bus} 
              color="#6366f1"
              subtext="Scheduled placement loops"
            />
          </Grid>
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <ChartCard title="Room & Bed Occupancy" subtitle="Allocated beds vs free capacity">
              <OccupancyChart occupied={stats.occupiedBeds} available={stats.totalBeds - stats.occupiedBeds} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={8}>
            <ChartCard title="Clinical Placement Distribution" subtitle="Students assigned by hospital">
              <HospitalChart data={hospitalDistribution} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={7}>
            <ChartCard title="Transportation Seat Allocation" subtitle="Passenger count vs vehicle capacity per trip">
              <TransportationChart data={tripUsage} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={5}>
            <ChartCard title="Accommodation Rotations Timeline" subtitle="Active schedules with student numbers">
              <AccommodationTimeline data={periodDistribution} />
            </ChartCard>
          </Grid>
        </Grid>

        {/* Navigation Grid for detailed reports */}
        <Typography variant="h6" className="font-bold mb-3 text-slate-800 dark:text-slate-100">
          Detailed Analytics Sub-Reports
        </Typography>
        <Grid container spacing={3}>
          {[
            { title: 'Accommodation Report', desc: 'Dorm allocations, bed checklists, waiting list, room summaries.', path: '/reports/accommodation' },
            { title: 'Transportation Report', desc: 'Trips manifest, driver schedules, daily summaries, vehicle workloads.', path: '/reports/transportation' },
            { title: 'Hospital Placement Statistics', desc: 'Detailed capacity metrics, student quotas, occupancy indicators.', path: '/reports/hospitals' },
            { title: 'Student Directory & Distribution', desc: 'Class sections list, filterable clinical rotations directory.', path: '/reports/students' }
          ].map((report, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  height: '100%', 
                  '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' } 
                }}
                onClick={() => navigate(report.path)}
              >
                <CardContent className="flex flex-col h-full justify-between p-5">
                  <Box>
                    <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                      {report.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-4">
                      {report.desc}
                    </Typography>
                  </Box>
                  <Box className="flex items-center text-primary font-medium text-sm gap-1 hover:gap-2 transition-all">
                    <span>Open Report</span>
                    <ArrowRight size={16} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </main>
    </div>
  );
}
