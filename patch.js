const fs = require('fs');
let code = fs.readFileSync('src/components/AppLayout.tsx', 'utf8');

const target = `        {/* Top App Bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-surface border-b border-outline z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 md:hidden cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900">{activeItem?.label || "Overview"}</h1>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-surface-variant rounded-full text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border border-outline">
                Dormitory Management System
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-surface-variant/50 border border-outline rounded-2xl px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Global search..." className="bg-transparent border-none focus:ring-0 text-xs font-medium w-full ml-2 text-slate-600 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors cursor-pointer">
                <MessageSquare className="h-5 w-5" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors relative cursor-pointer"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-surface" />
                  )}
                </button>`;

const replacement = `        {/* Top App Bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-primary border-b border-primary/20 z-30 sticky top-0 shadow-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-white/10 rounded-xl text-white md:hidden cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                <span className="text-2xl font-black leading-none pt-1">+</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black text-white tracking-tight leading-tight">STIN-Somdej Connect</h1>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-white/80 uppercase tracking-widest">
                  {activeItem?.label || "Overview"}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-white/10 border border-white/20 rounded-2xl px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-white/50 focus-within:bg-white/20 transition-all">
              <Search className="h-4 w-4 text-white/70" />
              <input type="text" placeholder="Global search..." className="bg-transparent border-none focus:ring-0 text-xs font-medium w-full ml-2 text-white outline-none placeholder:text-white/60" />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors cursor-pointer">
                <MessageSquare className="h-5 w-5" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors relative cursor-pointer"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-white rounded-full ring-2 ring-primary" />
                  )}
                </button>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AppLayout.tsx', code);
console.log('patched successfully');
