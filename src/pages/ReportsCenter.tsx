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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
            Institutional Intelligence
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Analyze operational metrics, rotation cycles, and resource utilization.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-6 py-3 text-sm font-bold text-white bg-medical-blue rounded-xl shadow-lg shadow-medical-blue/20 hover:bg-blue-700 transition-all flex items-center gap-3 cursor-pointer"
        >
          <Download className="h-5 w-5" />
          <span>Export Analytics</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        <SummaryCard
          title="Total Residents"
          value={summary?.totalStudents || 0}
          icon={Users}
          color="indigo"
        />
        <SummaryCard
          title="Clinical Courses"
          value={summary?.totalCourses || 0}
          icon={FileText}
          color="blue"
        />
        <SummaryCard
          title="Partner Sites"
          value={summary?.totalHospitals || 0}
          icon={MapPin}
          color="emerald"
        />
        <SummaryCard
          title="Rotation Groups"
          value={summary?.totalPracticeGroups || 0}
          icon={Users}
          color="amber"
        />
        <SummaryCard
          title="Active Cycles"
          value={summary?.totalTrainingPeriods || 0}
          icon={BarChart3}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex gap-4 px-8 border-b border-slate-50 overflow-x-auto pb-0 custom-scrollbar scroll-smooth">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-6 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? "border-medical-blue text-medical-blue" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "practice" && (
            <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-5">Academic Year</th>
                    <th className="px-6 py-5">Semester</th>
                    <th className="px-6 py-5">Clinical Course</th>
                    <th className="px-6 py-5">Practice Group</th>
                    <th className="px-6 py-5">Training Facility</th>
                    <th className="px-6 py-5 text-right">Deployment</th>
                    <th className="px-6 py-5">Interval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {practiceReport.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {r.academicYear}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {r.semester}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-medical-blue transition-colors">
                        {r.course}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {r.practiceGroup}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {r.hospital}
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-bold text-right">
                        {r.studentCount} Residents
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        {r.practicePeriod}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "students" && (
            <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-5">Clinical Course</th>
                    <th className="px-6 py-5">Training Site</th>
                    <th className="px-6 py-5">Medical Unit</th>
                    <th className="px-6 py-5">Resident Level</th>
                    <th className="px-6 py-5 text-right">Resident Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {studentDistReport.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-medical-blue transition-colors">
                        {r.course}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {r.hospital}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {r.ward}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-widest">Year {r.yearLevel}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-bold text-right">
                        {r.studentCount} Deployed
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "hospitals" && (
            <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-5">Healthcare Facility</th>
                    <th className="px-6 py-5 text-right">Courses Active</th>
                    <th className="px-6 py-5 text-right">Total Residents</th>
                    <th className="px-6 py-5 text-right">
                      Utilization Factor
                    </th>
                    <th className="px-6 py-5">Site Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {hospitalReport.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-medical-blue transition-colors">
                        {r.hospitalName}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-right font-medium">
                        {r.coursesCount} Cycles
                      </td>
                      <td className="px-6 py-4 text-slate-900 text-right font-bold">
                        {r.studentCount} Residents
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{Math.round((r.studentCount / r.capacity) * 100)}% Used</span>
                          <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-medical-blue transition-all duration-1000" style={{ width: `${Math.min(100, (r.studentCount / r.capacity) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${r.status === "active" ? "bg-medical-green/10 text-medical-green border-medical-green/10" : "bg-slate-100 text-slate-400 border-slate-200"}`}
                        >
                          {r.status === "active" ? "Active Site" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "transport" && (
            <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-5">Operational Date</th>
                    <th className="px-6 py-5 text-right">
                      Daily Trips
                    </th>
                    <th className="px-6 py-5 text-right">
                      Residents Transported
                    </th>
                    <th className="px-6 py-5 text-right">Fleet Capacity Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transportReport.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-medical-blue transition-colors">
                        {r.date}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-right font-medium">
                        {r.totalTrips} Circuits
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-bold text-right">
                        {r.totalStudentsTransported} Seats
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-right font-mono text-xs">
                        {r.vanUsage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "dorm" && (
            <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-5">Residential Facility</th>
                    <th className="px-6 py-5 text-right">Units Count</th>
                    <th className="px-6 py-5 text-right">Total Capacity</th>
                    <th className="px-6 py-5 text-right">
                      Occupied Beds
                    </th>
                    <th className="px-6 py-5 text-right">
                      Available Beds
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dormReport.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-medical-blue transition-colors">
                        {r.dormitory}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-right font-medium">
                        {r.roomsCount} Rooms
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-right font-medium">
                        {r.capacity} Total
                      </td>
                      <td className="px-6 py-4 text-slate-900 text-right font-bold">
                        {r.occupiedBeds} Units
                      </td>
                      <td className="px-6 py-4 text-medical-green text-right font-bold">
                        {r.availableBeds} Vacant
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "utility" && (
            <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-5">Billing Month</th>
                    <th className="px-6 py-5">Facility Code</th>
                    <th className="px-6 py-5 text-right">
                      Aquatic Expenses
                    </th>
                    <th className="px-6 py-5 text-right">
                      Electrical Expenses
                    </th>
                    <th className="px-6 py-5 text-right">
                      Verified Revenue
                    </th>
                    <th className="px-6 py-5 text-right">
                      Outstanding Receivable
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {utilityReport.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-medical-blue transition-colors">
                        {r.month}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs uppercase tracking-widest">
                        {r.dormitoryId}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-right font-mono text-xs">
                        ฿{r.totalWaterCost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-right font-mono text-xs">
                        ฿{r.totalElectricityCost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-medical-green text-right font-bold font-mono text-xs">
                        ฿{r.paid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-medical-red text-right font-bold font-mono text-xs">
                        ฿{r.pending.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "document" && (
            <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-5">Credential Registry</th>
                    <th className="px-6 py-5">Clinical Category</th>
                    <th className="px-6 py-5">Demographic</th>
                    <th className="px-6 py-5 text-right">Verified</th>
                    <th className="px-6 py-5 text-right">Pending</th>
                    <th className="px-6 py-5 text-right">Discrepancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {documentReport.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-medical-blue transition-colors">
                        {r.requiredDocument}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-widest">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {r.targetGroup}
                      </td>
                      <td className="px-6 py-4 text-medical-green text-right font-bold">
                        {r.submitted}
                      </td>
                      <td className="px-6 py-4 text-medical-orange text-right font-bold">
                        {r.pending}
                      </td>
                      <td className="px-6 py-4 text-medical-red text-right font-bold">
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
      "bg-indigo-50 text-indigo-600",
    blue: "bg-medical-blue/10 text-medical-blue",
    emerald:
      "bg-medical-green/10 text-medical-green",
    amber:
      "bg-medical-orange/10 text-medical-orange",
    purple:
      "bg-purple-50 text-purple-600",
    rose: "bg-medical-red/10 text-medical-red",
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4 transition-all hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 group"
    >
      <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 ${colorClasses}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
