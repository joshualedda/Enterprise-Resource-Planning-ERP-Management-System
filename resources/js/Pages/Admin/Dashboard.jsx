import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SalesAnalytics from '@/Components/SalesAnalytics';
import OrderStatusFunnel from '@/Components/OrderStatusFunnel';
import { Head, router } from '@inertiajs/react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Package,
    Activity,
    Plus,
    FileText,
    Tag,
    Download,
    RefreshCw,
    AlertCircle,
    Clock,
    UserPlus,
    XCircle,
    CheckCircle,
    MoreHorizontal
} from 'lucide-react';

// --- HELPERS ---
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(price || 0);
};

// --- MOCK DATA GENERATORS (For Frontend Demo) ---
const getMockTrend = (baseValue) => {
    const isPositive = Math.random() > 0.4;
    const value = Math.floor(Math.random() * 20) + 1;
    return { isPositive, value, label: `${isPositive ? '+' : '-'}${value}% from last period` };
};

// MOCK DATA: Fallback if props are empty
const MOCK_ORDERS = Array.from({ length: 8 }, (_, i) => ({
    id: 1000 + i,
    transaction: {
        reference_no: `ORD-${202400 + i}`,
        status: ['completed', 'pending', 'processing'][i % 3],
        user: { name: ['Alice Smith', 'Bob Jones', 'Charlie Day', 'Dana White'][i % 4] }
    },
    price_at_sale: (Math.random() * 2000 + 500).toFixed(2),
    quantity: Math.ceil(Math.random() * 5),
    created_at: new Date(Date.now() - i * 86400000).toISOString()
}));

const MOCK_TOP_PRODUCTS = [
    { name: 'Premium Silk Scarf', count: 142, price: 1250, image: null },
    { name: 'Organic Cocoon Pack', count: 98, price: 850, image: null },
    { name: 'Mulberry Tea Set', count: 75, price: 450, image: null },
    { name: 'Handwoven Fabric (m)', count: 56, price: 3200, image: null },
];

// --- COMPONENTS ---

// 1. KPI Card — Premium Redesign
const KPICard = ({ title, value, icon: Icon, colorClass, trend, subtext }) => {
    // Derive tinted bg from the base color class e.g. "bg-emerald-500" → "bg-emerald-50"
    const base = colorClass.split(' ')[0]; // e.g. "bg-emerald-500"
    const tinted = base.replace('-500', '-50').replace('-600', '-50').replace('-400', '-50');
    const textCol = base.replace('bg-', 'text-');

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden flex flex-col">
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${base} rounded-l-2xl`} />

            <div className="px-5 pt-5 pb-4 ml-1 flex-1 flex flex-col gap-3">
                {/* Top: label + icon chip */}
                <div className="flex items-start justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] leading-tight pt-0.5">
                        {title}
                    </p>
                    <div className={`w-10 h-10 rounded-xl ${tinted} flex items-center justify-center flex-shrink-0 ml-2`}>
                        <Icon className={`w-5 h-5 ${textCol}`} />
                    </div>
                </div>

                {/* Value */}
                <div className="text-[2rem] font-black text-slate-900 tracking-tight leading-none">
                    {value}
                </div>

                {/* Subtext */}
                {subtext && (
                    <p className="text-[11px] text-slate-400 font-medium leading-snug -mt-1">
                        {subtext}
                    </p>
                )}

                {/* Bottom: trend */}
                <div className="mt-auto pt-2 border-t border-slate-50 flex items-center gap-2">
                    {trend ? (
                        <>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                {trend.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {trend.value}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">vs last period</span>
                        </>
                    ) : (
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">No trend data</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// 2. Action Button
const ActionBtn = ({ icon: Icon, label, onClick, color = 'indigo' }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
    >
        <Icon size={16} />
        {label}
    </button>
);

// 3. Alert Item
const AlertItem = ({ type, title, time }) => {
    const colors = {
        warning: 'bg-amber-50 text-amber-600 border-amber-100',
        danger: 'bg-rose-50 text-rose-600 border-rose-100',
        info: 'bg-blue-50 text-blue-600 border-blue-100',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };
    const icons = {
        warning: AlertCircle,
        danger: XCircle,
        info: Clock,
        success: UserPlus
    };
    const Icon = icons[type] || Activity;

    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl border ${colors[type]} mb-3`}>
            <Icon size={16} className="mt-0.5 shrink-0" />
            <div>
                <p className="text-xs font-bold">{title}</p>
                <p className="text-[10px] opacity-80 mt-0.5">{time}</p>
            </div>
        </div>
    );
};

