import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Button, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Grid } from '@mui/material';
import { useAccommodationReport } from '../../hooks/useAccommodationReport';
import { ReportFilter } from '../../components/reports/ReportFilter';
import { ExportDialog } from '../../components/reports/ExportDialog';
import { PrintDialog } from '../../components/reports/PrintDialog';
import { LoadingSkeleton } from '../../components/reports/LoadingSkeleton';
import { EmptyState } from '../../components/reports/EmptyState';
import { FileDown, Printer, Home, UserCheck, AlertCircle } from 'lucide-react';

export function AccommodationReportPage() {
  const { data, loading } = useAccommodationReport();
  const [tabIndex, setTabIndex] = useState(0);
  const [filters, setFilters] = useState({ academicYear: '', semester: '', hospital: '', period: '', search: '' });
  const [exportOpen, setExportOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  if (loading || !data) {
    return (
      <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Typography variant="h4" mb={1} className="font-bold">Accommodation Report</Typography>
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  const { studentsByRoom, waitingList, roomSummary } = data;

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Helper filters
  const applyFilters = (item: any) => {
    if (filters.academicYear && item.academicYear !== filters.academicYear) return false;
    if (filters.semester && item.semester !== filters.semester) return false;
    if (filters.hospital && item.hospital !== filters.hospital) return false;
    if (filters.period && item.accommodationPeriod !== filters.period) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchName = item.studentName?.toLowerCase().includes(searchLower);
      const matchNo = item.studentNumber?.toLowerCase().includes(searchLower);
      const matchRoom = item.roomNumber?.toLowerCase().includes(searchLower);
      if (!matchName && !matchNo && !matchRoom) return false;
    }
    return true;
  };

  const filteredStudents = studentsByRoom.filter(applyFilters);
  const filteredWaiting = waitingList.filter(s => {
    if (filters.academicYear && s.academicYear !== filters.academicYear) return false;
    if (filters.hospital && s.hospital !== filters.hospital) return false;
    if (filters.period && s.accommodationPeriod !== filters.period) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return s.studentName.toLowerCase().includes(searchLower) || s.studentNumber.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const filteredRooms = roomSummary.filter(r => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return r.roomNumber.toLowerCase().includes(searchLower) || r.buildingName.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Export prepared data
  const getExportData = () => {
    if (tabIndex === 0) {
      return filteredRooms.map(r => ({
        'Room Number': r.roomNumber,
        'Building': r.buildingName,
        'Capacity': r.capacity,
        'Occupied': r.occupied,
        'Available': r.available,
        'Status': r.status,
        'Students': r.students
      }));
    } else if (tabIndex === 1) {
      return filteredStudents.map(s => ({
        'Student Number': s.studentNumber,
        'Student Name': s.studentName,
        'Hospital': s.hospital,
        'Period': s.accommodationPeriod,
        'Room': s.roomNumber,
        'Building': s.buildingName,
        'Bed': s.bedNumber
      }));
    } else {
      return filteredWaiting.map(w => ({
        'Student Number': w.studentNumber,
        'Student Name': w.studentName,
        'Hospital': w.hospital,
        'Period': w.accommodationPeriod,
        'Status': w.status
      }));
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-slate-100">
              Accommodation & Dorms Report
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Review room capacities, room rosters, and students awaiting room allocations.
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

        <ReportFilter onFilterChange={handleFilterChange} />

        <Paper className="mb-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
          <Tabs 
            value={tabIndex} 
            onChange={(e, val) => setTabIndex(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            className="border-b border-slate-100 dark:border-zinc-800"
          >
            <Tab icon={<Home size={18} className="mr-2" />} iconPosition="start" label="Rooms Occupancy Summary" />
            <Tab icon={<UserCheck size={18} className="mr-2" />} iconPosition="start" label="Student Placements List" />
            <Tab icon={<AlertCircle size={18} className="mr-2" />} iconPosition="start" label="Dorm Waiting List" />
          </Tabs>

          <Box className="p-4" id="printable-report-section">
            {tabIndex === 0 && (
              <TableContainer>
                {filteredRooms.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-bold">Room</TableCell>
                        <TableCell className="font-bold">Building</TableCell>
                        <TableCell className="font-bold" align="center">Capacity</TableCell>
                        <TableCell className="font-bold" align="center">Occupied</TableCell>
                        <TableCell className="font-bold" align="center">Available Beds</TableCell>
                        <TableCell className="font-bold">Assigned Students</TableCell>
                        <TableCell className="font-bold" align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRooms.map((room: any) => (
                        <TableRow key={room.id} hover>
                          <TableCell className="font-semibold">{room.roomNumber}</TableCell>
                          <TableCell>{room.buildingName}</TableCell>
                          <TableCell align="center">{room.capacity}</TableCell>
                          <TableCell align="center">{room.occupied}</TableCell>
                          <TableCell align="center">{room.available}</TableCell>
                          <TableCell className="text-slate-500 max-w-[240px] truncate">{room.students || '-'}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={room.occupied === room.capacity ? 'Full' : room.occupied > 0 ? 'Partial' : 'Empty'} 
                              size="small"
                              color={room.occupied === room.capacity ? 'error' : room.occupied > 0 ? 'primary' : 'default'}
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
              <TableContainer>
                {filteredStudents.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-bold">Student Name</TableCell>
                        <TableCell className="font-bold">ID Number</TableCell>
                        <TableCell className="font-bold">Hospital Placement</TableCell>
                        <TableCell className="font-bold">Rotation Period</TableCell>
                        <TableCell className="font-bold">Building</TableCell>
                        <TableCell className="font-bold" align="center">Room</TableCell>
                        <TableCell className="font-bold" align="center">Bed</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStudents.map((s: any) => (
                        <TableRow key={s.studentId} hover>
                          <TableCell className="font-semibold">{s.studentName}</TableCell>
                          <TableCell>{s.studentNumber}</TableCell>
                          <TableCell>{s.hospital}</TableCell>
                          <TableCell>{s.accommodationPeriod}</TableCell>
                          <TableCell>{s.buildingName}</TableCell>
                          <TableCell align="center">{s.roomNumber}</TableCell>
                          <TableCell align="center">{s.bedNumber}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            )}

            {tabIndex === 2 && (
              <TableContainer>
                {filteredWaiting.length === 0 ? (
                  <EmptyState title="Waiting List Empty" description="All eligible students have been assigned dormitory rooms." />
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-bold">Student Name</TableCell>
                        <TableCell className="font-bold">ID Number</TableCell>
                        <TableCell className="font-bold">Hospital Placement</TableCell>
                        <TableCell className="font-bold">Rotation Period</TableCell>
                        <TableCell className="font-bold" align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredWaiting.map((s: any) => (
                        <TableRow key={s.id} hover>
                          <TableCell className="font-semibold">{s.studentName}</TableCell>
                          <TableCell>{s.studentNumber}</TableCell>
                          <TableCell>{s.hospital}</TableCell>
                          <TableCell>{s.accommodationPeriod || 'DRส/ANCส'}</TableCell>
                          <TableCell align="center">
                            <Chip label="Awaiting Room" color="warning" size="small" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            )}
          </Box>
        </Paper>

        <ExportDialog 
          open={exportOpen} 
          onClose={() => setExportOpen(false)} 
          title={tabIndex === 0 ? 'Rooms_Occupancy_Summary' : tabIndex === 1 ? 'Student_Placements_List' : 'Accommodation_Waiting_List'} 
          data={getExportData()} 
        />

        <PrintDialog 
          open={printOpen} 
          onClose={() => setPrintOpen(false)} 
          elementId="printable-report-section" 
        />
      </main>
    </div>
  );
}
