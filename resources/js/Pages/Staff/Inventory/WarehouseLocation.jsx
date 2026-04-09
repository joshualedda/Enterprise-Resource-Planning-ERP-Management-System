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

const LOCATION_COLORS = [
    'from-indigo-400 to-blue-500', 
    'from-emerald-400 to-green-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-red-500',
    'from-violet-400 to-purple-600',
    'from-sky-400 to-cyan-500',
    'from-slate-400 to-slate-600'
];

const getLocationColor = (id) => LOCATION_COLORS[(id || 0) % LOCATION_COLORS.length];
const getLocationIcon = (name) => name ? name[0].toUpperCase() : '📍';

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
export default function WarehouseLocation({
    locations: serverLocations,
    warehouses,
    filters: serverFilters = {},
    flash,
}) {
    const isServer = serverLocations && serverLocations.data !== undefined;
    const rows = isServer ? serverLocations.data : [];

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
    const [warehouseId, setWarehouseId] = useState(serverFilters.warehouse_id ?? '');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

    // Form Modal Management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        warehouse_id: '',
        code: '',
        description: '',
    });

    const openModal = (mode, l = null) => {
        setModalMode(mode);
        clearErrors();
        if (mode === 'edit' && l) {
            setData({
                id: l.id,
                warehouse_id: l.warehouse_id || '',
                code: l.code || '',
                description: l.description || '',
            });
        } else {
            reset();
            // Auto-select first warehouse if none selected
            if (warehouses.length > 0) {
                setData('warehouse_id', warehouses[0].id);
            }
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
            post(route('staff.inventory.warehouses-location.store'), { onSuccess: () => closeModal() });
        } else {
            put(route('staff.inventory.warehouses-location.update', data.id), { onSuccess: () => closeModal() });
        }
    };

    const confirmDelete = (l) => {
        setItemToDelete(l);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            destroy(route('staff.inventory.warehouses-location.destroy', itemToDelete.id), {
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
            router.get(route('staff.inventory.warehouses-location.index'), {
                search: search || undefined,
                warehouse_id: warehouseId || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, warehouseId, isServer]);

    const kpiData = [
        {
            label: 'Total Locations', value: serverLocations.total || 0, badge: 'All', badgeColor: 'text-slate-500 bg-slate-50',
            iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
            iconBg: 'bg-indigo-50 text-indigo-600',
        },
        {
            label: 'Total Warehouses', value: warehouses.length, badge: 'Active Storage', badgeColor: 'text-emerald-600 bg-emerald-50',
            iconPath: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
            iconBg: 'bg-emerald-50 text-emerald-600',
        }
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Warehouse Locations — Inventory" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Warehouse Locations</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Specific storage points (aisles, bins, shelves) within warehouses.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => openModal('add')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200 ml-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Location
                        </button>
                    </div>
                </div>

                {/* ── KPI CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiData.map(k => <KpiCard key={k.label} {...k} />)}
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
                                placeholder="Search by location code or description…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

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
                            {[
                                { mode: 'table', icon: 'M3 10h18M3 14h18M3 6h18M3 18h18' },
                                { mode: 'grid',  icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                            ].map(v => (
                                <button
                                    key={v.mode}
                                    onClick={() => setViewMode(v.mode)}
                                    className={`p-2 rounded-lg transition ${viewMode === v.mode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={v.icon} />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="mt-3 text-[11px] font-bold text-slate-400">
                        Showing <span className="text-slate-700 font-black">{rows.length}</span> location{rows.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === 'table' && (
                    <Table
                        title="📍 Warehouse Location List"
                        subtitle="Specific storage points across all warehouses"
                        badgeCount={rows.length}
                        columns={['#', 'Location Code', 'Warehouse', 'Description', 'Created', 'Actions']}
                        emptyState={
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-4xl">📍</div>
                                <p className="text-sm font-black text-slate-300">No locations found</p>
                                <p className="text-xs text-slate-300">Try adjusting your search or filters.</p>
                            </div>
                        }
                        footer={isServer && (
                            <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                                <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                                    Page {serverLocations.current_page} of {serverLocations.last_page}
                                    &nbsp;·&nbsp; {serverLocations.total} total locations
                                </p>
                                <Pagination 
                                    currentPage={serverLocations.current_page} 
                                    totalPages={serverLocations.last_page} 
                                    onPageChange={(page) => {
                                        router.get(route(route().current()), {
                                            search,
                                            warehouse_id: warehouseId,
                                            page
                                        }, { preserveState: true, preserveScroll: true });
                                    }}
                                />
                            </div>
                        )}
                    >
                        {rows.length > 0 && rows.map((l, i) => (
                            <Tr key={l.id}>
                                {/* # */}
                                <Td className="text-xs font-bold text-slate-300">{i + 1}</Td>

                                {/* Location Code */}
                                <Td>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getLocationColor(l.id)} flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0`}>
                                            {getLocationIcon(l.code)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{l.code || 'NO-CODE'}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID #{l.id}</p>
                                        </div>
                                    </div>
                                </Td>

                                {/* Warehouse */}
                                <Td>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg w-fit">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter truncate max-w-[100px]">
                                            {l.warehouse?.name || 'Unknown'}
                                        </span>
                                    </div>
                                </Td>

                                {/* Description */}
                                <Td className="max-w-xs">
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{l.description ?? '—'}</p>
                                </Td>

                                {/* Created */}
                                <Td className="text-xs font-bold text-slate-400 whitespace-nowrap">
                                    {new Date(l.created_at).toLocaleDateString()}
                                </Td>

                                {/* Actions */}
                                <Td>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => openModal('edit', l)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                            Edit
                                        </button>
                                        <button onClick={() => confirmDelete(l)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
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
                        {rows.length > 0 ? rows.map(l => (
                            <div key={l.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                <div className={`h-1.5 bg-gradient-to-r ${getLocationColor(l.id)}`} />
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getLocationColor(l.id)} flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0`}>
                                            {getLocationIcon(l.code)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 leading-tight truncate">{l.code || 'Unnamed Location'}</p>
                                            <p className="text-[10px] font-bold text-indigo-500 mt-0.5">{l.warehouse?.name}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                        {l.description ?? 'No description added.'}
                                    </p>
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                        <span className="text-[10px] text-slate-300 font-bold">{new Date(l.created_at).toLocaleDateString()}</span>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openModal('edit', l)} className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition">
                                                Edit
                                            </button>
                                            <button onClick={() => confirmDelete(l)} className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="text-4xl">📍</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal for Add/Edit */}
                <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl">
                    <form onSubmit={submitForm} className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">
                            {modalMode === 'add' ? 'Add Warehouse Location' : 'Edit Location'}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <InputLabel htmlFor="warehouse_id" value="Parent Warehouse *" />
                                <select
                                    id="warehouse_id"
                                    value={data.warehouse_id}
                                    onChange={e => setData('warehouse_id', e.target.value)}
                                    className="mt-1 block w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                                    required
                                >
                                    <option value="">Select Warehouse</option>
                                    {warehouses.map(wh => (
                                        <option key={wh.id} value={wh.id}>{wh.name} ({wh.code || 'No Code'})</option>
                                    ))}
                                </select>
                                <InputError message={errors.warehouse_id} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <InputLabel htmlFor="code" value="Location Code *" />
                                <TextInput id="code" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full placeholder-slate-300" placeholder="e.g. A1-S2 (Aisle 1, Shelf 2)" required />
                                <InputError message={errors.code} className="mt-2" />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea 
                                    id="description" 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)} 
                                    className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" 
                                    rows="3"
                                    placeholder="Optional details about this storage location..."
                                ></textarea>
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} className="!bg-indigo-600 hover:!bg-indigo-700">
                                {modalMode === 'add' ? 'Save Location' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">Confirm Deletion</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete the location <span className="font-bold text-slate-800">"{itemToDelete?.code}"</span>? 
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
