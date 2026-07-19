import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Filter, AlertCircle } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { auditService } from '../services/audit.service';
import { AuditLog } from '../types/db';

export function SystemActivityLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await auditService.getAll();
        setLogs(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error("Failed to load audit logs:", error);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => filterType === 'all' || log.targetType === filterType);

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'UPDATE': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'DELETE': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'IMPORT': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">System Activity Log</h1>
          <p className="text-gray-500 dark:text-gray-400">Review all important system changes and administrative actions.</p>
        </div>
      </div>

      <DashboardCard id="audit-filters" title="Filter Activity" icon={Filter}>
        <div className="flex items-center gap-4">
          <select
            className="rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Targets</option>
            <option value="Student">Students</option>
            <option value="Hospital">Hospitals</option>
            <option value="Course">Courses</option>
            <option value="PracticeGroup">Practice Groups</option>
          </select>
        </div>
      </DashboardCard>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 font-mono text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium dark:text-white">
                    {log.targetType}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {log.userId}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-8 w-8 text-gray-300" />
                      <p>No activity logs found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
