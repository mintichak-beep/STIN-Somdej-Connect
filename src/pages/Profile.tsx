import { useState, useEffect } from 'react';
import { ProfileCard } from '../components/ProfileCard';
import { useAuth } from '../hooks/useAuth';
import { Shield, ToggleLeft, ToggleRight, Database, RefreshCw } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            My CPATMS Account Profile
          </h1>
          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
            Configure preferences, edit contact info, and view system status.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 self-start sm:self-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 disabled:opacity-50 transition"
        >
          <RefreshCw className={`h-4 w-4 text-gray-400 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      {/* Main Profile Card Component */}
      <ProfileCard />

      {/* Settings Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Settings Panel */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition">
          <h3 className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white mb-4">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-500" />
            Visual Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-zinc-800/50">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">Dark Interface Theme</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Enable high-contrast dark theme mode</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className="text-red-600 dark:text-red-500 hover:scale-105 transition active:scale-95"
              >
                {isDark ? (
                  <ToggleRight className="h-9 w-9" />
                ) : (
                  <ToggleLeft className="h-9 w-9 text-gray-300 dark:text-zinc-700" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">Default Language</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">System display language setting</p>
              </div>
              <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 dark:bg-zinc-800 dark:text-zinc-300">
                English (STIN Preferred)
              </span>
            </div>
          </div>
        </div>

        {/* Security & System Info Panel */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition">
          <h3 className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white mb-4">
            <Database className="h-5 w-5 text-red-600 dark:text-red-500" />
            Role Permissions Audit
          </h3>
          <div className="space-y-3 text-xs font-medium text-gray-500 dark:text-zinc-400">
            <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-zinc-800/50">
              <span>Security Level:</span>
              <span className="font-bold text-gray-800 dark:text-zinc-200">
                {user.role === 'Administrator' ? 'Full Read/Write' : 'Limited Viewer'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50 dark:border-zinc-800/50">
              <span>Institution Affiliation:</span>
              <span className="font-bold text-gray-800 dark:text-zinc-200">Srisavarindhira Thai Red Cross</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Session Persistence:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-500">Active (Secure Cookie Sim)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
