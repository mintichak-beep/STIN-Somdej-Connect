import React, { useEffect, useState } from "react";
import {
  Loader2,
  User,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  studentDashboardService,
  StudentDashboardData,
} from "../services/studentDashboard.service";

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (user) {
        // TODO: Implement Firestore data fetching
        const dashboardData =
          await studentDashboardService.getDashboardData(user.uid);
        setData(dashboardData);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!data) return <div>No data available</div>;

  const currentPractice =
    data.practiceAssignments.find(
      (pa) => pa.status === "active" || pa.status === "assigned",
    ) || data.practiceAssignments[0];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      
      {/* Profile Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <User className="h-5 w-5" /> Profile
        </h2>
        {data.profile ? (
          <div className="space-y-2">
            <p><strong>Student ID:</strong> {data.profile.studentId}</p>
            <p><strong>Name:</strong> {data.profile.fullName}</p>
            <p><strong>Email:</strong> {data.profile.email}</p>
          </div>
        ) : (
          <p className="text-gray-500">Profile data not yet available.</p>
        )}
      </div>

      {/* Practice Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5" /> Practice Information
        </h2>
        {currentPractice ? (
          <div className="space-y-2">
            <p><strong>Course:</strong> {currentPractice.course?.name || "N/A"}</p>
            <p><strong>Practice Group:</strong> {currentPractice.trainingGroup?.name || "N/A"}</p>
            <p><strong>Hospital:</strong> {currentPractice.trainingSite?.name || "N/A"}</p>
          </div>
        ) : (
          <p className="text-gray-500">Practice information not yet available.</p>
        )}
      </div>
    </div>
  );
}
