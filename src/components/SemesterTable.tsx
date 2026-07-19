import { useState, useMemo } from 'react';
import { Semester, AcademicYear } from '../types/db';
import { StatusChip } from './StatusChip';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { ChevronUp, ChevronDown, Download, Printer, ArrowUpDown, CalendarDays, Star } from 'lucide-react';

interface SemesterTableProps {
  id?: string;
  data: Semester[];
  academicYears: AcademicYear[];
  isAdmin: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onSetCurrent: (id: string) => void;
}

export function SemesterTable({
  id,
  data,
  academicYears,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onActivate,
  onDeactivate,
  onSetCurrent
}: SemesterTableProps) {
  const [sortField, setSortField] = useState<'semesterNumber' | 'startDate' | 'endDate'>('semesterNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Build academic years map for rapid lookup
  const ayMap = useMemo(() => {
    const map = new Map<string, string>();
    academicYears.forEach(ay => map.set(ay.id, ay.name));
    return map;
  }, [academicYears]);

  // Sorting
  const sortedData = useMemo(() => {
    const list = [...data];
    list.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB, undefined, { numeric: true })
          : valB.localeCompare(valA, undefined, { numeric: true });
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

  const handleSort = (field: 'semesterNumber' | 'startDate' | 'endDate') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    const headers = 'ID,Academic Year ID,Academic Year,Semester Number,Semester Name,Start Date,End Date,Registration Start,Registration End,Status,Is Current\n';
    const rows = sortedData.map(sem => {
      const ayName = ayMap.get(sem.academicYearId) || '';
      return `"${sem.id}","${sem.academicYearId}","${ayName}","${sem.semesterNumber}","${sem.semesterName}","${sem.startDate}","${sem.endDate}","${sem.registrationStart}","${sem.registrationEnd}","${sem.status}",${sem.isCurrent}`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Semesters_Export_${Date.now()}.csv`);
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
          <title>STIN-Somdej Connect - Semester Term Master Registry</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 20px; margin-bottom: 5px; }
            p { font-size: 12px; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Semester Term Master Registry</h1>
          <p>Generated on ${new Date().toLocaleString()} • STIN-Somdej Connect</p>
          <table>
            <thead>
              <tr>
                <th>Semester Name</th>
                <th>Academic Year</th>
                <th>Semester Period</th>
                <th>Registration Period</th>
                <th>Current Active Term</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(sem => `
                <tr>
                  <td><strong>${sem.semesterName}</strong></td>
                  <td>${ayMap.get(sem.academicYearId) || '-'}</td>
                  <td>${sem.startDate} to ${sem.endDate}</td>
                  <td>${sem.registrationStart} to ${sem.registrationEnd}</td>
                  <td>${sem.isCurrent ? 'YES (Current Term)' : '-'}</td>
                  <td>${sem.status.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const getSortIcon = (field: 'semesterNumber' | 'startDate' | 'endDate') => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-40 ml-1 shrink-0" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-3.5 w-3.5 text-red-600 dark:text-red-500 ml-1 shrink-0" />
      : <ChevronDown className="h-3.5 w-3.5 text-red-600 dark:text-red-500 ml-1 shrink-0" />;
  };

  return (
    <div id={id} className="w-full space-y-4">
      {/* Utilities Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-50">
            Semester Terms ({data.length})
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-zinc-800/60 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black tracking-wider text-gray-400 uppercase dark:border-zinc-800/60 dark:bg-zinc-900/25">
                <th onClick={() => handleSort('semesterNumber')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-900/50">
                  <div className="flex items-center">
                    <span>Semester Name</span>
                    {getSortIcon('semesterNumber')}
                  </div>
                </th>
                <th className="px-6 py-4">Academic Year</th>
                <th onClick={() => handleSort('startDate')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-900/50">
                  <div className="flex items-center">
                    <span>Semester Period</span>
                    {getSortIcon('startDate')}
                  </div>
                </th>
                <th className="px-6 py-4">Registration Period</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-900/60">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center font-bold text-gray-400 dark:text-zinc-500">
                    No semesters match the applied filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((sem) => {
                  const ayName = ayMap.get(sem.academicYearId) || 'Unknown';

                  const contextActions: ActionMenuItem[] = [
                    { label: 'View Detail', onClick: () => onView(sem.id), icon: 'view' }
                  ];

                  if (isAdmin) {
                    contextActions.push(
                      { label: 'Edit Term', onClick: () => onEdit(sem.id), icon: 'edit' }
                    );

                    if (!sem.isCurrent) {
                      contextActions.push({ label: 'Set as Current Term', onClick: () => onSetCurrent(sem.id), icon: 'current' });
                    }

                    if (sem.status === 'active') {
                      contextActions.push({ label: 'Deactivate', onClick: () => onDeactivate(sem.id), icon: 'deactivate' });
                    } else if (sem.status === 'inactive') {
                      contextActions.push({ label: 'Activate', onClick: () => onActivate(sem.id), icon: 'activate' });
                    }

                    if (sem.status !== 'archived') {
                      contextActions.push({ label: 'Archive Record', onClick: () => onArchive(sem.id), icon: 'archive', danger: true });
                    } else {
                      contextActions.push({ label: 'Restore Record', onClick: () => onActivate(sem.id), icon: 'activate' });
                    }

                    contextActions.push({ label: 'Delete Permanently', onClick: () => onDelete(sem.id), icon: 'delete', danger: true });
                  }

                  return (
                    <tr key={sem.id} className="hover:bg-slate-50/50 transition dark:hover:bg-zinc-900/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-extrabold text-gray-900 dark:text-zinc-50 font-sans text-sm">
                          <span>{sem.semesterName}</span>
                          {sem.isCurrent && (
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase text-red-700 dark:bg-red-950/40 dark:text-red-400">
                              <Star className="h-2.5 w-2.5 fill-red-500 text-red-500" />
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700 dark:text-zinc-300">
                        {ayName}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-500 dark:text-zinc-400">
                        {sem.startDate} ⇄ {sem.endDate}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-500 dark:text-zinc-400">
                        {sem.registrationStart} ⇄ {sem.registrationEnd}
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip status={sem.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionMenu actions={contextActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 px-6 py-3.5 dark:border-zinc-900/60 dark:bg-zinc-900/10">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
              Page {currentPage} of {totalPages} ({data.length} total entries)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-gray-600 shadow-xs hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-gray-600 shadow-xs hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
