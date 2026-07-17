import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

interface Props {
  total: number;
  allocated: number;
  roomsUsed: number;
}

export function AllocationSummary({ total, allocated, roomsUsed }: Props) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Total Students', value: total },
        { label: 'Allocated', value: allocated },
        { label: 'Rooms Used', value: roomsUsed },
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
