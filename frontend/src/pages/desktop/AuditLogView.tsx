import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { History, ShieldCheck, User } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/users/audit')
      .then(setLogs)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center text-xs text-stone-500">Loading System Audit Trail...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-industrial-surface overflow-y-auto space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
          System Audit Trail & Compliance Log
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Immutable event log of every status transition, inspection sign-off, BOM verification, and NCR closure
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User & Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Details / Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-amber-50/20 transition-colors">
                  <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-stone-800">
                    {log.user?.name} ({log.user?.role})
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {log.entityType} ({log.entityId?.slice(0, 8)})
                  </td>
                  <td className="py-2.5 px-3 text-stone-500 max-w-sm truncate">
                    {JSON.stringify(log.details)}
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
