import fs from 'fs';
let code = fs.readFileSync('src/components/AppLayout.tsx', 'utf8');

const regex = /<header className="h-16 shrink-0 flex items-center justify-between px-6 bg-primary border-b border-primary\/20 z-30 sticky top-0 shadow-md">[\s\S]*?<\/header>/;

const replacement = `<header className="h-16 shrink-0 flex items-center justify-between px-6 bg-primary border-b border-primary/20 z-30 sticky top-0 shadow-md">
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
            <div className="hidden lg:flex items-center bg-white/10 border border-white/20 rounded-2xl px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-white/50 focus-within:bg-white/20 transition-all text-white placeholder-white/50">
              <Search className="h-4 w-4 text-white/70" />
              <input type="text" placeholder="Global search..." className="bg-transparent border-none focus:ring-0 text-xs font-medium w-full ml-2 text-white outline-none placeholder-white/60" />
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
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-surface rounded-2xl shadow-2xl border border-outline z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-outline flex justify-between items-center bg-surface-variant/30 text-slate-900">
                        <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar text-left text-slate-900">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs">No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} onClick={() => handleMarkRead(n.id)} className={\`p-3 rounded-xl hover:bg-surface-variant transition-colors cursor-pointer \${!n.isRead ? 'bg-primary-container/30' : ''}\`}>
                              <p className="text-xs font-bold text-slate-900">{n.title}</p>
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                              <p className="text-[9px] text-slate-400 mt-2">{format(n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt), 'dd MMM HH:mm')}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            
            <button
              onClick={onSwitchRole}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Switch Role
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight truncate max-w-32">{user?.displayName?.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest">{role}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden text-primary">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>
        </header>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AppLayout.tsx', code);
console.log('patched header successfully');
