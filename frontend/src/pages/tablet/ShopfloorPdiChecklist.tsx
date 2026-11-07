import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../lib/authContext';
import {
  ClipboardCheck,
  Check,
  X,
  FileDown,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ShopfloorPdiChecklist: React.FC = () => {
  const { user } = useAuth();
  const [panelSerial, setPanelSerial] = useState('BEE-12K-2026-001');
  const [panel, setPanel] = useState<any>(null);
  const [run, setRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadPanelAndPdi = async (serial: string) => {
    setLoading(true);
    try {
      const p = await apiRequest(`/panels/by-serial/${serial}`);
      setPanel(p);

      // Start or load active PDI run
      const activeRun = await apiRequest('/pdi/start', {
        method: 'POST',
        body: JSON.stringify({ panelId: p.id }),
      });
      setRun(activeRun);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPanelAndPdi(panelSerial);
  }, []);

  const handleUpdateResult = async (
    resultId: string,
    result: string,
    measuredValue?: string,
    comment?: string,
    autoCreateNcr?: boolean
  ) => {
    setSavingItem(resultId);
    try {
      await apiRequest('/pdi/record-item', {
        method: 'POST',
        body: JSON.stringify({
          inspectionRunId: run.id,
          resultId,
          result,
          measuredValue,
          comment,
          autoCreateNcr,
        }),
      });

      // Update local state
      setRun((prev: any) => ({
        ...prev,
        results: prev.results.map((r: any) =>
          r.id === resultId
            ? { ...r, result, measuredValue: measuredValue || r.measuredValue, comment: comment || r.comment }
            : r
        ),
      }));
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSavingItem(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!run?.id) return;
    setPdfGenerating(true);
    try {
      const token = localStorage.getItem('beqtrack_token');
      const res = await fetch(`/api/pdi/pdf/${run.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PDI-Report-${panelSerial}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setActionMessage('PDI Certificate PDF successfully generated and downloaded!');
    } catch (err: any) {
      alert(`PDF Error: ${err.message}`);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleQualityManagerApproval = async (decision: 'Approved' | 'Rejected') => {
    try {
      const res = await apiRequest(`/pdi/runs/${run.id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ decision, remarks: `Decision by ${user?.name}` }),
      });
      setActionMessage(res.message);
      loadPanelAndPdi(panelSerial);
    } catch (err: any) {
      alert(`Approval Blocked: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-xs text-stone-500">Loading PDI Inspection Dossier...</div>
      </div>
    );
  }

  const results = run?.results || [];
  const passedCount = results.filter((r: any) => r.result === 'Pass').length;
  const failedCount = results.filter((r: any) => r.result === 'Fail').length;

  return (
    <div className="flex-1 p-4 pb-20 bg-industrial-surface overflow-y-auto space-y-4">
      {/* Top Equipment Spec Header */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-stone-900 font-mono">
              PDI Checklist: {panel?.serialNumber}
            </h2>
            <StatusBadge status={run?.status || 'InProgress'} size="sm" />
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            12 kV Indoor Air-Insulated VCB Switchboard | ABB VD4 1250A Breaker | Customer: {panel?.workOrder?.project?.customer?.name}
          </p>
        </div>

        {/* Action Buttons: PDF & Approval */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={pdfGenerating}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-400" />
            {pdfGenerating ? 'Generating...' : 'Download PDI PDF'}
          </button>

          {(user?.role === 'ADMIN' || user?.role === 'QUALITY_MANAGER') && (
            <button
              onClick={() => handleQualityManagerApproval('Approved')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve Release
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 font-bold ml-2">×</button>
        </div>
      )}

      {/* Progress Counter Pill */}
      <div className="bg-stone-100 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span>
            Total Checks: <strong className="font-mono">{results.length}</strong>
          </span>
          <span className="text-emerald-700">
            Passed: <strong className="font-mono">{passedCount}</strong>
          </span>
          <span className="text-red-700">
            Failed: <strong className="font-mono">{failedCount}</strong>
          </span>
        </div>
        <span className="text-[11px] font-mono text-stone-500">
          Inspector: <strong>{run?.inspector?.name}</strong>
        </span>
      </div>

      {/* Checklist Items Container */}
      <div className="space-y-3">
        {results.map((item: any, idx: number) => {
          const isPass = item.result === 'Pass';
          const isFail = item.result === 'Fail';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-4 border transition-all ${
                isFail
                  ? 'border-red-300 bg-red-50/20 shadow-sm'
                  : isPass
                  ? 'border-stone-200'
                  : 'border-stone-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm mt-1">{item.checkItem}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    <strong>Acceptance:</strong> {item.acceptance || 'Per approved technical drawings'}
                  </p>
                </div>

                {/* Big Touch Buttons: PASS / FAIL / NA */}
                <div className="flex items-center gap-1.5 shrink-0 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleUpdateResult(item.id, 'Pass', item.measuredValue, item.comment)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      isPass
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> PASS
                  </button>

                  <button
                    onClick={() => handleUpdateResult(item.id, 'Fail', item.measuredValue, item.comment, true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      isFail
                        ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" /> FAIL
                  </button>
                </div>
              </div>

              {/* Measured Value Input Row */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-stone-500 font-semibold uppercase block mb-0.5">
                    Measured Value {item.unit ? `(${item.unit})` : ''}
                  </label>
                  <input
                    type="text"
                    defaultValue={item.measuredValue || ''}
                    placeholder={item.unit ? `Enter ${item.unit}` : 'Result or observation'}
                    onBlur={(e) => handleUpdateResult(item.id, item.result || 'Pass', e.target.value, item.comment)}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-500 font-semibold uppercase block mb-0.5">
                    Inspector Observation / Remarks
                  </label>
                  <input
                    type="text"
                    defaultValue={item.comment || ''}
                    placeholder="e.g. Verified satisfactory"
                    onBlur={(e) => handleUpdateResult(item.id, item.result || 'Pass', item.measuredValue, e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {isFail && (
                <div className="mt-2 p-2 bg-red-100/60 border border-red-200 rounded text-[11px] text-red-800 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    Inspection Failure: Automatically linked to Quality NCR register.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
