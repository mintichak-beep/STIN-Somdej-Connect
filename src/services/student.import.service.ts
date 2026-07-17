import * as XLSX from 'xlsx';
import { studentService } from './student.service';
import { Student } from '../types/student';

export const studentImportService = {
  importFromExcel: async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(worksheet) as any[];

          const students = json.map(row => ({
            studentId: `s-${row['เลขที่'] || Date.now()}`,
            studentNumber: String(row['เลขที่'] || ''),
            studentName: row['ชื่อ'] || '',
            section: String(row['Section'] || ''),
            academicYear: '2569', // Default or from file
            hospital: row['Hospital'] || '',
            rotationGroup: 'A', // Default or from file
            DRSchedule: row['DRส'] || '',
            status: 'active'
          } as Omit<Student, 'id'>));

          for (const student of students) {
            await studentService.create(student);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
};
