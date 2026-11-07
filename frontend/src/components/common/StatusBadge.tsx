import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'sm' }) => {
  const norm = status?.toUpperCase() || 'UNKNOWN';

  let colorClasses = 'bg-stone-100 text-stone-700 border-stone-300';

  // Green / Verified / Pass / Closed
  if (['PASS', 'PASSED', 'CLOSED', 'MATCHED', 'DISPATCHED', 'APPROVED', 'COMPLETED', 'DISPATCH_READY', 'ACTIVE'].includes(norm)) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
  }
  // Amber / Warning / Pending / InProgress / Hold
  else if (['PENDING', 'INPROGRESS', 'IN_PROCESS_QC', 'FINAL_TESTING', 'PDI', 'MANUFACTURING', 'BOM_APPROVED', 'MATERIAL_READY', 'UNDER_INVESTIGATION', 'ON_HOLD', 'ASSIGNED', 'SUBMITTED'].includes(norm)) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
  }
  // Red / Failed / Mismatch / Missing / Rejected / Rework
  else if (['FAIL', 'FAILED', 'MISMATCH', 'MISSING', 'REJECTED', 'REWORK_REQUIRED', 'CRITICAL', 'HIGH', 'OVERDUE'].includes(norm)) {
    colorClasses = 'bg-red-50 text-red-800 border-red-300 font-semibold';
  }
  // Neutral Slate
  else if (['DRAFT', 'ENGINEERING', 'NONE', 'MEDIUM', 'LOW'].includes(norm)) {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-mono tracking-wide ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
