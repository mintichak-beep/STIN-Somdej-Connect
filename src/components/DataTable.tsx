import { useState } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Plus, 
  Download, 
  Upload 
} from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onImport?: () => void;
  onExport?: () => void;
  searchPlaceholder?: string;
  searchFields: (keyof T)[];
}

export function DataTable<T extends { id: string }>({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onImport,
  onExport,
  searchPlaceholder = "ค้นหา...",
  searchFields,
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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-100 dark:border-zinc-800 overflow-hidden">
      <div className="p-6 border-b border-slate-50 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">{title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {onImport && (
              <button
                onClick={onImport}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            )}
            {onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-sm shadow-red-200 dark:shadow-none"
              >
                <Plus className="h-4 w-4" />
                <span>เพิ่มข้อมูล</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-red-600/20 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-zinc-800/50">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ${col.className}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-6 py-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 ${col.className}`}>
                      {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as any)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-zinc-400 font-bold">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            แสดง {startIndex + 1} ถึง {Math.min(startIndex + itemsPerPage, filteredData.length)} จาก {filteredData.length} รายการ
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-black text-zinc-900 dark:text-zinc-50 px-2">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
