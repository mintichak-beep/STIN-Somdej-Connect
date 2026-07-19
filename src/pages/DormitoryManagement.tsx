import React, { useState, useEffect } from 'react';
import { Dormitory, Room } from '../types/db';
import { dormitoryService } from '../services/dormitory.service';
import { roomService } from '../services/room.service';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { DashboardCard } from '../components/DashboardCard';
import { Plus, Trash2, Home, Bed } from 'lucide-react';

export function DormitoryManagement() {
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDorm, setSelectedDorm] = useState<string | null>(null);

  useEffect(() => {
    fetchDorms();
  }, []);

  async function fetchDorms() {
    setLoading(true);
    const data = await dormitoryService.getAll();
    setDormitories(data);
    setLoading(false);
  }

  async function selectDorm(id: string) {
    setSelectedDorm(id);
    const data = await roomService.getByDormitory(id);
    setRooms(data);
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dormitory Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dormitories.map(dorm => (
          <DashboardCard key={dorm.id} title={dorm.name} hoverEffect={true} className={selectedDorm === dorm.id ? 'border-red-500' : ''}>
            <p className="text-sm">{dorm.address}</p>
            <button onClick={() => selectDorm(dorm.id)} className="mt-4 text-red-600 font-bold text-sm">Manage Rooms</button>
          </DashboardCard>
        ))}
      </div>

      {selectedDorm && (
        <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Rooms for {dormitories.find(d => d.id === selectedDorm)?.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rooms.map(room => (
                    <DashboardCard key={room.id} title={`Room ${room.roomNumber}`}>
                        <div className="text-sm">Capacity: {room.capacity}</div>
                        <div className="text-sm">Occupied: {room.occupiedCount}</div>
                    </DashboardCard>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
