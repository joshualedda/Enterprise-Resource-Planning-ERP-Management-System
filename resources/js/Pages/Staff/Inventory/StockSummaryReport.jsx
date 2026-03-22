import { useState, useMemo, useEffect, useRef } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, router, Link } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

const COLORS = ['#0B1F3B', '#3BAA35', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const phpFmt = (n) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n);

function KpiCard({ label, value, iconPath, iconBg, badge, badgeColor }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
            </div>
            <div>
                <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">{label}</p>
                {badge && (
                    <span className={`mt-2 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function StockSummaryReport({ stocks, kpis, charts, warehouses, categories, filters, flash }) {
    const rows = stocks.data || [];
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const [search, setSearch] = useState(filters.search ?? '');
    const [warehouseFilter, setWarehouseFilter] = useState(filters.warehouse_id ?? '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id ?? '');

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(route('staff.inventory.reports.stock-summary'), {
                search: search || undefined,
                warehouse_id: warehouseFilter || undefined,
                category_id: categoryFilter || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, warehouseFilter, categoryFilter]);

    const items = [
        {
            label: 'Total Products', value: kpis.total_products, 
            iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            iconBg: 'bg-indigo-50 text-indigo-600',
        },
        {
            label: 'On Hand Qty', value: Number(kpis.total_qty).toLocaleString(), 
            iconPath: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Low Stock Items', value: kpis.low_stock_count, 
            badge: kpis.low_stock_count > 0 ? 'Action Required' : 'Healthy',
            badgeColor: kpis.low_stock_count > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
            iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
            iconBg: 'bg-amber-50 text-amber-600',
        },
        {
            label: 'Inventory Value', value: phpFmt(kpis.total_value), 
            iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m.599-1c.51-.598.901-1.364.901-2.201 0-1.657-1.343-2-3-2V8',
            iconBg: 'bg-indigo-50 text-indigo-700',
        },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Stock Summary Report — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Summary Report</h1>
                        <p className="text-slate-500 font-medium mt-1">Real-time inventory health and distribution analytics.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export CSV
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B1F3B] hover:bg-slate-800 rounded-xl transition shadow-sm shadow-indigo-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search product name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        <select
                            value={warehouseFilter}
                            onChange={e => setWarehouseFilter(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none appearance-none cursor-pointer transition min-w-[160px]"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none appearance-none cursor-pointer transition min-w-[160px]"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stock by Category - Pie Chart */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#0B1F3B]" />
                                Stock by Category
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty Distribution</span>
                        </div>
                        <div className="h-[300px] w-full">
                            {charts.category.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.category}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {charts.category.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-xs italic font-medium">No category data available</div>
                            )}
                        </div>
                    </div>

                    {/* Stock by Warehouse - Bar Chart */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#3BAA35]" />
                                Stock by Warehouse
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage Levels</span>
                        </div>
                        <div className="h-[300px] w-full">
                            {charts.warehouse.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.warehouse} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#3BAA35' }}
                                        />
                                        <Bar dataKey="value" fill="#3BAA35" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-xs italic font-medium">No warehouse data available</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <Table
                    title="📦 Detailed Stock Snapshot"
                    subtitle="Granular breakdown of current inventory levels"
                    badgeCount={stocks.total}
                    columns={['Product', 'Category', 'Warehouse', 'Batch', 'On Hand', 'Reserved', 'Available', 'Unit']}
                    footer={stocks.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs font-bold text-slate-400 italic">
                                Page {stocks.current_page} of {stocks.last_page} &nbsp;·&nbsp; {stocks.total} records
                            </p>
                            <Pagination 
                                currentPage={stocks.current_page} 
                                totalPages={stocks.last_page} 
                                onPageChange={(page) => {
                                    router.get(route('staff.inventory.reports.stock-summary'), { ...filters, page }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    )}
                >
                    {rows.length > 0 ? rows.map((r) => {
                        const available = r.quantity_on_hand - r.quantity_reserved;
                        return (
                            <Tr key={r.id}>
                                <Td>
                                    <p className="text-sm font-black text-slate-800 leading-tight">{r.product?.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">SKU: {r.product?.sku || '—'}</p>
                                </Td>
                                <Td>
                                    <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                        {r.product?.category?.name || '—'}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="text-xs font-bold text-indigo-600">{r.warehouse?.name || '—'}</span>
                                </Td>
                                <Td>
                                    <span className="text-xs font-medium text-slate-500 italic">{r.batch?.batch_code || '—'}</span>
                                </Td>
                                <Td className="text-center font-black text-slate-900 text-xs">
                                    {Number(r.quantity_on_hand).toLocaleString()}
                                </Td>
                                <Td className="text-center font-bold text-slate-400 text-xs italic">
                                    {Number(r.quantity_reserved).toLocaleString()}
                                </Td>
                                <Td className="text-center font-black text-[#3BAA35] text-sm">
                                    {available.toLocaleString()}
                                </Td>
                                <Td className="text-xs font-bold text-slate-400 uppercase">
                                    {r.product?.unit?.symbol || 'Units'}
                                </Td>
                            </Tr>
                        );
                    }) : (
                        <Tr>
                            <Td colSpan="8" className="py-20 text-center">
                                <div className="flex flex-col items-center gap-2 opacity-30">
                                    <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                    <p className="text-sm font-black text-slate-500">No stock data matching your criteria</p>
                                </div>
                            </Td>
                        </Tr>
                    )}
                </Table>
            </div>
        </InventoryStaffLayout>
    );
}
