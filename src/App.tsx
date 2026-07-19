import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { PublicRoute } from './components/PublicRoute';
import { LandingPage } from './pages/LandingPage';
import { StudentSearch } from './pages/StudentSearch';
import { StudentProfile } from './pages/StudentProfile';
import { TeacherLogin } from './pages/TeacherLogin';
import { ForgotPassword } from './pages/ForgotPassword';
import { Unauthorized } from './pages/Unauthorized';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing / Welcome Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Student Access Portal (No Auth Required) */}
          <Route path="/student" element={<StudentSearch />} />
          <Route path="/student/profile" element={<StudentProfile />} />

          {/* Teacher Auth Routes */}
          <Route
            path="/teacher/login"
            element={
              <PublicRoute>
                <TeacherLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={<Navigate to="/teacher/login" replace />}
          />
          
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Secure Teacher Dashboard Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <AuthGuard allowedRoles={['teacher', 'Teacher']}>
                <Dashboard />
              </AuthGuard>
            }
          />

          {/* Backwards Compatibility / Fallback redirects */}
          <Route
            path="/dashboard"
            element={<Navigate to="/teacher/dashboard" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
