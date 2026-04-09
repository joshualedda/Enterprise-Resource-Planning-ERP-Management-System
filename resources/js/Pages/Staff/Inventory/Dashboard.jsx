import { useState, useMemo } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head } from '@inertiajs/react';

const fmt = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n);

// ─────────────────────────────────────────────
// SVG DONUT CHART
// ─────────────────────────────────────────────
function DonutChart({ data }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = 58; const cx = 78; const cy = 78; const stroke = 20;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    const slices = data.map(d => {
        const dash = (d.value / total) * circumference;
        const s = { ...d, dash, gap: circumference - dash, offset };
        offset += dash;
        return s;
    });
    return (
        <div className="flex items-center gap-5">
            <svg width="156" height="156" className="flex-shrink-0">
                {slices.map((s, i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={s.color} strokeWidth={stroke}
                        strokeDasharray={`${s.dash} ${s.gap}`}
                        strokeDashoffset={-s.offset + circumference / 4}
                        className="transition-all duration-500" />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 21, fontWeight: 900, fill: '#0f172a' }}>{total}%</text>
                <text x={cx} y={cy + 11} textAnchor="middle" style={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8', letterSpacing: 1 }}>DISTRIB.</text>
            </svg>
            <div className="space-y-2 text-xs">
                {data.map(d => (
                    <div key={d.label} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-slate-500 font-medium">{d.label}</span>
                        <span className="ml-auto font-black text-slate-800 pl-3">{d.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// SVG GROUPED BAR CHART (IN vs OUT)
// ─────────────────────────────────────────────
function BarChart({ data }) {
    const W = 340; const H = 130; const pad = { t: 10, b: 28, l: 8, r: 8 };
    const iW = W - pad.l - pad.r;
    const iH = H - pad.t - pad.b;
    const groupW = iW / data.length;
    const maxVal = Math.max(...data.flatMap(d => [d.purchase + d.prodIn, d.sales + d.prodOut + d.adjust]), 10);
    const COLORS_IN = ['#7c3aed', '#10b981'];
    const COLORS_OUT = ['#f59e0b', '#ef4444', '#94a3b8'];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                <line key={i} x1={pad.l} x2={W - pad.r}
                    y1={pad.t + iH * (1 - t)} y2={pad.t + iH * (1 - t)}
                    stroke="#f1f5f9" strokeWidth="1" />
            ))}
            {data.map((d, gi) => {
                const gx = pad.l + gi * groupW;
                const inVals = [d.purchase, d.prodIn];
                const outVals = [d.sales, d.prodOut, d.adjust];
                const barW = 10;
                const gap = 2;
                const totalBars = 5;
                const groupStart = gx + (groupW - (totalBars * barW + 4 * gap)) / 2;
                return (
                    <g key={gi}>
                        {inVals.map((v, bi) => {
                            const bh = (v / maxVal) * iH;
                            const bx = groupStart + bi * (barW + gap);
                            return <rect key={bi} x={bx} y={pad.t + iH - bh} width={barW} height={bh || 0}
                                fill={COLORS_IN[bi]} rx={3} className="transition-all duration-500" />;
                        })}
                        {outVals.map((v, bi) => {
                            const bh = (v / maxVal) * iH;
                            const bx = groupStart + (2 + bi) * (barW + gap) + gap;
                            return <rect key={bi} x={bx} y={pad.t + iH - bh} width={barW} height={bh || 0}
                                fill={COLORS_OUT[bi]} rx={3} className="transition-all duration-500" />;
                        })}
                        <text x={gx + groupW / 2} y={H - 6} textAnchor="middle"
                            style={{ fontSize: 8, fill: '#94a3b8', fontWeight: 700 }}>{d.day}</text>
                    </g>
                );
            })}
        </svg>
    );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function InventoryDashboard({
    stats = {},
    lowStock = [],
    expiring = [],
    warehouses = [],
    reservations = [],
    categoryData = [],
    movementData = [],
    recentActivity = [],
}) {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filterWH, setFilterWH] = useState('All');
    const [filterCat, setFilterCat] = useState('All');

    const uniqueWH = useMemo(() => ['All', ...new Set(lowStock.map(i => i.warehouse))], [lowStock]);
    const uniqueCat = useMemo(() => ['All', ...new Set(lowStock.map(i => i.category))], [lowStock]);

    const filteredLow = useMemo(() =>
        lowStock.filter(i =>
            (filterWH === 'All' || i.warehouse === filterWH) &&
            (filterCat === 'All' || i.category === filterCat)
        ), [lowStock, filterWH, filterCat]
    );

    // KPIs
    const kpis = [
        {
            label: 'Active Products',
            value: stats.total_products ?? 0,
            sub: 'inventory items',
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            iconBg: 'bg-emerald-50 text-emerald-600',
            badge: 'Total Active', badgeColor: 'text-emerald-600 bg-emerald-50',
        },
        {
            label: 'Warehouses',
            value: stats.warehouses ?? 0,
            sub: 'storage locations',
            icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
            iconBg: 'bg-blue-50 text-blue-600',
            badge: 'Active', badgeColor: 'text-blue-600 bg-blue-50',
        },
        {
            label: 'Low Stock',
            value: stats.low_stock ?? 0,
            sub: 'below reorder level',
            icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
            iconBg: 'bg-amber-50 text-amber-600',
            badge: 'Needs Reorder', badgeColor: 'text-amber-600 bg-amber-50',
        },
        {
            label: 'Out of Stock',
            value: stats.out_of_stock ?? 0,
            sub: 'zero quantity',
            icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
            iconBg: 'bg-rose-50 text-rose-600',
            badge: 'Critical', badgeColor: 'text-rose-600 bg-rose-50',
        },
        {
            label: 'Expiring Soon',
            value: stats.expiring_soon ?? 0,
            sub: 'within 30 days',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            iconBg: 'bg-orange-50 text-orange-600',
            badge: '30-day window', badgeColor: 'text-orange-600 bg-orange-50',
        },
        {
            label: 'Inventory Value',
            value: fmt(stats.total_value ?? 0),
            sub: 'total stock valuation',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-violet-50 text-violet-600',
            badge: 'FIFO Valuation', badgeColor: 'text-violet-600 bg-violet-50',
        },
    ];

    const expiryColor = (days) =>
        days <= 7 ? 'text-rose-600 bg-rose-50 border-rose-100' :
            days <= 30 ? 'text-amber-600 bg-amber-50 border-amber-100' :
                'text-slate-500 bg-slate-50 border-slate-100';

    const stockPct = (stock, reorder) => Math.min(Math.round((stock / reorder) * 100), 100);
    const stockBarColor = (p) => p <= 20 ? 'bg-rose-500' : p <= 50 ? 'bg-amber-400' : 'bg-emerald-500';

    return (
        <InventoryStaffLayout>
            <Head title="Inventory Dashboard" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── HEADER + SMART FILTERS ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Dashboard</h1>
                        <p className="text-slate-500 font-medium mt-1">Real-time stock health, movements, and valuation.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none cursor-pointer transition" />
                        <span className="text-slate-300 font-bold text-sm">–</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none cursor-pointer transition" />

                        <select value={filterWH} onChange={e => setFilterWH(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition">
                            {uniqueWH.map(w => <option key={w}>{w}</option>)}
                        </select>

                        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition">
                            {uniqueCat.map(c => <option key={c}>{c}</option>)}
                        </select>

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

                {/* ── 6 KPI CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {kpis.map(kpi => (
                        <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 leading-none">{kpi.value}</p>
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

                    {/* Donut — Category Distribution */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Category Distribution</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Where capital is tied up</p>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">by % share</span>
                        </div>
                        <DonutChart data={categoryData} />
                    </div>

                    {/* Bar — IN vs OUT */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Stock IN vs OUT</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">This week — all movement types</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                            {[
                                { color: '#7c3aed', label: 'Purchase IN' },
                                { color: '#10b981', label: 'Prod. Output IN' },
                                { color: '#f59e0b', label: 'Sales OUT' },
                                { color: '#ef4444', label: 'Prod. Consumption' },
                                { color: '#94a3b8', label: 'Adjustments' },
                            ].map(l => (
                                <span key={l.label} className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: l.color }} />{l.label}
                                </span>
                            ))}
                        </div>
                        <BarChart data={movementData} />
                    </div>
                </div>

                {/* ── LOW STOCK TABLE ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">⚠ Low Stock Items</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Products below reorder level</p>
                        </div>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">
                            {filteredLow.length} items
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    {['Product', 'Category', 'Warehouse', 'Current Stock', 'Reorder Level', 'Status', 'Action'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLow.length > 0 ? filteredLow.map(row => {
                                    const p = stockPct(row.stock, row.reorder);
                                    return (
                                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3.5 text-sm font-bold text-slate-800">{row.product}</td>
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-500">{row.category}</td>
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-500">{row.warehouse}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-14 bg-slate-100 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${stockBarColor(p)}`} style={{ width: `${p}%` }} />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700">{row.stock}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-slate-500">{row.reorder}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${p <= 20 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {p <= 20 ? 'Critical' : 'Low'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <button className="text-[10px] font-black text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition">
                                                    + Create PO
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={7} className="py-12 text-center text-sm font-bold text-slate-300">All stock levels are healthy ✓</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── EXPIRING BATCHES ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📅 Expiring Batches</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Batches expiring within 30 days</p>
                        </div>
                        <div className="flex gap-2 text-[9px] font-black">
                            <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600">&#60; 7d = Critical</span>
                            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-600">&#60; 30d = Warning</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    {['Product', 'Batch Code', 'Warehouse', 'Expiry Date', 'Days Left', 'Qty'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {expiring.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-3.5 text-sm font-bold text-slate-800">{row.product}</td>
                                        <td className="px-5 py-3.5 text-xs font-bold text-slate-500 font-mono">{row.batch}</td>
                                        <td className="px-5 py-3.5 text-xs font-bold text-slate-500">{row.warehouse}</td>
                                        <td className="px-5 py-3.5 text-xs font-bold text-slate-600">{row.expiry}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${expiryColor(row.days)}`}>
                                                {row.days}d
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-slate-600">{row.qty} kg</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── BOTTOM ROW ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Warehouse Stock Summary */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🏬 Warehouse Summary</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Stock value per location</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['Warehouse', 'Items', 'Total Qty', 'Value'].map(h => (
                                            <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {warehouses.map((w, i) => (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3 text-sm font-bold text-slate-800">{w.name}</td>
                                            <td className="px-5 py-3 text-sm font-bold text-slate-600">{w.items}</td>
                                            <td className="px-5 py-3 text-sm font-bold text-slate-600">{w.qty.toLocaleString()} kg</td>
                                            <td className="px-5 py-3 text-sm font-bold text-emerald-600">{fmt(w.value)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50/60 border-t border-slate-100">
                                        <td className="px-5 py-3 text-xs font-black text-slate-500 uppercase tracking-wider" colSpan={3}>Total Inventory Value</td>
                                        <td className="px-5 py-3 text-sm font-black text-emerald-700">{fmt(warehouses.reduce((s, w) => s + w.value, 0))}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Sericulture Snapshot */}
                        <div className="px-6 pt-4 pb-5 space-y-3 border-t border-slate-50 mt-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🧵 Sericulture Snapshot</p>
                            {[
                                { label: 'Mulberry Leaves (this week)', val: '340 kg consumed', pct: 68, color: 'bg-violet-500' },
                                { label: 'Cocoon Inventory Level', val: '820 kg vs 1,000 capacity', pct: 82, color: 'bg-emerald-500' },
                                { label: 'Silk Yarn Available for Sale', val: '156 kg finished goods', pct: 39, color: 'bg-blue-500' },
                            ].map(item => (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-slate-700">{item.label}</span>
                                        <span className="font-black text-slate-500">{item.val}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed + Reserved Stock */}
                    <div className="flex flex-col gap-6">

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1">
                            <div className="px-6 py-4 border-b border-slate-50">
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🔄 Recent Stock Activity</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Latest 5 stock movements</p>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {recentActivity.length > 0 ? recentActivity.map((a, i) => (
                                    <div key={i} className="flex items-start gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                                        <div className="text-lg flex-shrink-0 mt-0.5">{a.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800 leading-tight">{a.text}</p>
                                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{a.detail}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex-shrink-0">{a.time}</span>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center text-sm font-bold text-slate-300">
                                        No recent activity logged.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reserved Stock */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50">
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🛒 Active Reservations</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">eCommerce stock holds</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/60 border-b border-slate-100">
                                            {['Product', 'Reserved', 'Order', 'Expires'].map(h => (
                                                <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reservations.map((r, i) => (
                                            <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-5 py-3 text-xs font-bold text-slate-800">{r.product}</td>
                                                <td className="px-5 py-3 text-xs font-bold text-violet-600">{r.reserved} units</td>
                                                <td className="px-5 py-3 text-xs font-bold text-slate-500 font-mono">{r.order}</td>
                                                <td className="px-5 py-3 text-[10px] font-bold text-slate-400">{r.expiry}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </InventoryStaffLayout>
    );
}
