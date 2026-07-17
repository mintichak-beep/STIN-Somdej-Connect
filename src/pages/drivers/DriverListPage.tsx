import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useDrivers } from '../../hooks/useDrivers';
import { useNavigate } from 'react-router-dom';
import { DriverTable } from '../../components/drivers/DriverTable';

export function DriverListPage() {
  const { drivers } = useDrivers();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Drivers</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/drivers/create')}>Add Driver</Button>
        </Box>
        <Paper className="p-4">
          <DriverTable drivers={drivers} />
        </Paper>
      </main>
    </div>
  );
}
