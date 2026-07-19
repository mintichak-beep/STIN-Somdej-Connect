import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRole } from "../../hooks/useRole";
import { AppLayout } from "../../components/AppLayout";
import { TeacherTabs } from "../../components/tabs/TeacherTabs";
import { StudentTabs } from "../../components/tabs/StudentTabs";
import { TeacherDashboard } from "../../components/TeacherDashboard";
import { StudentDashboard } from "../../components/StudentDashboard";
import { DormitoryManagement } from "../DormitoryManagement";
import { TransportationManagement } from "../TransportationManagement";
import { UtilityManagement } from "../UtilityManagement";
import { StudentUtilities } from "../StudentUtilities";
import { SupervisionManagement } from "../SupervisionManagement";
import { StudentEvaluationView } from "../StudentEvaluationView";
import { HospitalManagement } from "../HospitalManagement";
import { Settings } from "../Settings";
import { UserManagement } from "../UserManagement";
import { DataManagement } from "../DataManagement";
import { SystemIssues } from "../SystemIssues";
import { UserFeedbackPage } from "../UserFeedbackPage";
import { AdminAnalytics } from "../AdminAnalytics";
import { StudentManagement } from "../StudentManagement";
import { PracticeAssignmentCenter } from "../PracticeAssignmentCenter";
import { PracticeScheduleCenter } from "../PracticeScheduleCenter";
import { MyPractice } from "../MyPractice";
import { TeacherOperationCenter } from "../TeacherOperationCenter";
import { ReportsCenter } from "../ReportsCenter";

export function DashboardHome() {
  const { isTeacher } = useRole();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" ? (
        isTeacher ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )
      ) : activeTab === "operation-center" ? (
        isTeacher ? (
          <TeacherOperationCenter />
        ) : (
          <div>Access Denied</div>
        )
      ) : activeTab === "reports" ? (
        isTeacher ? (
          <ReportsCenter />
        ) : (
          <div>Access Denied</div>
        )
      ) : activeTab === "practice-assignments" ? (
        <PracticeAssignmentCenter />
      ) : activeTab === "practice-schedule-center" ? (
        isTeacher ? <PracticeScheduleCenter /> : <div>Access Denied</div>
      ) : activeTab === "my-practice" ? (
        <MyPractice />
      ) : activeTab === "dorms" ? (
        <DormitoryManagement />
      ) : activeTab === "transportation" ? (
        <TransportationManagement />
      ) : activeTab === "utilities" ? (
        isTeacher ? (
          <UtilityManagement />
        ) : (
          <StudentUtilities />
        )
      ) : activeTab === "supervision" ? (
        <SupervisionManagement />
      ) : activeTab === "evaluations" ? (
        isTeacher ? (
          <div>Evaluation Management (To be added)</div>
        ) : (
          <StudentEvaluationView studentId={user?.uid || ""} />
        )
      ) : activeTab === "hospitals" ? (
        <HospitalManagement />
      ) : activeTab === "settings" ? (
        <Settings />
      ) : activeTab === "users" ? (
        <UserManagement />
      ) : activeTab === "data" ? (
        <DataManagement />
      ) : activeTab === "issues" ? (
        <SystemIssues />
      ) : activeTab === "feedback" ? (
        <UserFeedbackPage />
      ) : activeTab === "analytics" ? (
        <AdminAnalytics />
      ) : activeTab === "students" ? (
        <StudentManagement />
      ) : activeTab === "import-students" ? (
        isTeacher ? <StudentImportCenter /> : <div>Access Denied</div>
      ) : isTeacher ? (
        <TeacherTabs activeTab={activeTab} />
      ) : (
        <StudentTabs activeTab={activeTab} />
      )}
    </AppLayout>
  );
}

export default DashboardHome;
