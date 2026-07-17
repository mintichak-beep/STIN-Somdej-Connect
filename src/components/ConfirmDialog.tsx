import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isSubmitting?: boolean;
}

export function ConfirmDialog({
  id,
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isSubmitting = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const colorMap = {
    danger: {
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400',
      btn: 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 text-white'
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white'
    },
    info: {
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
      btn: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
    }
  };

  const selectedColor = colorMap[variant];

  return (
    <AnimatePresence>
      <div id={id} className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Dialog Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selectedColor.iconBg}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-zinc-50">
                {title}
              </h3>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed dark:text-zinc-400">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/80 cursor-pointer disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 ${selectedColor.btn}`}
            >
              {isSubmitting ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
