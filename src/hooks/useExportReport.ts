import { useState } from 'react';
import { pdfExportService } from '../services/pdfExport.service';
import { excelExportService } from '../services/excelExport.service';

export function useExportReport() {
  const [exporting, setExporting] = useState(false);

  const exportExcel = async (title: string, data: any[]) => {
    setExporting(true);
    try {
      excelExportService.exportToExcel(data, title.replace(/\s+/g, '_'));
    } catch (err) {
      console.error('Excel Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async (title: string, data: any[]) => {
    setExporting(true);
    try {
      pdfExportService.exportToPDF(title, data);
    } catch (err) {
      console.error('PDF Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const printReport = (elementId: string) => {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // to restore React app state
  };

  return {
    exporting,
    exportExcel,
    exportPDF,
    printReport
  };
}
