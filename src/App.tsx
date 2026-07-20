import { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { StudentManagement } from './pages/StudentManagement';
import { StudentDetails } from './pages/StudentDetails';
import { SubjectManagement } from './pages/SubjectManagement';
import { RoomManagement } from './pages/RoomManagement';
import { VanManagement } from './pages/VanManagement';
import { VanTrips } from './pages/VanTrips';
import { Reports } from './pages/Reports';
import { UtilityBilling } from './pages/UtilityBilling';
import { PaymentVerification } from './pages/PaymentVerification';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentUtilities } from './pages/StudentUtilities';
import { MyTransportation } from './pages/MyTransportation';
import { seedDatabaseIfEmpty } from './services/seed.service';

import { TeacherManagement } from './pages/TeacherManagement';

export default function App() {
  const [role, setRole] = useState<'Teacher' | 'Student' | null>(() => {
    return localStorage.getItem('user_role') as 'Teacher' | 'Student' | null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    seedDatabaseIfEmpty();
  }, []);

  const handleSelectRole = (selectedRole: 'Teacher' | 'Student') => {
    localStorage.setItem('user_role', selectedRole);
    setRole(selectedRole);
    setActiveTab('dashboard');
  };

  const handleSwitchRole = () => {
    localStorage.removeItem('user_role');
    setRole(null);
    setActiveTab('dashboard');
    setSelectedStudentId(null);
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('student-details');
  };

  if (!role) {
    return <LandingPage onSelectRole={handleSelectRole} />;
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
        case 'vans':
          return <VanManagement />;
        case 'van-trips':
          return <VanTrips />;
        case 'teachers':
          return <TeacherManagement />;
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
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard onNavigateToBills={() => setActiveTab('student-utilities')} />;
        case 'student-utilities':
          return <StudentUtilities />;
        case 'my-transportation':
          return <MyTransportation />;
        default:
          return <StudentDashboard onNavigateToBills={() => setActiveTab('student-utilities')} />;
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
