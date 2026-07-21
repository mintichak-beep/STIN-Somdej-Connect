import React, { useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Download, 
  Upload, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  User, 
  ArrowUpDown 
} from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  searchFields?: (keyof T | string)[];
  onAdd?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onDownloadTemplate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  title,
  description,
  columns,
  data,
  searchFields,
  onAdd,
  onImport,
  onExport,
  onDownloadTemplate,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = "Search records...",
  emptyTitle = "No Data Found",
  emptyDescription = "Get started by adding your first record to this collection."
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Data
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    if (searchFields && searchFields.length > 0) {
      return searchFields.some(field => {
        const val = (item as any)[field];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    return Object.values(item as any).some(val => 
      val !== undefined && val !== null && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="md-card overflow-hidden flex flex-col bg-white border border-slate-200/80 shadow-xl rounded-[20px]">
      <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#212121] tracking-tight">{title}</h2>
            {description && <p className="text-xs font-semibold text-[#616161] mt-1">{description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onDownloadTemplate && (
              <button
                onClick={onDownloadTemplate}
                className="md-button-outlined text-xs py-2.5 px-4 flex items-center gap-2"
              >
                <Download className="h-4 w-4 text-[#424242]" />
                <span>Download Template</span>
              </button>
            )}
            {onImport && (
              <button
                onClick={onImport}
                className="md-button-outlined text-xs py-2.5 px-4 flex items-center gap-2"
              >
                <Upload className="h-4 w-4 text-[#424242]" />
                <span>Import</span>
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="md-button-outlined text-xs py-2.5 px-4 flex items-center gap-2"
              >
                <Download className="h-4 w-4 text-[#424242]" />
                <span>Export</span>
              </button>
            )}
            {onAdd && (
              <button
                onClick={onAdd}
                className="md-button-filled text-xs py-3 px-5 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Record</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-[#212121] focus:border-[#D32F2F] focus:ring-4 focus:ring-[#D32F2F]/10 outline-none transition-all placeholder:text-slate-400 shadow-xs"
            />
          </div>
          <button className="md-button-outlined text-xs py-3 px-5 border-slate-200 text-[#424242] hover:text-[#212121] flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-20 bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white shadow-md">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-8 py-4 text-[11px] font-black uppercase tracking-wider text-white ${col.className || ''}`}>
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="h-3 w-3 cursor-pointer hover:text-red-200 transition-colors" />}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-wider text-right text-white">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#212121]">
            {paginatedData.length > 0 ? (
              paginatedData.map((item: any, rowIdx: number) => (
                <tr key={item.id || rowIdx} className={`transition-colors group ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'} hover:bg-red-50/50`}>
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-8 py-4 text-xs font-semibold text-[#212121] ${col.className || ''}`}>
                      {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as any)}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all cursor-pointer"
                            title="View Profile"
                          >
                            <User className="h-4 w-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2 text-slate-500 hover:text-[#D32F2F] hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-8 py-24 text-center bg-white">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    {data.length === 0 ? (
                      <>
                        <h3 className="text-base font-black text-[#212121] uppercase tracking-widest mb-1">{emptyTitle}</h3>
                        <p className="text-xs font-semibold text-[#616161] max-w-xs mx-auto mb-6">{emptyDescription}</p>
                        {onAdd && (
                          <button
                            onClick={onAdd}
                            className="md-button-filled flex items-center gap-2 text-xs py-2.5 px-6"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add First Record</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-base font-black text-[#212121] uppercase tracking-widest mb-1">No Matching Results</p>
                        <p className="text-xs font-semibold text-[#616161] max-w-xs mx-auto">Try adjusting your filters or search keywords to find what you're looking for.</p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80">
        <div className="flex items-center gap-4">
          <p className="text-[11px] font-bold text-[#616161] uppercase tracking-widest">
            Showing <span className="text-[#D32F2F] font-black">{filteredData.length > 0 ? startIndex + 1 : 0}</span> to <span className="text-[#D32F2F] font-black">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-[#D32F2F] font-black">{filteredData.length}</span> entries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="md-button-outlined py-1.5 px-3 flex items-center gap-1.5 text-xs border-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent ? "bg-[#D32F2F] text-white shadow-md shadow-red-900/20" : "text-[#424242] hover:bg-slate-200 hover:text-[#212121]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="md-button-outlined py-1.5 px-3 flex items-center gap-1.5 text-xs border-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
