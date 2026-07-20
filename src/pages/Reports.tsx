import { BarChart3, Download, FileText, PieChart, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function Reports() {
  const reports = [
    { 
      title: "Student Allocation Summary", 
      description: "Comprehensive list of students grouped by their assigned training centers and departments.", 
      icon: FileText,
      category: "Academic",
      lastUpdated: "Today, 09:45 AM"
    },
    { 
      title: "Dormitory Occupancy Report", 
      description: "Detailed analysis of student residency distribution across buildings, floors, and specific units.", 
      icon: PieChart,
      category: "Facilities",
      lastUpdated: "Yesterday, 04:20 PM"
    },
    { 
      title: "Van Fleet Logistics", 
      description: "Logistics summary covering vehicle utilization, driver assignments, and passenger transport schedules.", 
      icon: TrendingUp,
      category: "Transport",
      lastUpdated: "2 hours ago"
    },
    { 
      title: "Utility Billing Analysis", 
      description: "Financial breakdown of water and electricity consumption across the institutional dormitories.", 
      icon: BarChart3,
      category: "Financial",
      lastUpdated: "3 days ago"
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Reports</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Access analytical data and generated summaries for institutional decision making.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, idx) => {
          const Icon = report.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 rounded-2xl bg-primary-container text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary-container rounded-xl transition-all">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-slate-50 text-[10px] font-bold text-slate-500 rounded-full border border-slate-100 uppercase tracking-widest">{report.category}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{report.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar className="h-3 w-3" />
                  Updated: {report.lastUpdated}
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                  View Full Report
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-8 bg-slate-900 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-900/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-xl font-bold tracking-tight">Need a Custom Report?</h3>
          <p className="text-sm text-slate-400 font-medium mt-1">Our administrative team can generate specialized datasets tailored to your specific research or auditing needs.</p>
        </div>
        <button className="relative z-10 px-8 py-4 bg-primary text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          Request Specialized Data
        </button>
      </div>
    </div>
  );
}
