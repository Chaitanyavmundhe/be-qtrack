import React, { useState } from 'react';
import { AlertCircle, X, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-industrial-stone border-b border-industrial-border px-3 py-1.5 text-xs text-industrial-slate flex items-center justify-between">
      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="inline-flex items-center gap-1 font-semibold text-industrial-amber px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
          <ShieldCheck className="w-3.5 h-3.5 text-industrial-amber" />
          EXHIBITION PROTOTYPE
        </span>
        <span className="text-[11px] text-stone-600 truncate">
          <strong>BE-QTrack:</strong> Academic Prototype for Problem Statement Sr. No. 6 (Automation & Digitalization). Product references based on public website data. Demonstration workflows and sample BOMs are illustrative.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-stone-400 hover:text-stone-700 p-0.5 rounded transition-colors ml-2"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
