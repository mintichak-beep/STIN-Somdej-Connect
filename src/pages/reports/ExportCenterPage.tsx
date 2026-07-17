import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Button, Paper, Grid, Card, CardContent, CardActions, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { mockDB } from '../../services/mockData';
import { reportService } from '../../services/report.service';
import { useExportReport } from '../../hooks/useExportReport';
import { FileSpreadsheet, FileText, Download, CheckCircle, HelpCircle } from 'lucide-react';

export function ExportCenterPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const { exportExcel, exportPDF, exporting } = useExportReport();

  useEffect(() => {
    setStudents(mockDB.getStudents());
    setRooms(mockDB.getRooms());
    setTrips(mockDB.getTransportSchedules());
  }, []);

  const handleExportAllStudents = () => {
    const formatted = students.map(s => ({
      'Student ID': s.studentNumber,
      'Name': s.studentName,
      'Class Section': s.section,
      'Academic Year': s.academicYear,
      'Hospital Placement': s.hospital,
      'Rotation': s.accommodationPeriod || s.DRSchedule || 'None',
      'Status': s.status
    }));
    exportExcel('Full_Student_Roster', formatted);
  };

  const handleExportAllRooms = () => {
    const formatted = rooms.map(r => ({
      'Room ID': r.id,
      'Room Number': r.roomNumber,
      'Designated Gender': r.gender,
      'Total Capacity': r.capacity,
      'Occupied Count': r.occupiedCount,
      'Status': r.status
    }));
    exportExcel('Full_Room_Inventory', formatted);
  };

  const handleExportAllTrips = () => {
    const formatted = trips.map(t => ({
      'Trip ID': t.id,
      'Route Name': t.route,
      'Departure': t.departureTime,
      'Status': t.status
    }));
    exportExcel('Full_Transportation_Schedules', formatted);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-slate-100">
              Central Export Center
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Produce enterprise XLS files, download complete student cohorts, or fetch backup archives.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" className="font-bold mb-3 text-slate-800 dark:text-slate-100">
              Available Corporate Datasets
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                  <CardContent className="p-5">
                    <Box className="flex items-center gap-2 mb-3">
                      <FileSpreadsheet className="text-emerald-600" size={24} />
                      <Typography variant="subtitle1" className="font-bold">Student Rotation Directory</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" className="mb-4">
                      Download spreadsheet of all registered students, current clinical hospital rotations, and gender demographics.
                    </Typography>
                    <Divider />
                    <List dense>
                      <ListItem disablePadding className="py-1">
                        <ListItemIcon className="min-w-[28px]"><CheckCircle size={14} className="text-emerald-600" /></ListItemIcon>
                        <ListItemText primary="Includes section, rot group, status" />
                      </ListItem>
                      <ListItem disablePadding className="py-1">
                        <ListItemIcon className="min-w-[28px]"><CheckCircle size={14} className="text-emerald-600" /></ListItemIcon>
                        <ListItemText primary="Supports Thai and English names" />
                      </ListItem>
                    </List>
                  </CardContent>
                  <CardActions className="p-4 pt-0">
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="success" 
                      onClick={handleExportAllStudents}
                      startIcon={<Download size={16} />}
                      disabled={exporting}
                    >
                      Export Excel
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                  <CardContent className="p-5">
                    <Box className="flex items-center gap-2 mb-3">
                      <FileSpreadsheet className="text-emerald-600" size={24} />
                      <Typography variant="subtitle1" className="font-bold">Dorm Room Inventories</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" className="mb-4">
                      Get full room sheets with assigned occupants list, specific buildings, active maintenance notices, and bed capacities.
                    </Typography>
                    <Divider />
                    <List dense>
                      <ListItem disablePadding className="py-1">
                        <ListItemIcon className="min-w-[28px]"><CheckCircle size={14} className="text-emerald-600" /></ListItemIcon>
                        <ListItemText primary="Includes floor structures, capacities" />
                      </ListItem>
                      <ListItem disablePadding className="py-1">
                        <ListItemIcon className="min-w-[28px]"><CheckCircle size={14} className="text-emerald-600" /></ListItemIcon>
                        <ListItemText primary="Tracks available vacant beds" />
                      </ListItem>
                    </List>
                  </CardContent>
                  <CardActions className="p-4 pt-0">
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="success" 
                      onClick={handleExportAllRooms}
                      startIcon={<Download size={16} />}
                      disabled={exporting}
                    >
                      Export Excel
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                  <CardContent className="p-5">
                    <Box className="flex items-center gap-2 mb-3">
                      <FileSpreadsheet className="text-emerald-600" size={24} />
                      <Typography variant="subtitle1" className="font-bold">Transit Logs & Schedules</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" className="mb-4">
                      Download transportation schedule listings, including routes, plate numbers, driver directories, and departures.
                    </Typography>
                    <Divider />
                    <List dense>
                      <ListItem disablePadding className="py-1">
                        <ListItemIcon className="min-w-[28px]"><CheckCircle size={14} className="text-emerald-600" /></ListItemIcon>
                        <ListItemText primary="Comprehensive driver listings" />
                      </ListItem>
                    </List>
                  </CardContent>
                  <CardActions className="p-4 pt-0">
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="success" 
                      onClick={handleExportAllTrips}
                      startIcon={<Download size={16} />}
                      disabled={exporting}
                    >
                      Export Excel
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" className="font-bold mb-3 text-slate-800 dark:text-slate-100">
              Export Instructions
            </Typography>
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'slate.50/50' }}>
              <CardContent className="p-5 flex flex-col gap-3">
                <Box className="flex items-start gap-2">
                  <HelpCircle className="text-slate-400 mt-1" size={20} />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-slate-700">What format is supported?</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Standard XLS Spreadsheets are fully compatible with Microsoft Excel and Google Sheets. Special fonts are styled beautifully.
                    </Typography>
                  </Box>
                </Box>
                <Box className="flex items-start gap-2">
                  <HelpCircle className="text-slate-400 mt-1" size={20} />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-slate-700">Are PDF exports custom-built?</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Yes! PDF generation matches the corporate theme with header summaries, generated date stamps, and page numbers.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </main>
    </div>
  );
}
