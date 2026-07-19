import React from 'react';

export const SchedulePreview = ({ records }) => {
  if (!records || records.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-zinc-900">Schedule Preview</h3>
      <table className="min-w-full divide-y divide-zinc-200 mt-2">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Student ID</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Course</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Hospital</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {records.slice(0, 5).map((r, i) => (
            <tr key={i}>
              <td className="px-4 py-2 text-sm">{r.studentId}</td>
              <td className="px-4 py-2 text-sm">{r.course}</td>
              <td className="px-4 py-2 text-sm">{r.hospital}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
