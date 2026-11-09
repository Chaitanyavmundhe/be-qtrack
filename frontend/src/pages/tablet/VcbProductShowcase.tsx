import React from 'react';
import {
  Cpu,
  Shield,
  Layers,
  CheckCircle,
  FileText,
  Award,
  ExternalLink,
} from 'lucide-react';

export const VcbProductShowcase: React.FC = () => {
  return (
    <div className="flex-1 p-3 sm:p-4 pb-24 sm:pb-20 bg-industrial-surface overflow-y-auto space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Title & Product Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-4 sm:gap-6">
        {/* Real Product Image from website */}
        <div className="w-full sm:w-72 md:w-64 h-48 sm:h-56 bg-stone-50 rounded-xl border border-stone-200 p-2.5 flex items-center justify-center shrink-0 shadow-inner">
          <img
            src="/assets/12kv-vcb-panel.png"
            alt="12 kV Indoor Air-Insulated VCB Switchboard"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-mono">
              STANDARD REFERENCE PRODUCT
            </span>
            <span className="text-xs text-stone-500 font-mono">IS 3427 / IEC 62271-200</span>
          </div>

          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-stone-900 tracking-tight">
            12 kV Indoor Air-Insulated Draw-out VCB Panel
          </h1>

          <p className="text-xs text-stone-600 leading-relaxed">
            Fitted with <strong>ABB VD4 horizontal draw-out type vacuum circuit breaker</strong>. Engineered for 12 kV medium-voltage power distribution with door-closed racking, positive mechanical safety interlocks, and compact air-insulated construction.
          </p>

          <div className="pt-1 flex flex-wrap justify-center md:justify-start gap-1.5 text-xs">
            <span className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md font-mono border border-stone-200 text-[11px]">
              ABB Certified MV Panel Builder
            </span>
            <span className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md font-mono border border-stone-200 text-[11px]">
              CPRI / ERDA Type Tested
            </span>
            <span className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md font-mono border border-stone-200 text-[11px]">
              Paint: RAL 7032 Grey
            </span>
          </div>

          <p className="text-[10px] text-stone-400 italic pt-1">
            Image & specifications source: bushelectromech.com (Public Product Documentation)
          </p>
        </div>
      </div>

      {/* Published Technical Specifications Grid */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Published Technical Reference Specifications
            </h2>
            <p className="text-xs text-stone-500">
              Configured in the BE-QTrack product master for automated PDI template generation
            </p>
          </div>
          <Award className="w-5 h-5 text-amber-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Rated Voltage', val: '12 kV' },
            { label: 'Rated Insulation Voltage', val: '12 kV' },
            { label: 'Power Frequency Withstand', val: '28 kV for 1 minute' },
            { label: 'Lightning Impulse Withstand', val: '75 kV peak' },
            { label: 'Rated Frequency', val: '50 Hz' },
            { label: 'Short-Time Withstand Current', val: '20 / 26.3 / 31.5 / 40 kA (3s)' },
            { label: 'Peak Current', val: '65.75 kA' },
            { label: 'Main Busbar Rated Current', val: '630 – 1600 A (up to 2000 A)' },
            { label: 'Branch Connection Current', val: '630 – 1600 A' },
            { label: 'Maintenance Clearance (Front)', val: '1.5 meters' },
            { label: 'Maintenance Clearance (Rear)', val: '1.0 meter' },
            { label: 'Maintenance Clearance (Sides)', val: '1.0 meter' },
            { label: 'Cable Connection Height', val: '600 mm' },
            { label: 'Standard Paint Shade', val: 'RAL 7032 Siemens Grey' },
            { label: 'Approximate Enclosure Weight', val: '600 kg' },
          ].map((item) => (
            <div key={item.label} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-400 font-semibold uppercase block">
                {item.label}
              </span>
              <span className="font-mono font-bold text-stone-900 text-sm mt-0.5 block">
                {item.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Interlocking & Construction Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" /> Operator Safety Interlocks
          </h3>
          <ul className="text-xs text-stone-600 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>Door-closed breaker racking between TEST and SERVICE positions.</li>
            <li>Mechanical interlock preventing racking while circuit breaker contacts are CLOSED.</li>
            <li>Automatic metallic shutters that positively close over fixed cluster contacts on breaker withdrawal.</li>
            <li>Earthing switch interlocked to prevent closure when breaker is racked into service.</li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" /> Manufacturing Quality Controls
          </h3>
          <ul className="text-xs text-stone-600 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>2.0mm high-grade CRCA sheet metal with CNC laser cutting and precision bending.</li>
            <li>7-tank chemical pre-treatment and electrostatic powder coating (60–80 μm).</li>
            <li>Electrolytic copper (EC grade) main busbars with color-coded heat-shrink sleeves.</li>
            <li>Routine dielectric test: 28 kV AC rms for 1 minute before dispatch release.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
