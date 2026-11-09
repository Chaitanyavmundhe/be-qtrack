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
  const [filter, setFilter] = useState<'ALL' | 'MISMATCH' | 'MATCHED'>('ALL');

  const filteredItems = items.filter((item: any) => {
    if (filter === 'MISMATCH') return item.status === 'Mismatch';
    if (filter === 'MATCHED') return item.status === 'Matched';
    return true;
  });

  return (
    <div className="flex-1 p-3 sm:p-4 pb-24 sm:pb-20 bg-industrial-surface overflow-y-auto space-y-3 sm:space-y-4">
      {/* Header Card */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 font-mono">
              BOM Verification: {panelSerial}
            </h2>
            <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-700 border border-stone-300 px-1.5 py-0.5 rounded shrink-0">
              Rev {data?.revision}.0 Approved
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Physical shopfloor verification of installed electrical switchgear components vs approved BOM
          </p>
        </div>

        {/* Match Percentage Pill */}
        <div className="flex items-center justify-between md:justify-end gap-3 bg-stone-50 md:bg-transparent p-2.5 md:p-0 rounded-lg border md:border-0 border-stone-200">
          <span className="text-[11px] text-stone-500 md:hidden uppercase font-semibold">BOM Match Rate:</span>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 hidden md:block uppercase font-bold">BOM Match Rate</span>
            <span className="text-base sm:text-lg font-mono font-black text-amber-700">{s?.matchPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Discrepancy Highlight Box (The Exhibition Story Relays) */}
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg text-red-700 shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-red-900 text-sm">Active Component Discrepancy Detected</h4>
              <StatusBadge status="MISMATCH" size="sm" />
            </div>
            <p className="text-xs text-red-800 mt-1.5 leading-relaxed">
              <strong>Item #3: Auxiliary Contactor Relay:</strong> Required spec is <code className="bg-white px-1.5 py-0.5 rounded text-stone-900 font-mono font-bold border border-red-200">Schneider CAD32-BD (3NO+2NC)</code>. Physical component found mounted is <code className="bg-white px-1.5 py-0.5 rounded text-red-700 font-mono font-bold border border-red-300">Schneider CAD33-BD (3NO+3NC)</code>.
            </p>

            <div className="mt-3">
              <button
                onClick={() => navigate('/ncr-fast')}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Raise NCR for Relay Mismatch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center font-semibold transition-all ${
            filter === 'ALL' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          All Items ({items.length})
        </button>
        <button
          onClick={() => setFilter('MISMATCH')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center font-semibold transition-all ${
            filter === 'MISMATCH' ? 'bg-red-600 text-white shadow-sm' : 'text-red-700 hover:bg-red-50'
          }`}
        >
          Mismatches ({items.filter((i: any) => i.status === 'Mismatch').length})
        </button>
        <button
          onClick={() => setFilter('MATCHED')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center font-semibold transition-all ${
            filter === 'MATCHED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          Matched ({items.filter((i: any) => i.status === 'Matched').length})
        </button>
      </div>

      {/* Touch Component Cards */}
      <div className="space-y-3">
        {filteredItems.map((item: any) => {
          const isMatched = item.status === 'Matched';
          const isMismatch = item.status === 'Mismatch';

          return (
            <div
              key={item.bomItemId}
              className={`bg-white rounded-xl p-3.5 sm:p-4 border transition-all ${
                isMismatch
                  ? 'border-red-400 bg-red-50/20 shadow-sm'
                  : isMatched
                  ? 'border-stone-200'
                  : 'border-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-stone-400">
                      #{item.itemNo}
                    </span>
                    <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-1.5 py-0.2 rounded">
                      {item.category}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm mt-1 leading-snug">{item.componentName}</h4>
                  <p className="text-xs text-stone-600 font-mono mt-0.5 truncate">
                    <strong>Code:</strong> {item.componentCode} | <strong>Loc:</strong> {item.installLocation}
                  </p>
                </div>

                {/* Touch Quick Status Buttons */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0 mt-1 sm:mt-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item, 'Matched')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] sm:min-h-[36px] ${
                      isMatched
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 active:bg-stone-300'
                    }`}
                  >
                    <Check className="w-4 h-4" /> Matched
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item, 'Mismatch')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] sm:min-h-[36px] ${
                      isMismatch
                        ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 active:bg-stone-300'
                    }`}
                  >
                    <X className="w-4 h-4" /> Mismatch
                  </button>
                </div>
              </div>

              {/* Required Spec vs Actual Physical Comparison Grid */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50/70 p-3 rounded-lg">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Engineering Approved BOM Specification
                  </span>
                  <p className="font-mono text-stone-900 mt-0.5 break-words">
                    <strong>Model:</strong> {item.requiredModel || 'As per GA'}
                  </p>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    <strong>Make:</strong> {item.requiredManufacturer} | <strong>Qty:</strong> {item.requiredQty} {item.unit}
                  </p>
                  <p className="text-stone-500 text-[11px] mt-0.5 italic leading-snug">{item.technicalSpec}</p>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-stone-200 pt-2.5 sm:pt-0 sm:pl-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Physical Component Verified on Shopfloor
                  </span>
                  <p className={`font-mono mt-0.5 font-bold break-words ${isMismatch ? 'text-red-700' : 'text-stone-900'}`}>
                    <strong>Model:</strong> {item.actualModel || 'Awaiting shopfloor verification'}
                  </p>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    <strong>Make:</strong> {item.actualManufacturer || item.requiredManufacturer} | <strong>Qty:</strong> {item.actualQty || item.requiredQty} {item.unit}
                  </p>
                  {item.remarks && (
                    <p className="text-stone-500 text-[11px] mt-0.5 italic leading-snug">
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
