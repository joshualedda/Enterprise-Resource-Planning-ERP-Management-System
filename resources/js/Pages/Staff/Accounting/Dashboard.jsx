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
const absFmt  = (n) => Math.abs(Number(n || 0)).toLocaleString();

// ─── MOCK DATA ─────────────────────────────────────────────────────────────

const TREND_MONTHLY = [
    { period: 'Sep',  revenue: 280000, expenses: 160000, profit: 120000 },
    { period: 'Oct',  revenue: 320000, expenses: 175000, profit: 145000 },
    { period: 'Nov',  revenue: 295000, expenses: 168000, profit: 127000 },
    { period: 'Dec',  revenue: 380000, expenses: 195000, profit: 185000 },
    { period: 'Jan',  revenue: 340000, expenses: 182000, profit: 158000 },
    { period: 'Feb',  revenue: 412800, expenses: 198450, profit: 214350 },
];
const TREND_QUARTERLY = [
    { period: 'Q1-25', revenue: 820000, expenses: 480000, profit: 340000 },
    { period: 'Q2-25', revenue: 910000, expenses: 510000, profit: 400000 },
    { period: 'Q3-25', revenue: 875000, expenses: 503000, profit: 372000 },
    { period: 'Q4-25', revenue: 995000, expenses: 538000, profit: 457000 },
    { period: 'Q1-26', revenue: 412800, expenses: 198450, profit: 214350 },
];
const TREND_YEARLY = [
    { period: '2022', revenue: 2100000, expenses: 1380000, profit: 720000 },
    { period: '2023', revenue: 2650000, expenses: 1520000, profit: 1130000 },
    { period: '2024', revenue: 3200000, expenses: 1890000, profit: 1310000 },
    { period: '2025', revenue: 3600000, expenses: 2031000, profit: 1569000 },
    { period: '2026', revenue: 412800,  expenses: 198450,  profit: 214350 },
];

const INCOME_DONUT = [
    { label: 'Silk Yarn',    value: 185000, color: '#f59e0b' },
    { label: 'Silk Fabric',  value: 142000, color: '#f97316' },
    { label: 'By-products',  value:  54800, color: '#10b981' },
    { label: 'Others',       value:  31000, color: '#6366f1' },
];

const EXPENSE_BARS = [
    { label: 'Raw Materials',    value: 82400, color: '#f43f5e' },
    { label: 'Production Cost',  value: 51200, color: '#f97316' },
    { label: 'Labor',            value: 34500, color: '#f59e0b' },
    { label: 'Utilities',        value: 14800, color: '#6366f1' },
    { label: 'Maintenance',      value:  9600, color: '#8b5cf6' },
    { label: 'Others',           value:  5950, color: '#94a3b8' },
];

const AR_ROWS = [
    { inv: 'INV-2026-014', customer: 'LGU La Union',       amount: 24000, due: '2026-02-17', overdue: 7  },
    { inv: 'INV-2026-016', customer: 'Maria Santos',        amount:  4800, due: '2026-02-28', overdue: -4 },
    { inv: 'INV-2026-017', customer: 'Jose Reyes',          amount:  8400, due: '2026-03-02', overdue: -6 },
    { inv: 'INV-2026-018', customer: 'Province Office',     amount: 32000, due: '2026-02-20', overdue: 4  },
    { inv: 'INV-2026-019', customer: 'Ana dela Cruz',       amount:  6200, due: '2026-03-05', overdue:-9  },
];

const AP_ROWS = [
    { bill: 'BILL-2026-009', supplier: 'RawSilk Inc.',       amount: 12800, due: '2026-02-21', overdue: 3  },
    { bill: 'BILL-2026-011', supplier: 'Farm Supplies Co.',  amount:  5400, due: '2026-02-25', overdue:-1  },
    { bill: 'BILL-2026-012', supplier: 'MERALCO',            amount:  3200, due: '2026-02-28', overdue:-4  },
    { bill: 'BILL-2026-013', supplier: 'Equipment Parts BV', amount:  9600, due: '2026-03-04', overdue:-8  },
];

