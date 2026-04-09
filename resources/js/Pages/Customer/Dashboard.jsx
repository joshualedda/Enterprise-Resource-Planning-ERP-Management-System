import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ShoppingBag, Package, Star, CheckCircle, Truck, XCircle,
    Eye, ShoppingCart, RefreshCw, AlertCircle, ImageIcon,
    TrendingUp, Activity, ArrowUpRight, Clock,
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price || 0);

// ── Status config matching your ENUM ─────────────────────────────────────────
const statusConfig = {
    'Pending':          { label: 'Pending',          classes: 'bg-amber-50 text-amber-600',                      icon: Clock },
    'In Process':       { label: 'In Process',       classes: 'bg-blue-50 text-blue-600',                        icon: RefreshCw },
    'Ready to Pickup':  { label: 'Ready to Pickup',  classes: 'bg-emerald-50 text-emerald-700 animate-pulse',    icon: Package },
    'Product Received': { label: 'Product Received', classes: 'bg-slate-100 text-slate-500',                     icon: CheckCircle },
    'Cancelled':        { label: 'Cancelled',        classes: 'bg-rose-50 text-rose-600',                        icon: XCircle },
};

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { label: status, classes: 'bg-amber-50 text-amber-600', icon: AlertCircle };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${cfg.classes}`}>
            <Icon size={10} /> {cfg.label}
        </span>
    );
};

const KPICard = ({ title, value, icon: Icon, colorClass, subtext }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className={`inline-flex p-3 rounded-xl ${colorClass} bg-opacity-10 mb-4`}>
            <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
        <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
        {subtext && <p className="text-xs text-slate-400 mt-2 font-medium">{subtext}</p>}
    </div>
);

export default function CustomerDashboard({ auth, transactions = [], recentProducts = [], chartData = [] }) {
    const { auth: pageAuth } = usePage().props;
    const user      = (auth || pageAuth)?.user;
    const firstName = user?.first_name || 'there';

    const [activeFilter, setActiveFilter] = useState('all');

    // ── Real stats ────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const received   = transactions.filter(t => t.status === 'Product Received');
        const active     = transactions.filter(t => !['Product Received', 'Cancelled'].includes(t.status));
        const totalSpent = received.reduce((s, t) => s + Number(t.total_amount || 0), 0);
        return {
            totalSpent,
            activeCount:    active.length,
            receivedCount:  received.length,
            readyForPickup: transactions.filter(t => t.status === 'Ready to Pickup').length,
            inProcess:       transactions.filter(t => t.status === 'In Process').length,
        };
    }, [transactions]);

    const NO_IMAGE = 'https://placehold.co/400x300?text=No+Image';

    // ── Filter for the mini table ─────────────────────────────────────────────
    const filteredOrders = useMemo(() => {
        const list = activeFilter === 'active'
            ? transactions.filter(t => !['Product Received', 'Cancelled'].includes(t.status))
            : activeFilter === 'received'
            ? transactions.filter(t => t.status === 'Product Received')
            : transactions;
        return list.slice(0, 6);
    }, [transactions, activeFilter]);

    return (
        <AuthenticatedLayout header="My Dashboard">
            <Head title="My Dashboard" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── Welcome ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Welcome back, {firstName} 👋
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Here's a summary of your orders and account activity.
                        </p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {[
                            { label: 'Recent All', key: 'all' },
                            { label: 'In Progress', key: 'active' },
                            { label: 'Completed', key: 'received' },
                        ].map(f => (
                            <button key={f.key} onClick={() => setActiveFilter(f.key)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilter === f.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <KPICard title="Total Lifetime Spent" value={formatPrice(stats.totalSpent)} icon={ShoppingBag}  colorClass="bg-indigo-500" subtext="From received orders" />
                    <KPICard title="Current Active Orders" value={stats.activeCount}           icon={Package}      colorClass="bg-blue-500"
                        subtext={stats.readyForPickup > 0 ? `🎉 ${stats.readyForPickup} ready for pickup!` : `${stats.inProcess} in process`} />
                    <KPICard title="Total Orders Completed" value={stats.receivedCount}        icon={CheckCircle}  colorClass="bg-emerald-500" subtext="Successfully transacted" />
                </div>

                {/* ── Visual Analytics — Charts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Spending Trend */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Spending Trend</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Monthly purchase volume (PHP)</p>
                            </div>
                            <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600"><TrendingUp size={18} /></div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#64748b', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Activity */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Order Activity</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Number of orders per month</p>
                            </div>
                            <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600"><Activity size={18} /></div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                                    <YAxis hide />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* LEFT — Recent Orders Table */}
                    <div className="xl:col-span-2">
                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-lg text-slate-800">Recent Orders</h3>
                                <Link href={route('customer.orders.index')}
                                    className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all hover:bg-indigo-100">
                                    See All <Eye size={12} />
                                </Link>
                            </div>

                            {transactions.length === 0 ? (
                                <div className="text-center py-16">
                                    <ShoppingBag size={40} className="text-slate-200 mx-auto mb-3" />
                                    <p className="font-black text-slate-400 text-sm">No orders yet</p>
                                    <p className="text-slate-400 text-xs mt-1 mb-6">Start shopping to see your orders here.</p>
                                    <Link href={route('products.all')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-colors">
                                        <ShoppingCart size={14} /> Shop Now
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                                <th className="py-3 px-3">Reference</th>
                                                <th className="py-3 px-3">Items</th>
                                                <th className="py-3 px-3">Date</th>
                                                <th className="py-3 px-3">Status</th>
                                                <th className="py-3 px-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-sm">
                                            {filteredOrders.map((t) => (
                                                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-3.5 px-3 font-bold text-indigo-600 font-mono text-xs">
                                                        #{t.reference_no}
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex -space-x-2">
                                                            {t.order_items?.slice(0, 3).map((item, idx) => (
                                                                <img key={idx} 
                                                                    src={item.product?.image_url || NO_IMAGE}
                                                                    onError={(e) => { e.target.src = NO_IMAGE; }}
                                                                    className="h-7 w-7 rounded-full border-2 border-white object-cover bg-slate-100 shadow-sm"
                                                                    title={item.product?.product} />
                                                            ))}
                                                            {(t.order_items?.length || 0) > 3 && (
                                                                <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500">
                                                                    +{t.order_items.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                                            {t.order_items?.length || 0} item{(t.order_items?.length || 0) !== 1 ? 's' : ''}
                                                        </p>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-slate-500 text-xs font-bold">
                                                        {new Date(t.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <StatusBadge status={t.status} />
                                                    </td>
                                                    <td className="py-3.5 px-3 text-right font-black text-slate-800 text-sm">
                                                        {formatPrice(t.total_amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredOrders.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="py-10 text-center text-slate-400 text-xs font-bold uppercase">
                                                        No orders match this filter
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="space-y-6">

                        {/* Order Status Breakdown */}
                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <h3 className="font-black text-sm uppercase tracking-wider text-slate-400 mb-5">Order Status</h3>
                            <div className="space-y-3">
                                {Object.entries(statusConfig).map(([key, cfg]) => {
                                    const count = transactions.filter(t => t.status === key).length;
                                    const Icon  = cfg.icon;
                                    return (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`p-1.5 rounded-lg ${cfg.classes}`}><Icon size={12} /></span>
                                                <span className="text-xs font-bold text-slate-600">{cfg.label}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-800 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* For You — Real Products */}
                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">For You</h3>
                                <Link href={route('products.all')}
                                    className="text-xs text-indigo-600 font-bold hover:underline">See All</Link>
                            </div>
                            <div className="space-y-4">
                                {recentProducts.length > 0 ? recentProducts.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                            <img 
                                                src={p.image_url || NO_IMAGE} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                alt={p.product} 
                                                onError={(e) => { e.target.src = NO_IMAGE; }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{p.product}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{p.category?.category ?? '—'}</p>
                                        </div>
                                        <p className="text-xs font-black text-indigo-600 shrink-0">{formatPrice(p.price)}</p>
                                    </div>
                                )) : (
                                    <p className="text-xs text-slate-400 text-center py-4">No products available.</p>
                                )}
                            </div>
                            <Link href={route('products.all')}
                                className="w-full mt-5 py-3 rounded-xl bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                                <ShoppingCart size={14} /> Shop Now
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}