import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { FloorForm } from '../../components/FloorForm';
import { useFloors } from '../../hooks/useFloors';
import { ArrowLeft } from 'lucide-react';

export function FloorCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { createFloor } = useFloors();

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      await createFloor(formData);
      navigate('/floors');
    } catch (err: any) {
      alert(err?.message || 'Failed to configure floor level.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50 dark:bg-zinc-950">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-100 bg-white px-6 dark:border-zinc-800/60 dark:bg-zinc-950">
          <button
            onClick={() => navigate('/floors')}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg text-slate-500 hover:text-gray-900 dark:hover:text-zinc-100 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-black text-gray-900 dark:text-zinc-50 uppercase tracking-wider">
              Set Up Floor Level
            </h1>
            <p className="text-[10px] font-bold text-slate-400">
              Configure level numbers, display names, and descriptions within parent buildings
            </p>
          </div>
        </header>

        {/* Form Container */}
        <div className="p-6 max-w-2xl mx-auto w-full">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
            <FloorForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/floors')}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
