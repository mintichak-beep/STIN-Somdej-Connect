import { useState, useMemo } from 'react';
import { Hospital } from '../types/db';
import { HospitalStatusChip } from './HospitalStatusChip';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { ChevronUp, ChevronDown, Download, Printer, ArrowUpDown, MapPin, GraduationCap, Building } from 'lucide-react';

interface HospitalTableProps {
  id?: string;
  data: Hospital[];
  isAdmin: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function HospitalTable({
  id,
  data,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate
}: HospitalTableProps) {
  const [sortField, setSortField] = useState<'hospitalCode' | 'hospitalNameTH' | 'hospitalNameEN' | 'studentCapacity'>('hospitalCode');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  const sortedData = useMemo(() => {
    const list = [...data];
    list.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB, 'th', { sensitivity: 'base' })
          : valB.localeCompare(valA, 'th', { sensitivity: 'base' });
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

  const handleSort = (field: 'hospitalCode' | 'hospitalNameTH' | 'hospitalNameEN' | 'studentCapacity') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    const headers = 'Hospital ID,Code,Name (TH),Name (EN),Short Name,Type,Affiliation,Province,District,Subdistrict,Postal Code,Address,Latitude,Longitude,Telephone,Fax,Email,Website,Director,Coordinator Name,Coordinator Phone,Coordinator Email,Buildings,Rooms,Student Capacity,Teacher Capacity,Status,Created At\n';
    const rows = sortedData.map(h => 
      `"${h.id}","${h.hospitalCode}","${h.hospitalNameTH}","${h.hospitalNameEN}","${h.shortName || ''}","${h.type}","${h.affiliation || ''}","${h.province}","${h.district}","${h.subdistrict}","${h.postalCode}","${h.address}",${h.latitude},${h.longitude},"${h.telephone}","${h.fax || ''}","${h.email || ''}","${h.website || ''}","${h.directorName || ''}","${h.coordinatorName}","${h.coordinatorPhone}","${h.coordinatorEmail || ''}",${h.numberOfBuildings},${h.numberOfRooms},${h.studentCapacity},${h.teacherCapacity},"${h.status}","${h.createdAt}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Hospitals_Registry_Export_${Date.now()}.csv`);
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
          <title>STIN-Somdej Connect - Clinical Hospitals Master Registry</title>
          <style>
            body { font-family: sans-serif; padding: 25px; color: #1f2937; }
            h1 { font-size: 22px; margin-bottom: 4px; font-weight: bold; }
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
          <h1>STIN-Somdej Connect Clinical Placements</h1>
          <p>Hospitals Master Registry List. Generated on: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString()}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name (Thai)</th>
                <th>Name (English)</th>
                <th>Type</th>
                <th>Province</th>
                <th>Capacity</th>
                <th>Coordinator</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(h => `
                <tr>
                  <td><strong>${h.hospitalCode}</strong></td>
                  <td>${h.hospitalNameTH}</td>
                  <td>${h.hospitalNameEN}</td>
                  <td>${h.type}</td>
                  <td>${h.province}</td>
                  <td>${h.studentCapacity} Seats</td>
                  <td>${h.coordinatorName}</td>
                  <td>${h.coordinatorPhone}</td>
                  <td>
                    <span class="badge ${
                      h.status === 'active' ? 'badge-active' : h.status === 'inactive' ? 'badge-inactive' : 'badge-archived'
                    }">
                      ${h.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div id={id || 'hospital-table-container'} className="space-y-4">
      
      {/* Table Command Bar */}
      <div className="flex justify-end gap-2 shrink-0">
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-zinc-500" />
          <span>Export CSV</span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-zinc-500" />
          <span>Print Registry</span>
        </button>
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {/* Header Cells with sorting */}
              <th className="py-3 px-4">Logo</th>
              <th className="py-3 px-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('hospitalCode')}>
                <div className="flex items-center gap-1">
                  <span>Code</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('hospitalNameTH')}>
                <div className="flex items-center gap-1">
                  <span>Thai Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('hospitalNameEN')}>
                <div className="flex items-center gap-1">
                  <span>English Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Province</th>
              <th className="py-3 px-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('studentCapacity')}>
                <div className="flex items-center gap-1">
                  <span>Placements</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
            {paginatedData.map((h) => {
              // Action items inside the row menu
              const rowActions: ActionMenuItem[] = [
                { label: 'View Details', onClick: () => onView(h.id), icon: 'view' }
              ];
              if (isAdmin) {
                rowActions.push({ label: 'Edit Profile', onClick: () => onEdit(h.id), icon: 'edit' });
                rowActions.push({ label: 'Duplicate', onClick: () => onDuplicate(h.id), icon: 'duplicate' });
                if (h.status === 'archived') {
                  rowActions.push({ label: 'Restore Profile', onClick: () => onRestore(h.id), icon: 'activate' });
                } else {
                  rowActions.push({ label: 'Archive Profile', onClick: () => onArchive(h.id), icon: 'archive' });
                }
                rowActions.push({ label: 'Delete Permanently', onClick: () => onDelete(h.id), icon: 'delete', danger: true });
              }

              const defaultLogo = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=50';

              return (
                <tr
                  key={h.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors font-medium text-zinc-700 dark:text-zinc-300"
                >
                  <td className="py-2 px-4">
                    <img
                      src={h.logoURL || defaultLogo}
                      alt="Logo"
                      className="w-8 h-8 rounded-lg object-cover border border-zinc-100 dark:border-zinc-800 bg-white"
                      referrerPolicy="no-referrer"
                    />
                  </td>
                  <td className="py-2 px-4 font-bold text-zinc-950 dark:text-white">
                    {h.hospitalCode}
                  </td>
                  <td className="py-2 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                    <button
                      type="button"
                      onClick={() => onView(h.id)}
                      className="text-left hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                    >
                      {h.hospitalNameTH}
                    </button>
                  </td>
                  <td className="py-2 px-4 opacity-95">
                    {h.hospitalNameEN}
                  </td>
                  <td className="py-2 px-4">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-semibold text-[10px]">
                      {h.type}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{h.province}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{h.studentCapacity} Seats</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <HospitalStatusChip status={h.status} />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <div className="inline-block bg-white dark:bg-zinc-950 rounded-lg shadow-xs">
                      <ActionMenu actions={rowActions} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-4 text-xs font-semibold text-zinc-500">
          <p>
            Showing page <strong className="text-zinc-800 dark:text-zinc-200">{currentPage}</strong> of{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{totalPages}</strong>
          </p>
          <div className="inline-flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 font-bold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 font-bold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
