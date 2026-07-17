import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { Vehicle } from '../../types/transportation';

export function VehicleTable({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Vehicle Number</TableCell>
            <TableCell>License Plate</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id}>
              <TableCell>{v.vehicleNumber}</TableCell>
              <TableCell>{v.licensePlate}</TableCell>
              <TableCell>{v.vehicleType}</TableCell>
              <TableCell>{v.seatCapacity}</TableCell>
              <TableCell>
                <Chip label={v.status} color={v.status === 'active' ? 'success' : 'default'} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
