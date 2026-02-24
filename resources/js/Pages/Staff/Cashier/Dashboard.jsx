import CashierStaffLayout from '@/Layouts/CashierStaffLayout';
import { Head } from '@inertiajs/react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const HOURLY_SALES = [
    { hour: '8AM',  sales: 1200 },
    { hour: '9AM',  sales: 2800 },
    { hour: '10AM', sales: 3400 },
    { hour: '11AM', sales: 4100 },
    { hour: '12PM', sales: 5200 },
    { hour: '1PM',  sales: 4600 },
    { hour: '2PM',  sales: 3100 },
    { hour: '3PM',  sales: 2700 },
    { hour: '4PM',  sales: 1900 },
    { hour: '5PM',  sales: 900  },
];

const PAYMENT_METHODS = [
    { name: 'Cash',   value: 12400, color: '#14b8a6' },
    { name: 'GCash',  value: 5800,  color: '#06b6d4' },
    { name: 'Card',   value: 3200,  color: '#6366f1' },
    { name: 'Bank',   value: 1600,  color: '#8b5cf6' },
];

const RECENT_TRANSACTIONS = [
    { receipt: 'POS-0091', customer: 'Walk-in',       amount: '₱480',   method: 'Cash',  time: '1:42 PM', status: 'Paid' },
    { receipt: 'POS-0090', customer: 'Maria Santos',  amount: '₱1,250', method: 'GCash', time: '1:31 PM', status: 'Paid' },
    { receipt: 'POS-0089', customer: 'Walk-in',       amount: '₱760',   method: 'Cash',  time: '1:17 PM', status: 'Refunded' },
    { receipt: 'POS-0088', customer: 'Jose Reyes',    amount: '₱2,100', method: 'Card',  time: '1:05 PM', status: 'Paid' },
    { receipt: 'POS-0087', customer: 'Walk-in',       amount: '₱340',   method: 'Cash',  time: '12:52 PM', status: 'Voided' },
    { receipt: 'POS-0086', customer: 'Ana Cruz',      amount: '₱890',   method: 'GCash', time: '12:41 PM', status: 'Paid' },
    { receipt: 'POS-0085', customer: 'Walk-in',       amount: '₱210',   method: 'Cash',  time: '12:30 PM', status: 'Held' },
];

