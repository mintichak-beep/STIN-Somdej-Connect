import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export function StatisticCard({ label, value }: { label: string, value: number }) {
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary">{label}</Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
}
