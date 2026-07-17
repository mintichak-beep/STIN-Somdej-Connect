import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  color?: string;
}

export function SummaryCard({ title, value, icon: Icon, description, color = '#3b82f6' }: SummaryCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #f1f5f9' }}>
      <CardContent className="p-5 flex items-center gap-4">
        <Box 
          className="p-3 rounded-xl flex items-center justify-center text-white" 
          style={{ backgroundColor: color }}
        >
          <Icon size={20} />
        </Box>
        <Box>
          <Typography variant="caption" className="uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">
            {title}
          </Typography>
          <Typography variant="h5" className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {value}
          </Typography>
          {description && (
            <Typography variant="caption" color="textSecondary" className="mt-1 block">
              {description}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
