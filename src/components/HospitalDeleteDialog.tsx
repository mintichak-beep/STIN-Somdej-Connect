import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface HospitalDeleteDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hospitalName: string;
}

export function HospitalDeleteDialog({
  id,
  isOpen,
  onClose,
  onConfirm,
  hospitalName
}: HospitalDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      id={id || 'hospital-delete-dialog'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Alert Icon */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Confirm Delete Hospital Profile
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              This action cannot be undone. All buildings, rooms, placements and resources connected to this hospital will be affected.
            </p>
          </div>
        </div>

        {/* Selected target display */}
        <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl p-3.5 text-xs text-rose-800 dark:text-rose-300 font-semibold">
          Target Hospital: <span className="font-bold underline">{hospitalName}</span>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
}
