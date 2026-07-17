import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Student } from '../../types/student';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const columnHelper = createColumnHelper<Student>();

interface Props {
  data: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export function StudentTable({ data, onEdit, onDelete }: Props) {
  const columns = [
    columnHelper.accessor('studentNumber', { header: 'เลขที่' }),
    columnHelper.accessor('studentName', { header: 'ชื่อ' }),
    columnHelper.accessor('section', { header: 'Section' }),
    columnHelper.accessor('hospital', { header: 'Hospital' }),
    columnHelper.accessor('DRSchedule', { header: 'DR Schedule' }),
    columnHelper.accessor('roomId', { header: 'Room' }),
    columnHelper.accessor('bedId', { header: 'Bed' }),
    columnHelper.accessor('status', { header: 'Status' }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <>
          <IconButton onClick={() => onEdit(row.original)}><Edit /></IconButton>
          <IconButton onClick={() => onDelete(row.original.id)}><Delete /></IconButton>
        </>
      )
    })
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableCell key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
