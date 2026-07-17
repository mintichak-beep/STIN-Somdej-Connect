import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ 
  title = 'No Records Found', 
  description = 'Try adjusting your filters or search term to discover placements or allocations.' 
}: EmptyStateProps) {
  return (
    <Card sx={{ borderRadius: 3, py: 6, textAlign: 'center', boxShadow: 'none', border: '1px dashed #e2e8f0' }}>
      <CardContent className="flex flex-col items-center justify-center">
        <Box className="p-4 bg-slate-50 dark:bg-zinc-800/50 text-slate-400 rounded-full mb-4">
          <Inbox size={48} strokeWidth={1.5} />
        </Box>
        <Typography variant="h6" className="font-bold text-slate-700 dark:text-slate-200 mb-1">
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" className="max-w-md mx-auto">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
