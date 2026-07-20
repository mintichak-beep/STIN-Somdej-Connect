import { Modal } from "./Modal";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger"
}: ConfirmDialogProps) {
  const iconMap = {
    danger: <AlertCircle className="h-7 w-7" />,
    warning: <AlertTriangle className="h-7 w-7" />,
    info: <Info className="h-7 w-7" />
  };

  const variantColorMap = {
    danger: "text-medical-red bg-medical-red/10",
    warning: "text-medical-orange bg-medical-orange/10",
    info: "text-medical-blue bg-medical-blue/10"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-8">
        <div className="flex items-start gap-5">
          <div className={`p-4 rounded-2xl shrink-0 ${variantColorMap[variant]}`}>
            {iconMap[variant]}
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-800 leading-snug">
              {message}
            </p>
            <p className="text-sm font-medium text-slate-400">
              This action cannot be undone. Please confirm to proceed.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="md-button-text text-slate-500 hover:text-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`md-button-filled ${variant === 'danger' ? 'bg-medical-red' : variant === 'warning' ? 'bg-medical-orange' : 'bg-medical-blue'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
