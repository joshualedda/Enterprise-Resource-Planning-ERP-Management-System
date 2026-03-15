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

const UNIT_COLORS = [
    'from-rose-400 to-red-500',
    'from-fuchsia-400 to-purple-500',
    'from-indigo-400 to-blue-500',
    'from-cyan-400 to-teal-500',
    'from-emerald-400 to-green-500',
    'from-amber-400 to-orange-500',
    'from-slate-400 to-slate-600'
];

const getUnitColor = (id) => UNIT_COLORS[(id || 0) % UNIT_COLORS.length];
const getUnitIcon = (name) => name ? name[0].toUpperCase() : '⚖️';

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
export default function Units({
    units: serverUnits,
    stats: serverStats,
    filters: serverFilters = {},
    flash,
}) {
    const isServer = serverUnits && serverUnits.data !== undefined;
    const rows  = isServer ? serverUnits.data : [];
    const stats = serverStats ?? { total: 0, with_products: 0 };

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
    const [viewMode, setViewMode]   = useState('table'); // 'table' | 'grid'

    // Form Modal Management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        name: '',
        description: '',
    });

    const openModal = (mode, u = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && u) {
            setData({
                id: u.id,
                name: u.name || '',
                description: u.description || '',
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
            post(route('staff.inventory.units.store'), { onSuccess: () => closeModal() });
        } else {
            put(route('staff.inventory.units.update', data.id), { onSuccess: () => closeModal() });
        }
    };

    const confirmDelete = (u) => {
        setItemToDelete(u);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.inventory.units.destroy', itemToDelete.id), {
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
            router.get(route('staff.inventory.units.index'), {
                search: search || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, isServer]);

    const kpis = [
        {
            label: 'Total Units', value: stats.total, badge: 'All', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'With Products', value: stats.with_products, badge: 'In Use', badgeColor: 'text-violet-600 bg-violet-50',
            iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            iconBg: 'bg-violet-50 text-violet-600',
        },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Units — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Units of Measurement</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Manage measurements and dimensions for the sericulture inventory.
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
                            Add Unit
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
                                placeholder="Search by unit name or description…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                            />
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
                        Showing <span className="text-slate-700 font-black">{rows.length}</span> unit{rows.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">⚖️ Unit List</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">All product units of measurement in the inventory system</p>
                            </div>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                                {rows.length} units
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['#', 'Unit', 'Description', 'Products', 'Created', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {rows.length > 0 ? rows.map((u, i) => (
                                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors group">
                                            {/* # */}
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-300">{i + 1}</td>

                                            {/* Unit */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getUnitColor(u.id)} flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0`}>
                                                        {getUnitIcon(u.name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 leading-tight">{u.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID #{u.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Description */}
                                            <td className="px-5 py-3.5 max-w-xs">
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{u.description ?? '—'}</p>
                                            </td>

                                            {/* Products */}
                                            <td className="px-5 py-3.5">
                                                <span className={`text-sm font-black ${u.products_count > 0 ? 'text-violet-600' : 'text-slate-300'}`}>
                                                    {u.products_count ?? 0}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium ml-1">items</span>
                                            </td>

                                            {/* Created */}
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-400 whitespace-nowrap">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => openModal('edit', u)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => confirmDelete(u)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="text-4xl">⚖️</div>
                                                    <p className="text-sm font-black text-slate-300">No units found</p>
                                                    <p className="text-xs text-slate-300">Try adjusting your search or filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {isServer && (
                            <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                                <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                    Page {serverUnits.current_page} of {serverUnits.last_page}
                                    &nbsp;·&nbsp; {serverUnits.total} total units
                                </p>
                                <Pagination
                                    currentPage={serverUnits.current_page}
                                    totalPages={serverUnits.last_page}
                                    onPageChange={(page) => {
                                        router.get(route(route().current()), {
                                            search,
                                            page
                                        }, { preserveState: true, preserveScroll: true });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ── GRID VIEW ── */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rows.length > 0 ? rows.map(u => (
                            <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                {/* Gradient strip */}
                                <div className={`h-1.5 bg-gradient-to-r ${getUnitColor(u.id)}`} />

                                <div className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getUnitColor(u.id)} flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0`}>
                                            {getUnitIcon(u.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 leading-tight">{u.name}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                        {u.description ?? 'No description added yet.'}
                                    </p>

                                    {/* Stats row */}
                                    <div className="flex items-center gap-4 pt-1">
                                        <div className="text-center">
                                            <p className="text-base font-black text-violet-600">{u.products_count ?? 0}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Products</p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                        <span className="text-[10px] text-slate-300 font-bold">{new Date(u.created_at).toLocaleDateString()}</span>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openModal('edit', u)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                                Edit
                                            </button>
                                            <button onClick={() => confirmDelete(u)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="text-4xl mb-2">⚖️</div>
                                <p className="text-sm font-black text-slate-300">No units found</p>
                            </div>
                        )}
                    </div>
                )}


                {/* ── SUMMARY BAR ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📊 Overview</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Stock spread across all units</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-x divide-slate-50">
                        {rows.map(u => (
                            <div key={u.id} className="px-5 py-4 text-center hover:bg-slate-50/60 transition-colors">
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getUnitColor(u.id)} mx-auto mb-2 flex items-center justify-center text-white font-black text-xs shadow-sm`}>
                                    {getUnitIcon(u.name)}
                                </div>
                                <p className="text-xs font-black text-slate-700">{u.products_count ?? 0}</p>
                                <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5 line-clamp-1">{u.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl">
                    <form onSubmit={submitForm} className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">
                            {modalMode === 'add' ? 'Add New Unit' : 'Edit Unit'}
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Unit Name *" />
                                <TextInput id="name" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} className="mt-1 block w-full border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm" rows="3"></textarea>
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>{modalMode === 'add' ? 'Save Unit' : 'Save Changes'}</PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">Confirm Deletion</h2>
                        <InputError message={errors.unit} className="mb-4" />
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete the unit <span className="font-bold text-slate-800">"{itemToDelete?.name}"</span>? 
                            <br /><br /><span className="text-rose-600 font-bold">Note: You cannot delete units that currently have products.</span>
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
