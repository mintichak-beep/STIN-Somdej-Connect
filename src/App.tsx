import { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { StudentManagement } from './pages/StudentManagement';
import { TeacherManagement } from './pages/TeacherManagement';
import { HospitalManagement } from './pages/HospitalManagement';
import { RoomManagement } from './pages/RoomManagement';
import { VanManagement } from './pages/VanManagement';
import { AllocationManagement } from './pages/AllocationManagement';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { UtilityBilling } from './pages/UtilityBilling';
import { StudentUtilities } from './pages/StudentUtilities';
import { Login } from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { seedDatabaseIfEmpty } from './services/seed.service';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    seedDatabaseIfEmpty();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'hospitals':
        return <HospitalManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'utility-billing':
        return <UtilityBilling />;
      case 'student-utilities':
        return <StudentUtilities />;
      case 'vans':
        return <VanManagement />;
      case 'allocations':
        return <AllocationManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AppLayout>
  );
}
