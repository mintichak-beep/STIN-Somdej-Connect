import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface AccommodationTimelineProps {
  data: {
    period: string;
    studentCount: number;
  }[];
}

export function AccommodationTimeline({ data }: AccommodationTimelineProps) {
  const total = data.reduce((acc, curr) => acc + curr.studentCount, 0) || 1;

  return (
    <Box className="flex flex-col gap-4 py-2">
      {data.map((item, idx) => {
        const percent = Math.round((item.studentCount / total) * 100);
        return (
          <Box key={idx} className="flex flex-col gap-1">
            <Box className="flex justify-between items-center text-sm">
              <Typography variant="body2" className="font-semibold text-slate-700 dark:text-slate-300">
                {item.period === 'ANCส' ? 'ANCส (Prenatal)' : item.period === 'DRส' ? 'DRส (Delivery Room)' : item.period}
              </Typography>
              <Typography variant="body2" className="text-slate-500 font-medium">
                {item.studentCount} Students ({percent}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={percent} 
              className="h-2 rounded bg-slate-100 dark:bg-zinc-800"
              color={item.period === 'ANCส' ? 'primary' : 'secondary'}
            />
          </Box>
        );
      })}
    </Box>
  );
}
