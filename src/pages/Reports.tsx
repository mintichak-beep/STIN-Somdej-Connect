import { BarChart3, Download, FileText } from "lucide-react";

export function Reports() {
  const reports = [
    { title: "สรุปรายชื่อนักศึกษาแยกตามแหล่งฝึก", description: "รายชื่อนักศึกษาทั้งหมดที่ได้รับจัดสรรในแต่ละแหล่งฝึก", icon: FileText },
    { title: "รายงานการเข้าพัก", description: "สรุปจำนวนนักศึกษาที่เข้าพักในแต่ละอาคารและห้องพัก", icon: BarChart3 },
    { title: "ตารางการเดินรถตู้", description: "รายละเอียดการใช้รถตู้ในการรับ-ส่งนักศึกษา", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">รายงาน</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => {
          const Icon = report.icon;
          return (
            <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-zinc-800 group hover:border-red-500 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <Icon className="h-6 w-6" />
                </div>
                <button className="p-2 text-zinc-400 hover:text-red-600 transition-all">
                  <Download className="h-5 w-5" />
                </button>
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 mb-2">{report.title}</h3>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {report.description}
              </p>
              <button className="mt-6 w-full py-3 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs font-black text-zinc-600 dark:text-zinc-400 hover:bg-red-600 hover:text-white transition-all">
                ดูรายงานฉบับเต็ม
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
