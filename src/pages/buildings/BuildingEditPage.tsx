import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { BuildingForm } from '../../components/BuildingForm';
import { useBuilding } from '../../hooks/useBuilding';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function BuildingEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const { building, loading, error, updateProfile } = useBuilding(id);

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      await updateProfile(formData);
      navigate('/buildings');
    } catch (err: any) {
      alert(err?.message || 'Failed to update building details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50 dark:bg-zinc-950">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-100 bg-white px-6 dark:border-zinc-800/60 dark:bg-zinc-950">
          <button
            onClick={() => navigate('/buildings')}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg text-slate-500 hover:text-gray-900 dark:hover:text-zinc-100 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-black text-gray-900 dark:text-zinc-50 uppercase tracking-wider">
              Edit Building Profile
            </h1>
            <p className="text-[10px] font-bold text-slate-400">
              Update details for {building?.buildingName || 'Building'} ({building?.buildingCode || '...'})
            </p>
          </div>
        </header>

        {/* Form Container */}
        <div className="p-6 max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-400 mt-2">Loading building profile...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 rounded-2xl border border-rose-100 text-xs font-bold text-center">
              {error}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
              <BuildingForm
                initialData={building}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/buildings')}
                loading={submitting}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
