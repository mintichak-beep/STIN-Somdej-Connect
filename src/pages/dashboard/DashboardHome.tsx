import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { AppLayout } from '../../components/AppLayout';
import { TeacherTabs } from '../../components/tabs/TeacherTabs';
import { StudentTabs } from '../../components/tabs/StudentTabs';

export function DashboardHome() {
  const { isTeacher } = useRole();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {isTeacher ? (
        <TeacherTabs activeTab={activeTab} />
      ) : (
        <StudentTabs activeTab={activeTab} />
      )}
    </AppLayout>
  );
}

export default DashboardHome;
