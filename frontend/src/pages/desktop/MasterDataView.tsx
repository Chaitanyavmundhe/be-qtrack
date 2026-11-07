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
    <div className="flex-1 p-4 md:p-6 bg-industrial-surface overflow-y-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
            Work Orders & Panel Fleet
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Production batches, engineering BOM releases, and serialized panel inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search serial, status, WO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* Panels Fleet Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <span className="font-bold text-xs text-stone-900">
            Serialized Panel Register ({filteredPanels.length} Units)
          </span>
        </div>

        <div className="overflow-x-auto">
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
      </div>
    </div>
  );
};
