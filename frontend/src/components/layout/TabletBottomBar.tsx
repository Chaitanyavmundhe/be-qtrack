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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 px-2 py-1 shadow-lg flex items-center justify-around safe-area-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-700 bg-amber-50 font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-medium tracking-tight">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
