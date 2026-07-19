import React from 'react';

export function DataManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Data Import/Export</h2>
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border">
        <h3 className="font-bold mb-4">Export Data</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Export to CSV</button>
      </div>
    </div>
  );
}
