import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Button, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Accordion, AccordionSummary, AccordionDetails, Grid, Card, CardContent } from '@mui/material';
import { useTransportationReport } from '../../hooks/useTransportationReport';
import { ReportFilter } from '../../components/reports/ReportFilter';
import { ExportDialog } from '../../components/reports/ExportDialog';
import { PrintDialog } from '../../components/reports/PrintDialog';
import { LoadingSkeleton } from '../../components/reports/LoadingSkeleton';
import { EmptyState } from '../../components/reports/EmptyState';
import { Bus, MapPin, ChevronDown, FileDown, Printer, CalendarClock, UserCheck } from 'lucide-react';

export function TransportationReportPage() {
  const { data, loading } = useTransportationReport();
  const [tabIndex, setTabIndex] = useState(0);
  const [filters, setFilters] = useState({ academicYear: '', semester: '', hospital: '', period: '', search: '' });
  const [exportOpen, setExportOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  if (loading || !data) {
    return (
      <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Typography variant="h4" mb={1} className="font-bold">Transportation Report</Typography>
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  const { scheduleSummary } = data;

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const applyFilters = (trip: any) => {
    if (filters.hospital && !trip.route.toLowerCase().includes(filters.hospital.toLowerCase())) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchRoute = trip.route.toLowerCase().includes(searchLower);
      const matchDriver = trip.driverName.toLowerCase().includes(searchLower);
      const matchPlate = trip.vehiclePlate.toLowerCase().includes(searchLower);
      const matchStudent = trip.students.some((st: any) => st.studentName.toLowerCase().includes(searchLower));
      if (!matchRoute && !matchDriver && !matchPlate && !matchStudent) return false;
    }
    return true;
  };

  const filteredTrips = scheduleSummary.filter(applyFilters);

  // Export prepared data
  const getExportData = () => {
    if (tabIndex === 0) {
      return filteredTrips.map(t => ({
        'Route': t.route,
        'Departure': t.departureTime,
        'Vehicle Plate': t.vehiclePlate,
        'Vehicle Model': t.vehicleModel,
        'Driver Name': t.driverName,
        'Driver Phone': t.driverPhone,
        'Capacity': t.capacity,
        'Passengers': t.occupied,
        'Available Seats': t.available,
        'Status': t.status
      }));
    } else {
      const manifestRows: any[] = [];
      filteredTrips.forEach((t: any) => {
        t.students.forEach((st: any) => {
          manifestRows.push({
            'Route': t.route,
            'Departure': t.departureTime,
            'Vehicle': `${t.vehicleModel} (${t.vehiclePlate})`,
            'Driver': t.driverName,
            'Student Name': st.studentName,
            'Student Number': st.studentNumber,
            'Pickup': st.pickup,
            'Dropoff': st.dropoff
          });
        });
      });
      return manifestRows;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-slate-100">
              Transportation Logistics Report
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track vehicle manifests, daily travel itineraries, and transit occupancy rates.
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

        <Paper className="mb-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
          <Tabs 
            value={tabIndex} 
            onChange={(e, val) => setTabIndex(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            className="border-b border-slate-100 dark:border-zinc-800"
          >
            <Tab icon={<Bus size={18} className="mr-2" />} iconPosition="start" label="Transportation Schedules" />
            <Tab icon={<UserCheck size={18} className="mr-2" />} iconPosition="start" label="Passenger Manifests" />
          </Tabs>

          <Box className="p-4" id="transport-report-printable">
            {tabIndex === 0 && (
              <TableContainer>
                {filteredTrips.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-bold">Route</TableCell>
                        <TableCell className="font-bold">Departure Time</TableCell>
                        <TableCell className="font-bold">Vehicle</TableCell>
                        <TableCell className="font-bold">Driver</TableCell>
                        <TableCell className="font-bold" align="center">Capacity</TableCell>
                        <TableCell className="font-bold" align="center">Assigned Passengers</TableCell>
                        <TableCell className="font-bold" align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTrips.map((trip: any) => (
                        <TableRow key={trip.id} hover>
                          <TableCell className="font-semibold">{trip.route}</TableCell>
                          <TableCell>{trip.departureTime}</TableCell>
                          <TableCell>{trip.vehiclePlate} ({trip.vehicleModel})</TableCell>
                          <TableCell>{trip.driverName} ({trip.driverPhone})</TableCell>
                          <TableCell align="center">{trip.capacity}</TableCell>
                          <TableCell align="center">{trip.occupied}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={trip.status.toUpperCase()} 
                              size="small"
                              color={trip.status === 'completed' ? 'success' : 'primary'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            )}

            {tabIndex === 1 && (
              <Box className="flex flex-col gap-3">
                {filteredTrips.length === 0 ? (
                  <EmptyState />
                ) : (
                  filteredTrips.map((trip: any) => (
                    <Accordion key={trip.id} defaultExpanded sx={{ borderRadius: 2, mb: 1, border: '1px solid #f1f5f9' }}>
                      <AccordionSummary expandIcon={<ChevronDown />}>
                        <Box className="flex flex-wrap items-center justify-between w-full pr-4 gap-2">
                          <Box className="flex items-center gap-2">
                            <Bus className="text-primary" size={18} />
                            <Typography className="font-bold text-slate-800">{trip.route}</Typography>
                          </Box>
                          <Box className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Departure: <strong>{trip.departureTime}</strong></span>
                            <span>Driver: <strong>{trip.driverName}</strong></span>
                            <Chip label={`${trip.occupied}/${trip.capacity} Seats`} size="small" color="primary" />
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails className="bg-slate-50 dark:bg-zinc-900/30 p-0 border-t border-slate-100 dark:border-zinc-800">
                        {trip.students.length === 0 ? (
                          <Box className="p-4 text-center text-slate-400 text-sm">No students assigned to this manifest</Box>
                        ) : (
                          <Table size="small">
                            <TableHead className="bg-slate-100/50 dark:bg-zinc-800/50">
                              <TableRow>
                                <TableCell className="font-semibold text-xs">Student Name</TableCell>
                                <TableCell className="font-semibold text-xs">ID Number</TableCell>
                                <TableCell className="font-semibold text-xs">Placement</TableCell>
                                <TableCell className="font-semibold text-xs">Pickup Location</TableCell>
                                <TableCell className="font-semibold text-xs">Dropoff Location</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {trip.students.map((st: any, i: number) => (
                                <TableRow key={i} hover>
                                  <TableCell className="text-xs font-medium">{st.studentName}</TableCell>
                                  <TableCell className="text-xs">{st.studentNumber}</TableCell>
                                  <TableCell className="text-xs">{st.hospital}</TableCell>
                                  <TableCell className="text-xs">{st.pickup}</TableCell>
                                  <TableCell className="text-xs">{st.dropoff}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>
            )}
          </Box>
        </Paper>

        <ExportDialog 
          open={exportOpen} 
          onClose={() => setExportOpen(false)} 
          title={tabIndex === 0 ? 'Transportation_Schedules_Report' : 'Passenger_Manifests_List'} 
          data={getExportData()} 
        />

        <PrintDialog 
          open={printOpen} 
          onClose={() => setPrintOpen(false)} 
          elementId="transport-report-printable" 
        />
      </main>
    </div>
  );
}
