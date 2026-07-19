import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { utilityService } from '../services/utility.service';
import { UtilityRecord } from '../types/db';
import { Plus, Receipt, CheckCircle, Clock } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function UtilityManagement() {
  const [records, setRecords] = useState<UtilityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const data = await utilityService.getAll();
        setRecords(data);
        setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Utility Management</h2>
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          <Plus className="h-4 w-4" /> Create Utility Record
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Rooms" icon={Receipt} value="45" />
        <DashboardCard title="Monthly Bills" icon={Receipt} value={records.length.toString()} />
        <DashboardCard title="Pending Payments" icon={Clock} value="12" />
        <DashboardCard title="Completed Payments" icon={CheckCircle} value="33" />
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold mb-4">Recent Utility Bills</h3>
        {records.length === 0 ? <p>No bills found.</p> : (
            <div className="space-y-4">
                {records.map(rec => (
                    <div key={rec.id} className="border-b pb-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold">Room {rec.roomId} - {rec.month} {rec.year}</p>
                            <p className="text-sm text-gray-500">Water: {rec.waterAmount} | Elec: {rec.electricityAmount}</p>
                        </div>
                        <p className="font-bold">Total: {rec.totalAmount} THB</p>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
