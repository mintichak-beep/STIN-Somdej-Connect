import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Grid } from '@mui/material';
import { mockDB } from '../../services/mockData';

interface ReportFilterProps {
  onFilterChange: (filters: {
    academicYear: string;
    semester: string;
    hospital: string;
    period: string;
    search: string;
  }) => void;
  showPeriod?: boolean;
}

export function ReportFilter({ onFilterChange, showPeriod = true }: ReportFilterProps) {
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [hospital, setHospital] = useState('');
  const [period, setPeriod] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setAcademicYears(mockDB.getAcademicYears());
    setHospitals(mockDB.getHospitals());
  }, []);

  useEffect(() => {
    onFilterChange({ academicYear, semester, hospital, period, search });
  }, [academicYear, semester, hospital, period, search]);

  return (
    <Box className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 mb-4">
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            label="Academic Year"
            size="small"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <MenuItem value="">All Years</MenuItem>
            {academicYears.map((year) => (
              <MenuItem key={year.id} value={year.year}>
                {year.year}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            label="Semester"
            size="small"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <MenuItem value="">All Semesters</MenuItem>
            <MenuItem value="Semester 1">Semester 1</MenuItem>
            <MenuItem value="Semester 2">Semester 2</MenuItem>
            <MenuItem value="Summer">Summer</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            label="Hospital"
            size="small"
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
          >
            <MenuItem value="">All Hospitals</MenuItem>
            {hospitals.map((h) => (
              <MenuItem key={h.id} value={h.name}>
                {h.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {showPeriod && (
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              fullWidth
              label="Rotation Period"
              size="small"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="">All Periods</MenuItem>
              <MenuItem value="ANCส">ANCส (Prenatal)</MenuItem>
              <MenuItem value="DRส">DRส (Delivery Room)</MenuItem>
            </TextField>
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={showPeriod ? 2.4 : 4.8}>
          <TextField
            fullWidth
            label="Search Student / Room..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
