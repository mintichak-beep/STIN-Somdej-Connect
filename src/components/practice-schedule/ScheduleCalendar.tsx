import React from 'react';
import { practiceScheduleService } from '../../services/practiceScheduleService';

export const ScheduleCalendar = () => {
  const schedules = practiceScheduleService.getSchedules();

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-zinc-900">Practice Calendar</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {schedules.map(s => (
          <div key={s.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="font-bold text-indigo-700">{s.ward}</h4>
            <p className="text-sm text-zinc-600">{s.startDate} - {s.endDate}</p>
            <p className="text-xs text-zinc-500 mt-2">{s.shift}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
