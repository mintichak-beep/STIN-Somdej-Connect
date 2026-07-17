import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { Student } from '../../types/student';

interface Props {
  students: Student[];
}

export function StudentStatisticsCard({ students }: Props) {
  const total = students.length;
  const assigned = students.filter(s => s.roomId).length;
  const waiting = total - assigned;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Total Students', value: total },
        { label: 'Assigned Room', value: assigned },
        { label: 'Waiting Assignment', value: waiting },
      ].map(stat => (
        <Grid item xs={4} key={stat.label}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">{stat.label}</Typography>
              <Typography variant="h4">{stat.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
