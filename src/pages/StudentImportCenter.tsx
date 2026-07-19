import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, FileText, CheckCircle, AlertCircle, 
  XCircle, Download, Users, Plus, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { studentImportService } from '../services/studentImport.service';

export function StudentImportCenter() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    valid: any[];
    invalid: any[];
    duplicates: any[];
    preview: any[];
  } | null>(null);
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });

  const [activeTab, setActiveTab] = useState<'preview' | 'history'>('preview');
  const [history, setHistory] = useState<any[]>([]);

  // Load history on tab change
  const loadHistory = () => {
    const hist = studentImportService.getImportHistory();
    setHistory(hist.sort((a: any, b: any) => new Date(b.importDate).getTime() - new Date(a.importDate).getTime()));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setIsProcessing(true);
    setImportResult(null);
    setImportSuccess(false);

    try {
      const result = await studentImportService.validateData(selectedFile);
      setImportResult(result);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please ensure it is a valid Excel or CSV file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    
    if (!droppedFile.name.match(/\.(csv|xlsx|xls)$/)) {
      alert('Please upload a valid CSV or Excel file.');
      return;
    }
    
    setFile(droppedFile);
    setIsProcessing(true);
    setImportResult(null);
    setImportSuccess(false);

    try {
      const result = await studentImportService.validateData(droppedFile);
      setImportResult(result);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = async () => {
    if (!importResult || importResult.valid.length === 0) return;
    
    setIsConfirming(true);
    try {
      const result = await studentImportService.confirmImport(
        importResult.valid, 
        user?.uid || 'unknown-teacher', 
        file?.name || 'import.csv'
      );
      setImportSuccess(true);
      setImportStats({ success: result.count, failed: importResult.invalid.length + importResult.duplicates.length });
    } catch (error) {
      console.error('Import failed', error);
      alert('Import failed. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setImportResult(null);
    setImportSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleExportStudents = () => {
    // In a real app, this would come from a service
    import('../services/mockData').then(({ mockDB }) => {
      const students = mockDB.getStudents();
      const practiceAssignments = mockDB.getPracticeAssignments();
      const courses = mockDB.getCourses();
      
      const exportData = students.map(s => {
        // Find assignment
        const assignment = practiceAssignments.find(pa => pa.studentId === s.id);
        const course = assignment ? courses.find(c => c.id === assignment.courseId) : null;
        
        return {
          "Student ID": s.studentId || s.studentNumber,
          "Name": s.fullName || s.studentName,
          "Email": s.email || '',
          "Course": course ? course.name : '',
          "Practice Group": assignment ? assignment.practiceGroupId : '',
          "Hospital": assignment ? assignment.trainingSiteId : s.hospital || ''
        };
      });

      const headers = Object.keys(exportData[0] || {}).join(',');
      const rows = exportData.map(row => 
        Object.values(row).map(value => 
          '"' + String(value || '').replace(/"/g, '""') + '"'
        ).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', 'student_list.csv');
      link.click();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Student Import Center
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Upload and manage student data from Excel or CSV files.
          </p>
        </div>
        <button 
          onClick={handleExportStudents}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-700 transition"
        >
          <Download className="w-4 h-4" /> Export Student List
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800">
        <button 
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'preview' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
        >
          New Import
        </button>
        <button 
          onClick={() => { setActiveTab('history'); loadHistory(); }}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
        >
          Import History
        </button>
      </div>

      {activeTab === 'preview' && (
        <div className="space-y-6">
          {!importSuccess ? (
            <>
              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${importResult ? 'bg-slate-50 border-slate-200 dark:bg-zinc-800/30 dark:border-zinc-700/50' : 'bg-white border-indigo-200 hover:border-indigo-400 dark:bg-zinc-900 dark:border-indigo-900/50 dark:hover:border-indigo-700'} `}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!importResult ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-zinc-900 dark:text-white">
                        Drag and drop your file here
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        Support CSV and Excel files (.csv, .xlsx)
                      </p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv, .xlsx, .xls"
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Select File'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{file?.name}</p>
                        <p className="text-xs text-zinc-500">{(file?.size || 0) / 1024 > 1024 ? ((file?.size || 0) / (1024*1024)).toFixed(2) + ' MB' : ((file?.size || 0) / 1024).toFixed(1) + ' KB'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={resetImport}
                      className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Validation Results */}
              {importResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-4">
                      <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 p-3 rounded-lg">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">{importResult.valid.length}</p>
                        <p className="text-xs font-bold uppercase text-zinc-500">Ready to Import</p>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-4">
                      <div className="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 p-3 rounded-lg">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">{importResult.duplicates.length}</p>
                        <p className="text-xs font-bold uppercase text-zinc-500">Duplicates (Skipped)</p>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-4">
                      <div className="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 p-3 rounded-lg">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">{importResult.invalid.length}</p>
                        <p className="text-xs font-bold uppercase text-zinc-500">Invalid Records</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900">
                      <h3 className="font-black text-zinc-900 dark:text-white uppercase">Import Preview</h3>
                      {importResult.valid.length > 0 && (
                        <button 
                          onClick={confirmImport}
                          disabled={isConfirming}
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition uppercase tracking-wider flex items-center gap-2"
                        >
                          {isConfirming ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Confirm Import
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 font-black">No.</th>
                            <th className="px-4 py-3 font-black">Student ID</th>
                            <th className="px-4 py-3 font-black">Name</th>
                            <th className="px-4 py-3 font-black">Email</th>
                            <th className="px-4 py-3 font-black">Course</th>
                            <th className="px-4 py-3 font-black">Group</th>
                            <th className="px-4 py-3 font-black">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {importResult.preview.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50">
                              <td className="px-4 py-3 text-zinc-500">{row.originalRow}</td>
                              <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{row.studentId}</td>
                              <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{row.fullName}</td>
                              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.email}</td>
                              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate" title={row.course}>{row.course}</td>
                              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.practiceGroup}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                  row.status === 'Ready' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                  row.status === 'Duplicate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                }`}>
                                  {row.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importResult.preview.length === 0 && (
                        <div className="p-8 text-center text-zinc-500">No data found in file.</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border border-emerald-100 rounded-2xl p-8 text-center shadow-sm dark:bg-zinc-900 dark:border-emerald-900/30"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Import Successful!</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                Successfully imported {importStats.success} student records and assigned them to their respective courses and practice groups.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={resetImport}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition uppercase tracking-wider"
                >
                  Import Another File
                </button>
                <button 
                  onClick={() => { setActiveTab('history'); loadHistory(); }}
                  className="px-6 py-2 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition uppercase tracking-wider"
                >
                  View History
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-black">Date</th>
                  <th className="px-4 py-3 font-black">File Name</th>
                  <th className="px-4 py-3 font-black">Imported By</th>
                  <th className="px-4 py-3 font-black text-right">Total</th>
                  <th className="px-4 py-3 font-black text-right text-emerald-600">Success</th>
                  <th className="px-4 py-3 font-black text-right text-rose-600">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {history.length > 0 ? history.map((record, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{new Date(record.importDate).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      {record.fileName}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{record.importedBy}</td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-right">{record.totalRecords}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 text-right font-bold">{record.successRecords}</td>
                    <td className="px-4 py-3 text-rose-600 dark:text-rose-400 text-right font-bold">{record.failedRecords}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No import history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
