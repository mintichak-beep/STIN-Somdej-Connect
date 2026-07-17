import jsPDF from 'jspdf';

export const pdfExportService = {
  exportToPDF: (title: string, data: any[]) => {
    const doc = new jsPDF();
    doc.text(title, 10, 10);
    // ... implementation for adding data to PDF
    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  }
};
