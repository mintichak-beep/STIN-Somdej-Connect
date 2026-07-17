import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useRoomAllocation } from '../../hooks/useRoomAllocation';
import { useStudents } from '../../hooks/useStudents';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';

export function RoomAllocationPage() {
  const { students } = useStudents();
  const { performAllocation, loading } = useRoomAllocation();
  const [result, setResult] = useState<any>(null);

  const handleAllocate = async () => {
    const unassigned = students.filter(s => !s.roomId);
    const res = await performAllocation(unassigned);
    setResult(res);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Smart Room Allocation</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAllocate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Run Auto-Allocation'}
          </Button>
        </Box>
        
        <Paper className="p-4">
          <Typography variant="h6">Overview</Typography>
          <Typography>Total Students: {students.length}</Typography>
          <Typography>Unassigned: {students.filter(s => !s.roomId).length}</Typography>
        </Paper>

        {result && (
          <Paper className="p-4 mt-4">
            <Typography variant="h6">Allocation Result</Typography>
            <Typography>Successfully assigned {result.length} students.</Typography>
          </Paper>
        )}
      </main>
    </div>
  );
}
