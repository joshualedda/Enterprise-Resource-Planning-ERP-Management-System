import { useState, useEffect, useRef } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, router, Link } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#a855f7'];

const phpFmt = (n) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n);

function StockBadge({ qty, reorder }) {
    if (qty === 0) return <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-100">OUT OF STOCK</span>;
    return <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-100">LOW STOCK</span>;
}

export default function LowStockReport({ stocks, kpis, charts, warehouses, categories, filters, flash }) {
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
            router.get(route('staff.inventory.reports.low-stock'), {
                search: search || undefined,
                warehouse_id: warehouseFilter || undefined,
                category_id: categoryFilter || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, warehouseFilter, categoryFilter]);

    const kpiItems = [
        { label: 'Low Stock Items', value: kpis.low_stock_count, iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', iconBg: 'bg-amber-50 text-amber-600' },
        { label: 'Out of Stock', value: kpis.out_of_stock_count, iconPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', iconBg: 'bg-rose-50 text-rose-600' },
        { label: 'At-Risk Value', value: phpFmt(kpis.at_risk_value), iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m.599-1c.51-.598.901-1.364.901-2.201 0-1.657-1.343-2-3-2V8', iconBg: 'bg-indigo-50 text-indigo-700' },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Low Stock Report — Inventory" />
            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight text-rose-600">Inventory Alerts</h1>
                        <p className="text-slate-500 font-medium mt-1">Critical stock levels requiring immediate replenishment.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text" placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)}
                            className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        />
                        <select value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)} className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl">
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl">
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {kpiItems.map(k => (
                        <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${k.iconBg}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={k.iconPath} /></svg>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{k.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-800 mb-6 font-black uppercase tracking-widest text-slate-400">Alerts by Warehouse</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.warehouses} layout="vertical" margin={{ left: 40, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {charts.warehouses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <Table
                    title="🚨 Critical Replenishment List"
                    subtitle="Items at or below reorder thresholds"
                    badgeCount={stocks.total}
                    columns={['Product', 'Category', 'Warehouse', 'Current Stock', 'Reorder Level', 'Status', 'Action']}
                    footer={stocks.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between gap-4">
                            <Pagination 
                                currentPage={stocks.current_page} totalPages={stocks.last_page} 
                                onPageChange={(page) => router.get(route('staff.inventory.reports.low-stock'), { ...filters, page }, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    )}
                >
                    {rows.map((r) => (
                        <Tr key={r.id}>
                            <Td>
                                <p className="text-sm font-black text-slate-800 leading-tight">{r.product?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">SKU: {r.product?.sku || '—'}</p>
                            </Td>
                            <Td className="text-xs font-bold text-slate-500">{r.product?.category?.name}</Td>
                            <Td className="text-xs font-black text-indigo-600">{r.warehouse?.name}</Td>
                            <Td className="text-center">
                                <span className={`text-sm font-black ${r.quantity_on_hand === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                                    {Number(r.quantity_on_hand).toLocaleString()}
                                </span>
                            </Td>
                            <Td className="text-center text-xs font-black text-slate-400">{r.product?.reorder_level || 0}</Td>
                            <Td><StockBadge qty={r.quantity_on_hand} reorder={r.product?.reorder_level} /></Td>
                            <Td>
                                <Link href={route('staff.inventory.products.index')} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">Order Now</Link>
                            </Td>
                        </Tr>
                    ))}
                </Table>
            </div>
        </InventoryStaffLayout>
    );
}
