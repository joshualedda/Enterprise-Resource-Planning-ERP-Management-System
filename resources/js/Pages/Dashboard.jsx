import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

// --- HELPERS ---
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(price || 0);
};

// --- REUSABLE DATE FILTER ---
function DashboardFilter({ currentFilter }) {
    const handleFilterChange = (f) => {
        router.get(route('dashboard'), { filter: f }, { 
            preserveState: true, 
            replace: true 
        });
    };

    return (
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200 shadow-inner">
            {['today', 'week', 'month', 'year'].map((f) => (
                <button 
                    key={f} 
                    onClick={() => handleFilterChange(f)} 
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentFilter === f ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {f}
                </button>
            ))}
        </div>
    );
}

// --- REUSABLE STAT CARD ---
function StatCard({ label, value, color, icon, subtext, isDark = false }) {
    return (
        <div className={`${isDark ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white text-slate-900 shadow-sm'} p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all relative overflow-hidden group`}>
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-4 text-white group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-2`}>{label}</p>
            <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
            {subtext && <p className="text-[10px] text-slate-400 mt-2 font-medium italic opacity-80">{subtext}</p>}
        </div>
    );
}

// --- 1. ADMIN DASHBOARD ---
function AdminDashboard({ products, orders, topProducts, currentFilter }) {
    const totalRevenue = useMemo(() => {
        return orders.reduce((sum, order) => sum + (parseFloat(order.price_at_sale) * (parseInt(order.quantity) || 1)), 0);
    }, [orders]);

    const chartData = useMemo(() => {
        const groups = orders.reduce((acc, order) => {
            const label = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const subtotal = (parseFloat(order.price_at_sale) * (parseInt(order.quantity) || 1));
            acc[label] = (acc[label] || 0) + subtotal;
            return acc;
        }, {});
        
        // Isort ang dates para tama ang takbo ng line chart
        return Object.keys(groups).map(date => ({ 
            date, 
            amount: groups[date] 
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [orders]);

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Executive Overview</h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg italic uppercase tracking-widest text-[10px]">Management Portal • {currentFilter}</p>
                </div>
                <DashboardFilter currentFilter={currentFilter} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} color="bg-indigo-600" icon="₱" />
                <StatCard label="Orders" value={orders.length} color="bg-violet-600" icon="🛍️" />
                <StatCard label="Best Seller" value={topProducts[0]?.count || 0} color="bg-emerald-500" icon="⭐" subtext={topProducts[0]?.name} />
                <StatCard label="Inventory" value={products || 0} color="bg-slate-900" icon="📦" isDark />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LINE CHART SECTION */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm h-[450px] flex flex-col transition-all hover:shadow-md">
                    <div className="mb-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Revenue Trend</h2>
                        <p className="text-xl font-black text-slate-800">Sales Performance</p>
                    </div>
                    
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                                    tickFormatter={(value) => `₱${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [formatPrice(value), 'Revenue']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#4f46e5" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* BEST SELLERS LIST */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">Best Sellers</h2>
                    {topProducts.length > 0 ? topProducts.map((p, i) => (
                        <div key={i} className="flex items-center gap-4 mb-5 group">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">#{i+1}</div>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                                {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">📦</div>}
                            </div>
                            <div className="flex-1 min-w-0"><p className="text-xs font-black uppercase truncate text-slate-700">{p.name}</p></div>
                            <span className="text-indigo-600 font-black text-xs">{p.count} sold</span>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">No Data Available</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- 2. STAFF DASHBOARD ---
function StaffDashboard({ orders = [], currentFilter }) {
    const totalRevenue = useMemo(() => {
        if (!Array.isArray(orders)) return 0;
        return orders.reduce((sum, order) => sum + (parseFloat(order.price_at_sale) * (parseInt(order.quantity) || 1)), 0);
    }, [orders]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Store Operations</h1>
                    <p className="text-slate-500 font-medium italic mt-2 uppercase text-[10px] tracking-widest">Active Shift • <span className="text-indigo-600 font-black">{currentFilter}</span></p>
                </div>
                <DashboardFilter currentFilter={currentFilter} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} color="bg-indigo-600" icon="₱" />
                <StatCard label="Orders Handled" value={orders.length} color="bg-sky-500" icon="🛍️" />
                <StatCard label="Terminal" value="Online" color="bg-slate-900" icon="📟" isDark />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 font-black uppercase tracking-widest text-xs text-slate-400">Transaction Registry</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                <th className="px-8 py-5">Item</th>
                                <th className="px-8 py-5">Reference</th>
                                <th className="px-8 py-5">Customer</th>
                                <th className="px-8 py-5 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.map((o, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden">
                                                {o.product?.image_url ? <img src={o.product.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">📦</div>}
                                            </div>
                                            <span className="text-xs font-black text-slate-700 uppercase">{o.product?.product}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[10px] font-black text-indigo-500">{o.transaction?.reference_no || `ID-${o.id}`}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-slate-600">{o.transaction?.user?.name || 'Walk-in'}</td>
                                    <td className="px-8 py-5 text-right text-xs font-black">{formatPrice(o.price_at_sale * o.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- 3. CUSTOMER DASHBOARD ---
function CustomerDashboard({ orders = [], currentFilter }) {
    const mySpent = useMemo(() => {
        if (!Array.isArray(orders)) return 0;
        return orders.reduce((sum, o) => sum + (parseFloat(o.price_at_sale) * (parseInt(o.quantity) || 1)), 0);
    }, [orders]);

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">My Ledger</h1>
                    <p className="text-slate-500 font-medium italic mt-2 uppercase tracking-widest text-[10px]">
                        Personal Spending Summary • <span className="text-indigo-600">{currentFilter}</span>
                    </p>
                </div>
                <DashboardFilter currentFilter={currentFilter} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard label="Total Spent" value={formatPrice(mySpent)} color="bg-indigo-600" icon="₱" subtext={`Total expenses for this ${currentFilter}`} />
                <StatCard label="Items Purchased" value={orders.reduce((a, b) => a + (parseInt(b.quantity) || 0), 0)} color="bg-slate-900" icon="🛒" isDark subtext="Total quantity of orders" />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Order History</h2>
                    <span className="text-[10px] font-bold text-slate-300 italic">{orders.length} items total</span>
                </div>

                {orders.length > 0 ? (
                    orders.map((o, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-300 hover:shadow-md transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-50">
                                    {o.product?.image_url ? (
                                        <img src={o.product.image_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <span className="text-2xl">📦</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                                        Ref: {o.transaction?.reference_no || `#${o.id.toString().padStart(5, '0')}`}
                                    </p>
                                    <h4 className="font-black text-slate-800 text-lg uppercase leading-tight">
                                        {o.product?.product || 'Unknown Product'}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                        Ordered on {new Date(o.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="block font-black text-slate-900 text-xl">{formatPrice(o.price_at_sale * o.quantity)}</span>
                                <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase mt-2 ${o.transaction?.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {o.transaction?.status || 'Verified Sale'}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                        <p className="text-slate-300 font-black uppercase tracking-widest text-sm">No purchases found for this period</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- MAIN EXPORT ---
export default function Dashboard({ auth, orders = [], products = 0, topProducts = [], currentFilter = 'today' }) {
    const roleId = auth.user.role_id;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />
            <div className="max-w-7xl mx-auto px-6 py-10">
                {roleId === 1 && <AdminDashboard products={products} orders={orders} topProducts={topProducts} currentFilter={currentFilter} />}
                {roleId === 2 && <StaffDashboard orders={orders} currentFilter={currentFilter} />}
                {roleId === 3 && <CustomerDashboard orders={orders} currentFilter={currentFilter} />}
            </div>
        </AuthenticatedLayout>
    );
}