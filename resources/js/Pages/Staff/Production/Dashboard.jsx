import { useState, useMemo } from 'react';
import ProductionStaffLayout from '@/Layouts/ProductionStaffLayout';
import { Head } from '@inertiajs/react';

// ─────────────────────────────────────────────
// SAMPLE DATA  (replace with real props later)
// ─────────────────────────────────────────────
const SAMPLE_ORDERS = [
    { id: 'PO-2026-001', product: 'Silk Yarn A', planned: 500, produced: 340, startDate: '2026-02-20', status: 'In Progress' },
    { id: 'PO-2026-002', product: 'Cocoon Batch B', planned: 200, produced: 200, startDate: '2026-02-19', status: 'In Progress' },
    { id: 'PO-2026-003', product: 'Raw Silk Mix', planned: 300, produced: 120, startDate: '2026-02-22', status: 'In Progress' },
    { id: 'PO-2026-004', product: 'Silk Thread C', planned: 150, produced: 90, startDate: '2026-02-23', status: 'In Progress' },
];

const SAMPLE_YIELD = [
    { id: 'PO-2026-001', product: 'Silk Yarn A', planned: 500, actual: 340, waste: 26 },
    { id: 'PO-2026-002', product: 'Cocoon Batch B', planned: 200, actual: 195, waste: 5 },
    { id: 'PO-2026-003', product: 'Raw Silk Mix', planned: 300, actual: 120, waste: 18 },
    { id: 'PO-2026-004', product: 'Silk Thread C', planned: 150, actual: 90, waste: 12 },
];

const SAMPLE_ACTIVITY = [
    { id: 'RUN-045', icon: '✅', text: 'Run #RUN-045 completed', detail: '120 kg produced · 5 kg waste · QC Passed', time: '8m ago' },
    { id: 'RUN-044', icon: '🔍', text: 'QC Inspection started — Batch B', detail: 'Inspector: Maria Santos', time: '32m ago' },
    { id: 'RUN-043', icon: '⚠️', text: 'Material shortage flagged', detail: 'Raw Silk Thread below threshold', time: '1h ago' },
    { id: 'RUN-042', icon: '🏭', text: 'Run #RUN-042 started', detail: 'PO-2026-003 · Raw Silk Mix', time: '2h ago' },
    { id: 'RUN-041', icon: '📦', text: 'Output posted — Silk Yarn A', detail: '200 kg finished goods added to stock', time: '3h ago' },
];

const STATUS_DATA = [
    { label: 'Draft', value: 2, color: '#94a3b8' },
    { label: 'Approved', value: 5, color: '#a78bfa' },
    { label: 'In Progress', value: 4, color: '#7c3aed' },
    { label: 'Completed', value: 12, color: '#10b981' },
    { label: 'Cancelled', value: 1, color: '#f43f5e' },
];

const WEEKLY_DATA = [
    { day: 'Mon', issued: 80, output: 70 },
    { day: 'Tue', issued: 120, output: 110 },
    { day: 'Wed', issued: 95, output: 88 },
    { day: 'Thu', issued: 140, output: 130 },
    { day: 'Fri', issued: 60, output: 55 },
    { day: 'Sat', issued: 30, output: 28 },
    { day: 'Sun', issued: 0, output: 0 },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));
const yieldColor = (p) => p >= 85 ? 'text-emerald-600 bg-emerald-50' : p >= 65 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
const wasteColor = (p) => p <= 5 ? 'text-emerald-600 bg-emerald-50' : p <= 15 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';

