import { useState, useMemo } from 'react';
import { AcademicYear } from '../types/db';
import { StatusChip } from './StatusChip';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { ChevronUp, ChevronDown, Download, Printer, ArrowUpDown, CalendarRange } from 'lucide-react';

interface AcademicYearTableProps {
  id?: string;
  data: AcademicYear[];
  isAdmin: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDuplicate: (item: AcademicYear) => void;
}

export function AcademicYearTable({
  id,
  data,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onActivate,
  onDeactivate,
  onDuplicate
}: AcademicYearTableProps) {
  const [sortField, setSortField] = useState<'name' | 'status' | 'startYear'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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

  const handleSort = (field: 'name' | 'status' | 'startYear') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    const headers = 'ID,Name,Start Year,End Year,Description,Status,Active,Created At,Updated At\n';
    const rows = sortedData.map(ay => 
      `"${ay.id}","${ay.name}","${ay.startYear}","${ay.endYear}","${ay.description || ''}","${ay.status}",${ay.isActive},"${ay.createdAt}","${ay.updatedAt}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Academic_Years_Export_${Date.now()}.csv`);
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
          <title>CPATMS - Academic Years Master Registry</title>
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
          <h1>Academic Years Master Registry</h1>
          <p>Generated on ${new Date().toLocaleString()} • CPATMS Portal</p>
          <table>
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Description</th>
                <th>Start Year</th>
                <th>End Year</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(ay => `
                <tr>
                  <td><strong>${ay.name}</strong></td>
                  <td>${ay.description || '-'}</td>
                  <td>${ay.startYear}</td>
                  <td>${ay.endYear}</td>
                  <td>${ay.status.toUpperCase()}</td>
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

  const getSortIcon = (field: 'name' | 'status' | 'startYear') => {
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
          <CalendarRange className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-zinc-50">
            Registry Entries ({data.length})
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
                <th onClick={() => handleSort('name')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-900/50">
                  <div className="flex items-center">
                    <span>Academic Year</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Description</th>
                <th onClick={() => handleSort('startYear')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-900/50">
                  <div className="flex items-center">
                    <span>Term Period</span>
                    {getSortIcon('startYear')}
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-900/50">
                  <div className="flex items-center">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-900/60">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center font-bold text-gray-400 dark:text-zinc-500">
                    No academic years match the applied filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((ay) => {
                  // Build context actions
                  const contextActions: ActionMenuItem[] = [
                    { label: 'View Detail', onClick: () => onView(ay.id), icon: 'view' }
                  ];

                  if (isAdmin) {
                    contextActions.push(
                      { label: 'Edit Term', onClick: () => onEdit(ay.id), icon: 'edit' },
                      { label: 'Duplicate Entry', onClick: () => onDuplicate(ay), icon: 'duplicate' }
                    );

                    if (ay.status === 'active') {
                      contextActions.push({ label: 'Deactivate', onClick: () => onDeactivate(ay.id), icon: 'deactivate' });
                    } else if (ay.status === 'inactive') {
                      contextActions.push({ label: 'Activate', onClick: () => onActivate(ay.id), icon: 'activate' });
                    }

                    if (ay.status !== 'archived') {
                      contextActions.push({ label: 'Archive Record', onClick: () => onArchive(ay.id), icon: 'archive', danger: true });
                    } else {
                      contextActions.push({ label: 'Restore Record', onClick: () => onActivate(ay.id), icon: 'activate' });
                    }

                    contextActions.push({ label: 'Delete Permanently', onClick: () => onDelete(ay.id), icon: 'delete', danger: true });
                  }

                  return (
                    <tr key={ay.id} className="hover:bg-slate-50/50 transition dark:hover:bg-zinc-900/20">
                      <td className="px-6 py-4 font-extrabold text-gray-900 dark:text-zinc-50 font-sans text-sm">
                        {ay.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-500 dark:text-zinc-400 max-w-xs truncate">
                        {ay.description || '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600 dark:text-zinc-300">
                        {ay.startYear} - {ay.endYear}
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip status={ay.status} />
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
