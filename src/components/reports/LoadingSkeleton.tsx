import React from 'react';
import { Box, Grid, Skeleton, Card, CardContent } from '@mui/material';

export function LoadingSkeleton() {
  return (
    <Box className="w-full">
      {/* Filters skeleton */}
      <Card sx={{ borderRadius: 3, mb: 4 }} variant="outlined">
        <CardContent className="p-4">
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5].map((idx) => (
              <Grid item xs={12} sm={6} md={2.4} key={idx}>
                <Skeleton variant="rounded" height={40} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Cards skeleton */}
      <Grid container spacing={3} className="mb-6">
        {[1, 2, 3, 4].map((idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ borderRadius: 3 }} variant="outlined">
              <CardContent className="p-5 flex items-center justify-between">
                <Box className="w-2/3">
                  <Skeleton variant="text" width="60%" height={20} className="mb-2" />
                  <Skeleton variant="text" width="40%" height={32} />
                </Box>
                <Skeleton variant="circular" width={48} height={48} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts skeleton */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, minHeight: 320 }} variant="outlined">
            <CardContent className="p-5">
              <Skeleton variant="text" width="30%" height={24} className="mb-4" />
              <Skeleton variant="rectangular" height={220} className="rounded" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 320 }} variant="outlined">
            <CardContent className="p-5 flex flex-col items-center justify-center">
              <Skeleton variant="circular" width={160} height={160} className="mb-4" />
              <Skeleton variant="text" width="50%" height={20} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
