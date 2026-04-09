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

const CATEGORY_COLORS = [
    'from-lime-400 to-green-500', 
    'from-amber-300 to-orange-400',
    'from-violet-400 to-purple-600',
    'from-sky-400 to-blue-500',
    'from-slate-400 to-slate-600',
    'from-pink-400 to-rose-500',
    'from-cyan-400 to-teal-600'
];

const getCategoryColor = (id) => CATEGORY_COLORS[(id || 0) % CATEGORY_COLORS.length];
const getCategoryIcon = (name) => name ? name[0].toUpperCase() : '🏷️';

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function statusBadge(status) {
    return status === 'active'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
        : 'bg-slate-100 text-slate-400 border-slate-200';
}

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
export default function Categories({
    categories: serverCategories,
    stats: serverStats,
    filters: serverFilters = {},
    flash,
}) {
    const isServer = serverCategories && serverCategories.data !== undefined;
    const rows  = isServer ? serverCategories.data : [];
    const stats = serverStats ?? { total: 0, active: 0, archived: 0, with_products: 0 };

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

    const openModal = (mode, c = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && c) {
            setData({
                id: c.id,
                name: c.name || '',
                description: c.description || '',
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
            post(route('staff.inventory.categories.store'), { onSuccess: () => closeModal() });
        } else {
            put(route('staff.inventory.categories.update', data.id), { onSuccess: () => closeModal() });
        }
    };

    const confirmDelete = (c) => {
        setItemToDelete(c);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.inventory.categories.destroy', itemToDelete.id), {
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
            router.get(route('staff.inventory.categories.index'), {
                search: search || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, isServer]);

    const kpis = [
        {
            label: 'Total Categories', value: stats.total, badge: 'All', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
            iconBg: 'bg-slate-50 text-slate-500',
        },
        {
            label: 'Active', value: stats.active, badge: 'Published', badgeColor: 'text-emerald-600 bg-emerald-50',
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Archived', value: stats.archived, badge: 'Hidden', badgeColor: 'text-slate-400 bg-slate-100',
            iconPath: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
            iconBg: 'bg-slate-100 text-slate-500',
        },
        {
            label: 'With Products', value: stats.with_products, badge: 'Has items', badgeColor: 'text-violet-600 bg-violet-50',
            iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            iconBg: 'bg-violet-50 text-violet-600',
        },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Categories — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categories</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Manage product classifications for the sericulture inventory.
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
                            Add Category
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
                                placeholder="Search by category name or description…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        {/* Render filter block intentionally empty for status since categories have no explicit status currently */}

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
                        Showing <span className="text-slate-700 font-black">{rows.length}</span> categor{rows.length !== 1 ? 'ies' : 'y'}
                    </p>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">🏷️ Category List</h2>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">All product classifications in the inventory system</p>
                            </div>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                                {rows.length} categories
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-slate-100">
                                        {['#', 'Category', 'Description', 'Products', 'Created', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {rows.length > 0 ? rows.map((cat, i) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors group">
                                            {/* # */}
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-300">{i + 1}</td>

                                            {/* Category */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getCategoryColor(cat.id)} flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0`}>
                                                        {getCategoryIcon(cat.name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 leading-tight">{cat.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID #{cat.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Description */}
                                            <td className="px-5 py-3.5 max-w-xs">
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{cat.description ?? '—'}</p>
                                            </td>

                                            {/* Products */}
                                            <td className="px-5 py-3.5">
                                                <span className={`text-sm font-black ${cat.products_count > 0 ? 'text-violet-600' : 'text-slate-300'}`}>
                                                    {cat.products_count ?? 0}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium ml-1">items</span>
                                            </td>

                                            {/* Created */}
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-400 whitespace-nowrap">
                                                {new Date(cat.created_at).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => openModal('edit', cat)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => confirmDelete(cat)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="text-4xl">🏷️</div>
                                                    <p className="text-sm font-black text-slate-300">No categories found</p>
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
                                    Page {serverCategories.current_page} of {serverCategories.last_page}
                                    &nbsp;·&nbsp; {serverCategories.total} total categories
                                </p>
                                <Pagination
                                    currentPage={serverCategories.current_page}
                                    totalPages={serverCategories.last_page}
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
                        {rows.length > 0 ? rows.map(cat => (
                            <div key={cat.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                {/* Gradient strip */}
                                <div className={`h-1.5 bg-gradient-to-r ${getCategoryColor(cat.id)}`} />

                                <div className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCategoryColor(cat.id)} flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0`}>
                                            {getCategoryIcon(cat.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 leading-tight">{cat.name}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                        {cat.description ?? 'No description added yet.'}
                                    </p>

                                    {/* Stats row */}
                                    <div className="flex items-center gap-4 pt-1">
                                        <div className="text-center">
                                            <p className="text-base font-black text-violet-600">{cat.products_count ?? 0}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Products</p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                        <span className="text-[10px] text-slate-300 font-bold">{new Date(cat.created_at).toLocaleDateString()}</span>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openModal('edit', cat)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="text-4xl mb-2">🏷️</div>
                            </div>
                        )}
                    </div>
                )}


                {/* ── SUMMARY BAR ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">📊 Overview</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Stock spread across all categories</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-x divide-slate-50">
                        {rows.map(cat => (
                            <div key={cat.id} className="px-5 py-4 text-center hover:bg-slate-50/60 transition-colors">
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getCategoryColor(cat.id)} mx-auto mb-2 flex items-center justify-center text-white font-black text-xs shadow-sm`}>
                                    {getCategoryIcon(cat.name)}
                                </div>
                                <p className="text-xs font-black text-slate-700">{cat.products_count ?? 0}</p>
                                <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5 line-clamp-1">{cat.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl">
                    <form onSubmit={submitForm} className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">
                            {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Category Name *" />
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
                            <PrimaryButton disabled={processing}>{modalMode === 'add' ? 'Save Category' : 'Save Changes'}</PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">Confirm Deletion</h2>
                        <InputError message={errors.category} className="mb-4" />
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete the category <span className="font-bold text-slate-800">"{itemToDelete?.name}"</span>? 
                            <br /><br /><span className="text-rose-600 font-bold">Note: You cannot delete categories that currently have products.</span>
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
