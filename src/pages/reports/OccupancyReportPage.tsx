import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Card, CardContent, LinearProgress, Chip } from '@mui/material';
import { mockDB } from '../../services/mockData';
import { ReportFilter } from '../../components/reports/ReportFilter';
import { ExportDialog } from '../../components/reports/ExportDialog';
import { PrintDialog } from '../../components/reports/PrintDialog';
import { LoadingSkeleton } from '../../components/reports/LoadingSkeleton';
import { EmptyState } from '../../components/reports/EmptyState';
import { Building, Home, Bed, Percent, FileDown, Printer } from 'lucide-react';

export function OccupancyReportPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ academicYear: '', semester: '', hospital: '', period: '', search: '' });
  const [exportOpen, setExportOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    setBuildings(mockDB.getBuildings());
    setRooms(mockDB.getRooms());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Typography variant="h4" mb={1} className="font-bold">Room Occupancy % Report</Typography>
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const buildingStats = buildings.map(b => {
    const bRooms = rooms.filter(r => r.buildingId === b.id);
    let totalBeds = 0;
    let occupiedBeds = 0;
    bRooms.forEach(r => {
      totalBeds += r.capacity;
      occupiedBeds += r.occupiedCount;
    });

    const rate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    return {
      id: b.id,
      buildingName: b.buildingName,
      buildingType: b.buildingType,
      totalRooms: bRooms.length,
      totalBeds,
      occupiedBeds,
      availableBeds: Math.max(0, totalBeds - occupiedBeds),
      occupancyRate: rate,
      gender: b.gender
    };
  });

  const filteredBuildings = buildingStats.filter(b => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (b.buildingName?.toLowerCase().includes(searchLower) ?? false) || 
             (b.buildingType?.toLowerCase().includes(searchLower) ?? false);
    }
    return true;
  });

  const getExportData = () => {
    return filteredBuildings.map(b => ({
      'Building Name': b.buildingName,
      'Type': b.buildingType,
      'Total Rooms': b.totalRooms,
      'Total Beds': b.totalBeds,
      'Occupied Beds': b.occupiedBeds,
      'Available Beds': b.availableBeds,
      'Occupancy Rate %': `${b.occupancyRate}%`,
      'Resident Gender': b.gender
    }));
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-slate-100">
              Dormitory Occupancy % Report
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Observe housing capacity density, active beds, and remaining rooms inside each building block.
            </Typography>
          </Box>
          <Box className="flex gap-2">
            <Button 
              variant="outlined" 
              startIcon={<Printer size={16} />}
              onClick={() => setPrintOpen(true)}
            >
              Print
            </Button>
            <Button 
              variant="contained" 
              startIcon={<FileDown size={16} />}
              onClick={() => setExportOpen(true)}
            >
              Export
            </Button>
          </Box>
        </Box>

        <ReportFilter onFilterChange={handleFilterChange} showPeriod={false} />

        {/* Dashboard Cards */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <CardContent className="flex items-center gap-4 p-4">
                <Box className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                  <Building size={20} />
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" className="uppercase tracking-wider">Total Buildings</Typography>
                  <Typography variant="h5" className="font-bold">{filteredBuildings.length}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <CardContent className="flex items-center gap-4 p-4">
                <Box className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                  <Home size={20} />
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" className="uppercase tracking-wider">Total Rooms</Typography>
                  <Typography variant="h5" className="font-bold">
                    {filteredBuildings.reduce((acc, cur) => acc + cur.totalRooms, 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <CardContent className="flex items-center gap-4 p-4">
                <Box className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                  <Bed size={20} />
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" className="uppercase tracking-wider">Assigned Beds</Typography>
                  <Typography variant="h5" className="font-bold">
                    {filteredBuildings.reduce((acc, cur) => acc + cur.occupiedBeds, 0) / filteredBuildings.reduce((acc, cur) => acc + cur.totalBeds, 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <CardContent className="flex items-center gap-4 p-4">
                <Box className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                  <Percent size={20} />
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" className="uppercase tracking-wider">Overall Occupancy %</Typography>
                  <Typography variant="h5" className="font-bold">
                    {Math.round(
                      (filteredBuildings.reduce((acc, cur) => acc + cur.occupiedBeds, 0) /
                       Math.max(1, filteredBuildings.reduce((acc, cur) => acc + cur.totalBeds, 0))) * 100
                    )}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper className="p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800" id="occupancy-report-printable">
          <Typography variant="h6" className="font-bold mb-4 text-slate-800">Dormitories Occupancy Analytics</Typography>
          <TableContainer>
            {filteredBuildings.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-bold">Building Name</TableCell>
                    <TableCell className="font-bold">Resident Gender</TableCell>
                    <TableCell className="font-bold" align="center">Total Rooms</TableCell>
                    <TableCell className="font-bold" align="center">Total Beds</TableCell>
                    <TableCell className="font-bold" align="center">Occupied Beds</TableCell>
                    <TableCell className="font-bold" align="center">Available Beds</TableCell>
                    <TableCell className="font-bold" width="25%">Occupancy Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBuildings.map((b: any) => (
                    <TableRow key={b.id} hover>
                      <TableCell className="font-semibold">{b.buildingName} ({b.buildingType})</TableCell>
                      <TableCell>
                        <Chip 
                          label={b.gender} 
                          size="small" 
                          color={b.gender === 'Female' ? 'secondary' : b.gender === 'Male' ? 'primary' : 'default'} 
                        />
                      </TableCell>
                      <TableCell align="center">{b.totalRooms}</TableCell>
                      <TableCell align="center">{b.totalBeds}</TableCell>
                      <TableCell align="center" className="font-semibold">{b.occupiedBeds}</TableCell>
                      <TableCell align="center" className="text-slate-500">{b.availableBeds}</TableCell>
                      <TableCell>
                        <Box className="flex items-center gap-2">
                          <LinearProgress 
                            variant="determinate" 
                            value={b.occupancyRate} 
                            className="flex-1 h-2 rounded"
                            color={b.occupancyRate > 90 ? 'error' : b.occupancyRate > 60 ? 'primary' : 'success'}
                          />
                          <Typography variant="body2" className="font-semibold text-xs min-w-[32px] text-right">
                            {b.occupancyRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Paper>

        <ExportDialog 
          open={exportOpen} 
          onClose={() => setExportOpen(false)} 
          title="Dormitory_Occupancy_Rate_Report" 
          data={getExportData()} 
        />

        <PrintDialog 
          open={printOpen} 
          onClose={() => setPrintOpen(false)} 
          elementId="occupancy-report-printable" 
        />
      </main>
    </div>
  );
}
