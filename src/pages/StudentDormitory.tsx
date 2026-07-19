import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { Bed } from 'lucide-react';

export function StudentDormitory() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Dormitory</h2>
      
      <DashboardCard title="My Dormitory">
        <div className="space-y-2">
          <p className="text-sm"><strong>Dormitory Name:</strong> Dormitory A</p>
          <p className="text-sm"><strong>Room:</strong> 201</p>
          <p className="text-sm"><strong>Roommates:</strong> Student A, Student B, Student C</p>
        </div>
      </DashboardCard>
    </div>
  );
}
