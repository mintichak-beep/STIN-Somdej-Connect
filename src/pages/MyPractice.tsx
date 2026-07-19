import React, { useState, useEffect } from "react";
import { practiceAssignmentService } from "../services/practiceAssignment.service";
import { PracticeAssignment } from "../types/db";
import { useAuth } from "../hooks/useAuth";
import { MapPin, User, Calendar, Briefcase, Building } from "lucide-react";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export function MyPractice() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<PracticeAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user?.uid) {
        // Extract student ID from mock email (e.g., 6610001@stin.ac.th -> 6610001)
        const mockStudentId = user.email?.split("@")[0] || "";
        const allData = await practiceAssignmentService.getAll();
        // Filter by the student's ID based on login
        const studentAssignments = allData.filter(
          (a) =>
            a.studentId === mockStudentId || mockStudentId.includes("student"),
        );
        setAssignments(studentAssignments);
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Practice</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.length > 0 ? (
          assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-zinc-900 p-6 rounded-xl border relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-zinc-800 rounded-lg">
                    <Briefcase className="text-blue-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{a.courseId}</h4>
                    <p className="text-sm text-gray-500">
                      Group {a.practiceGroupId}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${a.status === "assigned" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                >
                  {a.status === "assigned" ? "Assigned" : a.status || "Active"}
                </span>
              </div>
              <div className="space-y-4 text-sm bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-5 w-5 mt-0.5 text-gray-400" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                      Practice Site
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {a.trainingSiteId}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <Building className="h-5 w-5 mt-0.5 text-gray-400" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                      Department / Ward
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {a.wardDepartment}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <User className="h-5 w-5 mt-0.5 text-gray-400" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                      Supervisor
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {a.teacherId}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 mt-0.5 text-gray-400" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                      Practice Period
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {a.startDate} to {a.endDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-dashed">
            <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No active practice assignments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
