import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  TrendingUp,
  Percent,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface KpiData {
  summary: {
    totalPanels: number;
    panelsInProduction: number;
    panelsDispatchReady: number;
    panelsDispatched: number;
    openNcrsCount: number;
    overdueNcrsCount: number;
    totalNcrs: number;
    bomMatchRate: number;
    pdiFirstPassRate: number;
    firstPassYield: number;
    avgClosureTimeHours: number;
  };
  charts: {
    stageDistribution: { stage: string; count: number }[];
    ncrByStatus: { status: string; count: number }[];
    ncrByCategory: { category: string; count: number }[];
    ncrByDepartment: { department: string; count: number }[];
    bomVerificationSummary: {
      total: number;
      matched: number;
      mismatched: number;
      pending: number;
    };
  };
}

export const ExecutiveKpiDashboard: React.FC = () => {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchKpis = async () => {
    try {
      setIsRefreshing(true);
      const res = await apiRequest<KpiData>('/dashboard/kpi');
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPIs');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKpis();

    // Listen to real-time Server-Sent Events (SSE)
    const eventSource = new EventSource('/api/dashboard/stream');
    eventSource.onmessage = (event) => {
      try {
        const live = JSON.parse(event.data);
        setData(live);
      } catch (e) {
        console.error('Error parsing SSE payload:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
          <h3 className="font-bold text-stone-800">Calculating Live Quality KPIs...</h3>
          <p className="text-xs text-stone-500">Querying PostgreSQL database aggregates</p>
        </div>
      </div>
    );
  }

  const s = data?.summary;
  const c = data?.charts;

  // Chart Color Schemes (Industrial Warm Slate & Amber palette)
  const PARETO_COLORS = ['#d97706', '#ea580c', '#b45309', '#78350f', '#451a03'];
  const STAGE_COLORS = ['#334155', '#475569', '#64748b', '#94a3b8', '#d97706', '#059669'];

  return (
    <div className="flex-1 p-4 md:p-6 bg-industrial-surface overflow-y-auto space-y-6">
      {/* Top Title & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
              Executive Quality KPI Command Center
            </h1>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> Live DB Sync
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time quality metrics computed directly from shopfloor panel traceability & inspection runs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-700 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent font-medium text-stone-900 focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Assembly">Assembly</option>
              <option value="Fabrication">Fabrication</option>
              <option value="Wiring">Wiring</option>
              <option value="Quality">Quality QA</option>
            </select>
          </div>

          <button
            onClick={fetchKpis}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top 4 Primary Industrial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* First-Pass Yield (FPY) */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>First-Pass Yield (FPY)</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-stone-900 font-mono">
              {s?.firstPassYield}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Target: ≥90%
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Formula: Panels passing final inspection without rework / First-inspected panels × 100
          </p>
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* PDI First-Pass Rate */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>PDI First-Pass Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-stone-900 font-mono">
              {s?.pdiFirstPassRate}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Release Gate
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Panels passing their initial PDI run on first submission
          </p>
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

        {/* BOM Match Rate */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>BOM Verification Match</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-stone-900 font-mono">
              {s?.bomMatchRate}%
            </span>
            <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
              1 Mismatch
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Auxiliary Relay model discrepancy detected on BEE-12K-2026-001
          </p>
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-600" />
        </div>

        {/* Active Open & Overdue NCRs */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Open Quality NCRs</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-red-700 font-mono">
              {s?.openNcrsCount}
            </span>
            <span className="text-xs text-stone-500">
              ({s?.overdueNcrsCount} Overdue)
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Total logged: {s?.totalNcrs} | MTTR: 24.5 hrs
          </p>
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
        </div>
      </div>

      {/* Production & Dispatch Counter Strip */}
      <div className="bg-stone-900 text-white rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-black text-lg">
            {s?.totalPanels}
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-100">Registered Panel Fleet Under Traceability</h4>
            <p className="text-xs text-stone-400">
              12 kV Indoor Air-Insulated VCB Switchboards (ABB VD4 Breakers)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">In Production</span>
            <span className="text-base font-bold text-amber-400 font-mono">{s?.panelsInProduction} Units</span>
          </div>
          <div className="border-l border-stone-800 pl-6">
            <span className="text-stone-400 block text-[10px] uppercase">Dispatch Ready</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{s?.panelsDispatchReady} Unit</span>
          </div>
          <div className="border-l border-stone-800 pl-6">
            <span className="text-stone-400 block text-[10px] uppercase">Dispatched to Site</span>
            <span className="text-base font-bold text-stone-300 font-mono">{s?.panelsDispatched} Unit</span>
          </div>
        </div>
      </div>

      {/* Two Column Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Defect Category Pareto Distribution */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Defect Category Pareto Analysis</h3>
              <p className="text-[11px] text-stone-500">Distribution of non-conformances identified across manufacturing</p>
            </div>
            <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
              Pareto Distribution
            </span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={c?.ncrByCategory || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1efe9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  width={130}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181b20',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]}>
                  {(c?.ncrByCategory || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PARETO_COLORS[index % PARETO_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Panel Stage Lifecycle Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Panel Lifecycle Stage Breakdown</h3>
              <p className="text-[11px] text-stone-500">Active WIP tracking across production gates</p>
            </div>
            <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
              Stage WIP
            </span>
          </div>

          <div className="h-64 mt-4 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={c?.stageDistribution || []}
                    dataKey="count"
                    nameKey="stage"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {(c?.stageDistribution || []).map((_, index) => (
                      <Cell key={`stage-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181b20',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 space-y-1.5 pl-2 max-h-56 overflow-y-auto text-xs">
              {(c?.stageDistribution || []).map((item, idx) => (
                <div key={item.stage} className="flex items-center justify-between py-1 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length] }}
                    />
                    <span className="text-stone-700 font-medium text-[11px]">{item.stage}</span>
                  </div>
                  <span className="font-mono font-bold text-stone-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Exhibition Discrepancy Alert Ticker */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
            <AlertTriangle className="w-5 h-5 text-industrial-amber" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-stone-900 text-sm">Active BOM Discrepancy Flagged</h4>
              <StatusBadge status="MISMATCH" size="sm" />
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Panel <strong className="font-mono text-stone-900">BEE-12K-2026-001</strong> has an installed auxiliary relay (Schneider CAD33-BD) that deviates from the approved BOM specification (Schneider CAD32-BD).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/bom-touch"
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            Review BOM Verification <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
