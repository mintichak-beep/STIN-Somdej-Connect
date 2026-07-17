import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, MenuItem, TextField, Grid } from '@mui/material';
import { reportService } from '../../services/report.service';
import { ReportFilter } from '../../components/reports/ReportFilter';
import { ExportDialog } from '../../components/reports/ExportDialog';
import { PrintDialog } from '../../components/reports/PrintDialog';
import { LoadingSkeleton } from '../../components/reports/LoadingSkeleton';
import { EmptyState } from '../../components/reports/EmptyState';
import { FileDown, Printer, GraduationCap } from 'lucide-react';

export function StudentReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ academicYear: '', semester: '', hospital: '', period: '', search: '' });
  const [sectionFilter, setSectionFilter] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    reportService.getStudentReport().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Typography variant="h4" mb={1} className="font-bold">Student Directory Report</Typography>
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  const { studentSummary } = data;

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const applyFilters = (student: any) => {
    if (filters.academicYear && student.academicYear !== filters.academicYear) return false;
    if (filters.hospital && student.hospital !== filters.hospital) return false;
    if (filters.period && student.accommodationPeriod !== filters.period) return false;
    if (sectionFilter && student.section !== sectionFilter) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchName = student.studentName?.toLowerCase().includes(searchLower) ?? false;
      const matchNo = student.studentNumber?.toLowerCase().includes(searchLower) ?? false;
      const matchRoom = student.roomNumber?.toLowerCase().includes(searchLower) ?? false;
      if (!matchName && !matchNo && !matchRoom) return false;
    }
    return true;
  };

  const filteredStudents = studentSummary.filter(applyFilters);

  // Extract unique sections
  const uniqueSections: string[] = Array.from(new Set(studentSummary.map((s: any) => s.section).filter(Boolean)));

  const getExportData = () => {
    return filteredStudents.map(s => ({
      'Student ID': s.studentNumber,
      'Student Name': s.studentName,
      'Section': s.section,
      'Academic Year': s.academicYear,
      'Hospital Placement': s.hospital,
      'Rotation Group': s.rotationGroup,
      'Accommodation Period': s.accommodationPeriod,
      'Room Number': s.roomNumber,
      'Status': s.status
    }));
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-slate-100">
              Student Directory & Rotations Report
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Browse full student placement profiles, housing details, and class section indexes.
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

        {/* Filters Panel with extra Section filter */}
        <Grid container spacing={2} className="mb-4">
          <Grid item xs={12} md={10}>
            <ReportFilter onFilterChange={handleFilterChange} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Box className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 h-[100px] flex items-center justify-center">
              <TextField
                select
                fullWidth
                label="Class Section"
                size="small"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <MenuItem value="">All Sections</MenuItem>
                {uniqueSections.map(sec => (
                  <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Grid>
        </Grid>

        <Paper className="p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800" id="student-report-printable">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" className="font-bold text-slate-800">Student Directory List</Typography>
            <Chip 
              icon={<GraduationCap size={16} />} 
              label={`${filteredStudents.length} Records Found`} 
              color="primary" 
              variant="outlined" 
            />
          </Box>

          <TableContainer>
            {filteredStudents.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-bold">Student Name</TableCell>
                    <TableCell className="font-bold">Student ID</TableCell>
                    <TableCell className="font-bold" align="center">Section</TableCell>
                    <TableCell className="font-bold">Placement Hospital</TableCell>
                    <TableCell className="font-bold">Rotation Group</TableCell>
                    <TableCell className="font-bold">Rotation Period</TableCell>
                    <TableCell className="font-bold" align="center">Room Number</TableCell>
                    <TableCell className="font-bold" align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((s: any) => (
                    <TableRow key={s.id} hover>
                      <TableCell className="font-semibold">{s.studentName}</TableCell>
                      <TableCell>{s.studentNumber}</TableCell>
                      <TableCell align="center">{s.section || '-'}</TableCell>
                      <TableCell>{s.hospital}</TableCell>
                      <TableCell>{s.rotationGroup || '-'}</TableCell>
                      <TableCell>{s.accommodationPeriod}</TableCell>
                      <TableCell align="center">
                        {s.roomNumber === 'Unassigned' ? (
                          <Chip label="Unassigned" size="small" variant="outlined" />
                        ) : (
                          <span className="font-semibold text-primary">{s.roomNumber}</span>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={s.status.toUpperCase()} 
                          size="small"
                          color={s.status === 'active' ? 'success' : 'default'}
                        />
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
          title="Students_Placement_Directory_Report" 
          data={getExportData()} 
        />

        <PrintDialog 
          open={printOpen} 
          onClose={() => setPrintOpen(false)} 
          elementId="student-report-printable" 
        />
      </main>
    </div>
  );
}
