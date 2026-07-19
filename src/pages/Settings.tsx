import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">System Settings</h2>
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" /> General Settings
        </h3>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Current Academic Year</label>
                <input type="text" className="border rounded px-2 py-1 w-full" defaultValue="2569" />
            </div>
            <div>
                <label className="block text-sm font-medium">Current Semester</label>
                <input type="text" className="border rounded px-2 py-1 w-full" defaultValue="1" />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Save Settings</button>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold mb-2">System Information</h3>
        <p className="text-sm text-gray-600">Application Version: 1.0.0</p>
        <p className="text-sm text-gray-600">Last Update: 2026-07-18</p>
      </div>
    </div>
  );
}