const INV_SNAPSHOT = [
    { label: 'Total Inventory Value',  value: 890400, color: '#f59e0b', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Raw Materials',          value: 312000, color: '#10b981', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'WIP (Work-in-Progress)', value: 187200, color: '#6366f1', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Finished Goods',         value: 391200, color: '#f97316', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
];

const PROD_COST = [
    { order: 'PRD-2026-012', cost: 42800, output: 220, perUnit: 194.5,  planned: 180, variance:  +14.5 },
    { order: 'PRD-2026-011', cost: 38400, output: 210, perUnit: 182.9,  planned: 185, variance:   -2.1 },
    { order: 'PRD-2026-010', cost: 51200, output: 260, perUnit: 196.9,  planned: 190, variance:   +6.9 },
    { order: 'PRD-2026-009', cost: 29600, output: 165, perUnit: 179.4,  planned: 182, variance:   -2.6 },
    { order: 'PRD-2026-008', cost: 46100, output: 248, perUnit: 185.9,  planned: 185, variance:   +0.9 },
];

const CASHFLOW_DATA = [
    { day: 'Feb 10', cashIn: 38200, cashOut: 14800 },
    { day: 'Feb 12', cashIn: 21600, cashOut: 22400 },
    { day: 'Feb 14', cashIn: 54000, cashOut: 18200 },
    { day: 'Feb 16', cashIn: 12800, cashOut: 31200 },
    { day: 'Feb 18', cashIn: 48400, cashOut: 16400 },
    { day: 'Feb 20', cashIn: 32000, cashOut: 19800 },
    { day: 'Feb 22', cashIn: 61200, cashOut: 24600 },
    { day: 'Feb 24', cashIn: 28400, cashOut: 21200 },
];

// ─── SVG DONUT CHART ───────────────────────────────────────────────────────
function DonutChart({ data }) {
    const total   = data.reduce((s, d) => s + d.value, 0);
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
function HorizBars({ data }) {
    const max = Math.max(...data.map(d => d.value));
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h2>
                    {sub && <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>}
                </div>
                {extra}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

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

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────
export default function AccountingDashboard({ stats = {} }) {
    const [trendPeriod, setTrendPeriod] = useState('Monthly');
    const [dateRange, setDateRange]     = useState('This Month');
    const [fiscalYear, setFiscalYear]   = useState('FY 2026');
    const [category,   setCategory]     = useState('All');
    const [entity,     setEntity]       = useState('All');

    const trendData = trendPeriod === 'Monthly'   ? TREND_MONTHLY
                    : trendPeriod === 'Quarterly' ? TREND_QUARTERLY
                    : TREND_YEARLY;

    const KPI_CARDS = [
        { label: 'Total Revenue',       value: phpFmt(412800), delta: '+8.4% vs last month',   up: true,  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-emerald-50 text-emerald-600', dbg: 'bg-emerald-50 text-emerald-600' },
        { label: 'Total Expenses',      value: phpFmt(198450), delta: '+2.1% vs last month',   up: false, icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-rose-50 text-rose-600',   dbg: 'bg-rose-50 text-rose-600'   },
        { label: 'Net Profit',          value: phpFmt(214350), delta: '+12.3% vs last month',  up: true,  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', bg: 'bg-indigo-50 text-indigo-600', dbg: 'bg-indigo-50 text-indigo-600' },
        { label: 'Cash Balance',        value: phpFmt(1204800), delta: 'As of today',          up: null,  icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',                                                    bg: 'bg-cyan-50 text-cyan-600',   dbg: 'bg-slate-50 text-slate-400'   },
        { label: 'Accounts Receivable', value: phpFmt(75400),  delta: '5 open invoices',       up: null,  icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: 'bg-amber-50 text-amber-600',  dbg: 'bg-amber-50 text-amber-600'   },
        { label: 'Accounts Payable',    value: phpFmt(31000),  delta: '4 unpaid bills',        up: null,  icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',                               bg: 'bg-violet-50 text-violet-600', dbg: 'bg-violet-50 text-violet-600' },
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
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            PDF
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Excel
                        </button>
                    </div>
                </div>

                {/* ── SMART FILTERS ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Filters</span>
                    {[
                        { label: 'Date Range', value: dateRange, setValue: setDateRange, opts: ['This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Custom'] },
                        { label: 'Fiscal Year', value: fiscalYear, setValue: setFiscalYear, opts: ['FY 2026', 'FY 2025', 'FY 2024'] },
                        { label: 'Category', value: category, setValue: setCategory, opts: ['All', 'Silk Yarn', 'Silk Fabric', 'By-products', 'Others'] },
                        { label: 'Customer/Supplier', value: entity, setValue: setEntity, opts: ['All', 'LGU La Union', 'Maria Santos', 'RawSilk Inc.', 'MERALCO'] },
                    ].map(f => (
                        <div key={f.label} className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{f.label}</label>
                            <select
                                value={f.value}
                                onChange={e => f.setValue(e.target.value)}
                                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition cursor-pointer"
                            >
                                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    ))}
                    <button className="ml-auto text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider transition">Reset</button>
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
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Revenue vs Expense Trend */}
                    <Card
                        title="📈 Revenue vs Expenses"
                        sub={`${trendPeriod} trend`}
                        extra={
                            <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5 text-[10px] font-black">
                                {['Monthly', 'Quarterly', 'Yearly'].map(p => (
                                    <button key={p} onClick={() => setTrendPeriod(p)}
                                        className={`px-3 py-1 rounded-lg transition-all ${trendPeriod === p ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        }
                    >
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="gProf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                                    <XAxis dataKey="period" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={v => `₱${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                                    <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#10b981" strokeWidth={2.5} fill="url(#gRev)"  dot={false} />
                                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gExp)"  dot={false} />
                                    <Area type="monotone" dataKey="profit"   name="Profit"   stroke="#6366f1" strokeWidth={2}   fill="url(#gProf)" dot={false} strokeDasharray="5 3" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Income Breakdown Donut */}
                    <Card title="🥧 Income Breakdown" sub="Revenue by product category" extra={null}>
                        <DonutChart data={INCOME_DONUT} />
                    </Card>
                </div>

                {/* ── 4+9. Expense Breakdown / Cash Flow ── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Expense Breakdown */}
                    <div>
                        <Card title="📊 Top Expense Categories" sub="Cost driver breakdown — this month">
                            <HorizBars data={EXPENSE_BARS} />
                        </Card>
                    </div>

                    {/* Cash Flow Chart */}
                    <div>
                        <Card title="💸 Cash Flow Snapshot" sub="Cash In vs Cash Out — last 30 days">
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={CASHFLOW_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={3}>
                                        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                                        <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <YAxis tickFormatter={v => `₱${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                                        <Bar dataKey="cashIn"  name="Cash In"  fill="#10b981" radius={[5,5,0,0]} maxBarSize={28} />
                                        <Bar dataKey="cashOut" name="Cash Out" fill="#f43f5e" radius={[5,5,0,0]} maxBarSize={28} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* ── 5+6. AR / AP Tables ── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* AR Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🧾 Accounts Receivable</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Outstanding customer invoices</p>
                            </div>
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{AR_ROWS.length} open</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['Invoice', 'Customer', 'Amount', 'Due Date', 'Status'].map(h => (
                                            <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {AR_ROWS.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 text-[11px] font-bold text-amber-600 font-mono">{r.inv}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-700">{r.customer}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-emerald-600">{phpFmt(r.amount)}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-400">{r.due}</td>
                                            <td className="px-4 py-3"><StatusBadge overdue={r.overdue} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-amber-50/50 border-t border-amber-100">
                                        <td colSpan={2} className="px-4 py-3 text-xs font-black text-slate-500 uppercase">Total AR</td>
                                        <td className="px-4 py-3 text-sm font-black text-amber-700">{phpFmt(AR_ROWS.reduce((s,r) => s+r.amount, 0))}</td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* AP Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📦 Accounts Payable</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Unpaid supplier bills</p>
                            </div>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">{AP_ROWS.length} bills</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['Bill', 'Supplier', 'Amount', 'Due Date', 'Status'].map(h => (
                                            <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {AP_ROWS.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 text-[11px] font-bold text-violet-600 font-mono">{r.bill}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-700">{r.supplier}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-rose-600">{phpFmt(r.amount)}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-400">{r.due}</td>
                                            <td className="px-4 py-3"><StatusBadge overdue={r.overdue} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-violet-50/50 border-t border-violet-100">
                                        <td colSpan={2} className="px-4 py-3 text-xs font-black text-slate-500 uppercase">Total AP</td>
                                        <td className="px-4 py-3 text-sm font-black text-violet-700">{phpFmt(AP_ROWS.reduce((s,r) => s+r.amount, 0))}</td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── 7+8. Inventory Snapshot / Production Cost ── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    {/* Inventory Value Snapshot */}
                    <div>
                        <Card title="📦 Inventory Value Snapshot" sub="Asset values from stock valuation">
                            <div className="space-y-4">
                                {INV_SNAPSHOT.map(item => (
                                    <div key={item.label} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color + '18' }}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: item.color }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-500 truncate">{item.label}</p>
                                            <p className="text-base font-black" style={{ color: item.color }}>{phpFmt(item.value)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: item.color + '15', color: item.color }}>
                                                {((item.value / INV_SNAPSHOT[0].value) * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Production Cost Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🏭 Production Cost Snapshot</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Cost per run/batch — latest 5 orders</p>
                            </div>
                            <button className="text-xs font-bold text-amber-600 hover:text-amber-700 transition">View All →</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['Order', 'Total Cost', 'Output (g)', 'Cost/Unit', 'Planned', 'Variance'].map(h => (
                                            <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {PROD_COST.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 text-[11px] font-bold text-indigo-600 font-mono">{r.order}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-700">{phpFmt(r.cost)}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-500">{r.output}g</td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-700">₱{r.perUnit.toFixed(1)}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-400">₱{r.planned}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${r.variance > 2 ? 'bg-rose-50 text-rose-600' : r.variance < 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                                    {r.variance > 0 ? '+' : ''}{r.variance.toFixed(1)} {r.variance > 2 ? '⚠' : r.variance < 0 ? '✓' : '~'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex gap-6 text-xs">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"/><span className="font-bold text-slate-500">Under budget</span></span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"/><span className="font-bold text-slate-500">Over budget {'>'} 2</span></span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"/><span className="font-bold text-slate-500">On target</span></span>
                        </div>
                    </div>
                </div>

            </div>
        </AccountingStaffLayout>
    );
}
