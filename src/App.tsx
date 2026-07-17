import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { Unauthorized } from './pages/Unauthorized';
import { Dashboard } from './pages/Dashboard';
import { UtilityPage } from './pages/utilities/UtilityPage';

import { AcademicYearPage } from './pages/academic-years/AcademicYearPage';
import { AcademicYearForm } from './pages/academic-years/AcademicYearForm';
import { AcademicYearDetail } from './pages/academic-years/AcademicYearDetail';

import { SemesterPage } from './pages/semesters/SemesterPage';
import { SemesterForm } from './pages/semesters/SemesterForm';
import { SemesterDetail } from './pages/semesters/SemesterDetail';

import { HospitalListPage } from './pages/hospitals/HospitalListPage';
import { HospitalCreatePage } from './pages/hospitals/HospitalCreatePage';
import { HospitalEditPage } from './pages/hospitals/HospitalEditPage';
import { HospitalDetailPage } from './pages/hospitals/HospitalDetailPage';

import { BuildingListPage } from './pages/buildings/BuildingListPage';
import { BuildingCreatePage } from './pages/buildings/BuildingCreatePage';
import { BuildingEditPage } from './pages/buildings/BuildingEditPage';
import { BuildingDetailPage } from './pages/buildings/BuildingDetailPage';

import { FloorListPage } from './pages/floors/FloorListPage';
import { FloorCreatePage } from './pages/floors/FloorCreatePage';
import { DashboardAnalyticsPage } from './pages/reports/DashboardAnalyticsPage';
import { AccommodationReportPage } from './pages/reports/AccommodationReportPage';
import { TransportationReportPage } from './pages/reports/TransportationReportPage';
import { HospitalReportPage } from './pages/reports/HospitalReportPage';
import { StudentReportPage } from './pages/reports/StudentReportPage';
import { OccupancyReportPage } from './pages/reports/OccupancyReportPage';
import { ExportCenterPage } from './pages/reports/ExportCenterPage';
import { FloorEditPage } from './pages/floors/FloorEditPage';
import { FloorDetailPage } from './pages/floors/FloorDetailPage';
import { RoomAllocationPage } from './pages/room-allocation/RoomAllocationPage';
import { WorkflowPage } from './pages/workflow/WorkflowPage';
import { ClinicalWardsPage } from './pages/clinical-wards/ClinicalWardsPage';
import { StudentListPage } from './pages/students/StudentListPage';
import { VehicleListPage } from './pages/vehicles/VehicleListPage';
import { DriverListPage } from './pages/drivers/DriverListPage';
import { TransportationSchedulePage } from './pages/transportation/TransportationSchedulePage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes with Guard redirecting logged-in users away from auth forms */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Unauthorized page fallback */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes guarded by authentication and role requirements */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute feature="dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute feature="profile">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Academic Years Protected Routes */}
          <Route
            path="/academic-years"
            element={
              <ProtectedRoute feature="academicYear">
                <AcademicYearPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic-years/create"
            element={
              <ProtectedRoute feature="academicYear">
                <AcademicYearForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic-years/:id"
            element={
              <ProtectedRoute feature="academicYear">
                <AcademicYearDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic-years/:id/edit"
            element={
              <ProtectedRoute feature="academicYear">
                <AcademicYearForm />
              </ProtectedRoute>
            }
          />

          {/* Semester Terms Protected Routes */}
          <Route
            path="/semesters"
            element={
              <ProtectedRoute feature="semester">
                <SemesterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/semesters/create"
            element={
              <ProtectedRoute feature="semester">
                <SemesterForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/semesters/:id"
            element={
              <ProtectedRoute feature="semester">
                <SemesterDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/semesters/:id/edit"
            element={
              <ProtectedRoute feature="semester">
                <SemesterForm />
              </ProtectedRoute>
            }
          />

          {/* Hospital Management Protected Routes */}
          <Route
            path="/hospitals"
            element={
              <ProtectedRoute feature="hospital">
                <HospitalListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals/create"
            element={
              <ProtectedRoute feature="hospital">
                <HospitalCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals/:id"
            element={
              <ProtectedRoute feature="hospital">
                <HospitalDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals/:id/edit"
            element={
              <ProtectedRoute feature="hospital">
                <HospitalEditPage />
              </ProtectedRoute>
            }
          />

          {/* Buildings Management Protected Routes */}
          <Route
            path="/buildings"
            element={
              <ProtectedRoute feature="building">
                <BuildingListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buildings/create"
            element={
              <ProtectedRoute feature="building">
                <BuildingCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buildings/:id"
            element={
              <ProtectedRoute feature="building">
                <BuildingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buildings/:id/edit"
            element={
              <ProtectedRoute feature="building">
                <BuildingEditPage />
              </ProtectedRoute>
            }
          />

          {/* Floors Management Protected Routes */}
          <Route
            path="/floors"
            element={
              <ProtectedRoute feature="building">
                <FloorListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/floors/create"
            element={
              <ProtectedRoute feature="building">
                <FloorCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/floors/:id"
            element={
              <ProtectedRoute feature="building">
                <FloorDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/floors/:id/edit"
            element={
              <ProtectedRoute feature="building">
                <FloorEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute feature="building">
                <StudentListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room-allocation"
            element={
              <ProtectedRoute feature="building">
                <RoomAllocationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflow"
            element={
              <ProtectedRoute feature="building">
                <WorkflowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinical-wards"
            element={
              <ProtectedRoute feature="building">
                <ClinicalWardsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/vehicles" element={<VehicleListPage />} />
          <Route path="/drivers" element={<DriverListPage />} />
          <Route path="/transportation" element={<TransportationSchedulePage />} />
          <Route path="/reports/dashboard" element={<DashboardAnalyticsPage />} />
          <Route path="/reports/accommodation" element={<AccommodationReportPage />} />
          <Route path="/reports/transportation" element={<TransportationReportPage />} />
          <Route path="/reports/hospitals" element={<HospitalReportPage />} />
          <Route path="/reports/students" element={<StudentReportPage />} />
          <Route path="/reports/occupancy" element={<OccupancyReportPage />} />
          <Route path="/reports/export" element={<ExportCenterPage />} />
          <Route
            path="/utilities"
            element={
              <ProtectedRoute>
                <UtilityPage />
              </ProtectedRoute>
            }
          />

          {/* Fallbacks */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

