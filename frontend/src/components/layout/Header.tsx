import React, { useState } from 'react';
import { useAuth, AppMode } from '../../lib/authContext';
import { Role } from '../../types';
import {
  Monitor,
  Tablet,
  QrCode,
  UserCheck,
  ChevronDown,
  Bell,
  Cpu,
  Layers,
  LogOut,
} from 'lucide-react';
import { QRScannerModal } from '../common/QRScannerModal';

export const Header: React.FC = () => {
  const { user, appMode, setAppMode, switchRole, logout, demoAccounts } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const availableRoles: { role: Role; label: string; desc: string }[] = [
    { role: 'QUALITY_MANAGER', label: 'Quality Manager', desc: 'Approve PDI, close NCRs, release dispatch' },
    { role: 'QUALITY_INSPECTOR', label: 'Quality Inspector', desc: 'Verify BOM, run PDI, raise NCRs' },
    { role: 'PRODUCTION', label: 'Production Supervisor', desc: 'Operation logs, corrective actions' },
    { role: 'ENGINEERING', label: 'Design & Engineering', desc: 'Product specs, BOM approvals, ECR/ECN' },
    { role: 'ADMIN', label: 'System Administrator', desc: 'Full system privileges' },
    { role: 'MANAGEMENT', label: 'Executive Management', desc: 'High-level KPI dashboards & trends' },
  ];

  return (
    <>
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 shadow-sm select-none">
        {/* Brand / Logo (Industrial text styling, responsive) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-900 flex items-center justify-center text-amber-500 font-bold text-base sm:text-lg shadow-sm border border-stone-800 shrink-0">
            Q
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold text-stone-900 tracking-tight text-sm sm:text-base font-mono">
                BE-QTrack
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold shrink-0">
                QA
              </span>
            </div>
            <p className="text-[10px] text-stone-500 hidden md:block tracking-wide">
              Digital Quality & Traceability Platform
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher (Web KPI Suite vs Shopfloor Tablet App) */}
        <div className="flex items-center bg-stone-100 p-0.5 sm:p-1 rounded-xl border border-stone-200 shadow-inner shrink-0">
          <button
            onClick={() => setAppMode('desktop')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              appMode === 'desktop'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-stone-700 shrink-0" />
            <span className="hidden sm:inline">Web KPI</span>
            <span className="sm:hidden">KPI</span>
          </button>
          <button
            onClick={() => setAppMode('tablet')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              appMode === 'tablet'
                ? 'bg-amber-500 text-stone-950 shadow-sm border border-amber-400 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Tablet className="w-3.5 h-3.5 text-stone-900 shrink-0" />
            <span className="hidden sm:inline">Shopfloor</span>
            <span className="sm:hidden">Shop</span>
          </button>
        </div>

        {/* Right Action Icons: QR Scanner & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick QR Scanner Button */}
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium bg-stone-100 hover:bg-amber-100 text-stone-800 border border-stone-300 rounded-lg transition-colors shrink-0"
            title="Scan Panel QR Code"
            aria-label="Scan Panel QR Code"
          >
            <QrCode className="w-4 h-4 text-industrial-amber" />
            <span className="hidden md:inline">Scan QR</span>
          </button>

          {/* Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors shadow-sm shrink-0"
              aria-label="Switch Demo Role"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="text-left hidden lg:block leading-tight">
                <span className="block text-[10px] text-stone-400">Current Demo Role</span>
                <span className="font-bold">{user?.role?.replace('_', ' ')}</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold lg:hidden">
                {user?.role?.split('_')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
            </button>

            {roleDropdownOpen && (
              <div className="fixed sm:absolute top-12 sm:top-full right-2 sm:right-0 mt-1 w-[calc(100vw-1rem)] sm:w-72 max-w-xs bg-white rounded-xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-stone-100 bg-stone-50">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Exhibition Role Switcher
                  </span>
                  <p className="text-xs text-stone-600 font-medium truncate">
                    Active: <strong>{user?.name}</strong> ({user?.role})
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {availableRoles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-amber-50 transition-colors ${
                        user?.role === r.role ? 'bg-amber-50/60 font-semibold text-amber-900' : 'text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.label}</span>
                        {user?.role === r.role && (
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-500 font-normal line-clamp-1">{r.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-1 mt-1 px-3">
                  <button
                    onClick={logout}
                    className="w-full text-left py-1.5 text-xs text-red-600 flex items-center gap-1.5 hover:text-red-700 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </>
  );
};
