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

const WAREHOUSE_COLORS = [
    'from-indigo-400 to-blue-500', 
    'from-emerald-400 to-green-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-red-500',
    'from-violet-400 to-purple-600',
    'from-sky-400 to-cyan-500',
    'from-slate-400 to-slate-600'
];

const getWarehouseColor = (id) => WAREHOUSE_COLORS[(id || 0) % WAREHOUSE_COLORS.length];
const getWarehouseIcon = (name) => name ? name[0].toUpperCase() : '🏢';

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
export default function Warehouses({
    warehouses: serverWarehouses,
    stats: serverStats,
    filters: serverFilters = {},
    flash,
}) {
    const isServer = serverWarehouses && serverWarehouses.data !== undefined;
    const rows  = isServer ? serverWarehouses.data : [];
    const stats = serverStats ?? { total: 0 };

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
        code: '',
        location: '',
        description: '',
    });

    const openModal = (mode, w = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && w) {
            setData({
                id: w.id,
                name: w.name || '',
                code: w.code || '',
                location: w.location || '',
                description: w.description || '',
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
            post(route('staff.inventory.warehouses.store'), { onSuccess: () => closeModal() });
        } else {
            put(route('staff.inventory.warehouses.update', data.id), { onSuccess: () => closeModal() });
        }
    };

    const confirmDelete = (w) => {
        setItemToDelete(w);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.inventory.warehouses.destroy', itemToDelete.id), {
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
            router.get(route('staff.inventory.warehouses.index'), {
                search: search || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, isServer]);

    const kpis = [
        {
            label: 'Total Warehouses', value: stats.total, badge: 'All Locations', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
            iconBg: 'bg-slate-50 text-slate-500',
        },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Warehouses — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Warehouses</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Manage inventory storage locations.
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
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200 ml-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Warehouse
                        </button>
                    </div>
                </div>

                {/* ── KPI CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* ── SEARCH & FILTER BAR ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <p className="mt-3 text-[11px] font-bold text-slate-400">
                        Showing <span className="text-slate-700 font-black">{rows.length}</span> warehouse{rows.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <Table
                        title="🏢 Warehouse List"
                        subtitle="All storage locations in the inventory system"
                        badgeCount={rows.length}
                        columns={['#', 'Warehouse', 'Location', 'Description', 'Created', 'Actions']}
                        emptyState={
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-4xl">🏢</div>
                                <p className="text-sm font-black text-slate-300">No warehouses found</p>
                                <p className="text-xs text-slate-300">Try adjusting your search or filters.</p>
                            </div>
                        }
                        footer={isServer && (
                            <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                                <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                    Page {serverWarehouses.current_page} of {serverWarehouses.last_page}
                                    &nbsp;·&nbsp; {serverWarehouses.total} total warehouses
                                </p>
                                <Pagination 
                                    currentPage={serverWarehouses.current_page} 
                                    totalPages={serverWarehouses.last_page} 
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
                        {rows.length > 0 && rows.map((w, i) => (
                            <Tr key={w.id}>
                                {/* # */}
                                <Td className="text-xs font-bold text-slate-300">{i + 1}</Td>

                                {/* Warehouse */}
                                <Td>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getWarehouseColor(w.id)} flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0`}>
                                            {getWarehouseIcon(w.name)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{w.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{w.code ? `Code: ${w.code}` : 'No Code'}</p>
                                        </div>
                                    </div>
                                </Td>

                                {/* Location */}
                                <Td className="max-w-[200px]">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                        <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="truncate">{w.location || <span className="text-slate-400 italic">Not set</span>}</span>
                                    </div>
                                </Td>

                                {/* Description */}
                                <Td className="max-w-[200px]">
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed truncate">{w.description ?? '—'}</p>
                                </Td>

                                {/* Created */}
                                <Td className="text-xs font-bold text-slate-400 whitespace-nowrap">
                                    {new Date(w.created_at).toLocaleDateString()}
                                </Td>

                                {/* Actions */}
                                <Td>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => openModal('edit', w)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                            Edit
                                        </button>
                                        <button onClick={() => confirmDelete(w)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {rows.map((w) => (
                            <div key={w.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-xl hover:border-indigo-100 transition-all group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getWarehouseColor(w.id)} flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                            {getWarehouseIcon(w.name)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">{w.name}</h3>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{w.code ? `CODE: ${w.code}` : 'NO CODE'}</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                    <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity">
                                            <button onClick={() => openModal('edit', w)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => confirmDelete(w)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-100 flex-1 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="truncate">{w.location || <span className="italic text-slate-400">Not set</span>}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                                        {w.description || <span className="italic text-slate-400">No extended description provided.</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── ADD / EDIT MODAL ── */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center`}>
                            {modalMode === 'add' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            )}
                        </div>
                        {modalMode === 'add' ? 'Create New Warehouse' : 'Edit Warehouse Details'}
                    </h2>
                    
                    <form onSubmit={submitForm} className="space-y-5">
                        <div className="space-y-1">
                            <InputLabel htmlFor="name" value="Warehouse Name *" className="text-slate-700 font-bold" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="block w-full border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                                required
                                placeholder="e.g. Central Depository"
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div className="space-y-1">
                            <InputLabel htmlFor="code" value="Location Code" className="text-slate-700 font-bold" />
                            <TextInput
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="block w-full border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl uppercase"
                                placeholder="e.g. CD-01"
                            />
                            <InputError message={errors.code} className="mt-1" />
                        </div>

                        <div className="space-y-1">
                            <InputLabel htmlFor="location" value="Address / Location Detail" className="text-slate-700 font-bold" />
                            <TextInput
                                id="location"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                className="block w-full border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                                placeholder="e.g. 123 Storage Ave. City"
                            />
                            <InputError message={errors.location} className="mt-1" />
                        </div>

                        <div className="space-y-1">
                            <InputLabel htmlFor="description" value="Notes / Description" className="text-slate-700 font-bold" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="block w-full border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm sm:text-sm"
                                rows="3"
                                placeholder="Additional details..."
                            ></textarea>
                            <InputError message={errors.description} className="mt-1" />
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <SecondaryButton onClick={closeModal} className="rounded-xl px-5 border-slate-200 text-slate-600">
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton disabled={processing} className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 border-none">
                                {processing ? 'Saving...' : (modalMode === 'add' ? 'Create Warehouse' : 'Save Changes')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── DELETE CONFIRM MODAL ── */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Delete Warehouse?</h2>
                    <p className="text-slate-500 text-sm mb-6">
                        Are you sure you want to remove <strong className="text-slate-700">{itemToDelete?.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton onClick={executeDelete} className="rounded-xl bg-rose-600 hover:bg-rose-700 border-none">
                            Yes, Delete It
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </InventoryStaffLayout>
    );
}
