import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Paper } from '@mui/material';
import { RoomAllocationTable } from '../../components/room-allocation/RoomAllocationTable';

export function AllocationResultPage({ assignments = [] }: { assignments?: any[] }) {
  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Typography variant="h4" mb={3}>Allocation Result</Typography>
        <Paper className="p-4">
          <RoomAllocationTable data={assignments} />
        </Paper>
      </main>
    </div>
  );
}
