import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    TrendingUp,
    TrendingDown,
    ShoppingBag,
    Package,
    Star,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    MoreHorizontal,
    Eye,
    ShoppingCart,
    Heart,
    Gift,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const formatPrice = (price) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price || 0);

const getMockTrend = () => {
    const isPositive = Math.random() > 0.4;
    const value = Math.floor(Math.random() * 20) + 1;
    return { isPositive, value };
};

// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------
const MOCK_ORDERS = [
    { id: 'ORD-20241', status: 'completed', date: '2024-01-15', items: 3, total: 3750.00, product: 'Premium Silk Scarf' },
    { id: 'ORD-20238', status: 'processing', date: '2024-01-20', items: 1, total: 1250.00, product: 'Handwoven Fabric (1m)' },
    { id: 'ORD-20235', status: 'pending', date: '2024-01-22', items: 2, total: 1700.00, product: 'Organic Cocoon Pack' },
    { id: 'ORD-20229', status: 'shipped', date: '2024-01-10', items: 1, total: 850.00, product: 'Mulberry Tea Set' },
    { id: 'ORD-20210', status: 'completed', date: '2024-01-05', items: 4, total: 5200.00, product: 'Silk Pillowcase Set' },
    { id: 'ORD-20198', status: 'cancelled', date: '2023-12-28', items: 1, total: 450.00, product: 'Cocoon Body Scrub' },
];

const MOCK_PRODUCTS = [
    { name: 'Premium Silk Scarf', price: 1250, image: null, category: 'Accessories' },
    { name: 'Handwoven Fabric', price: 3200, image: null, category: 'Fabric' },
    { name: 'Organic Cocoon Pack', price: 850, image: null, category: 'Raw Materials' },
    { name: 'Mulberry Tea Set', price: 450, image: null, category: 'Wellness' },
];

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------
const KPICard = ({ title, value, icon: Icon, colorClass, trend, subtext }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'} bg-slate-50 px-2 py-1 rounded-full`}>
                    {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {trend.value}%
                </div>
            )}
        </div>
        <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
            {subtext && <p className="text-xs text-slate-400 mt-2 font-medium">{subtext}</p>}
        </div>
    </div>
);

const ActionBtn = ({ icon: Icon, label, href = '#' }) => (
    <Link
        href={href}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
    >
        <Icon size={16} />
        {label}
    </Link>
);

