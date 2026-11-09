import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  CheckSquare,
  AlertTriangle,
  QrCode,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const TabletHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-3 sm:p-4 pb-24 sm:pb-20 bg-industrial-surface overflow-y-auto space-y-3 sm:space-y-4">
      {/* Shopfloor Top Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold font-mono text-base sm:text-lg shadow-sm shrink-0">
              MV
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase block">
                Shopfloor Field Station
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
                12 kV VCB Assembly Bay
              </h2>
            </div>
          </div>
          <StatusBadge status="ACTIVE" size="sm" />
        </div>

        <p className="text-xs text-stone-500 mt-2.5 sm:mt-3 leading-relaxed">
          Select an operational task below or scan a panel QR code to open its 360° digital passport.
        </p>

        {/* Primary Demonstration Panel Quick-Card */}
        <div className="mt-3 sm:mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-stone-500 uppercase block">Active Reference Panel</span>
            <span className="font-mono font-bold text-sm text-stone-900 block truncate">BEE-12K-2026-001</span>
            <span className="text-[11px] text-stone-600 block truncate">12 kV 1250A VCB Panel (ABB VD4)</span>
          </div>
          <button
            onClick={() => navigate('/panel/BEE-12K-2026-001')}
            className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm shrink-0"
          >
            <span>Open 360°</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Large Touch Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {/* Action 1: PDI Inspection */}
        <button
          onClick={() => navigate('/pdi-touch')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 hover:border-amber-400 active:bg-amber-50/30 shadow-sm text-left flex items-start gap-3 transition-all active:scale-[0.99]"
        >
          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 text-amber-800 shrink-0 border border-amber-200">
            <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-industrial-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-900 text-sm">PDI Digital Checklist</h3>
            <p className="text-xs text-stone-500 mt-0.5 leading-snug line-clamp-2">
              Execute Pre-Dispatch Inspection, capture dielectric & ductor values, and sign off PDF release.
            </p>
          </div>
        </button>

        {/* Action 2: BOM Verification */}
        <button
          onClick={() => navigate('/bom-touch')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 hover:border-amber-400 active:bg-red-50/30 shadow-sm text-left flex items-start gap-3 transition-all active:scale-[0.99]"
        >
          <div className="p-2.5 sm:p-3 rounded-xl bg-red-50 text-red-800 shrink-0 border border-red-200">
            <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-stone-900 text-sm truncate">BOM Component Verify</h3>
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded shrink-0">
                1 Mismatch
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 leading-snug line-clamp-2">
              Verify required vs installed parts. Review the Schneider CAD33 auxiliary relay discrepancy.
            </p>
          </div>
        </button>

        {/* Action 3: Raise NCR */}
        <button
          onClick={() => navigate('/ncr-fast')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 hover:border-amber-400 active:bg-amber-50/30 shadow-sm text-left flex items-start gap-3 transition-all active:scale-[0.99]"
        >
          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 text-amber-800 shrink-0 border border-amber-200">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-900 text-sm">Log Field NCR & 5-Whys</h3>
            <p className="text-xs text-stone-500 mt-0.5 leading-snug line-clamp-2">
              Record non-conformance with immediate containment and root cause questionnaire.
            </p>
          </div>
        </button>

        {/* Action 4: 12 kV VCB Product Specification */}
        <button
          onClick={() => navigate('/vcb-showcase')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 hover:border-amber-400 active:bg-emerald-50/30 shadow-sm text-left flex items-start gap-3 transition-all active:scale-[0.99]"
        >
          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 text-emerald-800 shrink-0 border border-emerald-200">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-900 text-sm">12 kV VCB Technical Specs</h3>
            <p className="text-xs text-stone-500 mt-0.5 leading-snug line-clamp-2">
              Official company product parameters, clearances, ratings, and ABB partnership references.
            </p>
          </div>
        </button>
      </div>

      {/* Extra Shopfloor Navigation Shortcuts */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-stone-200 shadow-sm space-y-2">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
          Additional Quality Records & Registers
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => navigate('/reports')}
            className="p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left font-medium text-stone-800 flex items-center justify-between"
          >
            <span>Quality & NCR Reports</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          </button>
          <button
            onClick={() => navigate('/master')}
            className="p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left font-medium text-stone-800 flex items-center justify-between"
          >
            <span>Work Orders & Fleet</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
