import React, { useState } from 'react';
import { ScheduleUploadBox } from '../components/practice-schedule/ScheduleUploadBox';
import { SchedulePreview } from '../components/practice-schedule/SchedulePreview';
import { ScheduleCalendar } from '../components/practice-schedule/ScheduleCalendar';
import { practiceScheduleService } from '../services/practiceScheduleService';

export const PracticeScheduleCenter = () => {
  const [validation, setValidation] = useState(null);

  const handleImport = async () => {
    if (validation?.valid) {
      await practiceScheduleService.importSchedules(validation.valid, 'teacher-id-123');
      alert('Import successful!');
      setValidation(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-black uppercase tracking-tight">Practice Schedule Center</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Import Schedule</h2>
        <ScheduleUploadBox onImport={setValidation} />
        {validation && (
          <div className="mt-4">
            <SchedulePreview records={validation.valid} />
            <button 
              onClick={handleImport}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded font-bold uppercase text-xs hover:bg-indigo-700"
            >
              Import {validation.valid.length} Schedules
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Practice Calendar</h2>
        <ScheduleCalendar />
      </div>
    </div>
  );
};


