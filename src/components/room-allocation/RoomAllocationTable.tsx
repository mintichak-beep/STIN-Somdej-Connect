import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface Props {
  data: any[];
}

export function RoomAllocationTable({ data }: Props) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Room</TableCell>
            <TableCell>Student Number</TableCell>
            <TableCell>Student Name</TableCell>
            <TableCell>Accommodation Period</TableCell>
            <TableCell>Bed</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.roomId}</TableCell>
              <TableCell>{row.studentNumber}</TableCell>
              <TableCell>{row.studentName}</TableCell>
              <TableCell>{row.accommodationPeriod}</TableCell>
              <TableCell>{row.bedNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
