import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users,
  MapPin,
  Bus,
  Bed,
  Zap,
  FileText,
  Megaphone,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  BookOpen,
} from "lucide-react";
import { teacherOperationService } from "../services/teacherOperation.service";
import { operationTaskService } from "../services/operationTask.service";
import { operationIssueService } from "../services/operationIssue.service";
import { OperationTask, OperationIssue } from "../types/db";

export function TeacherOperationCenter() {
  const [summary, setSummary] = useState<any>(null);
  const [tasks, setTasks] = useState<OperationTask[]>([]);
  const [issues, setIssues] = useState<OperationIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs for main content area
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "hospitals"
  >("overview");
  const [searchStudent, setSearchStudent] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sumData = await teacherOperationService.getSummaryData();
      const taskData = await operationTaskService.getAll();
      const issueData = await operationIssueService.getAll();

      setSummary(sumData);
      setTasks(taskData);
      setIssues(issueData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    const title = prompt("Enter task title:");
    if (!title) return;
    await operationTaskService.create({
      title,
      description: "New task created from quick action",
      priority: "normal",
      status: "pending",
      dueDate: new Date().toISOString(),
    });
    loadData();
  };

  const handleUpdateTaskStatus = async (
    id: string,
    status: "pending" | "processing" | "completed",
  ) => {
    await operationTaskService.update(id, { status });
    loadData();
  };

  const handleCreateIssue = async () => {
    const desc = prompt("Enter issue description:");
    if (!desc) return;
    await operationIssueService.create({
      category: "Practice",
      description: desc,
      priority: "normal",
      status: "pending",
    });
    loadData();
  };

  const handleUpdateIssueStatus = async (
    id: string,
    status: "pending" | "processing" | "resolved",
  ) => {
    await operationIssueService.update(id, { status });
    loadData();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Teacher Operation Center
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Central dashboard for managing nursing internship operations.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-700 transition">
            <Megaphone className="h-4 w-4" /> Announce
          </button>
          <button
            onClick={handleCreateTask}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" /> Task
          </button>
          <button
            onClick={handleCreateIssue}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-amber-700 transition"
          >
            <AlertCircle className="h-4 w-4" /> Issue
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <SummaryCard
          title="Active Courses"
          value={summary?.activeCourses || 0}
          icon={BookOpen}
          color="indigo"
        />
        <SummaryCard
          title="Training Students"
          value={`${summary?.assignedStudents}/${summary?.totalStudents}`}
          icon={Users}
          color="blue"
        />
        <SummaryCard
          title="Active Hospitals"
          value={summary?.activeHospitals || 0}
          icon={MapPin}
          color="emerald"
        />
        <SummaryCard
          title="Today's Trips"
          value={`${summary?.todayTrips} (${summary?.studentsTraveling} std)`}
          icon={Bus}
          color="amber"
        />
        <SummaryCard
          title="Dorm Occupancy"
          value={`${summary?.occupiedBeds}/${summary?.totalRooms}`}
          icon={Bed}
          color="purple"
        />
        <SummaryCard
          title="Pending Tasks"
          value={tasks.filter((t) => t.status !== "completed").length}
          icon={CheckCircle}
          color="rose"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Large area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === "overview" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === "students" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("hospitals")}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === "hospitals" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
            >
              Hospitals
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <h3 className="font-black text-zinc-900 dark:text-white uppercase mb-4">
                Current Internship Overview
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-black">Course</th>
                      <th className="px-4 py-3 font-black">Group</th>
                      <th className="px-4 py-3 font-black">Hospital</th>
                      <th className="px-4 py-3 font-black">Students</th>
                      <th className="px-4 py-3 font-black">Period</th>
                      <th className="px-4 py-3 font-black">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {summary?.practiceAssignments
                      ?.slice(0, 5)
                      .map((pa: any, i: number) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                            {pa.courseId || "Course"}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            {pa.practiceGroupId}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            {pa.hospitalId}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            {pa.studentIds?.length || 0}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-xs">
                            {pa.startDate} to {pa.endDate}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-black uppercase dark:bg-emerald-900/30 dark:text-emerald-400">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    {(!summary?.practiceAssignments ||
                      summary.practiceAssignments.length === 0) && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-zinc-500"
                        >
                          No active practice assignments
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-zinc-900 dark:text-white uppercase">
                  Student Monitoring
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search student ID or name"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-black">ID</th>
                      <th className="px-4 py-3 font-black">Name</th>
                      <th className="px-4 py-3 font-black">Course</th>
                      <th className="px-4 py-3 font-black">Hospital</th>
                      <th className="px-4 py-3 font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {summary?.students
                      ?.filter(
                        (s: any) =>
                          s.email
                            ?.toLowerCase()
                            .includes(searchStudent.toLowerCase()) ||
                          s.displayName
                            ?.toLowerCase()
                            .includes(searchStudent.toLowerCase()),
                      )
                      .slice(0, 10)
                      .map((s: any, i: number) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                            {s.email.split("@")[0]}
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                            {s.displayName}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            -
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            -
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline dark:text-indigo-400">
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "hospitals" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <h3 className="font-black text-zinc-900 dark:text-white uppercase mb-4">
                Hospital Monitoring
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-black">Name</th>
                      <th className="px-4 py-3 font-black">Students</th>
                      <th className="px-4 py-3 font-black">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {summary?.trainingSites
                      ?.slice(0, 5)
                      .map((h: any, i: number) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                            {h.name}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            {h.capacity || 0}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-black uppercase ${h.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400"}`}
                            >
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Today Operation Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
            <h3 className="font-black text-zinc-900 dark:text-white uppercase mb-4">
              Today's Operation
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-2">
                  Transportation ({summary?.trips?.length || 0})
                </h4>
                {summary?.trips?.slice(0, 2).map((trip: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-slate-50 p-2 rounded-lg dark:bg-zinc-800/50 mb-2 border border-slate-100 dark:border-zinc-700"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        Van {trip.vehicleId}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {trip.departureTime || "07:00 AM"}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded dark:bg-indigo-900/30 dark:text-indigo-400">
                      {trip.assignedStudents?.length || 0} pax
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-2">
                  Announcements
                </h4>
                {summary?.announcementsCount > 0 ? (
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30">
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold">
                      {summary.announcementsCount} active announcements
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">
                    No announcements today.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tasks Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-zinc-900 dark:text-white uppercase">
                Operation Tasks
              </h3>
              <button
                onClick={handleCreateTask}
                className="text-zinc-400 hover:text-indigo-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:bg-zinc-800/50 dark:border-zinc-700"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {task.title}
                      </h4>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          task.priority === "urgent"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : task.priority === "high"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleUpdateTaskStatus(task.id, e.target.value as any)
                        }
                        className="text-[10px] font-bold uppercase bg-transparent text-indigo-600 dark:text-indigo-400 border-none p-0 cursor-pointer focus:ring-0"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">
                  No tasks found.
                </p>
              )}
            </div>
          </div>

          {/* Issues Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-zinc-900 dark:text-white uppercase">
                Active Issues
              </h3>
            </div>
            <div className="space-y-3">
              {issues.length > 0 ? (
                issues
                  .filter((i) => i.status !== "resolved")
                  .slice(0, 5)
                  .map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 rounded-xl border border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400">
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium mb-3">
                        {issue.description}
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            handleUpdateIssueStatus(issue.id, "resolved")
                          }
                          className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">
                  No active issues.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex flex-col items-center justify-center text-center gap-2"
    >
      <div className={`p-2 rounded-lg ${colorClasses}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
        <p className="text-xl font-black text-zinc-900 dark:text-white">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
