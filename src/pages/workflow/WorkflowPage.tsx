import React, { useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Sidebar } from '../../components/Sidebar';
import { FileUpload } from '../../components/workflow/FileUpload';
import { WorkflowDashboard } from '../../components/workflow/WorkflowDashboard';
import { WorkflowStepIndicator } from '../../components/workflow/WorkflowStepIndicator';
import { WorkflowState } from '../../types/workflow';

export function WorkflowPage() {
  const [state, setState] = useState<WorkflowState>({
    status: 'idle',
    currentStep: 'upload',
    progress: 0,
    steps: [{ id: '1', label: 'Upload Files', status: 'pending' }, { id: '2', label: 'Import & Allocate', status: 'pending' }],
    warnings: [],
    errors: [],
    summary: { importedStudents: 0, accommodationGroups: 0, roomsUsed: 0, studentsAssigned: 0, transportationTrips: 0 }
  });

  const handleUpload = (file: File) => { /* Handle upload */ };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <Typography variant="h4" mb={3}>Smart Allocation Workflow</Typography>
        <Box display="flex" gap={2}>
          <FileUpload label="Upload Student Excel" onUpload={handleUpload} />
          <FileUpload label="Upload Schedule Excel" onUpload={handleUpload} />
        </Box>
        <Button variant="contained" className="mt-4">Run Workflow</Button>
        <WorkflowStepIndicator steps={state.steps} activeStep={0} />
        <WorkflowDashboard state={state} />
      </main>
    </div>
  );
}
