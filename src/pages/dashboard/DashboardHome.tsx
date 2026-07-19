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
import { StudentManagementCenter } from "../StudentManagementCenter";
import { StudentImportCenter } from "../StudentImportCenter";
import { PracticeAssignmentCenter } from "../PracticeAssignmentCenter";
import { PracticeScheduleCenter } from "../PracticeScheduleCenter";
import { CourseCenter } from "../CourseCenter";
import { HospitalCenter } from "../HospitalCenter";
import { PracticeGroupCenter } from "../PracticeGroupCenter";
import { MyPractice } from "../MyPractice";
import { TeacherOperationCenter } from "../TeacherOperationCenter";
import { TeacherOperationDashboard } from "../TeacherOperationDashboard";
import { ReportsCenter } from "../ReportsCenter";
import { SystemActivityLog } from "../SystemActivityLog";
import PDFImportCenter from "../PDFImportCenter";

function AccessDeniedPlaceholder() {
  const { switchRole } = useAuth() as any;
  return (
    <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-800 text-center shadow-lg">
      <div className="h-20 w-20 bg-red-50 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mb-8">
        <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white mb-3 font-sans tracking-tight">
        Access Restricted
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-10 leading-relaxed font-sans">
        This area is restricted to authorized instructors and coordinators. Please switch your role to <b>Teacher</b> to access these management tools.
      </p>
      <button
        onClick={() => switchRole?.('Teacher')}
        className="px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-semibold rounded-2xl transition-all shadow-md cursor-pointer"
      >
        Switch to Teacher Role
      </button>
    </div>
  );
}

export function DashboardHome() {
  const { isTeacher, isStudent } = useRole();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" ? (
        isTeacher ? (
          <TeacherOperationDashboard />
        ) : (
          <StudentDashboard />
        )
      ) : activeTab === "operation-center" ? (
        isTeacher ? (
          <TeacherOperationCenter />
        ) : (
          <AccessDeniedPlaceholder />
        )
      ) : activeTab === "reports" ? (
        isTeacher ? (
          <ReportsCenter />
        ) : (
          <AccessDeniedPlaceholder />
        )
      ) : activeTab === "courses" ? (
        isTeacher ? <CourseCenter /> : <AccessDeniedPlaceholder />
      ) : activeTab === "hospitals-master" ? (
        isTeacher ? <HospitalCenter /> : <AccessDeniedPlaceholder />
      ) : activeTab === "practice-groups-master" ? (
        isTeacher ? <PracticeGroupCenter /> : <AccessDeniedPlaceholder />
      ) : activeTab === "practice-assignments" ? (
        <PracticeAssignmentCenter />
      ) : activeTab === "practice-schedule-center" ? (
        isTeacher ? <PracticeScheduleCenter /> : <AccessDeniedPlaceholder />
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
          <div className="p-6 text-center font-bold text-gray-500">Evaluation Management (To be added)</div>
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
      ) : activeTab === "pdf-analysis" ? (
        <PDFImportCenter />
      ) : activeTab === "students" ? (
        isTeacher ? <StudentManagementCenter /> : <AccessDeniedPlaceholder />
      ) : activeTab === "import-students" ? (
        isTeacher ? <StudentImportCenter /> : <AccessDeniedPlaceholder />
      ) : activeTab === "activity-log" ? (
        isTeacher ? <SystemActivityLog /> : <AccessDeniedPlaceholder />
      ) : isTeacher ? (
        <TeacherTabs activeTab={activeTab} />
      ) : (
        <StudentTabs activeTab={activeTab} />
      )}
    </AppLayout>
  );
}

export default DashboardHome;
