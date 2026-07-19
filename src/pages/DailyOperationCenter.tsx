import React from 'react';
import { SummaryCards } from '../components/daily-op/SummaryCards';
import { DashboardCard } from '../components/DashboardCard';

export function DailyOperationCenter() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Daily Operation Center</h1>
      
      <SummaryCards />

      {/* Sections 1-6 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Today's Transportation">
          <p>Transportation content</p>
        </DashboardCard>
        <DashboardCard title="Dormitory Status">
          <p>Dormitory content</p>
        </DashboardCard>
        <DashboardCard title="Today's Supervision">
          <p>Supervision content</p>
        </DashboardCard>
        <DashboardCard title="Utility Status">
          <p>Utility content</p>
        </DashboardCard>
        <DashboardCard title="Latest Announcements">
          <p>Announcements content</p>
        </DashboardCard>
        <DashboardCard title="Student Issues">
          <p>Issues content</p>
        </DashboardCard>
      </div>

      {/* Section 7: Quick Actions */}
      <section className="flex gap-4">
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          Create Announcement
        </button>
        {/* Other buttons */}
      </section>
    </div>
  );
}
