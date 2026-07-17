import React, { useState, useMemo } from 'react';
import { Building } from '../types/db';
import { BuildingStatusChip } from './BuildingStatusChip';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { ChevronUp, ChevronDown, Download, Printer, Layers, DoorOpen, Bed, UserCheck } from 'lucide-react';
import { mockDB } from '../services/mockData';

interface BuildingTableProps {
  id?: string;
  data: Building[];
  isAdmin: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDuplicate: (id: string) => void;
}

type SortField = 'buildingCode' | 'buildingName' | 'buildingType' | 'numberOfFloors' | 'totalRooms' | 'totalBeds';

export function BuildingTable({
  id,
  data,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
}: BuildingTableProps) {
  const [sortField, setSortField] = useState<SortField>('buildingCode');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Resolve Hospital Name
  const getHospitalName = (hId: string) => {
    const hospital = mockDB.getHospitals().find((h) => h.id === hId);
    return hospital ? hospital.hospitalNameEN : 'Unknown';
  };

  // Sorting
  const sortedData = useMemo(() => {
    const list = [...data];
    list.sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
      return 0;
    });
    return list;
  }, [data, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    const headers = 'Building ID,Code,Name,Type,Floors,Rooms,Beds,Gender Orientation,Hospital,Address,Description,Status,Created At\n';
    const rows = sortedData
      .map((b) => {
        const hName = getHospitalName(b.hospitalId);
        return `"${b.id}","${b.buildingCode}","${b.buildingName}","${b.buildingType}",${b.numberOfFloors},${b.totalRooms},${b.totalBeds},"${b.gender}","${hName}","${b.address || ''}","${b.description || ''}","${b.status}","${b.createdAt}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Buildings_Registry_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Utility
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>CPATMS - Building Registry List</title>
          <style>
            body { font-family: sans-serif; padding: 25px; color: #1f2937; }
            h1 { font-size: 20px; margin-bottom: 4px; font-weight: bold; }
            p { font-size: 11px; margin-bottom: 25px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { border-bottom: 2px solid #e5e7eb; padding: 10px 8px; text-align: left; background-color: #f9fafb; font-weight: bold; }
            td { border-bottom: 1px solid #f3f4f6; padding: 10px 8px; text-align: left; }
            .badge { display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: bold; border-radius: 4px; }
            .badge-active { background-color: #d1fae5; color: #065f46; }
            .badge-inactive { background-color: #fef3c7; color: #92400e; }
            .badge-archived { background-color: #f3f4f6; color: #374151; }
          </style>
        </head>
        <body>
          <h1>CPATMS Clinical Placement Accommodations</h1>
          <p>Buildings Master Registry. Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Building Name</th>
                <th>Type</th>
                <th>Hospital Site</th>
                <th>Floors</th>
                <th>Rooms</th>
                <th>Total Capacity</th>
                <th>Target Gender</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${sortedData
                .map(
                  (b) => `
                <tr>
                  <td><strong>${b.buildingCode}</strong></td>
                  <td>${b.buildingName}</td>
                  <td>${b.buildingType}</td>
                  <td>${getHospitalName(b.hospitalId)}</td>
                  <td>${b.numberOfFloors}</td>
                  <td>${b.totalRooms}</td>
                  <td>${b.totalBeds} Beds</td>
                  <td>${b.gender}</td>
                  <td>
                    <span class="badge ${
                      b.status === 'active' ? 'badge-active' : b.status === 'inactive' ? 'badge-inactive' : 'badge-archived'
                    }">
                      ${b.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ChevronDown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
    );
  };

  return (
    <div id={id || 'building-table-container'} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
      {/* Table Export Header Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
          Showing {paginatedData.length} of {sortedData.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 border border-slate-200 rounded-xl dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 shadow-sm transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 border border-slate-200 rounded-xl dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print List</span>
          </button>
        </div>
      </div>

      {/* Table Shell */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/25 dark:bg-zinc-900/10">
              <th
                onClick={() => handleSort('buildingCode')}
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Code</span>
                  {renderSortIcon('buildingCode')}
                </div>
              </th>
              <th
                onClick={() => handleSort('buildingName')}
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Name</span>
                  {renderSortIcon('buildingName')}
                </div>
              </th>
              <th
                onClick={() => handleSort('buildingType')}
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Type</span>
                  {renderSortIcon('buildingType')}
                </div>
              </th>
              <th className="p-4">Hospital Site</th>
              <th
                onClick={() => handleSort('numberOfFloors')}
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Floors</span>
                  {renderSortIcon('numberOfFloors')}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalRooms')}
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Rooms</span>
                  {renderSortIcon('totalRooms')}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalBeds')}
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Capacity</span>
                  {renderSortIcon('totalBeds')}
                </div>
              </th>
              <th className="p-4">Gender</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs font-semibold text-gray-700 dark:text-zinc-300">
            {paginatedData.map((building) => {
              // Action builder
              const actionsList: ActionMenuItem[] = [
                { label: 'View Details', onClick: () => onView(building.id), icon: 'view' },
              ];

              if (isAdmin) {
                actionsList.push({ label: 'Edit Building', onClick: () => onEdit(building.id), icon: 'edit' });
                actionsList.push({ label: 'Duplicate', onClick: () => onDuplicate(building.id), icon: 'duplicate' });

                if (building.status === 'archived') {
                  actionsList.push({ label: 'Restore Building', onClick: () => onRestore(building.id), icon: 'activate' });
                } else {
                  actionsList.push({ label: 'Archive Building', onClick: () => onArchive(building.id), icon: 'archive' });
                }

                actionsList.push({
                  label: 'Delete Permanently',
                  onClick: () => onDelete(building.id),
                  icon: 'delete',
                  danger: true,
                });
              }

              return (
                <tr
                  key={building.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition group"
                >
                  <td className="p-4 font-bold text-gray-900 dark:text-zinc-100">{building.buildingCode}</td>
                  <td
                    onClick={() => onView(building.id)}
                    className="p-4 font-bold text-gray-950 dark:text-zinc-50 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {building.buildingName}
                  </td>
                  <td className="p-4">{building.buildingType}</td>
                  <td className="p-4 truncate max-w-[150px]">{getHospitalName(building.hospitalId)}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px]">
                      <Layers className="h-3 w-3 text-slate-400 shrink-0" />
                      {building.numberOfFloors}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px]">
                      <DoorOpen className="h-3 w-3 text-slate-400 shrink-0" />
                      {building.totalRooms}
                    </span>
                  </td>
                  <td className="p-4 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                    <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded text-[11px]">
                      <Bed className="h-3 w-3 shrink-0" />
                      {building.totalBeds}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <UserCheck className="h-3 w-3 text-slate-400" />
                      {building.gender}
                    </span>
                  </td>
                  <td className="p-4">
                    <BuildingStatusChip status={building.status} />
                  </td>
                  <td className="p-4 text-right">
                    <ActionMenu actions={actionsList} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
