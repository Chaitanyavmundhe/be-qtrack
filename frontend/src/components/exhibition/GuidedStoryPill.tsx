import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';

export const GuidedStoryPill: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const navigate = useNavigate();

  const storySteps = [
    {
      step: 1,
      title: '1. Register Panel BEE-12K-2026-001',
      desc: 'View panel serial number generation, product specs, and QR code tag.',
      path: '/panel/BEE-12K-2026-001',
    },
    {
      step: 2,
      title: '2. BOM Discrepancy Detection',
      desc: 'Inspect approved BOM vs actual parts: detect Schneider CAD33 auxiliary relay mismatch!',
      path: '/bom-touch',
    },
    {
      step: 3,
      title: '3. Raise & Investigate NCR',
      desc: 'Open NCR-2026-001: 5-Whys root cause, quarantine, and CAD32 replacement.',
      path: '/reports',
    },
    {
      step: 4,
      title: '4. Execute PDI Inspection Checklist',
      desc: 'Perform 14 test checks (dielectric withstand, ductor test, interlocks) on tablet.',
      path: '/pdi-touch',
    },
    {
      step: 5,
      title: '5. Pre-Dispatch PDF & Quality Gate Release',
      desc: 'Formally sign off PDI and generate PDF certificate. Verify open NCR gating.',
      path: '/pdi-touch',
    },
    {
      step: 6,
      title: '6. Panel 360° Traceability Passport',
      desc: 'Scan QR code to access complete 360° manufacturing & test history.',
      path: '/panel/BEE-12K-2026-001',
    },
    {
      step: 7,
      title: '7. Executive Quality KPI Dashboard',
      desc: 'Observe live FPY, BOM match rate (91.7%), and Pareto defect trends update automatically.',
      path: '/',
    },
  ];

  const handleGo = (idx: number) => {
    setCurrentStep(idx);
    navigate(storySteps[idx].path);
  };

  return (
    <div className="bg-stone-900 text-stone-200 border-b border-stone-800 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 sm:gap-2 shadow-inner select-none">
      <div className="flex items-center justify-between md:justify-start gap-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
            <PlayCircle className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">5-Min Demo</span>
            <span className="sm:hidden">Story</span>
          </span>
          <span className="text-stone-300 font-medium text-[11px] sm:text-xs truncate">
            Step {currentStep + 1}/7: <strong className="text-white">{storySteps[currentStep].title}</strong>
          </span>
        </div>

        {/* Mobile quick next button */}
        <div className="flex items-center gap-1.5 shrink-0 md:hidden">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-stone-400 hover:text-stone-200 text-[10px] underline px-1 py-0.5"
          >
            {collapsed ? 'Steps' : 'Hide'}
          </button>
          <button
            onClick={() => handleGo((currentStep + 1) % storySteps.length)}
            className="flex items-center gap-0.5 bg-amber-500 hover:bg-amber-400 text-stone-950 px-2 py-0.5 rounded font-bold text-[11px] transition-colors shadow-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-stone-400 hover:text-stone-200 underline text-[11px]"
        >
          {collapsed ? 'View All Steps' : 'Hide Steps'}
        </button>

        <button
          onClick={() => handleGo((currentStep + 1) % storySteps.length)}
          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1 rounded-md font-bold text-xs transition-colors shadow-sm"
        >
          <span>Next Story Stage</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="w-full mt-1.5 pt-2 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
          {storySteps.map((st, i) => (
            <button
              key={st.step}
              onClick={() => handleGo(i)}
              className={`text-left p-2 rounded-lg border transition-colors ${
                currentStep === i
                  ? 'bg-amber-500/20 border-amber-500/80 text-white'
                  : 'bg-stone-800/60 border-stone-700/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="font-semibold text-xs flex items-center justify-between">
                <span>{st.title}</span>
                {currentStep === i && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5 leading-snug line-clamp-2">{st.desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