// --- ADMIN DASHBOARD ---
function AdminDashboard({ products, orders, topProducts, currentFilter }) {
    // USE MOCK DATA IF EMPTY
    const displayOrders = (orders && orders.length > 0) ? orders : MOCK_ORDERS;
    const displayProducts = products || 42; // Fallback mock count
    const displayTopProducts = (topProducts && topProducts.length > 0) ? topProducts : MOCK_TOP_PRODUCTS;

    // Calculations
    const totalRevenue = useMemo(() => {
        return displayOrders.reduce((sum, order) => sum + (parseFloat(order.price_at_sale) * (parseInt(order.quantity) || 1)), 0);
    }, [displayOrders]);

    const averageOrderValue = useMemo(() => {
        return displayOrders.length > 0 ? totalRevenue / displayOrders.length : 0;
    }, [totalRevenue, displayOrders]);

    const orderStats = useMemo(() => {
        const pending = displayOrders.filter(o => o.transaction?.status === 'pending').length;
        const completed = displayOrders.filter(o => o.transaction?.status === 'completed').length;
        return { pending, completed };
    }, [displayOrders]);

    // Mock Chart Data
    const chartData = useMemo(() => {
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return labels.map(day => ({
            name: day,
            revenue: Math.floor(Math.random() * 50000) + 10000,
            orders: Math.floor(Math.random() * 50) + 5
        }));
    }, []);

    // Filter Handlers (Mock)
    const handleAction = (action) => {
        console.log('Action clicked:', action);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Overview of your store's performance.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {['Today', 'Week', 'Month', 'Year'].map((f) => (
                        <button
                            key={f}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${currentFilter === f.toLowerCase() ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Revenue"
                    value={formatPrice(totalRevenue)}
                    icon={DollarSign}
                    colorClass="bg-emerald-500 text-white"
                    trend={getMockTrend()}
                />
                <KPICard
                    title="Total Orders"
                    value={displayOrders.length}
                    icon={ShoppingBag}
                    colorClass="bg-teal-500 text-white"
                    trend={getMockTrend()}
                    subtext={`${orderStats.pending} Pending Processing`}
                />
                <KPICard
                    title="Avg. Order Value"
                    value={formatPrice(averageOrderValue)}
                    icon={Activity}
                    colorClass="bg-emerald-500 text-white"
                    trend={getMockTrend()}
                />
                <KPICard
                    title="Inventory Status"
                    value={displayProducts}
                    icon={Package}
                    colorClass="bg-amber-500 text-white"
                    subtext="5 Products Low Stock" // Mock
                />
            </div>

            {/* 3. Quick Actions */}
            <div className="flex flex-wrap gap-3 py-2 border-y border-slate-100 my-4">
                <ActionBtn icon={Plus} label="Add Product" onClick={() => handleAction('add-product')} />
                <ActionBtn icon={FileText} label="View Orders" onClick={() => handleAction('view-orders')} />
                <ActionBtn icon={Tag} label="Create Discount" onClick={() => handleAction('discount')} />
                <ActionBtn icon={Download} label="Export Report" onClick={() => handleAction('export')} />
                <ActionBtn icon={RefreshCw} label="Restock Inventory" onClick={() => handleAction('restock')} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* 4. Sales Chart Section (Left - 2cols) */}
                <div className="xl:col-span-2 space-y-6">
                    <SalesAnalytics />

                    {/* 5. Recent Orders Table */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-lg text-slate-800">Recent Orders</h3>
                            <button className="text-emerald-600 text-xs font-bold hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                        <th className="py-3 px-4">Order #</th>
                                        <th className="py-3 px-4">Customer</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Total</th>
                                        <th className="py-3 px-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    {displayOrders.slice(0, 5).map((order, i) => (
                                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4 font-bold text-emerald-600">#{order.transaction?.reference_no || order.id}</td>
                                            <td className="py-4 px-4 font-bold text-slate-700">{order.transaction?.user?.name || 'Walk-in Customer'}</td>
                                            <td className="py-4 px-4 text-slate-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${order.transaction?.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                    order.transaction?.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {order.transaction?.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right font-black text-slate-800">{formatPrice(order.price_at_sale * order.quantity)}</td>
                                            <td className="py-4 px-4 text-right">
                                                <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayOrders.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-10 text-center text-slate-400 text-xs font-bold uppercase">No recent orders found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 6. Right Panel (Funnel, Alerts & Best Sellers) */}
                <div className="space-y-6">
                    {/* Order Funnel */}
                    <div className="h-auto">
                        <OrderStatusFunnel />
                    </div>

                    {/* Operational Alerts */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <h3 className="font-black text-sm uppercase tracking-wider text-slate-400 mb-4">Operational Alerts</h3>
                        <div className="space-y-1">
                            <AlertItem type="warning" title="Low Stock: Silk Cocoon (Grade A)" time="2 hours ago" />
                            <AlertItem type="danger" title="Payment Failed: Order #3201" time="4 hours ago" />
                            <AlertItem type="info" title="New Customer Registration" time="Today, 09:12 AM" />
                            <AlertItem type="success" title="Inventory Restock Completed" time="Yesterday" />
                        </div>
                    </div>

                    {/* Best Sellers */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">Top Products</h3>
                            <button className="text-xs text-emerald-600 font-bold">See All</button>
                        </div>
                        <div className="space-y-4">
                            {displayTopProducts.length > 0 ? displayTopProducts.slice(0, 4).map((p, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                        {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">📦</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-slate-700 truncate group-hover:text-emerald-600 transition-colors">{p.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{p.count} units sold</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-emerald-600">{formatPrice(p.price || 0)}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                                    <Package size={24} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-xs font-bold text-slate-400">No sales data yet</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-colors">
                            View Full Inventory
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN EXPORT (Admin only — role 3 redirects to Customer/Dashboard via controller) ---
export default function Dashboard({ auth, orders = [], products = 0, topProducts = [], currentFilter = 'today' }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />
            <div className="mx-auto px-2 sm:px-4 lg:px-6 py-8">
                <AdminDashboard products={products} orders={orders} topProducts={topProducts} currentFilter={currentFilter} />
            </div>
        </AuthenticatedLayout>
    );
}