// ─────────────────────────────────────────────
// SVG DONUT CHART
// ─────────────────────────────────────────────
function DonutChart({ data }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = 60; const cx = 80; const cy = 80; const stroke = 22;
    let offset = 0;
    const circumference = 2 * Math.PI * r;
    const slices = data.map(d => {
        const dash = (d.value / total) * circumference;
        const gap = circumference - dash;
        const slice = { ...d, dash, gap, offset };
        offset += dash;
        return slice;
    });

    return (
        <div className="flex items-center gap-6">
            <svg width="160" height="160" className="flex-shrink-0">
                {slices.map((s, i) => (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={stroke}
                        strokeDasharray={`${s.dash} ${s.gap}`}
                        strokeDashoffset={-s.offset + circumference / 4}
                        className="transition-all duration-500"
                    />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" className="text-slate-900" style={{ fontSize: 22, fontWeight: 900, fill: '#0f172a' }}>{total}</text>
                <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>ORDERS</text>
            </svg>
            <div className="space-y-2 text-xs">
                {data.map(d => (
                    <div key={d.label} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-slate-500 font-medium">{d.label}</span>
                        <span className="ml-auto font-black text-slate-800 pl-4">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// SVG LINE CHART
// ─────────────────────────────────────────────
function LineChart({ data }) {
    const W = 320; const H = 120; const pad = { t: 10, b: 28, l: 28, r: 8 };
    const iW = W - pad.l - pad.r;
    const iH = H - pad.t - pad.b;
    const maxVal = Math.max(...data.flatMap(d => [d.issued, d.output]), 10);
    const xStep = iW / (data.length - 1);

    const pts = (key) => data.map((d, i) => [
        pad.l + i * xStep,
        pad.t + iH - (d[key] / maxVal) * iH,
    ]);

    const polyline = (points) => points.map(p => p.join(',')).join(' ');
    const area = (points) => {
        const last = points[points.length - 1];
        const first = points[0];
        return `${polyline(points)} ${last[0]},${pad.t + iH} ${first[0]},${pad.t + iH}`;
    };

    const issued = pts('issued');
    const output = pts('output');

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
            <defs>
                <linearGradient id="gradIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                <line key={i} x1={pad.l} x2={W - pad.r}
                    y1={pad.t + iH * (1 - t)} y2={pad.t + iH * (1 - t)}
                    stroke="#f1f5f9" strokeWidth="1" />
            ))}
            {/* Areas */}
            <polygon points={area(issued)} fill="url(#gradIssued)" />
            <polygon points={area(output)} fill="url(#gradOutput)" />
            {/* Lines */}
            <polyline points={polyline(issued)} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={polyline(output)} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {/* Dots */}
            {issued.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#7c3aed" />)}
            {output.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#10b981" />)}
            {/* X labels */}
            {data.map((d, i) => (
                <text key={i} x={pad.l + i * xStep} y={H - 6} textAnchor="middle"
                    style={{ fontSize: 8, fill: '#94a3b8', fontWeight: 700 }}>{d.day}</text>
            ))}
        </svg>
    );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function ProductionDashboard({ stats = {}, orders = SAMPLE_ORDERS, yieldData = SAMPLE_YIELD }) {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filterProd, setFilterProd] = useState('All');

    const uniqueProducts = useMemo(() => ['All', ...new Set(orders.map(o => o.product))], [orders]);

    const filteredOrders = useMemo(() =>
        orders.filter(o => filterProd === 'All' || o.product === filterProd),
        [orders, filterProd]
    );

    // KPI values (use real stats if passed, fallback to sample)
    const kpis = [
        {
            label: 'Active Orders',
            value: stats.active_orders ?? filteredOrders.length,
            icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            badge: 'In Progress', badgeColor: 'text-violet-600 bg-violet-50',
            iconBg: 'bg-violet-50 text-violet-600',
        },
        {
            label: 'Pending Approval',
            value: stats.pending_approval ?? 3,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            badge: 'Awaiting', badgeColor: 'text-amber-600 bg-amber-50',
            iconBg: 'bg-amber-50 text-amber-600',
        },
        {
            label: 'Output Today',
            value: stats.output_today ?? '748 kg',
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            badge: 'Finished + WIP', badgeColor: 'text-emerald-600 bg-emerald-50',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Materials Issued',
            value: stats.materials_today ?? '830 kg',
            icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
            badge: 'Today', badgeColor: 'text-sky-600 bg-sky-50',
            iconBg: 'bg-sky-50 text-sky-600',
        },
        {
            label: 'Avg Yield',
            value: stats.avg_yield ?? '87%',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            badge: 'Output ÷ Planned', badgeColor: 'text-emerald-600 bg-emerald-50',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Waste / Reject Rate',
            value: stats.waste_rate ?? '6.2%',
            icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
            badge: 'Waste ÷ Output', badgeColor: 'text-rose-600 bg-rose-50',
            iconBg: 'bg-rose-50 text-rose-600',
        },
    ];

    return (
        <ProductionStaffLayout>
            <Head title="Production Dashboard" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── HEADER + FILTERS ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Production Dashboard</h1>
                        <p className="text-slate-500 font-medium mt-1">Live overview of orders, output, yield, and material consumption.</p>
                    </div>

                    {/* Filter & Export Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Date From */}
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none cursor-pointer transition" />
                        <span className="text-slate-300 font-bold text-sm">–</span>
                        {/* Date To */}
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none cursor-pointer transition" />

                        {/* Product filter */}
                        <select value={filterProd} onChange={e => setFilterProd(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none cursor-pointer appearance-none transition">
                            {uniqueProducts.map(p => <option key={p}>{p}</option>)}
                        </select>

                        {/* Export buttons */}
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            PDF
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Excel
                        </button>
                    </div>
                </div>

                {/* ── KPI CARDS (6) ── */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {kpis.map(kpi => (
                        <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 leading-none">{kpi.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">{kpi.label}</p>
                                <span className={`mt-2 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${kpi.badgeColor}`}>
                                    {kpi.badge}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── CHARTS ROW ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Donut — Production Status */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Production Status</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Orders by current status</p>
                            </div>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full uppercase">All Time</span>
                        </div>
                        <DonutChart data={STATUS_DATA} />
                    </div>

                    {/* Line — Weekly Activity */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Weekly Activity</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Materials issued vs. output produced</p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />Issued</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Output</span>
                            </div>
                        </div>
                        <LineChart data={WEEKLY_DATA} />
                    </div>
                </div>

                {/* ── IN-PROGRESS ORDERS TABLE ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Ongoing Production Orders</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Current in-progress batches</p>
                        </div>
                        <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">{filteredOrders.length} active</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    {['Order No.', 'Product', 'Planned Qty', 'Produced', 'Yield %', 'Start Date', 'Status', 'Action'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredOrders.length > 0 ? filteredOrders.map(o => {
                                    const y = pct(o.produced, o.planned);
                                    return (
                                        <tr key={o.id} className="group hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3.5 text-sm font-bold text-violet-600 font-mono">{o.id}</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-slate-800">{o.product}</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-slate-600">{o.planned} kg</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-slate-600">{o.produced} kg</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[60px]">
                                                        <div className={`h-1.5 rounded-full ${y >= 85 ? 'bg-emerald-500' : y >= 65 ? 'bg-amber-400' : 'bg-rose-500'}`}
                                                            style={{ width: `${Math.min(y, 100)}%` }} />
                                                    </div>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${yieldColor(y)}`}>{y}%</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-500">{o.startDate}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-50 text-violet-600">{o.status}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <button className="text-xs font-bold text-violet-600 hover:text-violet-800 hover:underline transition">View →</button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={8} className="py-16 text-center text-sm font-bold text-slate-300">No active production orders</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── YIELD & WASTE TABLE ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Yield & Waste Monitoring</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Per-batch efficiency snapshot</p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Live</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    {['Order No.', 'Product', 'Planned Qty', 'Actual Qty', 'Yield %', 'Waste Qty', 'Waste %'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {yieldData.map(row => {
                                    const y = pct(row.actual, row.planned);
                                    const w = pct(row.waste, row.actual + row.waste);
                                    return (
                                        <tr key={row.id} className="group hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3.5 text-sm font-bold text-violet-600 font-mono">{row.id}</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-slate-800">{row.product}</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600 font-bold">{row.planned} kg</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600 font-bold">{row.actual} kg</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${yieldColor(y)}`}>{y}%</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600 font-bold">{row.waste} kg</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${wasteColor(w)}`}>{w}%</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── BOTTOM ROW: Activity Feed + Sericulture Snapshot ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Recent Activity Feed */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Production Activity</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Latest run events</p>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {SAMPLE_ACTIVITY.map(a => (
                                <div key={a.id} className="flex items-start gap-3 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                                    <div className="text-xl flex-shrink-0 mt-0.5">{a.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-slate-800 leading-tight">{a.text}</p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{a.detail}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex-shrink-0">{a.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sericulture-Specific Snapshot */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🐛 Sericulture Snapshot</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Industry-specific yield metrics</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                {
                                    label: 'Cocoon Yield Performance',
                                    tags: ['Input: Mulberry Leaves', 'Output: Cocoons'],
                                    value: '72%', valueLabel: 'Yield',
                                    bar: 72, barColor: 'bg-violet-500',
                                },
                                {
                                    label: 'Silk Conversion Rate',
                                    tags: ['Cocoon → Silk Yarn ratio'],
                                    value: '18.4%', valueLabel: 'Conversion',
                                    bar: 18.4, barColor: 'bg-emerald-500',
                                },
                            ].map(item => (
                                <div key={item.label} className="p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-xs font-black text-slate-800">{item.label}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.tags.map(t => (
                                                    <span key={t} className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-slate-900 leading-none">{item.value}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{item.valueLabel}</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                                        <div className={`h-1.5 rounded-full ${item.barColor} transition-all duration-700`} style={{ width: `${item.bar}%` }} />
                                    </div>
                                </div>
                            ))}

                            {/* Cost Snapshot */}
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {[
                                    { label: 'Avg Cost / Unit', value: '₱12.40' },
                                    { label: 'Total Cost (Month)', value: '₱84,200' },
                                    { label: 'Highest Cost Run', value: '₱18.70/kg' },
                                    { label: 'Lowest Cost Run', value: '₱9.80/kg' },
                                ].map(c => (
                                    <div key={c.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-base font-black text-slate-900">{c.value}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{c.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </ProductionStaffLayout>
    );
}
