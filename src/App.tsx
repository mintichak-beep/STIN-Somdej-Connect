import { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { StudentManagement } from './pages/StudentManagement';
import { StudentDetails } from './pages/StudentDetails';
import { SubjectManagement } from './pages/SubjectManagement';
import { RoomManagement } from './pages/RoomManagement';
import { VanTrips } from './pages/VanTrips';
import { WeeklyRoomAssignmentPage } from './pages/WeeklyRoomAssignment';
import { Reports } from './pages/Reports';
import { UtilityBilling } from './pages/UtilityBilling';
import { PaymentVerification } from './pages/PaymentVerification';
import { WelcomePage } from './pages/WelcomePage';
import { StudentSelectionPage } from './pages/StudentSelectionPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentUtilities } from './pages/StudentUtilities';
import { MyTransportation } from './pages/MyTransportation';
import { TeacherManagement } from './pages/TeacherManagement';
import { TeacherProfile } from './pages/TeacherProfile';
import { TeacherDetails } from './pages/TeacherDetails';
import { PracticeTimetable } from './pages/PracticeTimetable';
import { PracticeSiteManagement } from './pages/PracticeSiteManagement';
import { WelcomeSettings } from './pages/WelcomeSettings';
import { Announcements } from "./pages/Announcements";
import { DutyScheduleManagement } from './pages/DutyScheduleManagement';
import { StudentDutySchedule } from './pages/StudentDutySchedule';
import { AcademicScheduleManagement } from './pages/AcademicScheduleManagement';
import { ClinicalPracticePlanner } from './pages/ClinicalPracticePlanner';
import { ClinicalSites } from './pages/ClinicalSites';
import { Wards } from './pages/Wards';
import { StudentGroups } from './pages/StudentGroups';
import { StudentClinicalPractice } from './pages/StudentClinicalPractice';
import { StudentAcademicSchedule } from './pages/StudentAcademicSchedule';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user } = useAuth();
  const [role, setRole] = useState<'Teacher' | 'Student' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(() => {
    return localStorage.getItem('selected_student_id');
  });
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const handleSelectRole = (selectedRole: 'Teacher' | 'Student') => {
    setRole(selectedRole);
    setActiveTab('dashboard');
  };

  const handleSwitchRole = () => {
    localStorage.removeItem('selected_student_id');
    setRole(null);
    setActiveTab('dashboard');
    setSelectedStudentId(null);
  };

  const handleSelectStudent = (studentId: string) => {
    localStorage.setItem('selected_student_id', studentId);
    setSelectedStudentId(studentId);
    setActiveTab('dashboard');
  };

  const handleChangeStudent = () => {
    localStorage.removeItem('selected_student_id');
    setSelectedStudentId(null);
  };

  if (!role) {
    return <WelcomePage onSelectRole={handleSelectRole} onSelectStudent={handleSelectStudent} />;
  }

  const renderContent = () => {
    if (role === 'Teacher') {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard />;
        case 'students':
          return <StudentManagement onSelectStudent={handleSelectStudent} />;
        case 'student-details':
          return <StudentDetails studentId={selectedStudentId!} onBack={() => setActiveTab('students')} />;
        case 'rooms':
          return <RoomManagement />;
        case 'room-assignments':
          return <WeeklyRoomAssignmentPage />;
        case 'van-trips':
          return <VanTrips />;
        case 'my-transportation':
          return <MyTransportation userId={user?.uid || 'dev-teacher-id'} role="Teacher" />;
        case 'teachers':
          return <TeacherManagement onSelectTeacher={(id) => {
            setSelectedTeacherId(id);
            setActiveTab('teacher-details');
          }} />;
        case 'teacher-details':
          return <TeacherDetails teacherId={selectedTeacherId!} onBack={() => setActiveTab('teachers')} />;
        case 'profile':
          return <TeacherProfile />;
        case 'subjects':
          return <SubjectManagement />;
        case 'clinical-planner':
        case 'practice-sites':
        case 'academic-schedules':
        case 'duty-management':
        case 'practice-timetable':
          return <ClinicalPracticePlanner />;
        case 'clinical-sites':
          return <ClinicalSites />;
        case 'wards':
          return <Wards />;
        case 'student-groups':
          return <StudentGroups />;
        case 'utility-billing':
          return <UtilityBilling />;
        case 'payment-verification':
          return <PaymentVerification />;
        case 'reports':
          return <Reports />;
        case 'welcome-settings':
          return <WelcomeSettings />;
        case 'announcements':
          return <Announcements role="Teacher" />;
        default:
          return <Dashboard />;
      }
    } else {
      // Student Portal
      if (!selectedStudentId) {
        return <StudentSelectionPage onSelectStudent={handleSelectStudent} />;
      }
      
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard studentId={selectedStudentId} onChangeStudent={handleChangeStudent} onNavigateToBills={() => setActiveTab('student-utilities')} />;
        case 'student-utilities':
          return <StudentUtilities studentId={selectedStudentId} />;
        case 'student-academic-schedule':
          return <StudentAcademicSchedule />;
        case 'clinical-duty':
          return <StudentClinicalPractice studentId={selectedStudentId} />;
        case 'duty-schedule':
          return <StudentDutySchedule studentId={selectedStudentId} />;
        case 'my-transportation':
          return <MyTransportation userId={selectedStudentId} role="Student" />;
        case 'announcements':
          return <Announcements role="Student" />;
        default:
          return <StudentDashboard studentId={selectedStudentId} onChangeStudent={handleChangeStudent} onNavigateToBills={() => setActiveTab('student-utilities')} />;
      }
    }
  };

  return (
    <AppLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      role={role} 
      onSwitchRole={handleSwitchRole}
    >
      {renderContent()}
    </AppLayout>
  );
}
