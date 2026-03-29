import { useState, useMemo } from 'react';
import AccountingStaffLayout from '@/Layouts/AccountingStaffLayout';
import { Head } from '@inertiajs/react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';

// ─── NUMBER HELPERS ────────────────────────────────────────────────────────
const phpFmt  = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-100 shadow-xl rounded-xl px-4 py-3 text-xs">
            <p className="font-black text-slate-500 mb-2 uppercase tracking-widest">{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color }} className="font-bold">
                    {p.name}: {phpFmt(p.value)}
                </p>
            ))}
        </div>
    );
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────
function StatusBadge({ overdue }) {
    if (overdue > 3)  return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 animate-pulse">Overdue {overdue}d</span>;
    if (overdue > 0)  return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-orange-50 text-orange-500">Due soon</span>;
    if (overdue >= -7) return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Due in {Math.abs(overdue)}d</span>;
    return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Not due</span>;
}

// ─── SECTION CARD WRAPPER ──────────────────────────────────────────────────
function Card({ title, sub, extra, children }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h2>
                    {sub && <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>}
                </div>
                {extra}
            </div>
            <div className="p-6 flex-1">{children}</div>
        </div>
    );
}

// ─── SVG DONUT CHART ───────────────────────────────────────────────────────
function DonutChart({ data = [] }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const r = 70, cx = 90, cy = 90, stroke = 28;
    const circ = 2 * Math.PI * r;
    let offset = 0;

    return (
        <div className="flex flex-col lg:flex-row items-center gap-6">
            <svg viewBox="0 0 180 180" className="w-44 h-44 flex-shrink-0">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                {data.map((d) => {
                    const dash = (d.value / total) * circ;
                    const gap  = circ - dash;
                    const el   = (
                        <circle key={d.label} cx={cx} cy={cy} r={r} fill="none"
                            stroke={d.color} strokeWidth={stroke}
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={-offset}
                            transform="rotate(-90 90 90)"
                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                    );
                    offset += dash;
                    return el;
                })}
                <text x={cx} y={cy - 8} textAnchor="middle" className="fill-slate-800 font-black text-xs" fontSize="11" fontWeight="900">Total</text>
                <text x={cx} y={cy + 10} textAnchor="middle" className="fill-slate-600" fontSize="10" fontWeight="700">₱{(total / 1000).toFixed(0)}K</text>
            </svg>
            <div className="space-y-2.5 w-full">
                {data.length === 0 && <p className="text-xs text-slate-400 italic">No data recorded</p>}
                {data.map(d => (
                    <div key={d.label}>
                        <div className="flex justify-between mb-1">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                                {d.label}
                            </span>
                            <span className="text-xs font-black text-slate-800">{phpFmt(d.value)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-1.5 rounded-full" style={{ width: `${(d.value / total) * 100}%`, background: d.color, transition: 'width 0.6s ease' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── SVG HORIZONTAL BAR ────────────────────────────────────────────────────
function HorizBars({ data = [] }) {
    if (data.length === 0) return <p className="text-xs text-slate-400 italic">No data recorded</p>;
    const max = Math.max(...data.map(d => d.value)) || 1;
    return (
        <div className="space-y-3">
            {data.map(d => (
                <div key={d.label}>
                    <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-600">{d.label}</span>
                        <span className="text-xs font-black text-slate-800">{phpFmt(d.value)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-2 rounded-full transition-all duration-700"
                            style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────
export default function AccountingDashboard({ 
    stats = {}, 
    trend_monthly = [], 
    income_breakdown = [], 
    expense_breakdown = [], 
    ar_rows = [], 
    ap_rows = [], 
    inventory_snapshot = [] 
}) {
    const [trendPeriod, setTrendPeriod] = useState('Monthly');
    const [dateRange, setDateRange]     = useState('This Month');
    const [fiscalYear, setFiscalYear]   = useState('FY 2026');

    const KPI_CARDS = [
        { label: 'Total Revenue',       value: phpFmt(stats.revenue_month), delta: 'Current Month',   up: true,  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-emerald-50 text-emerald-600', dbg: 'bg-emerald-50 text-emerald-600' },
        { label: 'Total Expenses',      value: phpFmt(stats.expenses_month), delta: 'Current Month',   up: false, icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm1-5a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-rose-50 text-rose-600',   dbg: 'bg-rose-50 text-rose-600'   },
        { label: 'Net Profit',          value: phpFmt(stats.net_profit), delta: (stats.net_profit >= 0 ? '+' : '-') + ' Current Margin',  up: stats.net_profit >= 0,  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', bg: 'bg-indigo-50 text-indigo-600', dbg: stats.net_profit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600' },
        { label: 'Cash Balance',        value: phpFmt(stats.cash_balance), delta: 'Settled funds',          up: null,  icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',                                                    bg: 'bg-cyan-50 text-cyan-600',   dbg: 'bg-slate-50 text-slate-400'   },
        { label: 'Accounts Receivable', value: phpFmt(stats.accounts_receivable),  delta: ar_rows.length + ' open invoices',       up: null,  icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: 'bg-amber-50 text-amber-600',  dbg: 'bg-amber-50 text-amber-600'   },
        { label: 'Accounts Payable',    value: phpFmt(stats.accounts_payable),  delta: ap_rows.length + ' unpaid bills',        up: null,  icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',                               bg: 'bg-violet-50 text-violet-600', dbg: 'bg-violet-50 text-violet-600' },
    ];

    return (
        <AccountingStaffLayout>
            <Head title="Accounting Dashboard" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── HEADER ── */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Accounting Dashboard</h1>
                        <p className="text-slate-500 font-medium mt-1">Financial health at-a-glance · <span className="text-amber-600 font-bold">{fiscalYear}</span></p>
                    </div>
                </div>

                {/* ── 1. KPI CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {KPI_CARDS.map(kpi => (
                        <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-900 leading-none">{kpi.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">{kpi.label}</p>
                                <span className={`mt-2 inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${kpi.dbg}`}>
                                    {kpi.up === true  && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7"/></svg>}
                                    {kpi.up === false && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>}
                                    {kpi.delta}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── 2+3. Revenue vs Expense Chart / Income Donut ── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                    {/* Revenue vs Expense Trend */}
                    <Card
                        title="📈 Revenue vs Expenses"
                        sub={`${trendPeriod} trend`}
                    >
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trend_monthly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                                    <XAxis dataKey="period" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={v => `₱${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                                    <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#10b981" strokeWidth={2.5} fill="url(#gRev)"  dot={false} />
                                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gExp)"  dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Income Breakdown Donut */}
                    <Card title="🥧 Income Breakdown" sub="Revenue distribution by source" extra={null}>
                        <DonutChart data={income_breakdown} />
                    </Card>
                </div>

                {/* ── 4+5. Expense Breakdown & AR Table ── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                    {/* Expense Breakdown */}
                    <Card title="📊 Top Expense Categories" sub="Cost distribution — current month">
                        <HorizBars data={expense_breakdown} />
                    </Card>

                    {/* AR Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🧾 Accounts Receivable</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Outstanding customer invoices</p>
                            </div>
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{ar_rows.length} open</span>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['Invoice', 'Customer', 'Amount', 'Due Date', 'Status'].map(h => (
                                            <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {ar_rows.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-xs text-slate-400 italic">No open receivables found</td></tr>}
                                    {ar_rows.slice(0, 5).map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 text-[11px] font-bold text-amber-600 font-mono">{r.inv}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-700">{r.customer}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-emerald-600">{phpFmt(r.amount)}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-400">{r.due}</td>
                                            <td className="px-4 py-3"><StatusBadge overdue={r.overdue} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── 6+7. AP Table & Inventory Snapshot ── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                   {/* AP Table */}
                   <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📦 Accounts Payable</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Unpaid supplier bills</p>
                            </div>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">{ap_rows.length} bills</span>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['Bill', 'Supplier', 'Amount', 'Due Date', 'Status'].map(h => (
                                            <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {ap_rows.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-xs text-slate-400 italic">No pending payables found</td></tr>}
                                    {ap_rows.slice(0, 5).map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 text-[11px] font-bold text-violet-600 font-mono">{r.bill}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-700">{r.supplier}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-rose-600">{phpFmt(r.amount)}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-400">{r.due}</td>
                                            <td className="px-4 py-3"><StatusBadge overdue={r.overdue} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Inventory Value Snapshot */}
                    <Card title="📦 Inventory Value Snapshot" sub="Asset values from live stock levels">
                        <div className="space-y-4">
                            {inventory_snapshot.map(item => (
                                <div key={item.label} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color + '15' }}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: item.color }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-500 truncate">{item.label}</p>
                                        <p className="text-base font-black" style={{ color: item.color }}>{phpFmt(item.value)}</p>
                                    </div>
                                </div>
                            ))}
                            {inventory_snapshot.length === 0 && <p className="text-xs text-slate-400 italic">No inventory data available</p>}
                        </div>
                    </Card>
                </div>

            </div>
        </AccountingStaffLayout>
    );
}
