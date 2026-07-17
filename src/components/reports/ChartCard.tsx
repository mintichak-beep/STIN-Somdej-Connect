import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #f1f5f9', height: '100%' }}>
      <CardContent className="p-5 flex flex-col h-full justify-between">
        <Box className="mb-4">
          <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="textSecondary" className="mt-0.5 block">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box className="flex-1 flex items-center justify-center">
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
