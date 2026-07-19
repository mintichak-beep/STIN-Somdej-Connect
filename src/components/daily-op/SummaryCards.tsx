import { Users, Building2, Hospital, Bed, Bus, Calendar } from 'lucide-react';
import { DashboardCard } from '../DashboardCard';

export function SummaryCards() {
  const students = [];
  const groups = [];
  const hospitals = [];
  const dorms = [].filter(b => b.buildingType === 'Dormitory');
  const vans = [];
  const trips = [];

  const cards = [
    { title: 'Nursing Students', value: students.length, icon: Users, color: 'text-blue-600' },
    { title: 'Training Groups', value: groups.length, icon: Users, color: 'text-indigo-600' },
    { title: 'Hospitals', value: hospitals.length, icon: Hospital, color: 'text-emerald-600' },
    { title: 'Dormitories', value: dorms.length, icon: Bed, color: 'text-purple-600' },
    { title: 'Van Trips', value: vans.length, icon: Bus, color: 'text-orange-600' },
    { title: 'Today\'s Schedule', value: trips.length, icon: Calendar, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <DashboardCard key={i} title={card.title} hoverEffect={true}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-50 dark:bg-zinc-800 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold">{card.value}</span>
            </div>
          </DashboardCard>
        );
      })}
    </div>
  );
}
