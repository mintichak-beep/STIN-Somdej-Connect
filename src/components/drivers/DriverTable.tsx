import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { Driver } from '../../types/transportation';

export function DriverTable({ drivers }: { drivers: Driver[] }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Driver Name</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>License Number</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.driverName}</TableCell>
              <TableCell>{d.phone}</TableCell>
              <TableCell>{d.licenseNumber}</TableCell>
              <TableCell>
                <Chip label={d.status} color={d.status === 'active' ? 'success' : 'default'} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
