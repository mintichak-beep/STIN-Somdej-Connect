import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useVehicles } from '../../hooks/useVehicles';
import { useNavigate } from 'react-router-dom';
import { VehicleTable } from '../../components/vehicles/VehicleTable';

export function VehicleListPage() {
  const { vehicles } = useVehicles();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Vehicles</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/vehicles/create')}>Add Vehicle</Button>
        </Box>
        <Paper className="p-4">
          <VehicleTable vehicles={vehicles} />
        </Paper>
      </main>
    </div>
  );
}
