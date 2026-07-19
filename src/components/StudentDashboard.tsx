import React, { useEffect, useState } from "react";
import {
  Hospital,
  Calendar,
  User,
  Bed,
  Bus,
  Zap,
  Megaphone,
  FileText,
  Bell,
  Check,
  MapPin,
  Loader2,
  Activity,
} from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { useAuth } from "../hooks/useAuth";
import {
  studentDashboardService,
  StudentDashboardData,
} from "../services/studentDashboard.service";
import { mockDB } from "../services/mockData";

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [readAnns, setReadAnns] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (user) {
        let studentId = user.uid;
        // In this mock setup, user email might map to a student in mockDB.
        const students = mockDB.getStudents();
        const foundStudent = students.find((s) => s.email === user.email);
        if (foundStudent) {
          studentId = user.email?.split("@")[0] || "";
        }

        const dashboardData =
          await studentDashboardService.getDashboardData(studentId);
        setData(dashboardData);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const markNotifAsRead = (id: string) => {
    // Update mockDB for persistence
    const allNotifs = mockDB.getNotifications();
    const updatedAll = allNotifs.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );
    mockDB.saveNotifications(updatedAll);

    // Update local state
    if (data) {
      setData({
        ...data,
        notifications: data.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
      });
    }
  };

  const markAnnRead = (id: string) => {
    if (!readAnns.includes(id)) {
      setReadAnns((prev) => [...prev, id]);
    }
  };

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
  const currentTransport = data.transportation[0];
  const currentRoom = data.dormitory[0];
  const currentUtility = data.utilities[0];

  const unreadAnnouncements = data.announcements.filter(
    (a) => !readAnns.includes(a.id),
  ).length;
  const unreadNotifications = data.notifications.filter(
    (n) => !n.isRead,
  ).length;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
          Student Dashboard
        </h2>
        {unreadNotifications > 0 && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold dark:bg-red-900/30 dark:text-red-400">
            <Bell className="w-4 h-4" />
            {unreadNotifications} New
          </div>
        )}
      </div>

      {/* Profile & Practice Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                Profile Information
              </h3>
              <p className="text-xs text-zinc-500 font-medium uppercase">Personal Records</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-zinc-800/50">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Student ID</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{data.profile?.studentId || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-zinc-800/50">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Full Name</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{data.profile?.fullName || data.profile?.studentName || user?.displayName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Email</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{data.profile?.email || user?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Practice Information Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                Practice Information
              </h3>
              <p className="text-xs text-zinc-500 font-medium uppercase">Current Placement</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-zinc-800/50">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Course</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{currentPractice?.course?.name || 'Pending Assignment'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-zinc-800/50">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Practice Group</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{currentPractice?.trainingGroup?.name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Hospital</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{currentPractice?.trainingSite?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <DashboardCard title="Current Course" hoverEffect>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p
                className="text-xs font-bold text-zinc-900 dark:text-white truncate w-24"
                title={currentPractice?.course?.name || "N/A"}
              >
                {currentPractice?.course?.name || "N/A"}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Training Hospital" hoverEffect>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
              <Hospital className="w-4 h-4" />
            </div>
            <div>
              <p
                className="text-xs font-bold text-zinc-900 dark:text-white truncate w-24"
                title={currentPractice?.trainingSite?.name || "N/A"}
              >
                {currentPractice?.trainingSite?.name || "N/A"}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Practice Period" hoverEffect>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30 dark:text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-900 dark:text-white">
                {currentPractice
                  ? `${new Date(currentPractice.startDate).toLocaleDateString()} - ${new Date(currentPractice.endDate).toLocaleDateString()}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Dormitory Room" hoverEffect>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
              <Bed className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate w-24">
                {currentRoom?.room?.roomNumber || "N/A"}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Transportation" hoverEffect>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-900 dark:text-white truncate w-24">
                {currentTransport?.schedule?.departureTime || "N/A"}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Utility Bills" hoverEffect>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg dark:bg-rose-900/30 dark:text-rose-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">
                {currentUtility?.paymentStatus || "No Bills"}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. My Practice */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-black text-zinc-900 dark:text-white uppercase">
              My Practice
            </h3>
          </div>

          {currentPractice ? (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 dark:bg-zinc-800/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">
                      {currentPractice.course?.name || "Unknown Course"}
                    </h4>
                    <p className="text-xs text-zinc-500 font-medium">
                      {currentPractice.courseId}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase dark:bg-blue-900/30 dark:text-blue-400">
                    {currentPractice.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                      Hospital
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {currentPractice.trainingSite?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                      Ward
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {currentPractice.wardDepartment || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                      Group
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {currentPractice.trainingGroup?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                      Teacher
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {currentPractice.teacher?.name || "N/A"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                      Period
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {new Date(currentPractice.startDate).toLocaleDateString()}{" "}
                      - {new Date(currentPractice.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-sm">
              No active practice assignments.
            </div>
          )}
        </div>

        {/* 3. My Transportation */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-900/20 dark:text-orange-400">
              <Bus className="w-5 h-5" />
            </div>
            <h3 className="font-black text-zinc-900 dark:text-white uppercase">
              My Transportation
            </h3>
          </div>

          {currentTransport ? (
            <div className="bg-slate-50 rounded-xl p-4 dark:bg-zinc-800/50 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {currentTransport.schedule?.pickupLocation}
                  </span>
                </div>
                <span className="text-zinc-400 text-xs">➔</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {currentTransport.schedule?.dropoffLocation}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                    Departure Time
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {currentTransport.schedule?.departureTime}
                  </span>
                </div>
                <div>
                  <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                    Van Number
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {currentTransport.vehicle?.plateNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                    Driver
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {currentTransport.driver?.name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                    Driver Phone
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {currentTransport.driver?.phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-sm">
              No transport assigned.
            </div>
          )}
        </div>

        {/* 4. My Dormitory */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-900/20 dark:text-indigo-400">
              <Bed className="w-5 h-5" />
            </div>
            <h3 className="font-black text-zinc-900 dark:text-white uppercase">
              My Dormitory
            </h3>
          </div>

          {currentRoom ? (
            <div className="bg-slate-50 rounded-xl p-4 dark:bg-zinc-800/50 space-y-3">
              <div className="flex justify-between items-start pb-3 border-b border-slate-200 dark:border-zinc-700">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                    {currentRoom.dormitory?.name || "Dormitory"}
                  </h4>
                  <p className="text-xs text-zinc-500 font-medium">
                    Room {currentRoom.room?.roomNumber || "Unknown"}
                  </p>
                </div>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-black uppercase dark:bg-indigo-900/30 dark:text-indigo-400">
                  Assigned
                </span>
              </div>

              <div className="text-xs mb-3">
                <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                  Contact Information
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {currentRoom.dormitory?.contactPerson || "N/A"} •{" "}
                  {currentRoom.dormitory?.phone || "N/A"}
                </span>
              </div>

              <div className="text-xs">
                <span className="block text-zinc-400 uppercase text-[9px] font-black mb-2">
                  Roommates ({currentRoom.roommates?.length || 0})
                </span>
                {currentRoom.roommates && currentRoom.roommates.length > 0 ? (
                  <ul className="space-y-1">
                    {currentRoom.roommates.map((rm, idx) => (
                      <li
                        key={idx}
                        className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2"
                      >
                        <User className="w-3 h-3 text-zinc-400" /> {rm}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-zinc-500 italic">No roommates</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-sm">
              No dormitory assigned.
            </div>
          )}
        </div>

        {/* 5. My Utilities */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg dark:bg-rose-900/20 dark:text-rose-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-black text-zinc-900 dark:text-white uppercase">
              My Utilities
            </h3>
          </div>

          {currentUtility ? (
            <div className="bg-slate-50 rounded-xl p-4 dark:bg-zinc-800/50 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-zinc-700">
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                  {currentUtility.utilityRecord?.month}{" "}
                  {currentUtility.utilityRecord?.year}
                </h4>
                <span
                  className={`px-2 py-1 rounded-md text-[10px] font-black uppercase 
                  ${
                    currentUtility.paymentStatus === "completed" ||
                    currentUtility.paymentStatus === "verified"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {currentUtility.paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                    Water Cost
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    ฿{currentUtility.utilityRecord?.waterAmount || 0}
                  </span>
                </div>
                <div>
                  <span className="block text-zinc-400 uppercase text-[9px] font-black mb-1">
                    Electricity Cost
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    ฿{currentUtility.utilityRecord?.electricityAmount || 0}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                  <span className="font-black text-zinc-900 dark:text-white uppercase">
                    Your Share
                  </span>
                  <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                    ฿{currentUtility.sharedAmount}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-sm">
              No pending utility bills.
            </div>
          )}
        </div>

        {/* 6. Announcement Center */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg dark:bg-zinc-800 dark:text-zinc-300">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="font-black text-zinc-900 dark:text-white uppercase">
                Latest Announcements
              </h3>
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md dark:bg-blue-900/30 dark:text-blue-400">
              {unreadAnnouncements} Unread
            </span>
          </div>

          <div className="space-y-3">
            {data.announcements.length > 0 ? (
              data.announcements.slice(0, 3).map((ann, idx) => {
                const isRead = readAnns.includes(ann.id);
                return (
                  <div
                    key={idx}
                    className={`flex gap-4 p-3 rounded-xl border ${isRead ? "bg-white border-slate-100 dark:bg-zinc-900 dark:border-zinc-800" : "bg-slate-50 border-slate-200 dark:bg-zinc-800/50 dark:border-zinc-700"}`}
                  >
                    <div className="shrink-0 pt-1">
                      {!isRead &&
                        (ann.priority === "urgent" ? (
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        ) : ann.priority === "important" ? (
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        ))}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4
                          className={`font-bold text-sm ${isRead ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-900 dark:text-white"}`}
                        >
                          {ann.title}
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap ml-2">
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p
                        className={`text-xs line-clamp-2 ${isRead ? "text-zinc-500 dark:text-zinc-500" : "text-zinc-600 dark:text-zinc-400"}`}
                      >
                        {ann.message}
                      </p>
                      {!isRead && (
                        <div className="mt-2 text-right">
                          <button
                            onClick={() => markAnnRead(ann.id)}
                            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition uppercase"
                          >
                            Mark as read
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-zinc-400 text-sm">
                No announcements at this time.
              </div>
            )}
          </div>
        </div>

        {/* 7. Document Center */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-900/20 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-black text-zinc-900 dark:text-white uppercase">
              My Documents
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.documents.required.length > 0 ? (
              data.documents.required.slice(0, 4).map((doc, idx) => {
                const submission = data.documents.submissions.find(
                  (s) => s.documentId === doc.id,
                );
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 border border-slate-100 rounded-xl dark:border-zinc-800"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white">
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500">
                        {doc.category}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {submission ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-md dark:bg-emerald-900/30 dark:text-emerald-400">
                          <Check className="w-3 h-3" /> {submission.status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded-md dark:bg-amber-900/30 dark:text-amber-400">
                          Pending
                        </span>
                      )}
                      <button className="text-[10px] font-black text-blue-600 uppercase hover:underline dark:text-blue-400">
                        {submission ? "View Status" : "Upload"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-6 text-zinc-400 text-sm">
                No required documents found.
              </div>
            )}
          </div>
        </div>

        {/* 8. Notification Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-900/20 dark:text-indigo-400">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-black text-zinc-900 dark:text-white uppercase">
                Notifications
              </h3>
            </div>
            <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-md dark:bg-red-900/30 dark:text-red-400">
              {unreadNotifications} Unread
            </span>
          </div>

          <div className="space-y-3">
            {data.notifications.length > 0 ? (
              data.notifications.slice(0, 4).map((notif, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 p-3 rounded-xl border ${notif.isRead ? "bg-white border-slate-100 dark:bg-zinc-900 dark:border-zinc-800" : "bg-slate-50 border-slate-200 dark:bg-zinc-800/50 dark:border-zinc-700"}`}
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        )}
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                          {notif.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap ml-2">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] font-black text-zinc-400 uppercase bg-zinc-100 px-2 py-0.5 rounded dark:bg-zinc-800">
                        {notif.type}
                      </span>
                      <div className="flex gap-3">
                        <button className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition uppercase">
                          View details
                        </button>
                        {!notif.isRead && (
                          <button
                            onClick={() => markNotifAsRead(notif.id)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition uppercase"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-zinc-400 text-sm">
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Visible only on small screens, handled by AppLayout generally, but this satisfies Part 9) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around md:hidden dark:bg-zinc-950 dark:border-zinc-800 z-50">
        <button className="flex flex-col items-center gap-1 p-2 text-red-600">
          <FileText className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
          <Hospital className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase">Practice</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
          <Bus className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase">Transport</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
          <Bed className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase">Dorm</span>
        </button>
      </div>
    </div>
  );
}
