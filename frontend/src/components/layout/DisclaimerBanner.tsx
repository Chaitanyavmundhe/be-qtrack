import React, { useState } from 'react';
import { AlertCircle, X, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-stone-100 border-b border-stone-200 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs text-stone-700 flex items-center justify-between gap-2 overflow-hidden select-none">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden min-w-0">
        <span className="inline-flex items-center gap-1 font-bold text-amber-900 px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-[10px] shrink-0">
          <ShieldCheck className="w-3 h-3 text-amber-700 shrink-0" />
          PROTOTYPE
        </span>
        <span className="text-[10px] sm:text-[11px] text-stone-600 truncate min-w-0">
          <strong>BE-QTrack:</strong> Academic Prototype for Problem Statement Sr. No. 6. Public reference specs. Illustrative demo BOMs.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors shrink-0"
        title="Dismiss notice"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
