import React, { useState, useEffect } from 'react';
import { supervisionService } from '../services/supervision.service';
import { SupervisionSchedule } from '../types/db';
import { DashboardCard } from '../components/DashboardCard';
import { Calendar, Plus, CheckCircle } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function SupervisionManagement() {
  const [schedules, setSchedules] = useState<SupervisionSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const data = await supervisionService.getSchedules();
        setSchedules(data);
        setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Supervision Management</h2>
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          <Plus className="h-4 w-4" /> Create Schedule
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map(sch => (
            <DashboardCard key={sch.id} title={`Visit to ${sch.trainingSiteId}`}>
                <p className="text-sm">Date: {sch.date}</p>
                <p className="text-sm">Time: {sch.startTime} - {sch.endTime}</p>
                <div className="flex gap-2 mt-4">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{sch.status}</span>
                </div>
            </DashboardCard>
        ))}
      </div>
    </div>
  );
}
