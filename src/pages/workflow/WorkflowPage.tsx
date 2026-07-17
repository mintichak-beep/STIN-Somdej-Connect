import React, { useState } from 'react';
import { Box, Typography, Button, Container, Snackbar, Alert } from '@mui/material';
import { Sidebar } from '../../components/Sidebar';
import { FileUpload } from '../../components/workflow/FileUpload';
import { WorkflowDashboard } from '../../components/workflow/WorkflowDashboard';
import { WorkflowStepIndicator } from '../../components/workflow/WorkflowStepIndicator';
import { WorkflowState } from '../../types/workflow';
import { workflowService } from '../../services/workflow.service';
import * as XLSX from 'xlsx';

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

  const [files, setFiles] = useState<{ studentFile: File | null; scheduleFile: File | null }>({ studentFile: null, scheduleFile: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleUpload = (file: File, type: 'student' | 'schedule') => {
    setFiles(prev => ({ ...prev, [type === 'student' ? 'studentFile' : 'scheduleFile']: file }));
    setSnackbar({ open: true, message: `${file.name} uploaded`, severity: 'success' });
  };

  const runWorkflow = async () => {
    if (!files.studentFile || !files.scheduleFile) {
        setSnackbar({ open: true, message: 'Please upload both files', severity: 'error' });
        return;
    }
    
    setState(prev => ({ ...prev, status: 'running' }));
    
    // Parse files
    const parseFile = async (file: File) => {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    };
    
    try {
        const studentData = await parseFile(files.studentFile);
        const scheduleData = await parseFile(files.scheduleFile);
        
        await workflowService.runWorkflow(studentData, scheduleData);
        
        setState(prev => ({ ...prev, status: 'completed', progress: 100 }));
        setSnackbar({ open: true, message: 'Workflow completed successfully', severity: 'success' });
    } catch (e) {
        setState(prev => ({ ...prev, status: 'failed' }));
        setSnackbar({ open: true, message: 'Workflow failed', severity: 'error' });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <Typography variant="h4" mb={3}>Smart Allocation Workflow</Typography>
        <Box display="flex" gap={2}>
          <FileUpload label="Upload Student Excel" onUpload={(f) => handleUpload(f, 'student')} />
          <FileUpload label="Upload Schedule Excel" onUpload={(f) => handleUpload(f, 'schedule')} />
        </Box>
        <Button variant="contained" className="mt-4" onClick={runWorkflow} disabled={state.status === 'running'}>Run Workflow</Button>
        <WorkflowStepIndicator steps={state.steps} activeStep={state.status === 'completed' ? 2 : 1} />
        <WorkflowDashboard state={state} />
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </main>
    </div>
  );
}
