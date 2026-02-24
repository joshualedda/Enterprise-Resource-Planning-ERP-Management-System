import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n || 0);
const fmtShort = (n) => n >= 1000 ? `₱${(n / 1000).toFixed(1)}k` : `₱${n}`;

// ─────────────────────────────────────────────
// SAMPLE / FALLBACK DATA
// ─────────────────────────────────────────────
const REVENUE_TREND = [
    { date: 'Feb 17', revenue: 18400, orders: 14 },
    { date: 'Feb 18', revenue: 22100, orders: 18 },
    { date: 'Feb 19', revenue: 14800, orders: 11 },
    { date: 'Feb 20', revenue: 31200, orders: 24 },
    { date: 'Feb 21', revenue: 28600, orders: 21 },
    { date: 'Feb 22', revenue: 19400, orders: 15 },
    { date: 'Feb 23', revenue: 35800, orders: 27 },
    { date: 'Feb 24', revenue: 12400, orders: 9 },
];

const STATUS_DATA = [
    { label: 'Pending', value: 8, color: '#f59e0b' },
    { label: 'Paid', value: 15, color: '#3b82f6' },
    { label: 'Processing', value: 6, color: '#8b5cf6' },
    { label: 'Shipped', value: 11, color: '#06b6d4' },
    { label: 'Completed', value: 42, color: '#10b981' },
    { label: 'Cancelled', value: 3, color: '#f43f5e' },
];

const TOP_SELLERS = [
    { product: 'Silk Yarn Grade A', sold: 120, revenue: 48000, stock: 6, reorder: 40 },
    { product: 'Raw Silk Thread 500m', sold: 88, revenue: 35200, stock: 24, reorder: 30 },
    { product: 'Cocoon Silk Fabric', sold: 64, revenue: 57600, stock: 18, reorder: 20 },
    { product: 'Mulberry Silk Scarf', sold: 52, revenue: 26000, stock: 31, reorder: 15 },
    { product: 'Silk Yarn Grade B', sold: 45, revenue: 14400, stock: 4, reorder: 25 },
];

const LOW_STOCK = [
    { product: 'Silk Yarn Grade A', available: 6, reserved: 10, reorder: 40 },
    { product: 'Silk Yarn Grade B', available: 4, reserved: 5, reorder: 25 },
    { product: 'Raw Silk Thread', available: 12, reserved: 8, reorder: 30 },
    { product: 'Cocoon Bags', available: 8, reserved: 0, reorder: 50 },
];

const RECENT_ORDERS = [
    { ref: 'ORD-2026-001', customer: 'Maria Santos', total: 4800, payment: 'Paid', status: 'Processing', date: '2026-02-24' },
    { ref: 'ORD-2026-002', customer: 'Juan dela Cruz', total: 1200, payment: 'Pending', status: 'Pending', date: '2026-02-24' },
    { ref: 'ORD-2026-003', customer: 'Ana Reyes', total: 7200, payment: 'Paid', status: 'Shipped', date: '2026-02-23' },
    { ref: 'ORD-2026-004', customer: 'Pedro Lim', total: 960, payment: 'Paid', status: 'Completed', date: '2026-02-23' },
    { ref: 'ORD-2026-005', customer: 'Cathy Tan', total: 3600, payment: 'Paid', status: 'Completed', date: '2026-02-22' },
    { ref: 'ORD-2026-006', customer: 'Mark Flores', total: 2400, payment: 'Pending', status: 'Cancelled', date: '2026-02-22' },
];

const PAYMENT_DATA = [
    { method: 'GCash', amount: 84200, color: '#3b82f6' },
    { method: 'Bank Transfer', amount: 62400, color: '#8b5cf6' },
    { method: 'Cash', amount: 31800, color: '#10b981' },
    { method: 'COD', amount: 18600, color: '#f59e0b' },
];

