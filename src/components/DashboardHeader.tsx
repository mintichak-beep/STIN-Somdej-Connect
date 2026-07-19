import { useState, useTransition } from 'react';
import { Search, Calendar, RefreshCw, LogOut, ShieldAlert, Award, GraduationCap, MapPin, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DashboardFilters } from '../services/statistics.service';
import { AcademicYear } from '../types/db';

interface DashboardHeaderProps {
  filters: DashboardFilters;
  updateFilter: (key: keyof DashboardFilters, value: string) => void;
  clearFilters: () => void;
  academicYears: AcademicYear[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  filters,
  updateFilter,
  clearFilters,
  academicYears,
  onRefresh,
  isRefreshing = false
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const [, startTransition] = useTransition();
  const [searchVal, setSearchVal] = useState(filters.searchQuery || '');

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Administrator': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
      case 'Teacher': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
      default: return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'Administrator': return <ShieldAlert className="h-3.5 w-3.5" />;
      case 'Teacher': return <UserCheck className="h-3.5 w-3.5" />;
      default: return <GraduationCap className="h-3.5 w-3.5" />;
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    startTransition(() => {
      updateFilter('searchQuery', val);
    });
  };

  return (
    <header className="relative flex flex-col gap-6 border-b border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
      {/* Upper bar: User Info, Logout & Header Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 id="header-title" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 md:text-3xl font-sans">
              STIN-Somdej Connect
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Clinical Placement, Accommodation & Transportation Management Portal
          </p>
        </div>

        {/* User profile dropdown card */}
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={user?.displayName}
                referrerPolicy="no-referrer"
                className="h-11 w-11 rounded-full border-2 border-red-100 object-cover dark:border-zinc-800"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-zinc-950"></span>
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{user?.displayName}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                  {getRoleIcon(user?.role)}
                  {user?.role}
                </span>
                {user?.department && (
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 max-w-[120px] truncate" title={user.department}>
                    • {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            id="logout-button"
            onClick={logout}
            title="Sign out of STIN-Somdej Connect"
            className="rounded-xl border border-gray-200 p-2.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Greeting card row */}
      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
            {getGreeting()}, {user?.displayName}!
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Welcome back to STIN clinical placements operations terminal. Here is the operational overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-2xs self-start md:self-auto">
          <Calendar className="h-4 w-4 text-red-600" />
          <span>{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
        </div>
      </div>

      {/* Operational Filter Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pt-2">
        {/* Global Search and Query */}
        <div className="relative w-full lg:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            id="global-search"
            type="text"
            placeholder="Global search by student name, ID, teacher, ward..."
            value={searchVal}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-hidden transition-all placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-red-500 dark:focus:ring-red-950/30"
          />
        </div>

        {/* Filter selection controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Academic Year Select */}
          <div className="flex items-center gap-1.5">
            <span className="hidden text-xs font-semibold text-gray-500 dark:text-zinc-400 sm:block">Term:</span>
            <select
              id="select-academic-year"
              value={filters.academicYearId || ''}
              onChange={(e) => updateFilter('academicYearId', e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-hidden transition-all hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <option value="">All Academic Years</option>
              {academicYears.map(ay => (
                <option key={ay.id} value={ay.id}>
                  AY {ay.year} {ay.status === 'active' ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Select */}
          <select
            id="select-semester"
            value={filters.semester || ''}
            onChange={(e) => updateFilter('semester', e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-hidden transition-all hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="Summer">Summer Term</option>
          </select>

          {/* Action buttons */}
          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <button
              id="clear-filters-btn"
              onClick={clearFilters}
              title="Reset all filters"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Reset
            </button>

            <button
              id="refresh-dashboard-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
