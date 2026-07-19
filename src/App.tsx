import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { storage } from './lib/storage';
import { Student } from './types/db';
import { AuthProvider } from './contexts/AuthContext';
import { PublicRoute } from './components/PublicRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { TeacherLogin } from './pages/TeacherLogin';
import { StudentSearch } from './pages/StudentSearch';
import { StudentProfile } from './pages/StudentProfile';
import { Dashboard } from './pages/Dashboard';
import { ForgotPassword } from './pages/ForgotPassword';
import { Unauthorized } from './pages/Unauthorized';

export default function App() {
  useEffect(() => {
    // Seed initial data from OCR if empty
    const students = storage.get<Student[]>('students') || [];
    if (students.length === 0) {
      const initialStudents: Student[] = [
        // Page 1
        { id: 's1', studentId: '6710152', firstName: 'พิมพ์ชนก', lastName: 'โพธิ์ทอง', fullName: 'พิมพ์ชนก โพธิ์ทอง', yearLevel: '1', classGroup: '12(C1)', phone: '081-234-5678', status: 'active', createdAt: new Date().toISOString() },
        { id: 's2', studentId: '6710153', firstName: 'พิมพ์ญาดา', lastName: 'ลิ้มศรีอรุณ', fullName: 'พิมพ์ญาดา ลิ้มศรีอรุณ', yearLevel: '1', classGroup: '12(C1)', phone: '081-234-5679', status: 'active', createdAt: new Date().toISOString() },
        { id: 's3', studentId: '6710154', firstName: 'พิมพ์นารา', lastName: 'ทองเฉลิม', fullName: 'พิมพ์นารา ทองเฉลิม', yearLevel: '1', classGroup: '12(C1)', phone: '081-234-5680', status: 'active', createdAt: new Date().toISOString() },
        { id: 's4', studentId: '6710155', firstName: 'พิมพ์นารา', lastName: 'หนูจบ', fullName: 'พิมพ์นารา หนูจบ', yearLevel: '1', classGroup: '12(C1)', phone: '081-234-5681', status: 'active', createdAt: new Date().toISOString() },
        { id: 's5', studentId: '6710156', firstName: 'พิมพ์ลภัส', lastName: 'ภิระบรรณ์', fullName: 'พิมพ์ลภัส ภิระบรรณ์', yearLevel: '1', classGroup: '12(C1)', phone: '081-234-5682', status: 'active', createdAt: new Date().toISOString() },
        { id: 's6', studentId: '6710157', firstName: 'พิมพ์วรรณ', lastName: 'ไพโรจน์', fullName: 'พิมพ์วรรณ ไพโรจน์', yearLevel: '1', classGroup: '12(C1)', phone: '081-234-5683', status: 'active', createdAt: new Date().toISOString() },
        { id: 's7', studentId: '6710158', firstName: 'พิมลวรรณ', lastName: 'คงศิริ', fullName: 'พิมลวรรณ คงศิริ', yearLevel: '1', classGroup: '12(C1)', phone: '081-234-5684', status: 'active', createdAt: new Date().toISOString() },
        { id: 's8', studentId: '6710159', firstName: 'ภัคจิรา', lastName: 'อยู่ในวงศ์', fullName: 'ภัคจิรา อยู่ในวงศ์', yearLevel: '1', classGroup: '12(C1)', phone: '081-234-5685', status: 'active', createdAt: new Date().toISOString() },
        // Page 2
        { id: 's9', studentId: '6710160', firstName: 'ภัคจีราภรณ์', lastName: 'หอมขจร', fullName: 'ภัคจีราภรณ์ หอมขจร', yearLevel: '1', classGroup: '13(C2)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's10', studentId: '6710161', firstName: 'ภัทรวดี', lastName: 'โจมสติ', fullName: 'ภัทรวดี โจมสติ', yearLevel: '1', classGroup: '13(C2)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's11', studentId: '6710162', firstName: 'ภัทรินทร์', lastName: 'สุดดี', fullName: 'ภัทรินทร์ สุดดี', yearLevel: '1', classGroup: '13(C2)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's12', studentId: '6710163', firstName: 'ภัศวา', lastName: 'รัตนไกวัล', fullName: 'ภัศวา รัตนไกวัล', yearLevel: '1', classGroup: '13(C2)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's13', studentId: '6710164', firstName: 'ภาวิดา', lastName: 'เสาวคนธ์', fullName: 'ภาวิดา เสาวคนธ์', yearLevel: '1', classGroup: '13(C2)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's14', studentId: '6710165', firstName: 'ภาวินี', lastName: 'พรชัยกรกุล', fullName: 'ภาวินี พรชัยกรกุล', yearLevel: '1', classGroup: '13(C2)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's15', studentId: '6710166', firstName: 'ภูฐิตาภา', lastName: 'มงคลมล', fullName: 'ภูฐิตาภา มงคลมล', yearLevel: '1', classGroup: '13(C2)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's16', studentId: '6710167', firstName: 'มัญฑิตา', lastName: 'ขวัญคง', fullName: 'มัญฑิตา ขวัญคง', yearLevel: '1', classGroup: '13(C2)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        // Page 3
        { id: 's17', studentId: '6710168', firstName: 'มีนา', lastName: 'ลุทะภาค', fullName: 'มีนา ลุทะภาค', yearLevel: '1', classGroup: '14(C3)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's18', studentId: '6710169', firstName: 'ยศวดี', lastName: 'ทองทาบ', fullName: 'ยศวดี ทองทาบ', yearLevel: '1', classGroup: '14(C3)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's19', studentId: '6710170', firstName: 'รฐนนท์', lastName: 'เล็กใจซื่อ', fullName: 'รฐนนท์ เล็กใจซื่อ', yearLevel: '1', classGroup: '14(C3)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's20', studentId: '6710171', firstName: 'รัชดาภรณ์', lastName: 'ประเสริฐสุข', fullName: 'รัชดาภรณ์ ประเสริฐสุข', yearLevel: '1', classGroup: '14(C3)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's21', studentId: '6710172', firstName: 'รัตนาภรณ์', lastName: 'จันเทพา', fullName: 'รัตนาภรณ์ จันเทพา', yearLevel: '1', classGroup: '14(C3)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's22', studentId: '6710173', firstName: 'รุจิกร', lastName: 'โกยทอง', fullName: 'รุจิกร โกยทอง', yearLevel: '1', classGroup: '14(C3)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's23', studentId: '6710174', firstName: 'ลักษิกา', lastName: 'อัตวัฒนา', fullName: 'ลักษิกา อัตวัฒนา', yearLevel: '1', classGroup: '14(C3)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
        { id: 's24', studentId: '6710175', firstName: 'วชิรวิชญ์', lastName: 'จันทร์ต้อย', fullName: 'วชิรวิชญ์ จันทร์ต้อย', yearLevel: '1', classGroup: '14(C3)', phone: '-', status: 'active', createdAt: new Date().toISOString() },
      ];
      storage.set('students', initialStudents);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes - redirected to dashboard since we have no login system */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/teacher/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
          <Route path="/unauthorized" element={<Navigate to="/dashboard" replace />} />

          {/* Student Public Search Pathway (Read-only) */}
          <Route path="/student" element={<StudentSearch />} />
          <Route path="/student/profile" element={<StudentProfile />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