const SILK_SALES = [
    { product: 'Silk Yarn', revenue: 62400 },
    { product: 'Silk Fabric', revenue: 57600 },
    { product: 'By-products', revenue: 18200 },
];

// ─────────────────────────────────────────────
// SVG DONUT
// ─────────────────────────────────────────────
function DonutChart({ data }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = 58; const cx = 75; const cy = 75; const stroke = 20;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    const slices = data.map(d => {
        const dash = (d.value / total) * circumference;
        const s = { ...d, dash, gap: circumference - dash, offset };
        offset += dash;
        return s;
    });
    return (
        <div className="flex items-center gap-5 flex-wrap">
            <svg width="150" height="150" className="flex-shrink-0">
                {slices.map((s, i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={s.color} strokeWidth={stroke}
                        strokeDasharray={`${s.dash} ${s.gap}`}
                        strokeDashoffset={-s.offset + circumference / 4}
                        className="transition-all duration-500" />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 22, fontWeight: 900, fill: '#0f172a' }}>{total}</text>
                <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8', letterSpacing: 1 }}>ORDERS</text>
            </svg>
            <div className="space-y-2 flex-1">
                {data.map(d => (
                    <div key={d.label} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-slate-500 font-medium">{d.label}</span>
                        <span className="ml-auto font-black text-slate-800 text-xs">{d.value}</span>
                        <span className="text-[10px] text-slate-300 font-bold w-8 text-right">{Math.round((d.value / total) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// STATUS + PAYMENT BADGES
// ─────────────────────────────────────────────
const STATUS_COLORS = {
    'Pending': 'bg-amber-50 text-amber-600',
    'Paid': 'bg-blue-50 text-blue-600',
    'Processing': 'bg-violet-50 text-violet-600',
    'Shipped': 'bg-cyan-50 text-cyan-600',
    'Completed': 'bg-emerald-50 text-emerald-600',
    'Cancelled': 'bg-rose-50 text-rose-600',
};

const PAYMENT_COLORS = {
    'Paid': 'bg-emerald-50 text-emerald-600',
    'Pending': 'bg-amber-50 text-amber-600',
    'Refunded': 'bg-rose-50 text-rose-600',
};

// ─────────────────────────────────────────────
// CUSTOM TOOLTIP for recharts
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, mode }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-100 shadow-xl rounded-xl px-4 py-3 text-xs">
            <p className="font-black text-slate-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-bold">
                    {p.name === 'revenue' ? fmt(p.value) : p.value + ' orders'}
                </p>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function AdminDashboard({
    stats = {},
    revenueData = REVENUE_TREND,
    topSellers = TOP_SELLERS,
    lowStock = LOW_STOCK,
    recentOrders = RECENT_ORDERS,
}) {
    const [trendMode, setTrendMode] = useState('revenue'); // 'revenue' | 'orders'
    const [dateRange, setDateRange] = useState('7');       // '7' | '30'

    const totalRevToday = stats.revenue_today ?? 12400;
    const ordersToday = stats.orders_today ?? 9;
    const pendingOrders = stats.pending_orders ?? 8;
    const shippingOrders = stats.for_shipping ?? 11;
    const newCustomers = stats.new_customers ?? 3;
    const aov = stats.aov ?? Math.round(totalRevToday / (ordersToday || 1));

    const kpis = [
        {
            label: 'Revenue Today',
            value: fmt(totalRevToday),
            delta: '+12%',
            up: true,
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-emerald-50 text-emerald-600',
            deltaBg: 'text-emerald-600 bg-emerald-50',
        },
        {
            label: 'Orders Today',
            value: ordersToday,
            delta: '+3',
            up: true,
            icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
            iconBg: 'bg-blue-50 text-blue-600',
            deltaBg: 'text-blue-600 bg-blue-50',
        },
        {
            label: 'Pending Orders',
            value: pendingOrders,
            delta: 'Action needed',
            up: false,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-amber-50 text-amber-600',
            deltaBg: 'text-amber-600 bg-amber-50',
        },
        {
            label: 'For Shipping',
            value: shippingOrders,
            delta: 'Ready to dispatch',
            up: true,
            icon: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4',
            iconBg: 'bg-cyan-50 text-cyan-600',
            deltaBg: 'text-cyan-600 bg-cyan-50',
        },
        {
            label: 'New Customers',
            value: newCustomers,
            delta: 'Today',
            up: true,
            icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
            iconBg: 'bg-violet-50 text-violet-600',
            deltaBg: 'text-violet-600 bg-violet-50',
        },
        {
            label: 'Avg Order Value',
            value: fmt(aov),
            delta: 'per order',
            up: true,
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            iconBg: 'bg-rose-50 text-rose-600',
            deltaBg: 'text-slate-400 bg-slate-50',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="eCommerce Dashboard" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── HEADER ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">eCommerce Dashboard</h1>
                        <p className="text-slate-500 font-medium mt-1">Sales, orders, inventory health — all in one view.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route().has('admin.orders.index') ? route('admin.orders.index') : '#'}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            Manage Orders
                        </Link>
                        <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Export PDF
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
                                <span className={`mt-2 inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${kpi.deltaBg}`}>
                                    {kpi.up
                                        ? <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                                        : <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    }
                                    {kpi.delta}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── CHARTS ROW ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Revenue/Orders Trend — spans 3 columns */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                    {trendMode === 'revenue' ? 'Revenue Trend' : 'Order Volume'}
                                </h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Last {dateRange} days</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Toggle mode */}
                                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                                    {['revenue', 'orders'].map(m => (
                                        <button key={m} onClick={() => setTrendMode(m)}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${trendMode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                            {m === 'revenue' ? '₱ Revenue' : '# Orders'}
                                        </button>
                                    ))}
                                </div>
                                {/* Date range */}
                                <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                                    className="px-2 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 border-0 rounded-xl outline-none cursor-pointer">
                                    <option value="7">7 days</option>
                                    <option value="30">30 days</option>
                                </select>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false}
                                    tickFormatter={v => trendMode === 'revenue' ? fmtShort(v) : v} width={42} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey={trendMode} stroke="#6366f1" strokeWidth={2.5}
                                    fill="url(#colorGrad)" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Orders by Status — spans 2 columns */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="mb-5">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Orders by Status</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Operational health overview</p>
                        </div>
                        <DonutChart data={STATUS_DATA} />
                    </div>
                </div>

                {/* ── TOP SELLING PRODUCTS ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🏆 Top Selling Products</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Last 30 days — sorted by quantity sold</p>
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">By Revenue</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    {['#', 'Product', 'Qty Sold', 'Revenue', 'Stock', 'Status'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {topSellers.map((row, i) => {
                                    const isLow = row.stock < row.reorder;
                                    const isOOS = row.stock === 0;
                                    return (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3.5 text-xs font-black text-slate-300">#{i + 1}</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-slate-800">{row.product}</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-slate-600">{row.sold} units</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-emerald-600">{fmt(row.revenue)}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-14 bg-slate-100 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${isOOS ? 'bg-rose-500' : isLow ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                            style={{ width: `${Math.min(Math.round((row.stock / row.reorder) * 100), 100)}%` }} />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700">{row.stock}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {isOOS
                                                    ? <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">Out of Stock</span>
                                                    : isLow
                                                        ? <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 animate-pulse">⚠ Low Stock</span>
                                                        : <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">In Stock</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── LOW STOCK + PAYMENT BREAKDOWN ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Low Stock Alerts — 3 cols */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">⚠ Low Stock Alerts</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Products at risk of overselling</p>
                            </div>
                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full animate-pulse">{lowStock.length} at risk</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['Product', 'Available', 'Reserved', 'Reorder At', 'Action'].map(h => (
                                            <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {lowStock.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3 text-sm font-bold text-slate-800">{row.product}</td>
                                            <td className="px-5 py-3 text-sm font-black text-rose-600">{row.available}</td>
                                            <td className="px-5 py-3 text-sm font-bold text-amber-600">{row.reserved}</td>
                                            <td className="px-5 py-3 text-sm font-bold text-slate-500">{row.reorder}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex gap-1.5">
                                                    <button className="text-[9px] font-black text-violet-600 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-lg transition">
                                                        + Prod. Order
                                                    </button>
                                                    <button className="text-[9px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition">
                                                        + Purchase Order
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Method Breakdown — 2 cols */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="mb-5">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">💳 Payment Breakdown</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Revenue by payment method</p>
                        </div>
                        <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={PAYMENT_DATA} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                                <XAxis type="number" tick={{ fontSize: 8, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                    tickFormatter={v => fmtShort(v)} />
                                <YAxis dataKey="method" type="category" tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }}
                                    axisLine={false} tickLine={false} width={80} />
                                <Tooltip formatter={v => [fmt(v), 'Revenue']} contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #f1f5f9' }} />
                                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                                    {PAYMENT_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {PAYMENT_DATA.map(d => (
                                <div key={d.method} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                        <span className="font-medium text-slate-500">{d.method}</span>
                                    </div>
                                    <span className="font-black text-slate-700">{fmt(d.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RECENT ORDERS TABLE ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📋 Recent Orders</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Latest 6 transactions</p>
                        </div>
                        <Link href={route().has('admin.orders.index') ? route('admin.orders.index') : '#'}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">
                            View All →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    {['Order No.', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Action'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentOrders.map((o, i) => (
                                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-3.5 text-sm font-bold text-indigo-600 font-mono">{o.ref}</td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-slate-800">{o.customer}</td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-emerald-600">{fmt(o.total)}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${PAYMENT_COLORS[o.payment] || 'bg-slate-50 text-slate-500'}`}>
                                                {o.payment}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] || 'bg-slate-50 text-slate-500'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs font-bold text-slate-400">{o.date}</td>
                                        <td className="px-5 py-3.5">
                                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition">View →</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── SILK PRODUCT SALES + STORE PERFORMANCE ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* 🧵 Silk Product Sales Breakdown */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="mb-5">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🧵 Silk Product Sales</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Revenue from sericulture products</p>
                        </div>
                        <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={SILK_SALES} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="product" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                    tickFormatter={v => fmtShort(v)} width={40} />
                                <Tooltip formatter={v => [fmt(v), 'Revenue']} contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #f1f5f9' }} />
                                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {SILK_SALES.map(s => (
                                <div key={s.product} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-base font-black text-slate-900">{fmt(s.revenue)}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{s.product}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🛍 Store Performance */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="mb-5">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🛍 Store Performance</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Conversion snapshot</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Store Visitors', value: stats.visitors ?? '—', icon: '👀', color: 'bg-slate-50' },
                                { label: 'Orders Placed', value: stats.total_orders ?? 85, icon: '📦', color: 'bg-indigo-50' },
                                { label: 'Conversion Rate', value: stats.conversion ?? '—', icon: '📈', color: 'bg-emerald-50' },
                                { label: 'Abandoned Carts', value: stats.abandoned_carts ?? '—', icon: '🛒', color: 'bg-amber-50' },
                                { label: 'Active Reservations', value: stats.reservations ?? 8, icon: '🔒', color: 'bg-violet-50' },
                                { label: 'Raw vs Finished Ratio', value: stats.raw_fg_ratio ?? '40/60', icon: '⚖️', color: 'bg-rose-50' },
                            ].map((item) => (
                                <div key={item.label} className={`${item.color} rounded-xl p-4 border border-slate-100`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{item.icon}</span>
                                        <p className="text-lg font-black text-slate-900">{item.value}</p>
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}