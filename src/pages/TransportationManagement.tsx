import React, { useState } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { Bus, Plus, Users, Calendar } from 'lucide-react';

export function TransportationManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Transportation Management</h2>
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          <Plus className="h-4 w-4" /> Create Trip
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Vans" icon={Bus} value="5" />
        <DashboardCard title="Today's Trips" icon={Calendar} value="3" />
        <DashboardCard title="Total Passengers" icon={Users} value="45" />
        <DashboardCard title="Available Seats" icon={Bus} value="10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard title="Van V001">
            <p className="text-sm">Destination: Somdej Hospital</p>
            <p className="text-sm">Departure: 07:00</p>
            <p className="text-sm">Seats: 12 / 15</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-orange-500 h-2.5 rounded-full" style={{width: '80%'}}></div>
            </div>
            <p className="text-xs mt-1">Remaining: 3 Seats</p>
          </DashboardCard>
      </div>
    </div>
  );
}
