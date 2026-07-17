import { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserAvatar } from './UserAvatar';
import { RoleBadge } from './RoleBadge';
import { Phone, Mail, Award, CheckCircle, Save, X, Settings } from 'lucide-react';

export function ProfileCard() {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) return null;

  const handleSave = async (e: FormEvent) => {

    e.preventDefault();
    try {
      await updateProfile({
        phone,
        department,
        displayName
      });
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancel = () => {
    setPhone(user.phone || '');
    setDepartment(user.department || '');
    setDisplayName(user.displayName || '');
    setIsEditing(false);
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <UserAvatar src={user.photoURL} name={user.displayName} size="xl" className="shrink-0" />

        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-lg font-bold text-gray-900 focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Full Name"
                  required
                />
              ) : (
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {user.displayName}
                </h2>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <RoleBadge role={user.role} />
                <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">•</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  {user.status}
                </span>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 transition"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-3 text-sm text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Email Field */}
            <div className="flex items-center gap-3.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/40">
              <Mail className="h-5 w-5 text-gray-400 dark:text-zinc-500 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-zinc-200 break-all">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Department Field */}
            <div className="flex items-center gap-3.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/40">
              <Award className="h-5 w-5 text-gray-400 dark:text-zinc-500 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  Department
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-sm text-gray-900 focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    placeholder="e.g. Nursing Science"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-700 dark:text-zinc-200">
                    {user.department || 'Not Specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div className="flex items-center gap-3.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/40">
              <Phone className="h-5 w-5 text-gray-400 dark:text-zinc-500 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  Phone Number
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-sm text-gray-900 focus:border-red-600 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    placeholder="e.g. 081-234-5678"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-700 dark:text-zinc-200">
                    {user.phone || 'Not Specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Last Login Field */}
            <div className="flex items-center gap-3.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/40">
              <Settings className="h-5 w-5 text-gray-400 dark:text-zinc-500 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  Last Activity Login
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-zinc-200">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }) : 'First login today'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
