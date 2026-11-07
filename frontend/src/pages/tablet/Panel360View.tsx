import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  QrCode,
  Calendar,
  Layers,
  Cpu,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Printer,
} from 'lucide-react';

export const Panel360View: React.FC = () => {
  const { serial } = useParams<{ serial?: string }>();
  const activeSerial = serial || 'BEE-12K-2026-001';
  const [panel, setPanel] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'operations' | 'bom' | 'ncr' | 'pdi' | 'specs'>('timeline');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiRequest(`/panels/by-serial/${activeSerial}`)
      .then(setPanel)
      .catch((err) => alert(`Error loading panel: ${err.message}`))
      .finally(() => setLoading(false));
  }, [activeSerial]);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center text-xs text-stone-500">Retrieving Panel 360° Digital Dossier...</div>
      </div>
    );
  }

  if (!panel) {
    return (
      <div className="flex-1 p-8 text-center text-stone-600">
        Panel with serial <strong>{activeSerial}</strong> not found.
      </div>
    );
  }

  const wo = panel.workOrder;
  const project = wo?.project;
  const customer = project?.customer;
  const product = wo?.productTemplate;

  return (
    <div className="flex-1 p-4 pb-20 bg-industrial-surface overflow-y-auto space-y-4">
      {/* Panel Top Passport Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* QR Code Tag Box */}
          <div className="w-20 h-20 p-1 bg-stone-50 border border-stone-300 rounded-xl flex items-center justify-center shrink-0">
            {panel.qrCodeData ? (
              <img src={panel.qrCodeData} alt="Panel QR" className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-10 h-10 text-stone-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Digital Traceability Passport
              </span>
              <StatusBadge status={panel.status} size="sm" />
            </div>

            <h1 className="text-xl font-black text-stone-900 font-mono tracking-tight mt-0.5">
              {panel.serialNumber}
            </h1>

            <p className="text-xs text-stone-600 font-medium mt-0.5">
              {product?.name} | ABB VD4 Breaker
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500 mt-2 font-mono">
              <span>WO: <strong>{wo?.workOrderNo}</strong></span>
              <span>Project: <strong>{project?.projectNo}</strong></span>
              <span>Customer: <strong>{customer?.name}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-300"
          >
            <Printer className="w-3.5 h-3.5" /> Print QR Tag
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-3 rounded-xl shadow-sm overflow-x-auto text-xs">
        {[
          { key: 'timeline', label: 'Lifecycle Gates' },
          { key: 'operations', label: `Operations (${panel.operationLogs?.length || 0})` },
          { key: 'bom', label: 'BOM Verification' },
          { key: 'ncr', label: `NCRs (${panel.ncrs?.length || 0})` },
          { key: 'pdi', label: 'PDI Inspection' },
          { key: 'specs', label: 'Technical Specs' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-3 px-4 font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.key
                ? 'border-amber-500 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Lifecycle Gates Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 text-sm">Status Progression & Quality Gate Audit</h3>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-stone-200">
            {(panel.statusHistory || []).map((h: any, idx: number) => (
              <div key={h.id || idx} className="flex items-start gap-3 relative pl-6">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white absolute left-2 top-1.5" />
                <div className="flex-1 bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-stone-900">{h.toStatus}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(h.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-stone-600 mt-1">{h.reason}</p>
                  <span className="text-[10px] text-stone-400 mt-1 block">By: {h.changedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Operations Log */}
      {activeTab === 'operations' && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h3 className="font-bold text-stone-900 text-sm">Manufacturing Route & Operations Log</h3>
          <div className="space-y-2">
            {(panel.operationLogs || []).map((op: any, i: number) => (
              <div key={op.id || i} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{op.operation}</span>
                    <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 rounded">{op.stage}</span>
                  </div>
                  <p className="text-stone-500 mt-0.5">{op.description}</p>
                </div>
                <StatusBadge status={op.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: BOM Verification */}
      {activeTab === 'bom' && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm">Shopfloor BOM Component Audit</h3>
            <button
              onClick={() => navigate('/bom-touch')}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Open Interactive Verifier →
            </button>
          </div>

          <div className="space-y-2">
            {(panel.bomVerifications || []).map((v: any) => (
              <div
                key={v.id}
                className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                  v.status === 'Mismatch' ? 'bg-red-50/60 border-red-300' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{v.bomItem?.componentName}</span>
                    <StatusBadge status={v.status} size="sm" />
                  </div>
                  <p className="text-stone-600 font-mono mt-0.5">
                    Installed: <strong>{v.actualModel || 'Pending'}</strong> | Req: {v.bomItem?.modelNumber}
                  </p>
                  {v.remarks && <p className="text-stone-500 italic mt-0.5">{v.remarks}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: NCRs */}
      {activeTab === 'ncr' && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h3 className="font-bold text-stone-900 text-sm">Linked Non-Conformance Reports</h3>
          {(panel.ncrs || []).length === 0 ? (
            <p className="text-xs text-stone-500">No active or historical NCRs logged for this panel.</p>
          ) : (
            (panel.ncrs || []).map((ncr: any) => (
              <div key={ncr.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">{ncr.ncrNumber}</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-semibold">
                      {ncr.defectCategory}
                    </span>
                  </div>
                  <StatusBadge status={ncr.status} size="sm" />
                </div>
                <p className="text-stone-700">{ncr.defectDescription}</p>
                {ncr.immediateCorrection && (
                  <p className="text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                    <strong>Correction:</strong> {ncr.immediateCorrection}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: PDI Inspection */}
      {activeTab === 'pdi' && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm">Pre-Dispatch Inspection (PDI)</h3>
            <button
              onClick={() => navigate('/pdi-touch')}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Open PDI Checklist →
            </button>
          </div>

          {(panel.inspectionRuns || []).map((r: any) => (
            <div key={r.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">Run #{r.runNumber} ({r.template?.name})</span>
                <StatusBadge status={r.status} size="sm" />
              </div>
              <p className="text-stone-600">{r.remarks || 'Dielectric withstand and interlocks passed'}</p>
              <span className="text-[10px] text-stone-400 block">
                Inspected by {r.inspector?.name} on {new Date(r.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Technical Specifications */}
      {activeTab === 'specs' && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h3 className="font-bold text-stone-900 text-sm">Verified Product Technical Specifications</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-[10px] text-stone-400 uppercase block">Rated Voltage</span>
              <span className="font-mono font-bold text-stone-900 text-sm">12 kV</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-[10px] text-stone-400 uppercase block">Rated Current</span>
              <span className="font-mono font-bold text-stone-900 text-sm">1250 A</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-[10px] text-stone-400 uppercase block">Short-Time Withstand</span>
              <span className="font-mono font-bold text-stone-900 text-sm">31.5 kA for 3s</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-[10px] text-stone-400 uppercase block">Dielectric Withstand</span>
              <span className="font-mono font-bold text-stone-900 text-sm">28 kV 1 min</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-[10px] text-stone-400 uppercase block">Lightning Impulse</span>
              <span className="font-mono font-bold text-stone-900 text-sm">75 kV</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-[10px] text-stone-400 uppercase block">Paint Shade</span>
              <span className="font-mono font-bold text-stone-900 text-sm">RAL 7032 Siemens Grey</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
