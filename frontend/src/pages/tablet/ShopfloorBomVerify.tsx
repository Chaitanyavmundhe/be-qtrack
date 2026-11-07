import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  AlertTriangle,
  Check,
  X,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const ShopfloorBomVerify: React.FC = () => {
  const [panelSerial, setPanelSerial] = useState('BEE-12K-2026-001');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadBomSummary = async (serial: string) => {
    setLoading(true);
    try {
      const panel = await apiRequest(`/panels/by-serial/${serial}`);
      const summary = await apiRequest(`/bom/panel/${panel.id}/summary`);
      setData({ ...summary, panelId: panel.id });
    } catch (err: any) {
      alert(`Error loading BOM: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBomSummary(panelSerial);
  }, [panelSerial]);

  const handleUpdateStatus = async (item: any, newStatus: string) => {
    setUpdatingId(item.bomItemId);
    try {
      await apiRequest('/bom/verify', {
        method: 'POST',
        body: JSON.stringify({
          bomItemId: item.bomItemId,
          panelId: data.panelId,
          status: newStatus,
          actualModel: item.actualModel || item.requiredModel,
          actualManufacturer: item.actualManufacturer || item.requiredManufacturer,
          actualQty: item.actualQty || item.requiredQty,
          remarks: newStatus === 'Mismatch' ? 'Discrepancy identified on shopfloor' : 'Verified OK',
        }),
      });

      // Reload summary
      loadBomSummary(panelSerial);
    } catch (err: any) {
      alert(`Error updating verification: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-xs text-stone-500">Loading BOM Verification Dossier...</div>
      </div>
    );
  }

  const s = data?.summary;
  const items = data?.items || [];

  return (
    <div className="flex-1 p-4 pb-20 bg-industrial-surface overflow-y-auto space-y-4">
      {/* Header Card */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-stone-900 font-mono">
              BOM Verification: {panelSerial}
            </h2>
            <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-700 border border-stone-300 px-1.5 py-0.5 rounded">
              Rev {data?.revision}.0 Approved
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Physical shopfloor verification of installed electrical switchgear components vs approved BOM
          </p>
        </div>

        {/* Match Percentage Pill */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-stone-400 block uppercase">BOM Match Rate</span>
            <span className="text-lg font-mono font-black text-amber-700">{s?.matchPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Discrepancy Highlight Box (The Exhibition Story Relays) */}
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg text-red-700 shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-red-900 text-sm">Active Component Discrepancy Detected</h4>
              <StatusBadge status="MISMATCH" size="sm" />
            </div>
            <p className="text-xs text-red-800 mt-1 leading-relaxed">
              <strong>Item #3: Auxiliary Contactor Relay:</strong> Required spec is <code className="bg-white px-1 py-0.5 rounded text-stone-900 font-mono font-bold">Schneider CAD32-BD (3NO+2NC)</code>. Physical component found mounted is <code className="bg-white px-1 py-0.5 rounded text-red-700 font-mono font-bold">Schneider CAD33-BD (3NO+3NC)</code>.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => navigate('/ncr-fast')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                Raise NCR for Relay Mismatch <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Touch Component Cards */}
      <div className="space-y-3">
        {items.map((item: any) => {
          const isMatched = item.status === 'Matched';
          const isMismatch = item.status === 'Mismatch';
          const isPending = item.status === 'Pending';

          return (
            <div
              key={item.bomItemId}
              className={`bg-white rounded-xl p-4 border transition-all ${
                isMismatch
                  ? 'border-red-400 bg-red-50/20 shadow-sm'
                  : isMatched
                  ? 'border-stone-200'
                  : 'border-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400">
                      #{item.itemNo}
                    </span>
                    <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-1.5 py-0.2 rounded">
                      {item.category}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm mt-1">{item.componentName}</h4>
                  <p className="text-xs text-stone-600 font-mono mt-0.5">
                    <strong>Code:</strong> {item.componentCode} | <strong>Loc:</strong> {item.installLocation}
                  </p>
                </div>

                {/* Touch Quick Status Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleUpdateStatus(item, 'Matched')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      isMatched
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> Matched
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(item, 'Mismatch')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      isMismatch
                        ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" /> Mismatch
                  </button>
                </div>
              </div>

              {/* Required Spec vs Actual Physical Comparison Grid */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50/60 p-2.5 rounded-lg">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Engineering Approved BOM Specification
                  </span>
                  <p className="font-mono text-stone-900 mt-0.5">
                    <strong>Model:</strong> {item.requiredModel || 'As per GA'}
                  </p>
                  <p className="text-stone-600 text-[11px]">
                    <strong>Make:</strong> {item.requiredManufacturer} | <strong>Qty:</strong> {item.requiredQty} {item.unit}
                  </p>
                  <p className="text-stone-500 text-[11px] mt-0.5 italic">{item.technicalSpec}</p>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-stone-200 sm:pl-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Physical Component Verified on Shopfloor
                  </span>
                  <p className={`font-mono mt-0.5 font-bold ${isMismatch ? 'text-red-700' : 'text-stone-900'}`}>
                    <strong>Model:</strong> {item.actualModel || 'Awaiting shopfloor verification'}
                  </p>
                  <p className="text-stone-600 text-[11px]">
                    <strong>Make:</strong> {item.actualManufacturer || item.requiredManufacturer} | <strong>Qty:</strong> {item.actualQty || item.requiredQty} {item.unit}
                  </p>
                  {item.remarks && (
                    <p className="text-stone-500 text-[11px] mt-0.5 italic">
                      Remarks: {item.remarks}
                    </p>
                  )}
                  {item.verifiedBy && (
                    <span className="text-[10px] text-stone-400 block mt-1">
                      Verified by {item.verifiedBy} at {new Date(item.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
