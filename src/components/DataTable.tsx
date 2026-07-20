import { useState } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Plus, 
  Download, 
  Upload,
  User,
  Filter,
  MoreVertical,
  ArrowUpDown
} from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onImport?: () => void;
  onExport?: () => void;
  searchPlaceholder?: string;
  searchFields: (keyof T)[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends { id: string }>({
  title,
  description = "Manage and track institutional records and medical data.",
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onImport,
  onExport,
  searchPlaceholder = "Search records...",
  searchFields,
  emptyTitle = "No Records Available",
  emptyDescription = "This collection is currently empty. Start by adding your first record manually.",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="md-card overflow-hidden flex flex-col bg-surface border-outline">
      <div className="p-8 border-b border-outline bg-surface">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onImport && (
              <button
                onClick={onImport}
                className="md-button-text flex items-center gap-2 border border-outline hover:bg-surface-variant/50"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="md-button-text flex items-center gap-2 border border-outline hover:bg-surface-variant/50"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            )}
            {onAdd && (
              <button
                onClick={onAdd}
                className="md-button-filled flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
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
              className="w-full pl-11 pr-4 py-3.5 bg-surface-variant/30 border border-outline rounded-2xl text-sm font-medium text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
            />
          </div>
          <button className="md-button-outlined flex items-center gap-2 py-3 px-5 border-outline text-slate-600 hover:text-primary">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-20 bg-surface shadow-sm">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-outline ${col.className}`}>
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="h-3 w-3 cursor-pointer hover:text-primary transition-colors" />}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right border-b border-outline">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-primary-container/20 transition-colors group">
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-8 py-5 text-sm font-bold text-slate-700 ${col.className}`}>
                      {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as any)}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title="View Profile"
                          >
                            <User className="h-5 w-5" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2.5 text-slate-400 hover:text-medical-teal hover:bg-medical-teal/10 rounded-xl transition-all"
                            title="Edit Record"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title="Delete Record"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                        <button className="p-2.5 text-slate-300 hover:text-slate-600">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-outline border-dashed">
                      <Search className="h-10 w-10 text-slate-200" />
                    </div>
                    {data.length === 0 ? (
                      <>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">{emptyTitle}</h3>
                        <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto mb-8">{emptyDescription}</p>
                        {onAdd && (
                          <button
                            onClick={onAdd}
                            className="md-button-filled flex items-center gap-3 px-8"
                          >
                            <Plus className="h-5 w-5" />
                            <span>Add First Record</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">No Matching Results</p>
                        <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">Try adjusting your filters or search keywords to find what you're looking for.</p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-6 border-t border-outline flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-variant/10">
        <div className="flex items-center gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-primary">{startIndex + 1}</span> to <span className="text-primary">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-primary">{filteredData.length}</span> entries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="md-button-outlined py-2 px-4 flex items-center gap-2 text-xs border-outline disabled:border-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              const isCurrent = pageNum === currentPage;
              if (totalPages > 5 && Math.abs(pageNum - currentPage) > 1 && pageNum !== 1 && pageNum !== totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                    isCurrent ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-primary-container hover:text-primary"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="md-button-outlined py-2 px-4 flex items-center gap-2 text-xs border-outline disabled:border-slate-100"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
