import { useState, useMemo, useEffect, useRef } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, router, Link } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Alert from '@/Components/Alert';

const phpFmt = (n) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n);

function statusBadge(reason) {
    // Simple logic to color-code based on reason or just use a default
    return 'bg-indigo-50 text-indigo-600 border-indigo-100';
}

function KpiCard({ label, value, sub, iconPath, iconBg, badge, badgeColor }) {
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

export default function StockAdjustmentHistory({ adjustments, warehouses, filters, flash }) {
    const rows = adjustments.data || [];
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

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(route('staff.inventory.stock-adjustments.index'), {
                search: search || undefined,
                warehouse_id: warehouseFilter || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, warehouseFilter]);

    const [selectedAdjustment, setSelectedAdjustment] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openDetails = (adj) => {
        setSelectedAdjustment(adj);
        setIsDetailsModalOpen(true);
    };

    const confirmDelete = (adj) => {
        setItemToDelete(adj);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            router.delete(route('staff.inventory.stock-adjustments.destroy', itemToDelete.id), {
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    const kpis = [
        {
            label: 'Total Adjustments', value: adjustments.total, badge: 'History', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
            iconBg: 'bg-indigo-50 text-indigo-600',
        },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Adjustment History — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Adjustment History</h1>
                        <p className="text-slate-500 font-medium mt-1">Review all manual stock corrections and reasons.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href={route('staff.inventory.stock-adjustments.create')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            New Adjustment
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search adj number or reason..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        <select
                            value={warehouseFilter}
                            onChange={e => setWarehouseFilter(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none appearance-none cursor-pointer transition"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                </div>

                <Table
                    title="📜 Adjustment Log"
                    subtitle="Record of manual stock adjustments"
                    badgeCount={adjustments.total}
                    columns={['#', 'Adj Number', 'Warehouse', 'Reason', 'Items', 'Date', 'Actions']}
                    footer={adjustments.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-xs font-bold text-slate-400">
                                Page {adjustments.current_page} of {adjustments.last_page} &nbsp;·&nbsp; {adjustments.total} total
                            </p>
                            <Pagination 
                                currentPage={adjustments.current_page} 
                                totalPages={adjustments.last_page} 
                                onPageChange={(page) => {
                                    router.get(route(route().current()), { ...filters, page }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    )}
                >
                    {rows.map((r, i) => (
                        <Tr key={r.id}>
                            <Td className="text-xs font-bold text-slate-300">{i + 1}</Td>
                            <Td>
                                <span className="text-sm font-black text-indigo-700">{r.adjustment_number}</span>
                            </Td>
                            <Td>
                                <span className="text-xs font-bold text-slate-700">{r.warehouse?.name || '—'}</span>
                            </Td>
                            <Td>
                                <span className="text-xs font-medium text-slate-600 break-words max-w-xs block">{r.reason}</span>
                            </Td>
                            <Td>
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {r.items?.length || 0} items
                                </span>
                            </Td>
                            <Td>
                                <span className="text-xs text-slate-500 font-medium">
                                    {new Date(r.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </Td>
                            <Td>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => openDetails(r)} className="text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition">
                                        Details
                                    </button>
                                    <button onClick={() => confirmDelete(r)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                        Delete
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                {/* Details Modal */}
                <Modal show={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} maxWidth="2xl">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Adjustment Details</h2>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{selectedAdjustment?.adjustment_number}</p>
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Warehouse</p>
                                <p className="text-sm font-bold text-slate-800">{selectedAdjustment?.warehouse?.name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tighter">Adjusted</span>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason</p>
                                <p className="text-sm font-medium text-slate-700">{selectedAdjustment?.reason}</p>
                            </div>
                            {selectedAdjustment?.notes && (
                                <div className="col-span-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">"{selectedAdjustment.notes}"</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Adjusted Items</p>
                            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-2 font-black text-[10px] text-slate-400 uppercase">Product</th>
                                            <th className="px-4 py-2 font-black text-[10px] text-slate-400 uppercase">Batch</th>
                                            <th className="px-4 py-2 font-black text-[10px] text-slate-400 uppercase text-center">Qty Change</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {selectedAdjustment?.items?.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-slate-800 leading-tight">{item.product?.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">SKU: {item.product?.sku || '—'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-bold text-slate-500">
                                                    {item.batch?.batch_code || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`text-sm font-black ${item.quantity >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {item.quantity >= 0 ? '+' : ''}{item.quantity}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                            <SecondaryButton onClick={() => setIsDetailsModalOpen(false)}>Close Details</SecondaryButton>
                        </div>
                    </div>
                </Modal>

                {/* Delete Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h2 className="text-xl font-black text-slate-800">Delete Adjustment?</h2>
                        <p className="text-sm text-slate-500 mt-2 mb-8 px-4">This will record a reverse stock operation. Are you sure you want to proceed with deleting <span className="font-bold text-slate-900">{itemToDelete?.adjustment_number}</span>?</p>
                        <div className="flex gap-3 justify-center">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton onClick={executeDelete} className="!bg-rose-600 hover:!bg-rose-700">Confirm Delete</PrimaryButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </InventoryStaffLayout>
    );
}
