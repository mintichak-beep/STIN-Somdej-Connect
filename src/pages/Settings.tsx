import { Settings as SettingsIcon, Bell, Shield, Database, Layout } from "lucide-react";

export function Settings() {
  const sections = [
    { title: "ตั้งค่าทั่วไป", description: "จัดการชื่อระบบ และข้อมูลเบื้องต้นของแอปพลิเคชัน", icon: Layout },
    { title: "ความปลอดภัย", description: "ตั้งค่าการเข้าถึง และการจัดการสิทธิ์", icon: Shield },
    { title: "การแจ้งเตือน", description: "กำหนดรูปแบบการแจ้งเตือนผ่านช่องทางต่างๆ", icon: Bell },
    { title: "ฐานข้อมูล", description: "สำรองข้อมูล และการจัดการ Firestore", icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">ตั้งค่า</h1>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-8 space-y-8">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div key={idx} className="flex items-start gap-6 group cursor-pointer">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 border-b border-slate-50 dark:border-zinc-800 pb-8 last:border-none">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 mb-1">{section.title}</h3>
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                      {section.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-8 py-3 text-sm font-black text-zinc-500">คืนค่าโรงงาน</button>
          <button className="px-8 py-3 text-sm font-black text-white bg-red-600 rounded-xl shadow-sm shadow-red-100">บันทึกการตั้งค่า</button>
        </div>
      </div>
    </div>
  );
}
