import * as XLSX from 'xlsx';
import { Student } from '../types/student';

export const studentExportService = {
  exportToExcel: (students: Student[]) => {
    const data = students.map(s => ({
      'เลขที่': s.studentNumber,
      'ชื่อ': s.studentName,
      'Section': s.section,
      'Hospital': s.hospital,
      'DRส': s.DRSchedule,
      'Room': s.roomId,
      'Bed': s.bedId
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'Students.xlsx');
  }
};
