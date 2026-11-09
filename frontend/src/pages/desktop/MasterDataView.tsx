import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const MasterDataView: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [panels, setPanels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([apiRequest('/master/work-orders'), apiRequest('/panels')])
      .then(([woList, pList]) => {
        setWorkOrders(woList);
        setPanels(pList);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPanels = panels.filter(
    (p) =>
      p.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.status.toLowerCase().includes(search.toLowerCase()) ||
      p.workOrder?.workOrderNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6 pb-24 sm:pb-20 bg-industrial-surface overflow-y-auto space-y-4 sm:space-y-6">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-stone-900 tracking-tight">
            Work Orders & Panel Fleet
          </h1>
          <p className="text-xs text-stone-500 mt-0.5 leading-snug">
            Production batches, engineering BOM releases, and serialized panel inventory
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search serial, status, WO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 sm:py-1.5 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Panels Fleet Container */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <span className="font-bold text-xs text-stone-900">
            Serialized Panel Register ({filteredPanels.length} Units)
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Serial Number</th>
                <th className="py-2.5 px-3">Product Description</th>
                <th className="py-2.5 px-3">Work Order & Customer</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3 text-right">360° View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPanels.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-stone-900">
                    {p.serialNumber}
                  </td>
                  <td className="py-3 px-3 text-stone-700 font-medium">
                    {p.workOrder?.productTemplate?.name || '12 kV Indoor VCB Panel'}
                  </td>
                  <td className="py-3 px-3 text-stone-600">
                    {p.workOrder?.workOrderNo} ({p.workOrder?.project?.customer?.name})
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/panel/${p.serialNumber}`)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-stone-300"
                    >
                      Dossier <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-stone-100">
          {filteredPanels.map((p) => (
            <div key={p.id} className="p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-stone-900 text-sm">{p.serialNumber}</span>
                <StatusBadge status={p.status} size="sm" />
              </div>
              <p className="text-xs text-stone-700 font-medium leading-snug">
                {p.workOrder?.productTemplate?.name || '12 kV Indoor VCB Panel'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <span>WO: {p.workOrder?.workOrderNo}</span>
                <span>{p.workOrder?.project?.customer?.name}</span>
              </div>
              <button
                onClick={() => navigate(`/panel/${p.serialNumber}`)}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-300 mt-1"
              >
                <span>Open Digital Passport (360°)</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
