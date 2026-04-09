import { useState, useMemo, useEffect, useRef } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Alert from '@/Components/Alert';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const phpFmt = (n) =>
    new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(n);

function stockStatusBadge(onHand, reserved) {
    const available = onHand - reserved;
    if (onHand === 0) return { label: 'Out of Stock', cls: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (available < 10) return { label: 'Critical', cls: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (available < 50) return { label: 'Low Stock', cls: 'bg-amber-50 text-amber-600 border-amber-200' };
    return { label: 'Healthy', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
}

function StockBar({ onHand, reserved, max = 500 }) {
    const available = Math.max(onHand - reserved, 0);
    const availablePct = Math.min((available / max) * 100, 100);
    const reservedPct = Math.min((reserved / max) * 100, 100);
    
    const color = available === 0 ? 'bg-rose-400' : available < 10 ? 'bg-rose-400' : available < 50 ? 'bg-amber-400' : 'bg-emerald-500';
    
    return (
        <div className="flex items-center gap-2 w-32">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${availablePct}%` }} title={`Available: ${available}`} />
                <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${reservedPct}%` }} title={`Reserved: ${reserved}`} />
            </div>
            <span className="text-xs font-black text-slate-700 w-8 text-right">{onHand}</span>
        </div>
    );
}

const CATEGORY_COLORS = {
    'Raw Materials': 'from-lime-400 to-green-500',
    'Cocoons':       'from-amber-300 to-orange-400',
    'Silk Products': 'from-violet-400 to-purple-600',
    'By-Products':   'from-sky-400 to-blue-500',
    'Supplies':      'from-slate-300 to-slate-500',
};

function ProductAvatar({ product, category }) {
    const initial = product?.[0]?.toUpperCase() ?? 'P';
    const gradient = CATEGORY_COLORS[category] ?? 'from-emerald-400 to-teal-600';
    return (
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0`}>
            {initial}
        </div>
    );
}

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
                <span className={`mt-2 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {badge}
                </span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────
export default function ProductStocks({
    stocks: serverStocks,
    products,
    warehouses,
    filters: serverFilters = {},
    flash,
}) {
    const isServer = serverStocks && serverStocks.data !== undefined;
    const rows = isServer ? serverStocks.data : [];

    // Flash message state
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Local UI state
    const [search, setSearch]           = useState(serverFilters.search ?? '');
    const [warehouseFilter, setWarehouse] = useState(serverFilters.warehouse_id ?? 'All');
    const [viewMode, setViewMode]        = useState('table'); // 'table' | 'grid'

    // Auto-filter
    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        if (!isServer) return;
        const timeoutId = setTimeout(() => {
            router.get(route('staff.inventory.product-stocks.index'), {
                search: search || undefined,
                warehouse_id: warehouseFilter !== 'All' ? warehouseFilter : undefined,
            }, { preserveState: true, replace: true });
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, warehouseFilter, isServer]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [availableBatches, setAvailableBatches] = useState([]);
    const [isLoadingBatches, setIsLoadingBatches] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        product_id: '',
        warehouse_id: '',
        batch_id: '',
        quantity_on_hand: '0',
        quantity_reserved: '0',
    });

    // Fetch batches when product changes
    useEffect(() => {
        if (data.product_id && isModalOpen) {
            fetchBatches(data.product_id);
        } else {
            setAvailableBatches([]);
        }
    }, [data.product_id, isModalOpen]);

    const fetchBatches = async (productId) => {
        setIsLoadingBatches(true);
        try {
            const response = await fetch(route('staff.inventory.product-stocks.batches', productId));
            const result = await response.json();
            setAvailableBatches(result);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        } finally {
            setIsLoadingBatches(false);
        }
    };

    const openModal = async (mode, s = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && s) {
            setData({
                id: s.id,
                product_id: s.product_id || '',
                warehouse_id: s.warehouse_id || '',
                batch_id: s.batch_id || '',
                quantity_on_hand: s.quantity_on_hand || '0',
                quantity_reserved: s.quantity_reserved || '0',
            });
            if (s.product_id) {
                await fetchBatches(s.product_id);
            }
        } else {
            reset();
            if (products.length > 0) setData('product_id', products[0].id);
            if (warehouses.length > 0) setData('warehouse_id', warehouses[0].id);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post(route('staff.inventory.product-stocks.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            put(route('staff.inventory.product-stocks.update', data.id), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = (s) => {
        setItemToDelete(s);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.inventory.product-stocks.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
                onFinish: () => setItemToDelete(null),
            });
        }
    };

    const kpis = [
        {
            label: 'Total On Hand', value: phpFmt(rows.reduce((sum, r) => sum + parseFloat(r.quantity_on_hand), 0)), badge: 'Units', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'Total Reserved', value: phpFmt(rows.reduce((sum, r) => sum + parseFloat(r.quantity_reserved), 0)), badge: 'Committed', badgeColor: 'text-blue-600 bg-blue-50',
            iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
            iconBg: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Low Stock Records', value: rows.filter(r => (r.quantity_on_hand - r.quantity_reserved) < 50).length, badge: 'Needs Attention', badgeColor: 'text-amber-600 bg-amber-50',
            iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
            iconBg: 'bg-amber-50 text-amber-600',
        },
        {
            label: 'Warehouse Locations', value: warehouses.length, badge: 'Storage points', badgeColor: 'text-indigo-600 bg-indigo-50',
            iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
            iconBg: 'bg-indigo-50 text-indigo-600',
        },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Product Stocks — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Stocks</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Current inventory snapshot across all products, warehouses, and batches.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-200 ml-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Adjust Stock
                        </button>
                    </div>
                </div>

                {/* ── KPI CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* ── SEARCH & FILTER BAR ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">

                        {/* Search */}
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by product, warehouse, or batch…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        {/* Warehouse filter */}
                        <select
                            value={warehouseFilter}
                            onChange={e => setWarehouse(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none cursor-pointer transition"
                        >
                            <option value="All">All Warehouses</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>

                        {/* View Toggle */}
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 flex-shrink-0">
                            {[
                                { mode: 'table', icon: 'M3 10h18M3 14h18M3 6h18M3 18h18' },
                                { mode: 'grid',  icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                            ].map(v => (
                                <button
                                    key={v.mode}
                                    onClick={() => setViewMode(v.mode)}
                                    className={`p-2 rounded-lg transition ${viewMode === v.mode ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={v.icon} />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="mt-3 text-[11px] font-bold text-slate-400">
                        Showing <span className="text-slate-700 font-black">{rows.length}</span> record{rows.length !== 1 ? 's' : ''}
                        {warehouseFilter !== 'All' && <> · warehouse: <span className="text-emerald-600">{warehouses.find(w => w.id == warehouseFilter)?.name}</span></>}
                    </p>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <Table
                        title="📦 Stock Inventory"
                        subtitle="Snapshot of physical stock availability"
                        badgeCount={rows.length}
                        columns={['#', 'Product', 'Warehouse', 'Batch', 'On Hand', 'Reserved', 'Available', 'Status', 'Actions']}
                        emptyState={
                            <div className="flex flex-col items-center gap-2 py-12">
                                <div className="text-4xl">📦</div>
                                <p className="text-sm font-black text-slate-300">No stock records found</p>
                            </div>
                        }
                        footer={isServer && (
                            <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                                <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                    Page {serverStocks.current_page} of {serverStocks.last_page} · {serverStocks.total} total records
                                </p>
                                <Pagination 
                                    currentPage={serverStocks.current_page} 
                                    totalPages={serverStocks.last_page} 
                                    onPageChange={(page) => {
                                        router.get(route(route().current()), { search, warehouse_id: warehouseFilter, page }, { preserveState: true, preserveScroll: true });
                                    }}
                                />
                            </div>
                        )}
                    >
                        {rows.map((r, i) => {
                            const available = r.quantity_on_hand - r.quantity_reserved;
                            const status = stockStatusBadge(r.quantity_on_hand, r.quantity_reserved);
                            return (
                                <Tr key={r.id}>
                                    <Td className="text-xs font-bold text-slate-300">{i + 1}</Td>
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <ProductAvatar product={r.product?.name} category={r.product?.category?.name} />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{r.product?.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">ID #{r.id}</p>
                                            </div>
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                                            {r.warehouse?.name || '—'}
                                        </span>
                                    </Td>
                                    <Td>
                                        {r.batch ? (
                                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">
                                                {r.batch.batch_code}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">—</span>
                                        )}
                                    </Td>
                                    <Td>
                                        <StockBar onHand={r.quantity_on_hand} reserved={r.quantity_reserved} />
                                    </Td>
                                    <Td className="text-sm font-black text-blue-600">
                                        {phpFmt(r.quantity_reserved)}
                                    </Td>
                                    <Td className={`text-sm font-black ${available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {phpFmt(available)}
                                    </Td>
                                    <Td>
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${status.cls}`}>
                                            {status.label}
                                        </span>
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => openModal('edit', r)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">Edit</button>
                                            <button onClick={() => confirmDelete(r)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">Delete</button>
                                        </div>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Table>
                )}

                {/* ── GRID VIEW ── */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rows.map(r => {
                            const available = r.quantity_on_hand - r.quantity_reserved;
                            const status = stockStatusBadge(r.quantity_on_hand, r.quantity_reserved);
                            return (
                                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4 relative group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <ProductAvatar product={r.product?.name} category={r.product?.category?.name} />
                                            <div>
                                                <p className="text-xs font-black text-slate-800 leading-tight truncate w-32">{r.product?.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 font-bold">{r.warehouse?.name}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${status.cls}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-xl p-3 grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">On Hand</p>
                                            <p className="text-sm font-black text-slate-800">{r.quantity_on_hand}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reserved</p>
                                            <p className="text-sm font-black text-blue-600">{r.quantity_reserved}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Batch:</span>
                                            <span className="text-[10px] font-black text-violet-600">{r.batch ? r.batch.batch_code : 'N/A'}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available</p>
                                            <p className={`text-md font-black ${available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{available}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity justify-end border-t border-slate-50 pt-3">
                                        <button onClick={() => openModal('edit', r)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition">Edit</button>
                                        <button onClick={() => confirmDelete(r)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition">Delete</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── MODALS ── */}
                <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl">
                    <form onSubmit={submitForm} className="p-6">
                        <h2 className="text-xl font-black text-slate-800 mb-6">
                            {modalMode === 'add' ? 'Adjust Product Stock' : 'Edit Stock Record'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Product Select */}
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="product_id" value="Select Product *" />
                                <select id="product_id" value={data.product_id} onChange={e => setData('product_id', e.target.value)} className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold text-slate-700" required>
                                    <option value="">-- Choose a product --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <InputError message={errors.product_id} className="mt-2" />
                            </div>

                            {/* Warehouse Select */}
                            <div>
                                <InputLabel htmlFor="warehouse_id" value="Warehouse *" />
                                <select id="warehouse_id" value={data.warehouse_id} onChange={e => setData('warehouse_id', e.target.value)} className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold text-slate-700" required>
                                    <option value="">-- Select storage --</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                                <InputError message={errors.warehouse_id} className="mt-2" />
                            </div>

                            {/* Batch Select (Dynamic) */}
                            <div>
                                <InputLabel htmlFor="batch_id" value={isLoadingBatches ? "Batch (Fetching...)" : "Batch Code (Optional)"} />
                                <select id="batch_id" value={data.batch_id} onChange={e => setData('batch_id', e.target.value)} className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold text-slate-700" disabled={isLoadingBatches}>
                                    <option value="">{isLoadingBatches ? 'Loading batches...' : 'No Batch'}</option>
                                    {availableBatches.map(b => <option key={b.id} value={b.id}>{b.batch_code}</option>)}
                                </select>
                                <InputError message={errors.batch_id} className="mt-2" />
                            </div>

                            {/* Quantities */}
                            <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-50">
                                <InputLabel htmlFor="quantity_on_hand" value="Quantity On Hand *" />
                                <TextInput id="quantity_on_hand" type="number" step="0.01" value={data.quantity_on_hand} onChange={e => setData('quantity_on_hand', e.target.value)} className="mt-1 block w-full bg-white font-black text-emerald-600" required />
                                <InputError message={errors.quantity_on_hand} className="mt-2" />
                            </div>

                            <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-50">
                                <InputLabel htmlFor="quantity_reserved" value="Quantity Reserved *" />
                                <TextInput id="quantity_reserved" type="number" step="0.01" value={data.quantity_reserved} onChange={e => setData('quantity_reserved', e.target.value)} className="mt-1 block w-full bg-white font-black text-blue-600" required />
                                <InputError message={errors.quantity_reserved} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-50">
                            <SecondaryButton onClick={closeModal}>Discard</SecondaryButton>
                            <PrimaryButton disabled={processing} className="px-8 !bg-emerald-600 hover:!bg-emerald-700 shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px]">
                                {modalMode === 'add' ? 'Add Stock' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h2 className="text-lg font-black text-slate-800 mb-2">Delete Stock Record?</h2>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                            This will permanently remove this stock entry for <span className="font-bold text-slate-700">{itemToDelete?.product?.name}</span>. This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>No, Keep It</SecondaryButton>
                            <PrimaryButton onClick={executeDelete} disabled={processing} className="!bg-rose-600 hover:!bg-rose-700 shadow-lg shadow-rose-100 uppercase tracking-widest text-[10px]">
                                {processing ? 'Deleting...' : 'Yes, Delete'}
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>

            </div>
        </InventoryStaffLayout>
    );
}
