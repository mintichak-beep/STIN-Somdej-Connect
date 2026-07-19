import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { BarChart3 } from 'lucide-react';

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">System Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Active Users" icon={BarChart3}>
            <p className="text-3xl font-bold">128</p>
        </DashboardCard>
        <DashboardCard title="Courses" icon={BarChart3}>
            <p className="text-3xl font-bold">12</p>
        </DashboardCard>
        <DashboardCard title="Hospitals" icon={BarChart3}>
            <p className="text-3xl font-bold">5</p>
        </DashboardCard>
      </div>
    </div>
  );
}
