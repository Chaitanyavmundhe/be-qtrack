import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileText,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QualityReports: React.FC = () => {
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [pdiRuns, setPdiRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReportTab, setActiveReportTab] = useState<'ncr' | 'pdi'>('ncr');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([apiRequest('/ncr'), apiRequest('/pdi/runs')])
      .then(([ncrList, pdiList]) => {
        setNcrs(ncrList);
        setPdiRuns(pdiList);
      })
      .catch((err) => console.error('Error fetching reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = async (runId: string, serial: string) => {
    try {
      const token = localStorage.getItem('beqtrack_token');
      const res = await fetch(`/api/pdi/pdf/${runId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PDI-Report-${serial}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`PDF Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center text-xs text-stone-500">Loading Quality Records...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-industrial-surface overflow-y-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
            Quality Records & Inspection Reports
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Full compliance traceability: NCR defect register, 5-Whys corrective actions, and downloadable PDI release certificates
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setActiveReportTab('ncr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeReportTab === 'ncr'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            NCR Register ({ncrs.length})
          </button>
          <button
            onClick={() => setActiveReportTab('pdi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeReportTab === 'pdi'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            PDI Reports ({pdiRuns.length})
          </button>
        </div>
      </div>

      {/* NCR Register Table View */}
      {activeReportTab === 'ncr' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <span className="font-bold text-xs text-stone-900">
              Non-Conformance Reports (NCR) & 8D/CAPA Log
            </span>
            <button
              onClick={() => navigate('/ncr-fast')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              + Raise New NCR
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">NCR Number</th>
                  <th className="py-2.5 px-3">Panel Serial</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Defect Description</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Target Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ncrs.map((n) => (
                  <tr key={n.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">
                      {n.ncrNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-700">
                      {n.panel?.serialNumber ? (
                        <button
                          onClick={() => navigate(`/panel/${n.panel.serialNumber}`)}
                          className="hover:underline text-amber-800 font-bold"
                        >
                          {n.panel.serialNumber}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-stone-700 font-medium">
                      {n.defectCategory}
                    </td>
                    <td className="py-3 px-3 text-stone-600 max-w-xs truncate" title={n.defectDescription}>
                      {n.defectDescription}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          n.severity === 'High' || n.severity === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {n.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={n.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                      {n.targetDate ? new Date(n.targetDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PDI Reports Table View */}
      {activeReportTab === 'pdi' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50">
            <span className="font-bold text-xs text-stone-900">
              Pre-Dispatch Inspection (PDI) Reports & Digital Release Certificates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Panel Serial</th>
                  <th className="py-2.5 px-3">Run #</th>
                  <th className="py-2.5 px-3">Customer & Work Order</th>
                  <th className="py-2.5 px-3">Inspector</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {pdiRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">
                      {r.panel?.serialNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-600">
                      Run #{r.runNumber}
                    </td>
                    <td className="py-3 px-3 text-stone-700">
                      {r.panel?.workOrder?.project?.customer?.name} ({r.panel?.workOrder?.workOrderNo})
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {r.inspector?.name}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDownloadPdf(r.id, r.panel?.serialNumber)}
                        className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold inline-flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Download className="w-3 h-3 text-amber-400" /> PDF Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
