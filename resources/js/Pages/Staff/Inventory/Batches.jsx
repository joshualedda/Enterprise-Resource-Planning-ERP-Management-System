import { useState, useEffect, useRef, useMemo } from 'react';
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

const BATCH_COLORS = [
    'from-indigo-400 to-blue-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-red-500',
    'from-fuchsia-400 to-purple-500',
    'from-cyan-400 to-sky-500',
];

const getBatchColor = (id) => BATCH_COLORS[(id || 0) % BATCH_COLORS.length];
const getBatchIcon = (name) => name ? name[0].toUpperCase() : '📦';

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
export default function Batches({
    batches: serverBatches,
    products: serverProducts,
    stats: serverStats,
    filters: serverFilters = {},
    flash,
}) {
    const isServer = serverBatches && serverBatches.data !== undefined;
    const rows  = isServer ? serverBatches.data : [];
    const stats = serverStats ?? { total: 0, expiring_soon: 0, expired: 0 };
    const products = serverProducts || [];
    
    // Flash message state
    const [alertMessage, setAlertMessage] = useState('');
    
    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const [search, setSearch]       = useState(serverFilters.search ?? '');
    const [prodFilter, setProdFilter] = useState(serverFilters.product ?? 'All');
    const [viewMode, setViewMode]   = useState('table'); // 'table' | 'grid'

    // Form Modal Management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        raw_product_id: '',
        batch_code: '',
        supplier_id: '',
        manufacturing_date: '',
        expiry_date: '',
    });

    const openModal = (mode, b = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && b) {
            setData({
                id: b.id,
                raw_product_id: b.raw_product_id || '',
                batch_code: b.batch_code || '',
                supplier_id: b.supplier_id || '',
                manufacturing_date: b.manufacturing_date || '',
                expiry_date: b.expiry_date || '',
            });
        } else {
            reset();
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
            post(route('staff.inventory.batches.store'), { onSuccess: () => closeModal() });
        } else {
            put(route('staff.inventory.batches.update', data.id), { onSuccess: () => closeModal() });
        }
    };

    const confirmDelete = (b) => {
        setItemToDelete(b);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.inventory.batches.destroy', itemToDelete.id), {
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
            router.get(route('staff.inventory.batches.index'), {
                search: search || undefined,
                product: prodFilter !== 'All' ? prodFilter : undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, prodFilter, isServer]);

    const kpis = [
        {
            label: 'Total Batches', value: stats.total, badge: 'All Records', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'Expiring Soon', value: stats.expiring_soon, badge: '< 30 days', badgeColor: 'text-amber-600 bg-amber-50',
            iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-amber-50 text-amber-600',
        },
        {
            label: 'Expired', value: stats.expired, badge: 'Action Required', badgeColor: 'text-rose-600 bg-rose-50',
            iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
            iconBg: 'bg-rose-50 text-rose-600',
        },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Batches — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Batches</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Track manufacturing and expiry dates of stock shipments.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            PDF
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Excel
                        </button>
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-200 ml-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Batch
                        </button>
                    </div>
                </div>

                {/* ── KPI CARDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* ── SEARCH & FILTER BAR ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">

                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by batch code or product name…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        {/* Product Filter */}
                        <div className="relative md:w-48">
                            <select
                                value={prodFilter}
                                onChange={e => setProdFilter(e.target.value)}
                                className="w-full appearance-none pl-3 pr-8 py-2 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition"
                            >
                                <option value="All">All Products</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* View toggle */}
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
                        Showing <span className="text-slate-700 font-black">{rows.length}</span> batch{rows.length !== 1 ? 'es' : ''}
                    </p>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <Table
                        title="📦 Batch Records"
                        subtitle="Managing product batches and expiry tracking"
                        badgeCount={rows.length}
                        columns={['Batch Code', 'Product', 'Mfg Date', 'Expiry Date', 'Actions']}
                        emptyState={
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-4xl">📦</div>
                                <p className="text-sm font-black text-slate-300">No batches found</p>
                                <p className="text-xs text-slate-300">Try adjusting your search or filters.</p>
                            </div>
                        }
                        footer={isServer && (
                            <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                                <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                    Page {serverBatches.current_page} of {serverBatches.last_page}
                                    &nbsp;·&nbsp; {serverBatches.total} total batches
                                </p>
                                <Pagination 
                                    currentPage={serverBatches.current_page} 
                                    totalPages={serverBatches.last_page} 
                                    onPageChange={(page) => {
                                        router.get(route(route().current()), {
                                            search,
                                            page
                                        }, { preserveState: true, preserveScroll: true });
                                    }}
                                />
                            </div>
                        )}
                    >
                        {rows.length > 0 && rows.map((b, i) => (
                            <Tr key={b.id}>
                                {/* Batch Code */}
                                <Td>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getBatchColor(b.id)} flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0`}>
                                            {getBatchIcon(b.batch_code)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{b.batch_code}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID #{b.id}</p>
                                        </div>
                                    </div>
                                </Td>

                                {/* Product */}
                                <Td>
                                    <p className="text-xs font-bold text-slate-700">{b.product?.name ?? '—'}</p>
                                    <p className="text-[10px] text-slate-400">Assigned Item</p>
                                </Td>

                                {/* Mfg Date */}
                                <Td className="text-xs font-bold text-slate-500 whitespace-nowrap">
                                    {b.manufacturing_date ? new Date(b.manufacturing_date).toLocaleDateString() : '—'}
                                </Td>

                                {/* Expiry Date */}
                                <Td className="whitespace-nowrap">
                                    {b.expiry_date ? (
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                            new Date(b.expiry_date) < new Date()
                                                ? 'bg-rose-50 text-rose-600'
                                                : new Date(b.expiry_date) <= new Date(Date.now() + 30*24*60*60*1000)
                                                    ? 'bg-amber-50 text-amber-600'
                                                    : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            Exp: {new Date(b.expiry_date).toLocaleDateString()}
                                        </span>
                                    ) : <span className="text-xs text-slate-400 font-bold">—</span>}
                                </Td>

                                {/* Actions */}
                                <Td>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => openModal('edit', b)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                            Edit
                                        </button>
                                        <button onClick={() => confirmDelete(b)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                            Delete
                                        </button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Table>
                )}

                {/* ── GRID VIEW ── */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rows.length > 0 ? rows.map(b => (
                            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                {/* Gradient strip */}
                                <div className={`h-1.5 bg-gradient-to-r ${getBatchColor(b.id)}`} />

                                <div className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getBatchColor(b.id)} flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0`}>
                                            {getBatchIcon(b.batch_code)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 leading-tight truncate" title={b.batch_code}>{b.batch_code}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{b.product?.name ?? '—'}</p>
                                        </div>
                                    </div>

                                    {/* Expiry Badge */}
                                    <div className="flex items-center">
                                        {b.expiry_date ? (
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                                new Date(b.expiry_date) < new Date()
                                                    ? 'bg-rose-50 text-rose-600'
                                                    : new Date(b.expiry_date) <= new Date(Date.now() + 30*24*60*60*1000)
                                                        ? 'bg-amber-50 text-amber-600'
                                                        : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                Exp: {new Date(b.expiry_date).toLocaleDateString()}
                                            </span>
                                        ) : <span className="text-[10px] text-slate-400 font-bold">No Expiry</span>}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                        <span className="text-[10px] text-slate-300 font-bold">Mfg: {b.manufacturing_date ? new Date(b.manufacturing_date).toLocaleDateString() : '—'}</span>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openModal('edit', b)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                                Edit
                                            </button>
                                            <button onClick={() => confirmDelete(b)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="text-4xl mb-2">📦</div>
                                <p className="text-sm font-black text-slate-300">No batches found</p>
                            </div>
                        )}
                    </div>
                )}

                <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl">
                    <form onSubmit={submitForm} className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">
                            {modalMode === 'add' ? 'Add New Batch' : 'Edit Batch'}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="batch_code" value="Batch Code *" />
                                <TextInput id="batch_code" value={data.batch_code} onChange={e => setData('batch_code', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.batch_code} className="mt-2" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="raw_product_id" value="Product *" />
                                <select
                                    id="raw_product_id"
                                    value={data.raw_product_id}
                                    onChange={e => setData('raw_product_id', e.target.value)}
                                    className="mt-1 block w-full border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm"
                                    required
                                >
                                    <option value="" disabled>Select a product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.raw_product_id} className="mt-2" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="manufacturing_date" value="Manufacturing Date" />
                                <TextInput id="manufacturing_date" type="date" value={data.manufacturing_date} onChange={e => setData('manufacturing_date', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.manufacturing_date} className="mt-2" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <InputLabel htmlFor="expiry_date" value="Expiry Date" />
                                <TextInput id="expiry_date" type="date" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.expiry_date} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>{modalMode === 'add' ? 'Save Batch' : 'Save Changes'}</PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">Confirm Deletion</h2>
                        <InputError message={errors.batch} className="mb-4" />
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete the batch <span className="font-bold text-slate-800">"{itemToDelete?.batch_code}"</span>? This action cannot be undone and may affect associated stock.
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                onClick={executeDelete}
                                disabled={processing}
                                className="!bg-rose-600 hover:!bg-rose-700 focus:!ring-rose-500"
                            >
                                {processing ? 'Deleting...' : 'Delete'}
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>

            </div>
        </InventoryStaffLayout>
    );
}
