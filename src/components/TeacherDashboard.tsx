import React, { useState, useEffect } from "react";
import { Users, Building2, Hospital, Bed, Bus, Zap } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { practiceAssignmentService } from "../services/practiceAssignment.service";

export function TeacherDashboard() {
  const [stats, setStats] = useState([
    {
      title: "Students Assigned",
      value: "0",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Practice Groups",
      value: "0",
      icon: Users,
      color: "text-indigo-600",
    },
    {
      title: "Hospitals Used",
      value: "0",
      icon: Hospital,
      color: "text-emerald-600",
    },
    {
      title: "Active Courses",
      value: "0",
      icon: Building2,
      color: "text-purple-600",
    },
    { title: "Van Trips", value: "8", icon: Bus, color: "text-orange-600" },
    { title: "Pending Tasks", value: "3", icon: Zap, color: "text-red-600" },
  ]);

  useEffect(() => {
    async function fetchData() {
      const assignments = await practiceAssignmentService.getAll();

      const uniqueStudents = new Set(assignments.map((a) => a.studentId)).size;
      const uniqueGroups = new Set(assignments.map((a) => a.practiceGroupId))
        .size;
      const uniqueHospitals = new Set(assignments.map((a) => a.trainingSiteId))
        .size;
      const uniqueCourses = new Set(assignments.map((a) => a.courseId)).size;

      setStats((prev) => [
        { ...prev[0], value: uniqueStudents.toString() },
        { ...prev[1], value: uniqueGroups.toString() },
        { ...prev[2], value: uniqueHospitals.toString() },
        { ...prev[3], value: uniqueCourses.toString() },
        prev[4],
        prev[5],
      ]);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Teacher Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <DashboardCard key={i} title={stat.title} hoverEffect={true}>
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg bg-gray-50 dark:bg-zinc-800 ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