const statusConfig = {
    completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-600', icon: CheckCircle },
    processing: { label: 'Processing', classes: 'bg-blue-50 text-blue-600', icon: RefreshCw },
    pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-600', icon: Clock },
    shipped: { label: 'Shipped', classes: 'bg-indigo-50 text-indigo-600', icon: Truck },
    cancelled: { label: 'Cancelled', classes: 'bg-rose-50 text-rose-600', icon: XCircle },
};

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { label: status, classes: 'bg-slate-100 text-slate-500', icon: AlertCircle };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${cfg.classes}`}>
            <Icon size={10} />
            {cfg.label}
        </span>
    );
};

// ---------------------------------------------------------------------------
// MAIN CUSTOMER DASHBOARD
// ---------------------------------------------------------------------------
export default function CustomerDashboard({ auth }) {
    const { auth: pageAuth } = usePage().props;
    const user = (auth || pageAuth)?.user;
    const fullName = user ? `${user.first_name} ${user.last_name}` : 'Customer';
    const firstName = user?.first_name || 'there';

    const [activeFilter, setActiveFilter] = useState('all');

    // Derived stats from mock
    const totalSpent = useMemo(() =>
        MOCK_ORDERS.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0),
        []);
    const activeOrders = MOCK_ORDERS.filter(o => ['processing', 'pending', 'shipped'].includes(o.status)).length;
    const completedOrders = MOCK_ORDERS.filter(o => o.status === 'completed').length;
    const loyaltyPoints = Math.floor(totalSpent / 10); // 1 point per ₱10

    const filteredOrders = useMemo(() => {
        if (activeFilter === 'all') return MOCK_ORDERS;
        return MOCK_ORDERS.filter(o => o.status === activeFilter);
    }, [activeFilter]);

    return (
        <AuthenticatedLayout header="My Dashboard">
            <Head title="My Dashboard" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── 1. Welcome Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Welcome back, {firstName} 👋
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Here's a summary of your orders and account activity.
                        </p>
                    </div>
                    {/* Filter pills */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {['All', 'Active', 'Completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f === 'All' ? 'all' : f === 'Active' ? 'processing' : 'completed')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${(f === 'All' && activeFilter === 'all') ||
                                        (f === 'Active' && activeFilter === 'processing') ||
                                        (f === 'Completed' && activeFilter === 'completed')
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── 2. KPI Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Total Spent"
                        value={formatPrice(totalSpent)}
                        icon={ShoppingBag}
                        colorClass="bg-indigo-500"
                        trend={getMockTrend()}
                        subtext="Across all completed orders"
                    />
                    <KPICard
                        title="Active Orders"
                        value={activeOrders}
                        icon={Package}
                        colorClass="bg-blue-500"
                        subtext={`${MOCK_ORDERS.filter(o => o.status === 'pending').length} awaiting confirmation`}
                    />
                    <KPICard
                        title="Completed Orders"
                        value={completedOrders}
                        icon={CheckCircle}
                        colorClass="bg-emerald-500"
                        trend={getMockTrend()}
                    />
                    <KPICard
                        title="Loyalty Points"
                        value={loyaltyPoints.toLocaleString()}
                        icon={Star}
                        colorClass="bg-amber-500"
                        subtext="Earn 1 point per ₱10 spent"
                    />
                </div>

                {/* ── 3. Quick Actions ── */}
                <div className="flex flex-wrap gap-3 py-2 border-y border-slate-100 my-4">
                    <ActionBtn icon={ShoppingCart} label="Browse Products" href="/" />
                    <ActionBtn icon={Package} label="My Orders" href={route().has('orders.index') ? route('orders.index') : '#'} />
                    <ActionBtn icon={Heart} label="Wishlist" href="#" />
                    <ActionBtn icon={Gift} label="Redeem Points" href="#" />
                    <ActionBtn icon={Eye} label="Track Shipment" href="#" />
                </div>

                {/* ── 4. Main Two-Column Grid ── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* LEFT — Order History Table */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-lg text-slate-800">My Orders</h3>
                                <Link
                                    href={route().has('orders.index') ? route('orders.index') : '#'}
                                    className="text-indigo-600 text-xs font-bold hover:underline"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                            <th className="py-3 px-4">Order #</th>
                                            <th className="py-3 px-4">Product</th>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-right">Total</th>
                                            <th className="py-3 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-sm">
                                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                            <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-4 font-bold text-indigo-600">#{order.id}</td>
                                                <td className="py-4 px-4 font-bold text-slate-700 max-w-[160px] truncate">{order.product}</td>
                                                <td className="py-4 px-4 text-slate-500 text-xs">
                                                    {new Date(order.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                                <td className="py-4 px-4 text-right font-black text-slate-800">
                                                    {formatPrice(order.total)}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="py-10 text-center text-slate-400 text-xs font-bold uppercase">
                                                    No orders found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="space-y-6">

                        {/* Order Status Summary */}
                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <h3 className="font-black text-sm uppercase tracking-wider text-slate-400 mb-5">
                                Order Status
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(statusConfig).map(([key, cfg]) => {
                                    const count = MOCK_ORDERS.filter(o => o.status === key).length;
                                    const Icon = cfg.icon;
                                    return (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`p-1.5 rounded-lg ${cfg.classes}`}>
                                                    <Icon size={12} />
                                                </span>
                                                <span className="text-xs font-bold text-slate-600">{cfg.label}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-800 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recommended Products */}
                        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">
                                    For You
                                </h3>
                                <Link href="/" className="text-xs text-indigo-600 font-bold hover:underline">
                                    See All
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {MOCK_PRODUCTS.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-lg group-hover:bg-indigo-50 transition-colors">
                                            🧵
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                                {p.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold">{p.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-indigo-600">{formatPrice(p.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href="/"
                                className="w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={14} />
                                Shop Now
                            </Link>
                        </div>

                        {/* Loyalty Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-[1.5rem] shadow-lg text-white relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
                            <div className="absolute -right-2 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-4">
                                    <Star size={16} className="text-amber-300 fill-amber-300" />
                                    <span className="text-xs font-black uppercase tracking-widest text-white/80">Loyalty Rewards</span>
                                </div>
                                <p className="text-4xl font-black tracking-tight">{loyaltyPoints.toLocaleString()}</p>
                                <p className="text-xs text-white/70 mt-1 font-bold">Points Available</p>
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                                        Next reward at {(Math.ceil(loyaltyPoints / 500) * 500).toLocaleString()} pts
                                    </p>
                                    <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                                        <div
                                            className="bg-amber-300 h-1.5 rounded-full"
                                            style={{ width: `${(loyaltyPoints % 500) / 500 * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
