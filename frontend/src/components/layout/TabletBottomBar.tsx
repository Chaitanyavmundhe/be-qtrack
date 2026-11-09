import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  ClipboardCheck,
  CheckSquare,
  AlertTriangle,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const TabletBottomBar: React.FC = () => {
  const tabs = [
    { to: '/tablet', label: 'Shopfloor', icon: LayoutGrid },
    { to: '/pdi-touch', label: 'PDI Check', icon: ClipboardCheck },
    { to: '/bom-touch', label: 'BOM Verify', icon: CheckSquare },
    { to: '/ncr-fast', label: 'Log NCR', icon: AlertTriangle },
    { to: '/panel/BEE-12K-2026-001', label: 'Panel 360', icon: QrCode },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-1 py-1 shadow-2xl flex items-center justify-around pb-[max(0.35rem,env(safe-area-inset-bottom))] select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-900 bg-amber-100/80 font-bold'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`
            }
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium tracking-tight truncate w-full text-center mt-0.5">
              {tab.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};
