import { useState, useEffect, useRef } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, router, Link } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#0B1F3B', '#3BAA35', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const phpFmt = (n) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n);

function KpiCard({ label, value, sub, iconPath, iconBg, trend }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
            </div>
            <div>
                <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 mb-1 leading-tight">{label}</p>
                {trend !== undefined && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function MovementReport({ movements, kpis, charts, warehouses, filters, flash }) {
    const rows = movements.data || [];
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
    const [typeFilter, setTypeFilter] = useState(filters.movement_type ?? '');
    const [startDate, setStartDate] = useState(filters.start_date ?? '');
    const [endDate, setEndDate] = useState(filters.end_date ?? '');

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(route('staff.inventory.reports.movement'), {
                search: search || undefined,
                warehouse_id: warehouseFilter || undefined,
                movement_type: typeFilter || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, warehouseFilter, typeFilter, startDate, endDate]);

    const movementTypes = [
        'purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment', 'production_use', 'return'
    ];

    const kpiItems = [
        { label: 'Total Movements', value: kpis.total_movements, iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', iconBg: 'bg-indigo-50 text-indigo-600' },
        { label: 'Stock Inflow', value: kpis.total_in.toLocaleString(), iconPath: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4', iconBg: 'bg-emerald-50 text-emerald-600' },
        { label: 'Stock Outflow', value: kpis.total_out.toLocaleString(), iconPath: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4', iconBg: 'bg-rose-50 text-rose-600' },
        { label: 'Net Stock Change', value: (kpis.net_change >= 0 ? '+' : '') + kpis.net_change.toLocaleString(), iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', iconBg: 'bg-blue-50 text-blue-600', trend: kpis.net_change },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Stock Movement Report — Inventory" />
            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Movement Report</h1>
                        <p className="text-slate-500 font-medium mt-1">Analyze stock velocity and flow patterns.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                        <div className="relative col-span-1 lg:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Search Product</label>
                            <input
                                type="text" value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-3 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Warehouse</label>
                            <select value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)} className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl">
                                <option value="">All Warehouses</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Type</label>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl">
                                <option value="">All Types</option>
                                {movementTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiItems.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trend Line Chart */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500" /> Stock Trend (Net)
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={charts.trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Breakdown Bar Chart */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" /> Movements by Type
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.types}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <Table
                    title="📝 Movement History"
                    subtitle="Detailed log of all inventory inflows and outflows"
                    badgeCount={movements.total}
                    columns={['Date', 'Product', 'Type', 'Warehouse', 'Qty', 'Unit Cost', 'Reference']}
                    footer={movements.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between gap-4">
                            <p className="text-xs font-bold text-slate-400 italic">Page {movements.current_page} of {movements.last_page}</p>
                            <Pagination 
                                currentPage={movements.current_page} totalPages={movements.last_page} 
                                onPageChange={(page) => router.get(route('staff.inventory.reports.movement'), { ...filters, page }, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    )}
                >
                    {rows.map((r) => (
                        <Tr key={r.id}>
                            <Td className="text-xs font-medium text-slate-400">
                                {new Date(r.movement_date).toLocaleDateString()}
                            </Td>
                            <Td>
                                <p className="text-sm font-black text-slate-800 leading-tight">{r.product?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">BATCH: {r.batch?.batch_code || '—'}</p>
                            </Td>
                            <Td>
                                <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                    {r.movement_type.replace('_', ' ')}
                                </span>
                            </Td>
                            <Td className="text-xs font-bold text-indigo-600">
                                {r.warehouse?.name}
                            </Td>
                            <Td className={`text-sm font-black text-right ${r.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {r.quantity > 0 ? '+' : ''}{r.quantity.toLocaleString()}
                            </Td>
                            <Td className="text-xs font-bold text-slate-400 text-right">
                                {phpFmt(r.unit_cost)}
                            </Td>
                            <Td>
                                <p className="text-[10px] text-slate-500 font-medium italic">{r.reference_type || 'Manual'}</p>
                                <p className="text-[10px] font-black text-slate-800">#{r.reference_id || '—'}</p>
                            </Td>
                        </Tr>
                    ))}
                </Table>
            </div>
        </InventoryStaffLayout>
    );
}
