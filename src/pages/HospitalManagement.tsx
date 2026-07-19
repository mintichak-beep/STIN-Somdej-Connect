import React, { useState, useEffect } from 'react';
import { trainingSiteService } from '../services/trainingSite.service';
import { TrainingSite } from '../types/db';
import { DashboardCard } from '../components/DashboardCard';
import { Building2, Plus } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function HospitalManagement() {
  const [sites, setSites] = useState<TrainingSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const data = await trainingSiteService.getAll();
        setSites(data);
        setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Hospital Coordination Center</h2>
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          <Plus className="h-4 w-4" /> Add Hospital
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map(site => (
            <DashboardCard key={site.id} title={site.name} icon={Building2}>
                <p className="text-sm">Type: {site.hospitalType}</p>
                <p className="text-sm">Contact: {site.contactPerson}</p>
                <div className="mt-4 flex gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{site.status}</span>
                </div>
            </DashboardCard>
        ))}
      </div>
    </div>
  );
}
