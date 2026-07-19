import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full max-w-md text-center space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500 shadow-xs animate-bounce">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Access Denied
          </h2>
          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
            You do not have administrative permission to view this section of the STIN-Somdej Connect application.
          </p>
        </div>

        <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
          <Link
            to="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 active:bg-red-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
