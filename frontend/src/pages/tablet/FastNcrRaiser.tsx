import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Send,
  HelpCircle,
  Camera,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const FastNcrRaiser: React.FC = () => {
  const navigate = useNavigate();
  const [panelSerial, setPanelSerial] = useState('BEE-12K-2026-001');
  const [department, setDepartment] = useState('Low Voltage Assembly');
  const [defectCategory, setDefectCategory] = useState('BOM / Component Mismatch');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState(
    'Auxiliary Relay Model Mismatch: Installed Schneider CAD33-BD instead of approved engineering BOM specification Schneider CAD32-BD. Terminal arrangement does not match schematic wiring diagram.'
  );
  const [immediateCorrection, setImmediateCorrection] = useState(
    'Quarantined CAD33-BD relay and requested approved CAD32-BD 24V DC units from stores.'
  );
  const [whys, setWhys] = useState([
    'Why 1: Wrong auxiliary relay mounted on rail.',
    'Why 2: Operator picked CAD33 bin item without checking sub-code.',
    'Why 3: Stores bin label for CAD32 had mixed stock after inward receipt.',
    'Why 4: Visual inspection on inward receipt did not verify contact configuration.',
    'Why 5: Lack of barcode verification check at stores issue staging.',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const panel = await apiRequest(`/panels/by-serial/${panelSerial}`);
      const ncr = await apiRequest('/ncr', {
        method: 'POST',
        body: JSON.stringify({
          panelId: panel.id,
          department,
          defectCategory,
          severity,
          defectDescription: description,
          immediateCorrection,
          rootCauseMethod: '5-Whys Analysis',
          rootCauseAnalysis: whys.join('\n'),
          targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      setSuccessResult(ncr);
    } catch (err: any) {
      alert(`Error logging NCR: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-4 pb-24 sm:pb-20 bg-industrial-surface overflow-y-auto space-y-3 sm:space-y-4 max-w-2xl mx-auto">
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 bg-amber-100 rounded-lg text-amber-800 shrink-0">
            <AlertTriangle className="w-5 h-5 text-industrial-amber" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
              Raise Non-Conformance Report (NCR)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Shopfloor Quality Defect & 5-Whys Corrective Action Logger
            </p>
          </div>
        </div>
      </div>

      {successResult ? (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-emerald-300 shadow-sm text-center space-y-3 sm:space-y-4">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 mx-auto" />
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            NCR {successResult.ncrNumber} Successfully Logged!
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Linked to panel <strong className="font-mono">{panelSerial}</strong>. Panel status transitioned to{' '}
            <span className="font-mono font-bold text-red-700 bg-red-50 px-1 py-0.5 rounded border border-red-200">
              REWORK_REQUIRED
            </span>.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
            <button
              onClick={() => navigate('/reports')}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
            >
              View in NCR Register
            </button>
            <button
              onClick={() => setSuccessResult(null)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg text-xs font-semibold"
            >
              Raise Another NCR
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-sm">
          {/* Panel Serial Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Affected Panel Serial Number
            </label>
            <input
              type="text"
              value={panelSerial}
              onChange={(e) => setPanelSerial(e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 border border-stone-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="Low Voltage Assembly">Low Voltage Assembly</option>
                <option value="Sheet Metal Fabrication">Sheet Metal Fabrication</option>
                <option value="Busbar Installation">Busbar Installation</option>
                <option value="Incoming Material Stores">Incoming Material Stores</option>
                <option value="Final Quality Testing">Final Quality Testing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Defect Category
              </label>
              <select
                value={defectCategory}
                onChange={(e) => setDefectCategory(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="BOM / Component Mismatch">BOM / Component Mismatch</option>
                <option value="Loose Termination">Loose Termination</option>
                <option value="Shutter Mechanism Variation">Shutter Mechanism Variation</option>
                <option value="Surface & Paint Finish">Surface & Paint Finish</option>
                <option value="Missing Hardware">Missing Hardware / Accessories</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Severity / Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center min-h-[38px] ${
                    severity === s
                      ? s === 'Critical' || s === 'High'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm font-bold'
                        : 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm font-bold'
                      : 'bg-stone-50 text-stone-600 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Defect Description & Physical Evidence
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Immediate Containment / Correction
            </label>
            <input
              type="text"
              value={immediateCorrection}
              onChange={(e) => setImmediateCorrection(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="What action was taken to isolate the defect?"
            />
          </div>

          {/* 5-Whys Root Cause Methodology Section */}
          <div className="p-3 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              5-Whys Root Cause Analysis Questionnaire
            </span>
            <div className="space-y-2">
              {whys.map((why, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-950 font-bold text-[10px] flex items-center justify-center shrink-0 font-mono">
                    W{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={why}
                    onChange={(e) => {
                      const newWhys = [...whys];
                      newWhys[idx] = e.target.value;
                      setWhys(newWhys);
                    }}
                    className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all min-h-[48px]"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting NCR...' : 'Submit Non-Conformance Report'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
