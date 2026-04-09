import { useState, useEffect, useRef } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, router, Link } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1'];

export default function ExpiryReport({ batches, kpis, charts, warehouses, filters, flash }) {
    const rows = batches.data || [];
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
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(route('staff.inventory.reports.expiry'), {
                search: search || undefined,
                warehouse_id: warehouseFilter || undefined,
                status: statusFilter || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, warehouseFilter, statusFilter]);

    const getExpiryStatus = (date) => {
        if (!date) return { label: 'No Data', cls: 'bg-slate-100 text-slate-400' };
        const d = new Date(date);
        const now = new Date();
        const diff = (d - now) / (1000 * 60 * 60 * 24);
        if (diff < 0) return { label: 'Expired', cls: 'bg-rose-50 text-rose-600 border border-rose-100' };
        if (diff <= 30) return { label: 'Near Expiry', cls: 'bg-amber-50 text-amber-600 border border-amber-100' };
        return { label: 'Healthy', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' };
    };

    const kpiItems = [
        { label: 'Expired Batches', value: kpis.expired_count, iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', iconBg: 'bg-rose-50 text-rose-600' },
        { label: 'Near Expiry (30d)', value: kpis.near_expiry_count, iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-amber-50 text-amber-600' },
        { label: 'Total Monitored', value: kpis.total_monitored, iconPath: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', iconBg: 'bg-indigo-50 text-indigo-600' },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Expiry Tracking — Inventory" />
            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Expiry Report</h1>
                        <p className="text-slate-500 font-medium mt-1">Monitor product longevity and prevent waste.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text" placeholder="Search batch or product..." value={search} onChange={e => setSearch(e.target.value)}
                            className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        />
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl">
                            <option value="">All Statuses</option>
                            <option value="expired">Expired</option>
                            <option value="near_expiry">Near Expiry</option>
                            <option value="healthy">Healthy</option>
                        </select>
                        <select value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)} className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl">
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
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
                    <h3 className="text-sm font-black text-slate-800 mb-6 font-black uppercase tracking-widest text-slate-400">Batch Expiry Timeline</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.timeline}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <Table
                    title="🗓️ Batch Expiry Log"
                    subtitle="Detailed list of material longevity and status"
                    badgeCount={batches.total}
                    columns={['Batch Code', 'Product', 'Category', 'Manufacturing', 'Expiry Date', 'Status']}
                    footer={batches.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between gap-4">
                            <Pagination 
                                currentPage={batches.current_page} totalPages={batches.last_page} 
                                onPageChange={(page) => router.get(route('staff.inventory.reports.expiry'), { ...filters, page }, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    )}
                >
                    {rows.map((r) => {
                        const status = getExpiryStatus(r.expiry_date);
                        return (
                            <Tr key={r.id}>
                                <Td className="text-sm font-black text-indigo-700">{r.batch_code}</Td>
                                <Td>
                                    <p className="text-sm font-bold text-slate-800 leading-tight">{r.product?.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Qty: {r.stocks?.reduce((acc, s) => acc + Number(s.quantity_on_hand), 0).toLocaleString() || 0}</p>
                                </Td>
                                <Td className="text-xs font-bold text-slate-500">{r.product?.category?.name || '—'}</Td>
                                <Td className="text-xs text-slate-400 font-medium">{r.manufacturing_date || '—'}</Td>
                                <Td className="text-xs font-black text-slate-700">{r.expiry_date || 'N/A'}</Td>
                                <Td>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${status.cls}`}>
                                        {status.label}
                                    </span>
                                </Td>
                            </Tr>
                        );
                    })}
                </Table>
            </div>
        </InventoryStaffLayout>
    );
}
