import * as XLSX from 'xlsx';
import { mockDB } from './mockData';
import { Student, User, PracticeAssignment, TrainingSite, Course } from '../types/db';
import { auditService } from './audit.service';

function getCurrentUserId(): string {
  try {
    const user = localStorage.getItem('cpatms_user');
    return user ? JSON.parse(user).uid : 'system';
  } catch {
    return 'system';
  }
}

export const studentImportService = {
  validateData: async (file: File): Promise<{
    valid: any[];
    invalid: any[];
    duplicates: any[];
    preview: any[];
  }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          const valid: any[] = [];
          const invalid: any[] = [];
          const duplicates: any[] = [];
          const preview: any[] = [];

          const existingStudents = mockDB.getStudents();
          const existingUsers = mockDB.getUsers?.() || [];

          rawJson.forEach((row, index) => {
            const studentId = String(row.studentId || row['Student ID'] || row['เลขที่'] || '').trim();
            const fullName = String(row.fullName || row.name || row['Name'] || row['ชื่อ'] || '').trim();
            const courseName = String(row.course || row['Course'] || '').trim();
            
            let firstName = String(row.firstName || '').trim();
            let lastName = String(row.lastName || '').trim();
            if (!firstName && fullName) {
              const parts = fullName.split(' ');
              firstName = parts[0];
              lastName = parts.slice(1).join(' ');
            }

            const email = String(row.email || `${studentId}@stin.ac.th`).trim();
            const academicYear = String(row.academicYear || '2026').trim();
            const semester = String(row.semester || '1').trim();
            const practiceGroup = String(row.practiceGroup || 'Group 1').trim();

            let status = 'Ready';
            let isValid = true;
            let isDuplicate = false;

            // Validate student ID (numeric, 7 digits, range 6610001 - 6710230)
            const idNum = parseInt(studentId, 10);
            if (!/^\d{7}$/.test(studentId) || isNaN(idNum) || idNum < 6610001 || idNum > 6710230) {
              isValid = false;
              status = 'Invalid (ID format/range)';
            }

            if (!studentId || !fullName || !courseName) {
              isValid = false;
              status = 'Invalid (Missing fields)';
            }

            // Check duplicates
            const isStudentDup = existingStudents.some(s => s.studentId === studentId || s.email === email);
            const isUserDup = existingUsers.some((u: any) => u.email === email);
            
            if (isStudentDup || isUserDup) {
              isValid = false;
              isDuplicate = true;
              status = 'Duplicate';
            }

            const parsedRow = {
              originalRow: index + 1,
              studentId,
              fullName,
              firstName,
              lastName,
              email,
              course: courseName,
              academicYear,
              semester,
              practiceGroup,
              status
            };

            preview.push(parsedRow);

            if (isValid) {
              valid.push(parsedRow);
            } else if (isDuplicate) {
              duplicates.push(parsedRow);
            } else {
              invalid.push(parsedRow);
            }
          });

          resolve({ valid, invalid, duplicates, preview });
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  },

  confirmImport: async (validRecords: any[], teacherId: string, fileName: string) => {
    try {
      const students = mockDB.getStudents();
      const users = mockDB.getUsers?.() || [];
      const courses = mockDB.getCourses();
      const practiceAssignments = mockDB.getPracticeAssignments();
      // Generate some unique IDs for this import
      const importId = `imp-${Date.now()}`;
      
      const importedStudents: Student[] = [];
      const newUsers: User[] = [];
      
      // Keep track of which courses we need to create/find
      for (const record of validRecords) {
        // 1. Create Student
        const newStudent: Student = {
          id: `st-${record.studentId}-${Date.now()}`,
          studentId: record.studentId,
          studentNumber: record.studentId, // backward compat
          firstName: record.firstName,
          lastName: record.lastName,
          fullName: record.fullName,
          studentName: record.fullName, // backward compat
          email: record.email,
          academicYear: record.academicYear,
          yearLevel: 'Year 4', // Mock or parse from ID
          status: 'active',
          createdAt: new Date().toISOString()
        };
        students.push(newStudent);
        importedStudents.push(newStudent);

        // 2. Create User Profile
        const newUser: User = {
          id: `usr-${record.studentId}`,
          uid: `usr-${record.studentId}`,
          email: record.email,
          name: record.fullName,
          displayName: record.fullName,
          role: 'student',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        users.push(newUser);
        newUsers.push(newUser);

        // 3. Connect to Course / Practice Assignment
        // Try to find course by name or code
        let course = courses.find(c => 
          (c.courseName && c.courseName.includes(record.course)) || 
          (c.name && c.name.includes(record.course)) ||
          (c.courseCode === record.course) ||
          (c.code === record.course)
        );
        
        if (!course) {
          // Auto create course if not found (mock behavior)
          course = {
            id: `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            courseCode: `NUR-${Math.floor(Math.random() * 1000)}`,
            courseName: record.course,
            code: `NUR-${Math.floor(Math.random() * 1000)}`, // compat
            name: record.course, // compat
            academicYear: record.academicYear,
            semester: record.semester,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          courses.push(course);
        }

        // 4. Handle Practice Group
        const practiceGroups = mockDB.getPracticeGroups();
        let group = practiceGroups.find(g => g.name === record.practiceGroup && g.courseId === course!.id);
        if (!group) {
          group = {
            id: `pg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: record.practiceGroup,
            courseId: course!.id,
            hospitalId: record.hospital || 'h-siriraj',
            academicYear: record.academicYear,
            semester: record.semester,
            capacity: 10,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          practiceGroups.push(group);
          mockDB.savePracticeGroups(practiceGroups);
        }

        // Find or create practice assignment for this student/course/group
        let assignment = practiceAssignments.find(pa => 
          pa.studentId === newStudent.id && pa.courseId === course!.id && pa.practiceGroupId === group!.id
        );

        if (!assignment) {
          assignment = {
            id: `pa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            studentId: newStudent.id,
            courseId: course!.id,
            practiceGroupId: group!.id,
            trainingSiteId: group!.hospitalId,
            wardDepartment: 'General Ward',
            teacherId: teacherId,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'active',
            createdAt: new Date().toISOString()
          };
          practiceAssignments.push(assignment);
        }
      }

      // Save everything back to mockDB
      mockDB.saveStudents(students);
      if (mockDB.saveUsers) mockDB.saveUsers(users);
      mockDB.saveCourses(courses);
      mockDB.savePracticeAssignments(practiceAssignments);

      // Save Import History
      const history = mockDB.getImportHistory ? mockDB.getImportHistory() : [];
      history.push({
        id: importId,
        fileName,
        importedBy: teacherId,
        totalRecords: validRecords.length,
        successRecords: importedStudents.length,
        failedRecords: 0, // In real scenario we might have some failures
        importDate: new Date().toISOString()
      });
      if (mockDB.saveImportHistory) mockDB.saveImportHistory(history);
      
      await auditService.log(getCurrentUserId(), 'IMPORT', 'Student', 'batch', `Imported ${importedStudents.length} students from ${fileName}`);

      return { success: true, count: importedStudents.length };
    } catch (error) {
      console.error('Confirm import failed:', error);
      throw error;
    }
  },
  
  getImportHistory: () => {
    return mockDB.getImportHistory ? mockDB.getImportHistory() : [];
  }
};