const ALERTS = [
    { type: 'void',    icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', label: 'Void request pending approval', detail: 'POS-0087 · ₱340', color: 'text-rose-500 bg-rose-50 border-rose-100' },
    { type: 'refund',  icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', label: 'Refund request waiting', detail: 'POS-0089 · ₱760', color: 'text-amber-500 bg-amber-50 border-amber-100' },
    { type: 'stock',   icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Low stock: Silk Yarn (Grade A)', detail: '3 units remaining', color: 'text-orange-500 bg-orange-50 border-orange-100' },
    { type: 'cash',    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Cash discrepancy detected', detail: 'Over by ₱50 vs expected', color: 'text-teal-500 bg-teal-50 border-teal-100' },
];

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        Paid:     'bg-emerald-50 text-emerald-600',
        Held:     'bg-amber-50 text-amber-600',
        Voided:   'bg-rose-50 text-rose-500',
        Refunded: 'bg-indigo-50 text-indigo-500',
    };
    return (
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${map[status] ?? 'bg-slate-50 text-slate-400'}`}>
            {status}
        </span>
    );
}

function MethodIcon({ method }) {
    const map = {
        Cash:  { icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-teal-50 text-teal-600' },
        GCash: { icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',                                                                           bg: 'bg-cyan-50 text-cyan-600' },
        Card:  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',                                                               bg: 'bg-indigo-50 text-indigo-600' },
        Bank:  { icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',                                                                                      bg: 'bg-violet-50 text-violet-600' },
    };
    const m = map[method] ?? map.Cash;
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${m.bg}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={m.icon} />
            </svg>
            {method}
        </span>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2 text-xs">
            <p className="font-black text-slate-700">{label}</p>
            <p className="text-teal-600 font-bold mt-0.5">₱{payload[0].value.toLocaleString()}</p>
        </div>
    );
};

// ─── CUSTOM DONUT LABEL ───────────────────────────────────────────────────────
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.07) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + r * Math.sin(-midAngle * Math.PI / 180);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CashierDashboard() {


    const totalSales = PAYMENT_METHODS.reduce((s, m) => s + m.value, 0);

    return (
        <CashierStaffLayout>
            <Head title="Cashier Dashboard" />

            <div className="space-y-5">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">POS Dashboard</h1>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">
                            Monday, February 24 · Shift started 8:00 AM
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border text-emerald-600 bg-emerald-50 border-emerald-100">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Session Open
                        </span>
                    </div>
                </div>

                {/* ── SECTION 1: KPI CARDS ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    {[
                        { label: 'Total Sales Today',     value: '₱23,000', delta: '+12% vs yesterday', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-teal-50 text-teal-600', badge: 'bg-teal-50 text-teal-600', positive: true },
                        { label: 'Transactions',           value: '91',      delta: '91 completed',       icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', iconBg: 'bg-cyan-50 text-cyan-600', badge: 'bg-slate-50 text-slate-400', positive: true },
                        { label: 'Cash on Hand',           value: '₱12,400', delta: 'Expected cash',      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', iconBg: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-50 text-emerald-600', positive: true },
                        { label: 'Digital Payments',       value: '₱10,600', delta: 'GCash + Card + Bank', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', iconBg: 'bg-indigo-50 text-indigo-600', badge: 'bg-slate-50 text-slate-400', positive: true },
                        { label: 'Refunds Today',          value: '₱760',   delta: '1 refund',           icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', iconBg: 'bg-rose-50 text-rose-500', badge: 'bg-rose-50 text-rose-500', positive: false },
                        { label: 'Held Orders',            value: '1',      delta: 'Pending',            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-amber-50 text-amber-500', badge: 'bg-amber-50 text-amber-500', positive: false },
                    ].map(k => (
                        <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${k.iconBg}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={k.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 leading-none">{k.value}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{k.label}</p>
                                <span className={`mt-1.5 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${k.badge}`}>
                                    {k.delta}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>


                {/* ── SECTIONS 3 + 4: CHARTS ROW ── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                    {/* Hourly Sales Chart (wider) */}
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📊 Hourly Sales</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Today's revenue by hour</p>
                            </div>
                            <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">Today</span>
                        </div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={HOURLY_SALES} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barSize={24}>
                                    <defs>
                                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.7} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                                    <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdfa' }} />
                                    <Bar dataKey="sales" fill="url(#salesGrad)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Payment Method Donut */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
                        <div className="mb-4">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">💳 Payment Breakdown</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Cash vs digital ratio</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={PAYMENT_METHODS}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={46}
                                            outerRadius={72}
                                            paddingAngle={3}
                                            dataKey="value"
                                            labelLine={false}
                                            label={renderCustomLabel}
                                        >
                                            {PAYMENT_METHODS.map((m, i) => <Cell key={i} fill={m.color} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => [`₱${v.toLocaleString()}`, '']} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Legend */}
                            <div className="w-full space-y-2 mt-2">
                                {PAYMENT_METHODS.map(m => (
                                    <div key={m.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                                            <span className="font-bold text-slate-600">{m.name}</span>
                                        </div>
                                        <span className="font-black text-slate-800">₱{m.value.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-50">
                                    <span className="font-black text-slate-800">Total</span>
                                    <span className="font-black text-teal-600">₱{totalSales.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── SECTION 5: RECENT TRANSACTIONS ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🧾 Recent Transactions</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Latest POS activity · Scroll to see all</p>
                        </div>
                        <button className="text-xs font-bold text-teal-600 hover:text-teal-700 transition">View All →</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100">
                                    {['Receipt #', 'Customer', 'Amount', 'Method', 'Time', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {RECENT_TRANSACTIONS.map((t, i) => (
                                    <tr key={i} className="hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-4 py-3 text-[11px] font-bold text-teal-600 font-mono">{t.receipt}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-slate-700">{t.customer}</td>
                                        <td className="px-4 py-3 text-sm font-black text-slate-900">{t.amount}</td>
                                        <td className="px-4 py-3"><MethodIcon method={t.method} /></td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-400">{t.time}</td>
                                        <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-[10px] font-black text-slate-500 hover:text-teal-600 border border-slate-200 hover:border-teal-300 px-2 py-1 rounded-lg transition-colors">
                                                    🖨 Reprint
                                                </button>
                                                <button className="text-[10px] font-black text-slate-500 hover:text-teal-600 border border-slate-200 hover:border-teal-300 px-2 py-1 rounded-lg transition-colors">
                                                    Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── SECTIONS 6 + 7: ALERTS & PERFORMANCE ── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                    {/* Alerts */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">⚠ Attention Needed</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Items requiring your action</p>
                            </div>
                            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">{ALERTS.length}</span>
                        </div>
                        <div className="space-y-2.5">
                            {ALERTS.map((a, i) => (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${a.color}`}>
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} />
                                    </svg>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-700 leading-tight">{a.label}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{a.detail}</p>
                                    </div>
                                    <button className="ml-auto flex-shrink-0 text-[10px] font-black border border-current/30 px-2 py-1 rounded-lg hover:bg-white/60 transition-colors">
                                        Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Snapshot */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="mb-4">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🏆 Performance Snapshot</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Your shift summary so far</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Avg Transaction Value', value: '₱252.75', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'text-teal-600 bg-teal-50' },
                                { label: 'Items Sold Today',       value: '348',      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',                                                                                                                                                                                                                                                                 color: 'text-cyan-600 bg-cyan-50' },
                                { label: 'Highest Single Sale',    value: '₱2,100',   icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',                                                                                                                                                                                                 color: 'text-emerald-600 bg-emerald-50' },
                                { label: 'Peak Hour',              value: '12 PM',    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',                                                                                                                                                                                                                                                                color: 'text-indigo-600 bg-indigo-50' },
                            ].map(p => (
                                <div key={p.label} className={`flex items-center gap-3 p-3.5 rounded-xl ${p.color.split(' ')[1]}`}>
                                    <svg className={`w-5 h-5 flex-shrink-0 ${p.color.split(' ')[0]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.icon} />
                                    </svg>
                                    <div>
                                        <p className="text-base font-black text-slate-900 leading-none">{p.value}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1 leading-tight">{p.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Shift Balance Check */}
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Shift Balance</p>
                            <div className="flex items-center gap-3">
                                {[
                                    { label: 'Opening Cash',  value: '₱5,000' },
                                    { label: 'Total Sales',   value: '₱23,000' },
                                    { label: 'Cash Expected', value: '₱17,400' },
                                    { label: 'Actual Count',  value: '₱17,450' },
                                ].map((b, i) => (
                                    <div key={i} className="flex-1 text-center">
                                        <p className="text-sm font-black text-slate-800">{b.value}</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{b.label}</p>
                                    </div>
                                ))}
                                <div className="flex-1 text-center">
                                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">+₱50 Over</span>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">Variance</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </CashierStaffLayout>
    );
}
