import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { TransportSchedule } from '../../types/transportation';

export function ScheduleTable({ schedules }: { schedules: TransportSchedule[] }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Departure</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.date}</TableCell>
              <TableCell>{s.departureTime}</TableCell>
              <TableCell>{s.destination}</TableCell>
              <TableCell>{s.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
