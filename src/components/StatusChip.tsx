import React from 'react';

type StatusType = 
  | 'active' | 'inactive' 
  | 'available' | 'occupied' 
  | 'pending' | 'paid' | 'unpaid' 
  | 'verified' | 'pending_verification' | 'waiting_verification'
  | 'rejected';

interface StatusChipProps {
  status: StatusType | string;
  label?: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'danger' | 'neutral';
}

export function StatusChip({ status, label, variant }: StatusChipProps) {
  const normalizedStatus = (status || '').toLowerCase();
  
  const variantMap: Record<string, string> = {
    success: 'active',
    warning: 'occupied',
    error: 'rejected',
    danger: 'rejected',
    info: 'verified',
    neutral: 'inactive'
  };

  const lookupStatus = variant ? variantMap[variant] : normalizedStatus;

  const statusConfig: Record<string, { bg: string, text: string, dot: string, label: string }> = {
    active: { bg: 'bg-medical-green/10', text: 'text-medical-green', dot: 'bg-medical-green', label: 'Active' },
    inactive: { bg: 'bg-medical-red/10', text: 'text-medical-red', dot: 'bg-medical-red', label: 'Inactive' },
    available: { bg: 'bg-medical-teal/10', text: 'text-medical-teal', dot: 'bg-medical-teal', label: 'Available' },
    occupied: { bg: 'bg-medical-orange/10', text: 'text-medical-orange', dot: 'bg-medical-orange', label: 'Occupied' },
    pending: { bg: 'bg-medical-orange/10', text: 'text-medical-orange', dot: 'bg-medical-orange', label: 'Pending' },
    paid: { bg: 'bg-medical-green/10', text: 'text-medical-green', dot: 'bg-medical-green', label: 'Paid' },
    unpaid: { bg: 'bg-medical-red/10', text: 'text-medical-red', dot: 'bg-medical-red', label: 'Unpaid' },
    verified: { bg: 'bg-medical-blue/10', text: 'text-medical-blue', dot: 'bg-medical-blue', label: 'Verified' },
    waiting_verification: { bg: 'bg-medical-blue/10', text: 'text-medical-blue', dot: 'bg-medical-blue', label: 'Pending Verification' },
    pending_verification: { bg: 'bg-medical-blue/10', text: 'text-medical-blue', dot: 'bg-medical-blue', label: 'Pending Verification' },
    rejected: { bg: 'bg-medical-red/10', text: 'text-medical-red', dot: 'bg-medical-red', label: 'Rejected' },
  };

  const config = statusConfig[lookupStatus] || { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: status };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-current/10 ${config.bg} ${config.text}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">
        {label || config.label}
      </span>
    </div>
  );
}
