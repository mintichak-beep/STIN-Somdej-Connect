import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useSchedules } from '../../hooks/useSchedules';
import { useNavigate } from 'react-router-dom';
import { ScheduleTable } from '../../components/transportation/ScheduleTable';

export function TransportationSchedulePage() {
  const { schedules } = useSchedules();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Transportation Schedules</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/transportation/create')}>Add Schedule</Button>
        </Box>
        <Paper className="p-4">
          <ScheduleTable schedules={schedules} />
        </Paper>
      </main>
    </div>
  );
}
