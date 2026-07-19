import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  Users,
  MapPin,
  Bus,
  Bed,
  Zap,
  FileText,
  Download,
  Filter,
  ChevronRight,
} from "lucide-react";
import { reportCenterService } from "../services/reportCenter.service";

export function ReportsCenter() {
  const [summary, setSummary] = useState<any>(null);
  const [practiceReport, setPracticeReport] = useState<any[]>([]);
  const [studentDistReport, setStudentDistReport] = useState<any[]>([]);
  const [hospitalReport, setHospitalReport] = useState<any[]>([]);
  const [transportReport, setTransportReport] = useState<any[]>([]);
  const [dormReport, setDormReport] = useState<any[]>([]);
  const [utilityReport, setUtilityReport] = useState<any[]>([]);
  const [documentReport, setDocumentReport] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("practice");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        sumData,
        pracData,
        distData,
        hospData,
        transData,
        dormData,
        utilData,
        docData,
      ] = await Promise.all([
        reportCenterService.getSummaryData(),
        reportCenterService.getPracticeReport(),
        reportCenterService.getStudentDistributionReport(),
        reportCenterService.getHospitalUsageReport(),
        reportCenterService.getTransportationReport(),
        reportCenterService.getDormitoryReport(),
        reportCenterService.getUtilityReport(),
        reportCenterService.getDocumentStatusReport(),
      ]);

      setSummary(sumData);
      setPracticeReport(pracData);
      setStudentDistReport(distData);
      setHospitalReport(hospData);
      setTransportReport(transData);
      setDormReport(dormData);
      setUtilityReport(utilData);
      setDocumentReport(docData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExport = () => {
    switch (activeTab) {
      case "practice":
        exportToCSV(practiceReport, "practice_report");
        break;
      case "students":
        exportToCSV(studentDistReport, "student_distribution_report");
        break;
      case "hospitals":
        exportToCSV(hospitalReport, "hospital_usage_report");
        break;
      case "transport":
        exportToCSV(transportReport, "transportation_report");
        break;
      case "dorm":
        exportToCSV(dormReport, "dormitory_report");
        break;
      case "utility":
        exportToCSV(utilityReport, "utility_report");
        break;
      case "document":
        exportToCSV(documentReport, "document_status_report");
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const tabs = [
    { id: "practice", label: "Practice" },
    { id: "students", label: "Students" },
    { id: "hospitals", label: "Hospitals" },
    { id: "transport", label: "Transport" },
    { id: "dorm", label: "Dormitory" },
    { id: "utility", label: "Utility" },
    { id: "document", label: "Document" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Reports Center
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Operational analytics and data exports.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-700 transition"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <SummaryCard
          title="Total Students"
          value={summary?.totalStudents || 0}
          icon={Users}
          color="indigo"
        />
        <SummaryCard
          title="Total Courses"
          value={summary?.totalCourses || 0}
          icon={FileText}
          color="blue"
        />
        <SummaryCard
          title="Total Hospitals"
          value={summary?.totalHospitals || 0}
          icon={MapPin}
          color="emerald"
        />
        <SummaryCard
          title="Practice Groups"
          value={summary?.totalPracticeGroups || 0}
          icon={Users}
          color="amber"
        />
        <SummaryCard
          title="Training Periods"
          value={summary?.totalTrainingPeriods || 0}
          icon={BarChart3}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
        <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${activeTab === tab.id ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "practice" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-black">Academic Year</th>
                  <th className="px-4 py-3 font-black">Semester</th>
                  <th className="px-4 py-3 font-black">Course</th>
                  <th className="px-4 py-3 font-black">Group</th>
                  <th className="px-4 py-3 font-black">Hospital</th>
                  <th className="px-4 py-3 font-black text-right">Students</th>
                  <th className="px-4 py-3 font-black">Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {practiceReport.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                      {r.academicYear}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                      {r.semester}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.course}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.practiceGroup}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.hospital}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-bold text-right">
                      {r.studentCount}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-xs">
                      {r.practicePeriod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "students" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-black">Course</th>
                  <th className="px-4 py-3 font-black">Hospital</th>
                  <th className="px-4 py-3 font-black">Ward</th>
                  <th className="px-4 py-3 font-black">Year Level</th>
                  <th className="px-4 py-3 font-black text-right">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {studentDistReport.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.course}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.hospital}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.ward}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.yearLevel}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-bold text-right">
                      {r.studentCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "hospitals" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-black">Hospital Name</th>
                  <th className="px-4 py-3 font-black text-right">Courses</th>
                  <th className="px-4 py-3 font-black text-right">Students</th>
                  <th className="px-4 py-3 font-black text-right">
                    Capacity Usage
                  </th>
                  <th className="px-4 py-3 font-black">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {hospitalReport.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.hospitalName}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-right">
                      {r.coursesCount}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-right">
                      {r.studentCount}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-right text-xs">
                      {r.studentCount} / {r.capacity}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-black uppercase ${r.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "transport" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-black">Date</th>
                  <th className="px-4 py-3 font-black text-right">
                    Total Trips
                  </th>
                  <th className="px-4 py-3 font-black text-right">
                    Students Transported
                  </th>
                  <th className="px-4 py-3 font-black text-right">Van Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {transportReport.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.date}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-right">
                      {r.totalTrips}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-bold text-right">
                      {r.totalStudentsTransported}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-right">
                      {r.vanUsage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "dorm" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-black">Dormitory</th>
                  <th className="px-4 py-3 font-black text-right">Rooms</th>
                  <th className="px-4 py-3 font-black text-right">Capacity</th>
                  <th className="px-4 py-3 font-black text-right">
                    Occupied Beds
                  </th>
                  <th className="px-4 py-3 font-black text-right">
                    Available Beds
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {dormReport.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.dormitory}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-right">
                      {r.roomsCount}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-right">
                      {r.capacity}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-right font-bold">
                      {r.occupiedBeds}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 text-right font-bold">
                      {r.availableBeds}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "utility" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-black">Month</th>
                  <th className="px-4 py-3 font-black">Dormitory ID</th>
                  <th className="px-4 py-3 font-black text-right">
                    Total Water
                  </th>
                  <th className="px-4 py-3 font-black text-right">
                    Total Electricity
                  </th>
                  <th className="px-4 py-3 font-black text-right text-emerald-600">
                    Paid
                  </th>
                  <th className="px-4 py-3 font-black text-right text-amber-600">
                    Pending
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {utilityReport.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.month}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.dormitoryId}
                    </td>
                    <td className="px-4 py-3 text-blue-600 dark:text-blue-400 text-right font-mono">
                      ฿{r.totalWaterCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400 text-right font-mono">
                      ฿{r.totalElectricityCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 text-right font-bold font-mono">
                      ฿{r.paid.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-rose-600 dark:text-rose-400 text-right font-bold font-mono">
                      ฿{r.pending.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "document" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-black">Required Document</th>
                  <th className="px-4 py-3 font-black">Category</th>
                  <th className="px-4 py-3 font-black">Target Group</th>
                  <th className="px-4 py-3 font-black text-right">Submitted</th>
                  <th className="px-4 py-3 font-black text-right">Pending</th>
                  <th className="px-4 py-3 font-black text-right">Rejected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {documentReport.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.requiredDocument}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold dark:bg-zinc-800 dark:text-zinc-300">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.targetGroup}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 text-right font-bold">
                      {r.submitted}
                    </td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400 text-right font-bold">
                      {r.pending}
                    </td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400 text-right font-bold">
                      {r.rejected}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
