import React from 'react';
import { Box, Typography, Paper, LinearProgress, Grid } from '@mui/material';
import { WorkflowState } from '../../types/workflow';

interface Props {
  state: WorkflowState;
}

export function WorkflowDashboard({ state }: Props) {
  return (
    <Paper className="p-6 mt-4">
      <Typography variant="h6" mb={2}>Workflow Status: {state.status}</Typography>
      <LinearProgress variant="determinate" value={state.progress} className="mb-4" />
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2">Imported Students</Typography>
          <Typography variant="h4">{state.summary.importedStudents}</Typography>
        </Grid>
        {/* Add more stats... */}
      </Grid>
    </Paper>
  );
}
