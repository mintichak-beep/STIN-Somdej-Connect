import React, { useState, useEffect } from 'react';
import { systemIssueService } from '../services/systemIssue.service';
import { SystemIssue } from '../types/db';
import { DashboardCard } from '../components/DashboardCard';
import { Bug, Plus } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function SystemIssues() {
  const [issues, setIssues] = useState<SystemIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const data = await systemIssueService.getAll();
        setIssues(data);
        setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">System Issues Tracker</h2>
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          <Plus className="h-4 w-4" /> Report Issue
        </button>
      </div>
      <div className="space-y-4">
        {issues.map(issue => (
            <DashboardCard key={issue.id} title={`${issue.module}: ${issue.description}`} icon={Bug}>
                <p className="text-sm">Priority: {issue.priority}</p>
                <div className="mt-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${issue.status === 'open' ? 'bg-red-100 text-red-800' : issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {issue.status}
                    </span>
                </div>
            </DashboardCard>
        ))}
      </div>
    </div>
  );
}
