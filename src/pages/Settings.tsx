import { Settings as SettingsIcon, Bell, Shield, Database, Layout, User, Globe, Moon } from "lucide-react";
import { motion } from "motion/react";

export function Settings() {
  const sections = [
    { title: "General Preferences", description: "Manage institutional identifiers, localization, and branding.", icon: Layout },
    { title: "Security & Access", description: "Configure authentication protocols and administrative privileges.", icon: Shield },
    { title: "Notification System", description: "Define alert triggers for billing, assignments, and announcements.", icon: Bell },
    { title: "Data Management", description: "Database optimization, backup scheduling, and cloud synchronization.", icon: Database },
    { title: "Resident Portal", description: "Customize student interface and transportation features.", icon: User },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Configure your administrative workspace and manage institutional protocols.</p>
      </div>

      <div className="max-w-5xl space-y-6">
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 space-y-10">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-8 group cursor-pointer"
                >
                  <div className="p-5 rounded-[24px] bg-slate-50 text-slate-400 group-hover:bg-primary-container group-hover:text-primary transition-all duration-500">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 border-b border-slate-50 pb-10 group-last:border-none group-last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{section.title}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-lg">
                          {section.description}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-slate-50 rounded-[32px] border border-slate-100 gap-6">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                 <Globe className="h-6 w-6" />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-slate-900">Environment Node</h4>
                 <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Production v2.4.1</p>
              </div>
           </div>
           <div className="flex gap-4">
              <button className="px-8 py-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                Factory Reset
              </button>
              <button className="px-10 py-4 bg-primary text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                Save Global Configuration
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
