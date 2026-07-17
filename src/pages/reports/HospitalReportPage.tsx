import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Paper } from '@mui/material';

export function HospitalReportPage() {
  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Typography variant="h4" mb={3}>Hospital Reports</Typography>
        <Paper className="p-4">
          <Typography>Hospital report content goes here.</Typography>
        </Paper>
      </main>
    </div>
  );
}
