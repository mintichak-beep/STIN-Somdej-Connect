import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { HospitalForm } from '../../components/HospitalForm';
import { useHospital } from '../../hooks/useHospital';
import { useRole } from '../../hooks/useRole';
import { ChevronLeft, RefreshCw } from 'lucide-react';

export function HospitalEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useRole();
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errorUpdate, setErrorUpdate] = useState<string | null>(null);

  const { hospital, loading, error, updateProfile } = useHospital(id);

  // Guard routing if not administrator
  if (!isAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center space-y-3">
          <p className="text-sm font-bold text-rose-600">Access Denied</p>
          <p className="text-xs text-zinc-500">Only Administrators can modify clinical placements.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-indigo-500 hover:underline font-bold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (values: any) => {
    try {
      setLoadingUpdate(true);
      setErrorUpdate(null);
      await updateProfile(values);
      navigate('/hospitals');
    } catch (err: any) {
      setErrorUpdate(err?.message || 'Failed to update hospital placement profile.');
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Breadcrumbs Header */}
        <header className="h-16 shrink-0 border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex items-center gap-3 px-6 z-10">
          <button
            onClick={() => navigate('/hospitals')}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
              <span className="hover:underline cursor-pointer" onClick={() => navigate('/hospitals')}>Hospitals</span>
              <span>/</span>
              <span className="text-zinc-500 dark:text-zinc-300">Edit profile</span>
            </div>
            <h1 className="text-sm font-black text-zinc-900 dark:text-zinc-50 leading-tight">
              Modify: {loading ? '...' : hospital?.hospitalNameTH}
            </h1>
          </div>
        </header>

        {/* Scrollable Form Body Container */}
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl w-full mx-auto space-y-6">
          
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : error || !hospital ? (
            <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl p-4.5 text-xs font-semibold text-rose-700 dark:text-rose-400 text-center">
              {error || 'Hospital profile not found.'}
            </div>
          ) : (
            <>
              {errorUpdate && (
                <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl p-4.5 text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0"></span>
                  <p>{errorUpdate}</p>
                </div>
              )}

              <HospitalForm
                initialData={hospital}
                onSubmit={handleFormSubmit}
                onCancel={() => navigate('/hospitals')}
                loading={loadingUpdate}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
export default HospitalEditPage;
