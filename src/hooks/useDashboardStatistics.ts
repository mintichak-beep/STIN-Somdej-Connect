import { useState, useEffect, useMemo } from 'react';
import { statisticsService, DashboardFilters, DashboardStats, DashboardChartData } from '../services/statistics.service';

export function useDashboardStatistics(filters: DashboardFilters) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    // Simulate real-time subscription update
    const handleDbUpdate = () => {
      setTick(prev => prev + 1);
    };

    window.addEventListener('cpatms_db_update', handleDbUpdate);
    
    // Simulate initial loading skeleton effect
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => {
      window.removeEventListener('cpatms_db_update', handleDbUpdate);
      clearTimeout(timer);
    };
  }, []);

  // Recalculate stats and charts dynamically based on active filters
  const stats = useMemo<DashboardStats>(() => {
    try {
      return statisticsService.getStats(filters);
    } catch (e: any) {
      setError(e?.message || 'Failed to calculate statistics');
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalHospitals: 0,
        totalBuildings: 0,
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        totalVehicles: 0,
        totalDrivers: 0,
        transportationTrips: 0,
        academicYearsCount: 0,
        coursesCount: 0,
        sectionsCount: 0
      };
    }
  }, [filters, tick]);

  const chartData = useMemo<DashboardChartData>(() => {
    try {
      return statisticsService.getChartData(filters);
    } catch (e: any) {
      setError(e?.message || 'Failed to calculate chart distributions');
      return {
        studentByHospital: [],
        roomOccupancy: { occupied: 0, available: 0, maintenance: 0 },
        transportUsage: [],
        teacherDistribution: [],
        studentsByCourse: [],
        studentsBySection: [],
        monthlyPlacementSummary: []
      };
    }
  }, [filters, tick]);

  return {
    stats,
    chartData,
    loading,
    error,
    refresh: () => setTick(prev => prev + 1)
  };
}
