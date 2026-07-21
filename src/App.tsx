import { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { StudentManagement } from './pages/StudentManagement';
import { StudentDetails } from './pages/StudentDetails';
import { SubjectManagement } from './pages/SubjectManagement';
import { RoomManagement } from './pages/RoomManagement';
import { VanManagement } from './pages/VanManagement';
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

export default function App() {
  const [role, setRole] = useState<'Teacher' | 'Student' | null>(() => {
    return localStorage.getItem('user_role') as 'Teacher' | 'Student' | null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(() => {
    return localStorage.getItem('selected_student_id');
  });
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const handleSelectRole = (selectedRole: 'Teacher' | 'Student') => {
    localStorage.setItem('user_role', selectedRole);
    setRole(selectedRole);
    setActiveTab('dashboard');
  };

  const handleSwitchRole = () => {
    localStorage.removeItem('user_role');
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
        case 'vans':
          return <VanManagement />;
        case 'van-trips':
          return <VanTrips />;
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
        case 'utility-billing':
          return <UtilityBilling />;
        case 'payment-verification':
          return <PaymentVerification />;
        case 'reports':
          return <Reports />;
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
        case 'my-transportation':
          return <MyTransportation studentId={selectedStudentId} />;
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
