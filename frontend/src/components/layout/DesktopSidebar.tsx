import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Boxes,
  ClipboardCheck,
  AlertTriangle,
  History,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Executive KPI Suite', icon: BarChart3 },
    { to: '/reports', label: 'Quality & PDI Reports', icon: FileText },
    { to: '/master', label: 'Work Orders & Panels', icon: Boxes },
    { to: '/ecr', label: 'Engineering Changes (ECR)', icon: Layers },
    { to: '/audit', label: 'Audit Trail & Compliance', icon: History },
    { to: '/vcb-showcase', label: '12 kV VCB Specification', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-200 border-r border-stone-800 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-4">
        <div className="px-3 py-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
          Executive Command Center
        </div>

        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Industrial Plant Identification Footer */}
      <div className="p-4 border-t border-stone-800 bg-stone-950/60 text-xs text-stone-400">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold text-stone-300">Waluj MIDC Plant (K-89)</span>
        </div>
        <p className="text-[11px] text-stone-500">
          Chhatrapati Sambhajinagar, Maharashtra
        </p>
        <div className="mt-2 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
          <span>Standards: IEC 62271</span>
          <span className="font-mono text-amber-500">ISO 9001:2015</span>
        </div>
      </div>
    </aside>
  );
};
