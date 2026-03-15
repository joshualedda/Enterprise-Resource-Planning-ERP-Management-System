import { useState, useEffect, useRef } from 'react';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Alert from '@/Components/Alert';
import Pagination from '@/Components/Pagination';
import Table, { Tr, Td } from '@/Components/Table';

const MOVEMENT_COLORS = {
    purchase: 'from-emerald-400 to-green-500', 
    sale: 'from-blue-400 to-indigo-500',
    transfer_in: 'from-sky-400 to-cyan-500',
    transfer_out: 'from-violet-400 to-purple-600',
    adjustment: 'from-amber-400 to-orange-500',
    production_use: 'from-rose-400 to-red-500',
    return: 'from-slate-400 to-slate-600'
};

const getMovementColor = (type) => MOVEMENT_COLORS[type] || 'from-slate-400 to-slate-600';
const getMovementIcon = (type) => {
    switch(type) {
        case 'purchase': return '📥';
        case 'sale': return '📤';
        case 'transfer_in': return '🚛';
        case 'transfer_out': return '🚚';
        case 'adjustment': return '⚙️';
        case 'production_use': return '🏭';
        case 'return': return '🔄';
        default: return '📦';
    }
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function KpiCard({ label, value, badge, badgeColor, iconPath, iconBg }) {
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
export default function StockMovement({
    movements: serverMovements,
    products,
    warehouses,
    batches,
    filters: serverFilters = {},
    flash,
    movementTypes
}) {
    const isServer = serverMovements && serverMovements.data !== undefined;
    const rows = isServer ? serverMovements.data : [];

    // Flash message state
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const [search, setSearch] = useState(serverFilters.search ?? '');
    const [type, setType] = useState(serverFilters.type ?? '');
    const [warehouseId, setWarehouseId] = useState(serverFilters.warehouse_id ?? '');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

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
        movement_type: 'purchase',
        quantity: '',
        unit_cost: '0',
        movement_date: new Date().toISOString().split('T')[0],
        notes: '',
        reference_type: '',
        reference_id: '',
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
            const response = await fetch(route('staff.inventory.stock-movements.batches', productId));
            const result = await response.json();
            setAvailableBatches(result);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        } finally {
            setIsLoadingBatches(false);
        }
    };

    const openModal = async (mode, m = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && m) {
            setData({
                id: m.id,
                product_id: m.product_id || '',
                warehouse_id: m.warehouse_id || '',
                batch_id: m.batch_id || '',
                movement_type: m.movement_type || 'purchase',
                quantity: m.quantity || '',
                unit_cost: m.unit_cost || '0',
                movement_date: m.movement_date ? new Date(m.movement_date).toISOString().split('T')[0] : '',
                notes: m.notes || '',
                reference_type: m.reference_type || '',
                reference_id: m.reference_id || '',
            });
            // Fetch batches for editing product immediately
            if (m.product_id) {
                await fetchBatches(m.product_id);
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
            post(route('staff.inventory.stock-movements.store'), { onSuccess: () => closeModal() });
        } else {
            put(route('staff.inventory.stock-movements.update', data.id), { onSuccess: () => closeModal() });
        }
    };

    const confirmDelete = (m) => {
        setItemToDelete(m);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.inventory.stock-movements.destroy', itemToDelete.id), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
                onFinish: () => setItemToDelete(null),
            });
        }
    };

    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        if (!isServer) return;
        const timeoutId = setTimeout(() => {
            router.get(route('staff.inventory.stock-movements.index'), {
                search: search || undefined,
                type: type || undefined,
                warehouse_id: warehouseId || undefined,
            }, { preserveState: true, replace: true });
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, type, warehouseId, isServer]);

    const kpis = [
        {
            label: 'Total Movements', value: serverMovements.total || 0, badge: 'History', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
            iconBg: 'bg-indigo-50 text-indigo-600',
        },
        {
            label: 'Purchases', value: rows.filter(m => m.movement_type === 'purchase').length, badge: 'Inflow', badgeColor: 'text-emerald-600 bg-emerald-50',
            iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Sales', value: rows.filter(m => m.movement_type === 'sale').length, badge: 'Outflow', badgeColor: 'text-blue-600 bg-blue-50',
            iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
            iconBg: 'bg-blue-50 text-blue-600',
        }
    ];

    // Filtered batches based on selected product
    const filteredBatches = batches.filter(b => b.raw_product_id === parseInt(data.product_id));

    return (
        <InventoryStaffLayout>
            <Head title="Stock Movements — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Movements</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Track every inflow and outflow of stock across your warehouses.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200 ml-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Log Movement
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
                                placeholder="Search by notes, product or warehouse…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        {/* Type Filter */}
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl focus:ring-indigo-400 focus:border-indigo-400 block p-2 outline-none transition"
                        >
                            <option value="">All Types</option>
                            {movementTypes.map(t => (
                                <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
                            ))}
                        </select>

                        {/* Warehouse Filter */}
                        <select
                            value={warehouseId}
                            onChange={e => setWarehouseId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl focus:ring-indigo-400 focus:border-indigo-400 block p-2 outline-none transition"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map(wh => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                            ))}
                        </select>

                        {/* View toggle */}
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 flex-shrink-0">
                            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            </button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <Table
                        title="📜 Movement Log"
                        subtitle="Chronological list of all inventory changes"
                        badgeCount={rows.length}
                        columns={['Date', 'Type', 'Product', 'Warehouse', 'Qty', 'Cost', 'Actions']}
                        emptyState={
                            <div className="flex flex-col items-center gap-2 py-12">
                                <div className="text-4xl">📜</div>
                                <p className="text-sm font-black text-slate-300">No movements recorded</p>
                            </div>
                        }
                        footer={isServer && (
                            <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                                <p className="text-xs font-bold text-slate-400">
                                    Page {serverMovements.current_page} of {serverMovements.last_page} · {serverMovements.total} total
                                </p>
                                <Pagination 
                                    currentPage={serverMovements.current_page} 
                                    totalPages={serverMovements.last_page} 
                                    onPageChange={(page) => {
                                        router.get(route(route().current()), { search, type, warehouse_id: warehouseId, page }, { preserveState: true, preserveScroll: true });
                                    }}
                                />
                            </div>
                        )}
                    >
                        {rows.map((m) => (
                            <Tr key={m.id}>
                                <Td className="text-xs font-bold text-slate-400 whitespace-nowrap">
                                    {new Date(m.movement_date).toLocaleDateString()}
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getMovementColor(m.movement_type)} flex items-center justify-center text-white text-xs shadow-sm`}>
                                            {getMovementIcon(m.movement_type)}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                                            {m.movement_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </Td>
                                <Td>
                                    <p className="text-sm font-bold text-slate-800">{m.product?.name || 'Unknown'}</p>
                                    {m.batch && <p className="text-[9px] text-indigo-500 font-black uppercase tracking-tighter">Batch: {m.batch.batch_code}</p>}
                                </Td>
                                <Td>
                                    <span className="text-xs font-medium text-slate-600">{m.warehouse?.name || '—'}</span>
                                </Td>
                                <Td>
                                    <span className={`text-sm font-black ${m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="text-xs font-mono text-slate-400">₱{m.unit_cost}</span>
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => openModal('edit', m)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">Edit</button>
                                        <button onClick={() => confirmDelete(m)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">Delete</button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Table>
                )}

                {/* ── GRID VIEW ── */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rows.map(m => (
                            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden p-5 flex flex-col gap-4 relative group">
                                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${getMovementColor(m.movement_type)} opacity-5 rounded-bl-[4rem]`} />
                                
                                <div className="flex items-start justify-between">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getMovementColor(m.movement_type)} flex items-center justify-center text-white text-lg shadow-sm shadow-indigo-100`}>
                                        {getMovementIcon(m.movement_type)}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(m.movement_date).toLocaleDateString()}</p>
                                        <p className={`text-sm font-black ${m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-black text-slate-800 leading-tight truncate">{m.product?.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 capitalize">{m.warehouse?.name} · {m.movement_type.replace('_', ' ')}</p>
                                </div>

                                {m.notes && <p className="text-xs text-slate-500 line-clamp-2 italic">"{m.notes}"</p>}

                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                    <span className="text-[10px] font-mono text-slate-300">₱{m.unit_cost}/unit</span>
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal('edit', m)} className="w-7 h-7 flex items-center justify-center bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                        <button onClick={() => confirmDelete(m)} className="w-7 h-7 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── MODALS ── */}
                <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                    <form onSubmit={submitForm} className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                    {modalMode === 'add' ? 'Log Stock Movement' : 'Edit Movement Details'}
                                </h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Recording physical changes in inventory</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getMovementColor(data.movement_type)} flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100`}>
                                {getMovementIcon(data.movement_type)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Product */}
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="product_id" value="Select Product *" />
                                <select id="product_id" value={data.product_id} onChange={e => setData('product_id', e.target.value)} className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold text-slate-700" required>
                                    <option value="">Choose a product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <InputError message={errors.product_id} className="mt-2" />
                            </div>

                            {/* Warehouse & Batch */}
                            <div>
                                <InputLabel htmlFor="warehouse_id" value="Warehouse *" />
                                <select id="warehouse_id" value={data.warehouse_id} onChange={e => setData('warehouse_id', e.target.value)} className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold text-slate-700" required>
                                    <option value="">Select storage...</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                                <InputError message={errors.warehouse_id} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="batch_id" value={isLoadingBatches ? "Batch (Fetching...)" : "Batch (Optional)"} />
                                <select id="batch_id" value={data.batch_id} onChange={e => setData('batch_id', e.target.value)} className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold text-slate-700" disabled={isLoadingBatches}>
                                    <option value="">{isLoadingBatches ? 'Loading batches...' : 'No Batch'}</option>
                                    {availableBatches.map(b => <option key={b.id} value={b.id}>{b.batch_code}</option>)}
                                </select>
                                <InputError message={errors.batch_id} className="mt-2" />
                            </div>

                            {/* Movement Type & Date */}
                            <div>
                                <InputLabel htmlFor="movement_type" value="Movement Type *" />
                                <select id="movement_type" value={data.movement_type} onChange={e => setData('movement_type', e.target.value)} className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold text-slate-700 uppercase tracking-tighter" required>
                                    {movementTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                </select>
                                <InputError message={errors.movement_type} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="movement_date" value="Transaction Date *" />
                                <TextInput id="movement_date" type="date" value={data.movement_date} onChange={e => setData('movement_date', e.target.value)} className="mt-1 block w-full bg-slate-50" required />
                                <InputError message={errors.movement_date} className="mt-2" />
                            </div>

                            {/* Quantity & Unit Cost */}
                            <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-50 flex flex-col gap-4">
                                <div>
                                    <InputLabel htmlFor="quantity" value="Quantity *" />
                                    <div className="relative mt-1">
                                        <TextInput id="quantity" type="number" step="0.01" value={data.quantity} onChange={e => setData('quantity', e.target.value)} className="w-full pr-10 font-black text-indigo-600 focus:ring-indigo-500" placeholder="0.00" required />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-300 uppercase">Qty</span>
                                    </div>
                                    <InputError message={errors.quantity} className="mt-2" />
                                </div>
                            </div>
                            <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-50 flex flex-col gap-4">
                                <div>
                                    <InputLabel htmlFor="unit_cost" value="Unit Cost (₱) *" />
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-300 uppercase">₱</span>
                                        <TextInput id="unit_cost" type="number" step="0.01" value={data.unit_cost} onChange={e => setData('unit_cost', e.target.value)} className="w-full pl-7 font-black text-emerald-600 focus:ring-emerald-500" placeholder="0.00" required />
                                    </div>
                                    <InputError message={errors.unit_cost} className="mt-2" />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="notes" value="Notes & Remarks" />
                                <textarea id="notes" value={data.notes} onChange={e => setData('notes', e.target.value)} className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-medium text-slate-600" rows="2" placeholder="Reference numbers, reasons for adjustment, etc..."></textarea>
                                <InputError message={errors.notes} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-50">
                            <SecondaryButton onClick={closeModal}>Discard</SecondaryButton>
                            <PrimaryButton disabled={processing} className="px-8 !bg-indigo-600 hover:!bg-indigo-700 shadow-lg shadow-indigo-100 uppercase tracking-widest text-[10px]">
                                {modalMode === 'add' ? 'Confirm Log' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-2">Delete Entry?</h2>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                            This will permanently remove this stock movement entry. This action cannot be undone and may affect stock reporting.
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton onClick={executeDelete} disabled={processing} className="!bg-rose-600 hover:!bg-rose-700 shadow-lg shadow-rose-100 uppercase tracking-widest text-[10px]">
                                {processing ? 'Deleting...' : 'Delete Permanently'}
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>

            </div>
        </InventoryStaffLayout>
    );
}
